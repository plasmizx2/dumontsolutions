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
    const { subscriptionId, codeDeliveryMethod, reason } = await request.json();

    if (!subscriptionId || !codeDeliveryMethod) {
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

    // Get subscription from database
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { client: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (subscription.status === "canceled") {
      return NextResponse.json(
        { error: "Subscription already canceled" },
        { status: 400 }
      );
    }

    // Cancel Stripe subscription
    let stripeError = null;
    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } catch (error) {
      console.error("Stripe cancellation error:", error);
      stripeError = error;
    }

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
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
        clientName: subscription.client.name,
        email: subscription.client.email,
        codeDeliveryMethod,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // Send alert email to admin
    try {
      await sendCancellationAlertEmail({
        clientName: subscription.client.name,
        email: subscription.client.email,
        codeDeliveryMethod,
      });
    } catch (emailError) {
      console.error("Failed to send admin alert:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Subscription canceled successfully",
        subscriptionId: updatedSubscription.id,
        stripeError: stripeError ? String(stripeError) : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
