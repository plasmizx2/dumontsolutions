/** Human-readable plan labels and catalog pricing (aligned with checkout amounts). */

export function formatPlanLabel(tier: string): string {
  const t = (tier || "").toLowerCase();
  if (t === "basic_site") return "Basic Site";
  if (t === "site_maintenance") return "Site + Maintenance";
  if (t === "multi_site") return "Multi-Site + Maintenance";
  if (t === "pending") return "Pending checkout";
  return tier || "—";
}

export function formatCatalogPricing(tier: string, numSites: number = 1): string {
  const n = Math.max(1, Math.min(50, numSites || 1));
  const t = (tier || "").toLowerCase();
  if (t === "basic_site") return "$225 one-time";
  if (t === "site_maintenance") return "$225 one-time + $60/mo";
  if (t === "multi_site") return `$${175 * n} one-time ($175 × ${n}) + $50/mo`;
  if (t === "pending") return "—";
  return "—";
}

export function formatMonthlyFromCents(amountCents: number | null | undefined): string {
  if (amountCents == null || amountCents <= 0) return "";
  return `$${(amountCents / 100).toFixed(2)}/mo`;
}

/** Prefer active subscription with the highest monthly amount (Stripe truth). */
export function getActiveMonthlyCents(
  subscriptions: Array<{ status: string; amountMonthly: number }> | undefined
): number | null {
  if (!subscriptions?.length) return null;
  const active = subscriptions.filter((s) => s.status === "active");
  if (!active.length) return null;
  return Math.max(...active.map((s) => s.amountMonthly || 0)) || null;
}

/** Days left in a 30-day build window from first successful payment; null if none. */
export function getBuildWindowDaysRemaining(
  payments: Array<{ status: string; paidAt: string | null; createdAt: string }>
): number | null {
  const succeeded = payments
    .filter((p) => p.status === "succeeded")
    .sort(
      (a, b) =>
        new Date(a.paidAt || a.createdAt).getTime() -
        new Date(b.paidAt || b.createdAt).getTime()
    );
  if (succeeded.length === 0) return null;
  const start = new Date(succeeded[0].paidAt || succeeded[0].createdAt);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
