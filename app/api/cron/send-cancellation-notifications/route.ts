import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  calculateDaysSinceCancellation,
  filterPendingCancellations,
} from "@/lib/cancellation";
import { sendCancellationReminderEmail } from "@/lib/emails";

const prisma = new PrismaClient();

/**
 * Send cancellation reminder emails to admin
 *
 * Call this daily via cron job at scheduled times
 * Reminds admin about code deliveries that are pending
 *
 * Schedule: Day 1, 3, 7 after cancellation
 *
 * Example:
 * curl -X POST https://yourdomain.com/api/cron/send-cancellation-notifications?token=CRON_TOKEN
 */

export async function POST(request: NextRequest) {
  try {
    // Verify cron token
    const token = request.nextUrl.searchParams.get("token");
    if (token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get reminder schedule from env (default: 1,3,7 days)
    const reminderDaysStr = process.env.CANCELLATION_NOTIFICATION_DAYS || "1,3,7";
    const reminderDays = reminderDaysStr.split(",").map((d) => parseInt(d.trim()));

    // Get all pending cancellations
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "canceled",
        canceledAt: { not: null },
        codeDeliveryStatus: { not: "delivered" },
      },
      include: { client: true },
    });

    let emailsSent = 0;
    const results = [];

    for (const subscription of subscriptions) {
      const daysSince = calculateDaysSinceCancellation(
        new Date(subscription.canceledAt!)
      );

      // Check if we should send a reminder for this number of days
      if (reminderDays.includes(daysSince)) {
        try {
          await sendCancellationReminderEmail({
            clientName: subscription.client.name,
            email: subscription.client.email,
            codeDeliveryMethod: subscription.codeDeliveryMethod || "unknown",
            daysSinceCancellation: daysSince,
          });
          emailsSent++;
          results.push({
            client: subscription.client.name,
            daysSince,
            status: "reminder_sent",
          });
        } catch (error) {
          console.error(
            `Failed to send reminder for ${subscription.client.name}:`,
            error
          );
          results.push({
            client: subscription.client.name,
            daysSince,
            status: "failed",
            error: String(error),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      totalPending: subscriptions.length,
      reminderDays,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cancellation notification cron error:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}

/**
 * GET - Preview what emails would be sent
 * Shows all pending cancellations and which ones are due for reminders
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminderDaysStr = process.env.CANCELLATION_NOTIFICATION_DAYS || "1,3,7";
    const reminderDays = reminderDaysStr.split(",").map((d) => parseInt(d.trim()));

    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "canceled",
        canceledAt: { not: null },
        codeDeliveryStatus: { not: "delivered" },
      },
      include: { client: true },
    });

    const pendingCancellations = filterPendingCancellations(subscriptions);

    const toRemind = pendingCancellations.filter((c) =>
      reminderDays.includes(c.daysSinceCancellation)
    );

    return NextResponse.json({
      message: "Preview of pending cancellations",
      reminderDays,
      totalPending: subscriptions.length,
      dueForReminder: toRemind.length,
      cancellations: pendingCancellations.map((c) => ({
        client: c.clientName,
        email: c.email,
        method: c.method,
        daysSince: c.daysSinceCancellation,
        isDueForReminder: reminderDays.includes(c.daysSinceCancellation),
        isOverdue: c.isOverdue,
        status: c.status,
      })),
    });
  } catch (error) {
    console.error("Error fetching cancellation data:", error);
    return NextResponse.json(
      { error: "Failed to fetch cancellation data" },
      { status: 500 }
    );
  }
}
