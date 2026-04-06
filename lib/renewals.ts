// Utility functions for managing client renewals and billing cycles

export interface RenewalInfo {
  subscriptionId: number;
  clientId: number;
  clientName: string;
  email: string;
  nextBillingDate: Date;
  amountMonthly?: number;
  daysRemaining: number;
  isUrgent: boolean; // true if within the configured renewal window (days)
  siteUrl?: string;
}

/**
 * Calculate days remaining until next billing date
 */
export function calculateDaysRemaining(billingDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const billing = new Date(billingDate);
  billing.setHours(0, 0, 0, 0);

  const diffTime = billing.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Get countdown display text (e.g., "3 days", "1 day", "Today")
 */
export function getCountdownText(daysRemaining: number): string {
  if (daysRemaining === 0) return "Today";
  if (daysRemaining === 1) return "Tomorrow";
  return `${daysRemaining} days`;
}

/**
 * Get status color for countdown
 */
export function getCountdownColor(daysRemaining: number): "red" | "yellow" | "green" {
  if (daysRemaining === 0) return "red";
  if (daysRemaining <= 3) return "red";
  if (daysRemaining <= 7) return "yellow";
  return "green";
}

/**
 * Format date for display (e.g., "Mar 15, 2026")
 */
export function formatBillingDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Check if a subscription is within the renewal window
 */
export function isUpcomingRenewal(nextBillingDate: Date, windowDays: number = 7): boolean {
  const daysRemaining = calculateDaysRemaining(nextBillingDate);
  return daysRemaining >= 0 && daysRemaining <= windowDays;
}

/**
 * Get all subscriptions needing renewal soon
 */
export function filterUpcomingRenewals(subscriptions: any[], windowDays: number = 7): RenewalInfo[] {
  return subscriptions
    .filter((sub) => sub.status === "active" && !!sub.client)
    .map((sub) => ({
      subscriptionId: sub.id,
      clientId: sub.client.id,
      clientName: sub.client.name,
      email: sub.client.email,
      nextBillingDate: new Date(sub.nextBillingDate),
      amountMonthly: sub.amountMonthly,
      daysRemaining: calculateDaysRemaining(new Date(sub.nextBillingDate)),
      isUrgent: isUpcomingRenewal(new Date(sub.nextBillingDate), windowDays),
      siteUrl: sub.client.siteUrl,
    }))
    .filter((renewal) => renewal.isUrgent)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}
