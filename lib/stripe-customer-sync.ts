import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * When webhooks miss or the DB is out of sync, pull successful charges (and an
 * active subscription if missing) from Stripe for this client.
 */
export async function syncStripeDataForClient(clientId: number): Promise<void> {
  if (!process.env.STRIPE_SECRET_KEY) return;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      subscriptions: { take: 1 },
      payments: { take: 1 },
    },
  });

  if (!client?.email) return;

  const hasPayments = client.payments.length > 0;
  const hasSubscription = client.subscriptions.length > 0;
  if (hasPayments && hasSubscription) return;

  const email = client.email.trim().toLowerCase();

  let customerId = client.stripeCustomerId;
  if (!customerId) {
    const existing = await stripe.customers.list({ email, limit: 5 });
    const match =
      existing.data.find((c) => c.email?.toLowerCase() === email) ??
      existing.data[0];
    if (!match) return;
    customerId = match.id;
    await prisma.client.update({
      where: { id: clientId },
      data: { stripeCustomerId: customerId },
    });
  }

  if (!hasPayments) {
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 50,
    });

    for (const ch of charges.data) {
      if (ch.status !== "succeeded") continue;
      if (ch.amount_refunded && ch.amount_refunded >= ch.amount) continue;

      const pi = ch.payment_intent;
      const stripePaymentId =
        typeof pi === "string"
          ? pi
          : pi && typeof pi === "object" && "id" in pi
            ? (pi as Stripe.PaymentIntent).id
            : ch.id;

      const row = await prisma.payment.findUnique({
        where: { stripePaymentId },
      });
      if (row) continue;

      await prisma.payment.create({
        data: {
          clientId,
          stripePaymentId,
          amount: ch.amount,
          paymentType: "one_time",
          status: "succeeded",
          paidAt: new Date(ch.created * 1000),
          invoiceUrl: ch.receipt_url ?? null,
        },
      });
    }
  }

  if (!hasSubscription) {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });
    const active = subs.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );
    if (!active) return;

    const existing = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: active.id },
    });
    if (existing) return;

    const item = active.items.data[0];
    const unitAmount = item?.price?.unit_amount ?? 0;

    await prisma.subscription.create({
      data: {
        clientId,
        stripeSubscriptionId: active.id,
        status: active.status,
        currentPeriodStart: new Date(active.current_period_start * 1000),
        currentPeriodEnd: new Date(active.current_period_end * 1000),
        nextBillingDate: new Date(active.current_period_end * 1000),
        amountMonthly: unitAmount > 0 ? unitAmount : 6000,
      },
    });
  }
}
