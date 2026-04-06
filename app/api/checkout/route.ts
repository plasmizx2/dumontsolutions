import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { plan, clientName, clientEmail, numSites } = await request.json();

    if (!plan || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let mode: "payment" | "subscription" = "payment";
    const metadata: Record<string, string> = {
      clientName,
      clientEmail,
      plan,
    };

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
      // One-time fee + recurring subscription
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
      mode = "payment"; // First we handle the one-time payment, subscription will be created via webhook
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
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: mode,
      success_url: `${process.env.NEXTAUTH_URL}/pricing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      customer_email: clientEmail,
      metadata,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
