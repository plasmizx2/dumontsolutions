import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const promoId = parseInt(id, 10);
  if (Number.isNaN(promoId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const active = Boolean(body.active);

  const existing = await prisma.promoCode.findUnique({ where: { id: promoId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await stripe.promotionCodes.update(existing.stripePromotionCodeId, {
      active,
    });
  } catch (e) {
    console.error("Stripe promotion code update:", e);
    return NextResponse.json(
      { error: "Could not update Stripe promotion code." },
      { status: 500 }
    );
  }

  const updated = await prisma.promoCode.update({
    where: { id: promoId },
    data: { active },
  });

  return NextResponse.json(updated);
}
