// Utility functions for managing subscription cancellations

import { Subscription } from "@prisma/client";

export interface CancellationInfo {
  subscriptionId: number;
  clientName: string;
  email: string;
  method: "github" | "thumbdrive";
  canceledAt: Date;
  daysSinceCancellation: number;
  status: "pending" | "sent" | "delivered";
  isOverdue: boolean; // More than 7 days without delivery
}

/**
 * Calculate days since cancellation
 */
export function calculateDaysSinceCancellation(canceledAt: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const canceled = new Date(canceledAt);
  canceled.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - canceled.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Check if cancellation is overdue (more than 7 days)
 */
export function isCancellationOverdue(canceledAt: Date): boolean {
  return calculateDaysSinceCancellation(canceledAt) > 7;
}

/**
 * Get urgency level for cancellation
 */
export function getUrgencyLevel(
  canceledAt: Date,
  status: string
): "urgent" | "warning" | "normal" {
  if (status === "delivered") return "normal";

  const daysSince = calculateDaysSinceCancellation(canceledAt);
  if (daysSince > 7) return "urgent";
  if (daysSince > 3) return "warning";
  return "normal";
}

/**
 * Format cancellation status for display
 */
export function formatCancellationStatus(status?: string): string {
  if (!status) return "Not initiated";
  if (status === "pending") return "⏳ Pending - Code not sent";
  if (status === "sent") return "📤 Sent - Awaiting confirmation";
  if (status === "delivered") return "✅ Delivered - Complete";
  return status;
}

/**
 * Get delivery method display text
 */
export function getDeliveryMethodText(method?: string): string {
  if (!method) return "Unknown";
  if (method === "github") return "🖥️ GitHub Repository";
  if (method === "thumbdrive") return "💾 Physical Thumb Drive";
  return method;
}

/**
 * Check which reminder emails should be sent
 */
export function shouldSendReminderEmail(
  canceledAt: Date,
  reminderDays: number[],
  lastEmailDay?: number
): boolean {
  const daysSince = calculateDaysSinceCancellation(canceledAt);
  const shouldSend = reminderDays.includes(daysSince);

  // Don't send if we already sent one today
  if (lastEmailDay === daysSince) return false;

  return shouldSend;
}

/**
 * Get all pending cancellations needing action
 */
export function filterPendingCancellations(
  subscriptions: any[]
): CancellationInfo[] {
  return subscriptions
    .filter(
      (sub) =>
        sub.status === "canceled" &&
        sub.canceledAt &&
        sub.codeDeliveryStatus !== "delivered"
    )
    .map((sub) => ({
      subscriptionId: sub.id,
      clientName: sub.client.name,
      email: sub.client.email,
      method: sub.codeDeliveryMethod || "unknown",
      canceledAt: new Date(sub.canceledAt),
      daysSinceCancellation: calculateDaysSinceCancellation(new Date(sub.canceledAt)),
      status: sub.codeDeliveryStatus || "pending",
      isOverdue: isCancellationOverdue(new Date(sub.canceledAt)),
    }))
    .sort((a, b) => {
      // Sort by urgency: overdue first, then by days since
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return b.daysSinceCancellation - a.daysSinceCancellation;
    });
}

/**
 * Get status color for UI display
 */
export function getStatusColor(
  status: string,
  daysSince: number
): "red" | "yellow" | "green" | "gray" {
  if (status === "delivered") return "green";
  if (daysSince > 7) return "red";
  if (daysSince > 3) return "yellow";
  return "gray";
}
