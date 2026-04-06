import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

function normalizeCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(promos);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || (session.user as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rawCode = String(body.code || "");
    const code = normalizeCode(rawCode);
    const label = body.label ? String(body.label).trim() : null;
    const discountType = body.discountType === "amount" ? "amount" : "percent";

    if (!code || code.length < 3 || code.length > 40) {
      return NextResponse.json(
        { error: "Code must be 3–40 characters (letters/numbers)." },
        { status: 400 }
      );
    }

    if (!/^[A-Z0-9_-]+$/.test(code)) {
      return NextResponse.json(
        { error: "Code may only contain letters, numbers, underscores, and hyphens." },
        { status: 400 }
      );
    }

    const percentOff =
      discountType === "percent"
        ? Math.min(100, Math.max(1, Number(body.percentOff)))
        : null;
    const amountOffCents =
      discountType === "amount"
        ? Math.max(1, Math.round(Number(body.amountOffCents)))
        : null;

    if (discountType === "percent" && (!percentOff || Number.isNaN(percentOff))) {
      return NextResponse.json(
        { error: "Enter a valid percent off (1–100)." },
        { status: 400 }
      );
    }
    if (
      discountType === "amount" &&
      (!amountOffCents || Number.isNaN(amountOffCents))
    ) {
      return NextResponse.json(
        { error: "Enter a valid discount in cents (e.g. 2500 for $25)." },
        { status: 400 }
      );
    }

    let maxRedemptions: number | undefined;
    if (body.maxRedemptions != null && body.maxRedemptions !== "") {
      const n = Number(body.maxRedemptions);
      if (!Number.isFinite(n) || n < 1) {
        return NextResponse.json(
          { error: "Max redemptions must be a positive number." },
          { status: 400 }
        );
      }
      maxRedemptions = Math.floor(n);
    }

    let expiresAt: Date | null = null;
    if (body.expiresAt) {
      const d = new Date(String(body.expiresAt));
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid expiry date." }, { status: 400 });
      }
      expiresAt = d;
    }

    const existing = await prisma.promoCode.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "That code already exists." },
        { status: 409 }
      );
    }

    const couponParams: Stripe.CouponCreateParams = {
      duration: "once",
      name: label || `Promo ${code}`,
    };
    if (discountType === "percent") {
      couponParams.percent_off = percentOff!;
    } else {
      couponParams.amount_off = amountOffCents!;
      couponParams.currency = "usd";
    }

    const coupon = await stripe.coupons.create(couponParams);

    const promoCreateParams: Stripe.PromotionCodeCreateParams = {
      coupon: coupon.id,
      code,
    };
    if (maxRedemptions != null) {
      promoCreateParams.max_redemptions = maxRedemptions;
    }
    if (expiresAt) {
      promoCreateParams.expires_at = Math.floor(expiresAt.getTime() / 1000);
    }

    const promotionCode = await stripe.promotionCodes.create(promoCreateParams);

    const row = await prisma.promoCode.create({
      data: {
        code,
        label,
        stripeCouponId: coupon.id,
        stripePromotionCodeId: promotionCode.id,
        discountType,
        percentOff,
        amountOffCents,
        maxRedemptions: maxRedemptions ?? null,
        expiresAt,
        active: true,
      },
    });

    return NextResponse.json(row);
  } catch (e: unknown) {
    console.error("Promo create error:", e);
    const msg = e instanceof Error ? e.message : "Failed to create promo code";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
