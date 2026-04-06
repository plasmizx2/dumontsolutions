import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const prisma = new PrismaClient();

export async function POST() {
  try {
    const session = await getServerSession(authConfig);
    const role = (session?.user as { role?: string })?.role;
    const clientId = (session?.user as { clientId?: number })?.clientId;

    if (!session || role !== "client" || !clientId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Account not found." }, { status: 401 });
    }

    // Only allow subscription purchase if they bought site_subscription plan
    if (client.pricingTier !== 'site_subscription') {
      return NextResponse.json({ error: "Subscription not available for your plan." }, { status: 400 });
    }

    let stripeCustomerId = client.stripeCustomerId;
    if (!stripeCustomerId) {
      const existing = await stripe.customers.list({
        email: client.email,
        limit: 5,
      });
      const match =
        existing.data.find((c) => c.email?.toLowerCase() === client.email.toLowerCase()) ??
        existing.data[0];
      if (match) {
        stripeCustomerId = match.id;
      } else {
        const created = await stripe.customers.create({
          email: client.email,
          name: client.name?.trim() || undefined,
          metadata: { clientId: String(clientId) },
        });
        stripeCustomerId = created.id;
      }
      await prisma.client.update({
        where: { id: clientId },
        data: { stripeCustomerId },
      });
    }

    // Create subscription checkout
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Monthly Maintenance",
              description: "Site maintenance and support",
            },
            recurring: {
              interval: "month",
            },
            unit_amount: 5000, // $50.00
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30, // Free for first month
      },
      success_url: `${baseUrl}/dashboard?subscription=success`,
      cancel_url: `${baseUrl}/dashboard`,
      customer: stripeCustomerId,
      metadata: {
        clientId: String(clientId),
        plan: 'site_subscription'
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription checkout session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // For direct link access
  return POST();
}
