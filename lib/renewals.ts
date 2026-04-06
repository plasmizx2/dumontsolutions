// Utility functions for managing client renewals and billing cycles

export interface RenewalInfo {
  clientId: number;
  clientName: string;
  email: string;
  nextBillingDate: Date;
  daysRemaining: number;
  isUrgent: boolean; // true if within 7 days
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
  if (daysRemaining <= 7) return `${daysRemaining} days`;
  return `${Math.floor(daysRemaining / 7)} weeks`;
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
    .filter((sub) => sub.status === "active" && sub.client?.pricingTier === "maintenance")
    .map((sub) => ({
      clientId: sub.client.id,
      clientName: sub.client.name,
      email: sub.client.email,
      nextBillingDate: new Date(sub.nextBillingDate),
      daysRemaining: calculateDaysRemaining(new Date(sub.nextBillingDate)),
      isUrgent: isUpcomingRenewal(new Date(sub.nextBillingDate), windowDays),
      siteUrl: sub.client.siteUrl,
    }))
    .filter((renewal) => renewal.isUrgent)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}
