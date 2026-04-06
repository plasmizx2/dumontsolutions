import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import {
  sendCancellationConfirmationEmail,
  sendCancellationAlertEmail,
} from "@/lib/emails";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { email, codeDeliveryMethod, reason } = await request.json();

    if (!email || !codeDeliveryMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["github", "thumbdrive"].includes(codeDeliveryMethod)) {
      return NextResponse.json(
        { error: "Invalid delivery method" },
        { status: 400 }
      );
    }

    // Get client by email
    const client = await prisma.client.findUnique({
      where: { email },
      include: {
        subscriptions: {
          where: { status: "active" }, // only active subscriptions
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "No account found with that email." },
        { status: 404 }
      );
    }

    if (client.subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No active subscriptions found for this email." },
        { status: 404 }
      );
    }

    // Cancel the most recent active subscription
    const subscription = client.subscriptions[0];

    // Cancel Stripe subscription
    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } catch (error) {
      console.error("Stripe cancellation error:", error);
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "canceled",
        canceledAt: new Date(),
        codeDeliveryMethod,
        codeDeliveryStatus: "pending",
        cancellationReason: reason || null,
      },
    });

    // Send confirmation email to customer
    try {
      await sendCancellationConfirmationEmail({
        clientName: client.name,
        email: client.email,
        codeDeliveryMethod,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // Send alert email to admin
    try {
      await sendCancellationAlertEmail({
        clientName: client.name,
        email: client.email,
        codeDeliveryMethod,
      });
    } catch (emailError) {
      console.error("Failed to send admin alert:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Subscription canceled successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to process cancellation" },
      { status: 500 }
    );
  }
}
