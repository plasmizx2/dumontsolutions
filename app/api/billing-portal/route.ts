import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    const role = (session?.user as any)?.role as string | undefined;
    const clientId = (session?.user as any)?.clientId as number | undefined;

    if (!session || role !== "client" || !clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    if (!client?.email) {
      return NextResponse.json(
        { error: "Account email missing; contact support." },
        { status: 400 }
      );
    }

    let customerId = client.stripeCustomerId;

    // Google sign-in creates a Client before checkout; webhook may not have run yet,
    // or the ID was never saved. Resolve Stripe customer by email or create one.
    if (!customerId) {
      const normalizedEmail = client.email.trim().toLowerCase();
      const existing = await stripe.customers.list({
        email: normalizedEmail,
        limit: 5,
      });
      const match =
        existing.data.find((c) => c.email?.toLowerCase() === normalizedEmail) ??
        existing.data[0];

      if (match) {
        customerId = match.id;
      } else {
        const created = await stripe.customers.create({
          email: normalizedEmail,
          name: client.name?.trim() || undefined,
          metadata: { clientId: String(clientId) },
        });
        customerId = created.id;
      }

      await prisma.client.update({
        where: { id: clientId },
        data: { stripeCustomerId: customerId },
      });
    }

    const returnUrl =
      process.env.NEXTAUTH_URL?.toString() || request.nextUrl.origin;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${returnUrl}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}

