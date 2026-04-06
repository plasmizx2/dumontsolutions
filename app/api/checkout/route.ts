import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const prisma = new PrismaClient();

function normalizePromoCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    const role = (session?.user as { role?: string })?.role;
    const clientId = (session?.user as { clientId?: number })?.clientId;

    if (!session || role !== "client" || !clientId) {
      return NextResponse.json(
        {
          error:
            "Sign up and sign in before checkout. Use the Sign up button in the navigation.",
        },
        { status: 401 }
      );
    }

    const clientRecord = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!clientRecord) {
      return NextResponse.json({ error: "Account not found." }, { status: 401 });
    }

    const { plan, numSites, promoCode: promoRaw } = await request.json();

    if (!plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }

    const clientName = clientRecord.name;
    const clientEmail = clientRecord.email.trim().toLowerCase();

    if (!clientEmail) {
      return NextResponse.json(
        { error: "Your account needs an email before checkout." },
        { status: 400 }
      );
    }

    // Tie Checkout to a Stripe Customer and keep email in sync. Charges and receipts
    // use the Customer's email; a stale or empty Customer causes "no email" in Dashboard.
    let stripeCustomerId = clientRecord.stripeCustomerId;
    if (!stripeCustomerId) {
      const existing = await stripe.customers.list({
        email: clientEmail,
        limit: 5,
      });
      const match =
        existing.data.find((c) => c.email?.toLowerCase() === clientEmail) ??
        existing.data[0];
      if (match) {
        stripeCustomerId = match.id;
      } else {
        const created = await stripe.customers.create({
          email: clientEmail,
          name: clientName?.trim() || undefined,
          ...(clientRecord.phone?.trim()
            ? { phone: clientRecord.phone.trim() }
            : {}),
          metadata: { clientId: String(clientId) },
        });
        stripeCustomerId = created.id;
      }
      await prisma.client.update({
        where: { id: clientId },
        data: { stripeCustomerId },
      });
    }

    try {
      await stripe.customers.update(stripeCustomerId, {
        email: clientEmail,
        name: clientName?.trim() || undefined,
        ...(clientRecord.phone?.trim()
          ? { phone: clientRecord.phone.trim() }
          : {}),
      });
    } catch (err) {
      console.error("Stripe customer email sync before checkout:", err);
    }

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let mode: "payment" | "subscription" = "payment";
    const metadata: Record<string, string> = {
      clientName,
      clientEmail,
      plan,
      clientId: String(clientId),
    };

    let discounts:
      | Stripe.Checkout.SessionCreateParams.Discount[]
      | undefined;

    if (promoRaw && String(promoRaw).trim()) {
      const normalized = normalizePromoCode(String(promoRaw));
      const promoRow = await prisma.promoCode.findFirst({
        where: {
          code: normalized,
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      if (!promoRow) {
        return NextResponse.json(
          { error: "Invalid or expired promo code." },
          { status: 400 }
        );
      }

      if (
        promoRow.maxRedemptions != null &&
        promoRow.timesRedeemed >= promoRow.maxRedemptions
      ) {
        return NextResponse.json(
          { error: "This promo code has reached its maximum uses." },
          { status: 400 }
        );
      }

      try {
        const pc = await stripe.promotionCodes.retrieve(
          promoRow.stripePromotionCodeId
        );
        if (!pc.active) {
          return NextResponse.json(
            { error: "This promo code is no longer active." },
            { status: 400 }
          );
        }
        if (
          pc.max_redemptions != null &&
          pc.times_redeemed != null &&
          pc.times_redeemed >= pc.max_redemptions
        ) {
          return NextResponse.json(
            { error: "This promo code has reached its maximum uses." },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Could not validate promo code with Stripe." },
          { status: 400 }
        );
      }

      discounts = [{ promotion_code: promoRow.stripePromotionCodeId }];
      metadata.promoCodeId = String(promoRow.id);
      metadata.promoCode = promoRow.code;
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Configure based on plan
    if (plan === "basic_site") {
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Basic Site",
              description: "Professional website design and development",
            },
            unit_amount: 22500, // $225.00
          },
          quantity: 1,
        },
      ];
      mode = "payment";
    } else if (plan === "site_maintenance") {
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Site Package",
              description: "Initial website setup",
            },
            unit_amount: 22500, // $225.00
          },
          quantity: 1,
        },
      ];
      mode = "payment";
    } else if (plan === "multi_site") {
      const sites = Math.max(1, Math.min(50, Number(numSites || 1)));
      metadata.numSites = String(sites);
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Multi-Site Package",
              description: "Website setup for multiple sites",
            },
            unit_amount: 17500, // $175 per site
          },
          quantity: sites,
        },
      ];
      mode = "payment";
    } else {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode,
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      customer: stripeCustomerId,
      // Let Checkout refresh name/address from the Customer we just updated.
      customer_update: {
        name: "auto",
        address: "auto",
      },
      client_reference_id: String(clientId),
      metadata,
      ...(discounts ? { discounts } : {}),
      payment_intent_data: {
        receipt_email: clientEmail,
        metadata: {
          ...metadata,
          clientEmail,
        },
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
