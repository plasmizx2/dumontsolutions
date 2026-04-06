import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  sendUpcomingRenewalEmail,
  sendFinalRenewalReminder,
  sendRenewalProcessedEmail,
} from "@/lib/emails";
import { calculateDaysRemaining } from "@/lib/renewals";

const prisma = new PrismaClient();

/**
 * This endpoint sends renewal reminder emails to clients.
 * Call this once per day (preferably in the morning).
 *
 * You can set this up with:
 * - Render cron jobs
 * - External service like EasyCron or cron-job.org
 * - A scheduled job in your backend
 *
 * Example curl:
 * curl -X POST https://yourdomain.com/api/cron/send-renewal-emails?token=YOUR_SECRET_TOKEN
 */

export async function POST(request: NextRequest) {
  try {
    // Verify cron token for security
    const token = request.nextUrl.searchParams.get("token");
    if (token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active maintenance subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        nextBillingDate: { not: null },
        client: {
          pricingTier: "maintenance",
        },
      },
      include: { client: true },
    });

    let emailsSent = 0;
    const results = [];

    for (const subscription of subscriptions) {
      if (!subscription.nextBillingDate) continue;
      const daysRemaining = calculateDaysRemaining(subscription.nextBillingDate);

      // Day 25: Send "upcoming renewal" email
      if (daysRemaining === 25) {
        try {
          await sendUpcomingRenewalEmail({
            clientName: subscription.client.name,
            email: subscription.client.email,
            billingDate: subscription.nextBillingDate,
            amount: subscription.amountMonthly,
            siteUrl: subscription.client.siteUrl || undefined,
          });
          emailsSent++;
          results.push({
            client: subscription.client.name,
            type: "upcoming_reminder",
            status: "sent",
          });
        } catch (error) {
          console.error(
            `Failed to send upcoming reminder to ${subscription.client.email}:`,
            error
          );
          results.push({
            client: subscription.client.name,
            type: "upcoming_reminder",
            status: "failed",
            error: String(error),
          });
        }
      }

      // Day 29: Send "final reminder" email (24 hours before)
      else if (daysRemaining === 1) {
        try {
          await sendFinalRenewalReminder({
            clientName: subscription.client.name,
            email: subscription.client.email,
            billingDate: subscription.nextBillingDate,
            amount: subscription.amountMonthly,
          });
          emailsSent++;
          results.push({
            client: subscription.client.name,
            type: "final_reminder",
            status: "sent",
          });
        } catch (error) {
          console.error(
            `Failed to send final reminder to ${subscription.client.email}:`,
            error
          );
          results.push({
            client: subscription.client.name,
            type: "final_reminder",
            status: "failed",
            error: String(error),
          });
        }
      }

      // Day 0: Send "renewal processed" email
      else if (daysRemaining === 0) {
        try {
          await sendRenewalProcessedEmail({
            clientName: subscription.client.name,
            email: subscription.client.email,
            billingDate: subscription.nextBillingDate,
            amount: subscription.amountMonthly,
            siteUrl: subscription.client.siteUrl || undefined,
          });
          emailsSent++;
          results.push({
            client: subscription.client.name,
            type: "renewal_processed",
            status: "sent",
          });
        } catch (error) {
          console.error(
            `Failed to send renewal processed email to ${subscription.client.email}:`,
            error
          );
          results.push({
            client: subscription.client.name,
            type: "renewal_processed",
            status: "failed",
            error: String(error),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      totalSubscriptions: subscriptions.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to process renewal emails", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger endpoint for sending renewal emails on demand
 * Use this to test or manually trigger emails
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active subscriptions with days remaining
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        nextBillingDate: { not: null },
        client: {
          pricingTier: "maintenance",
        },
      },
      include: { client: true },
    });

    const renewalsData = subscriptions.map((sub) => ({
      clientName: sub.client.name,
      email: sub.client.email,
      nextBillingDate: sub.nextBillingDate!.toISOString(),
      daysRemaining: calculateDaysRemaining(sub.nextBillingDate!),
      amount: sub.amountMonthly,
      siteUrl: sub.client.siteUrl || undefined,
    }));

    return NextResponse.json({
      message: "This is a preview of renewals. Use POST to send emails.",
      totalSubscriptions: subscriptions.length,
      renewals: renewalsData,
    });
  } catch (error) {
    console.error("Error fetching renewals:", error);
    return NextResponse.json(
      { error: "Failed to fetch renewals" },
      { status: 500 }
    );
  }
}
