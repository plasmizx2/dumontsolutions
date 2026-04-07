import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { sendWelcomeEmail } from "@/lib/emails";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const prisma = new PrismaClient();

function generatePortalCode() {
  const chunk = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `DS-${chunk()}${chunk()}-${chunk()}${chunk()}`;
}

function paymentIntentIdFromSession(session: Stripe.Checkout.Session): string {
  const pi = session.payment_intent;
  if (typeof pi === "string") return pi;
  if (pi && typeof pi === "object" && "id" in pi) {
    return (pi as Stripe.PaymentIntent).id;
  }
  return session.id;
}

/** Stripe Checkout `session.url` is the payment page, not a receipt — use Charge.receipt_url. */
function looksLikeCheckoutPageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes("checkout.stripe.com/c/pay") || url.includes("/c/pay/cs_");
}

async function receiptUrlFromLatestCharge(
  latestCharge: string | Stripe.Charge | null
): Promise<string | null> {
  if (!latestCharge) return null;
  if (typeof latestCharge === "string") {
    const ch = await stripe.charges.retrieve(latestCharge);
    return ch.receipt_url ?? null;
  }
  return latestCharge.receipt_url ?? null;
}

/** Receipt URL for one-time Checkout (mode=payment) after completion. */
async function receiptUrlFromCheckoutSession(
  sessionId: string
): Promise<string | null> {
  try {
    const sess = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent.latest_charge"],
    });
    const pi = sess.payment_intent;
    if (!pi) return null;
    if (typeof pi === "string") {
      const intent = await stripe.paymentIntents.retrieve(pi, {
        expand: ["latest_charge"],
      });
      return receiptUrlFromLatestCharge(intent.latest_charge);
    }
    return receiptUrlFromLatestCharge(
      (pi as Stripe.PaymentIntent).latest_charge
    );
  } catch (e) {
    console.error("receiptUrlFromCheckoutSession:", e);
    return null;
  }
}

async function invoiceOrReceiptUrl(invoice: Stripe.Invoice): Promise<string | null> {
  if (invoice.hosted_invoice_url) return invoice.hosted_invoice_url;
  if (invoice.invoice_pdf) return invoice.invoice_pdf;
  try {
    const full = await stripe.invoices.retrieve(invoice.id, {
      expand: ["payment_intent.latest_charge"],
    });
    if (full.hosted_invoice_url) return full.hosted_invoice_url;
    if (full.invoice_pdf) return full.invoice_pdf;
    const pi = full.payment_intent;
    if (typeof pi === "string") {
      const intent = await stripe.paymentIntents.retrieve(pi, {
        expand: ["latest_charge"],
      });
      return receiptUrlFromLatestCharge(intent.latest_charge);
    }
    if (pi && typeof pi === "object" && "latest_charge" in pi) {
      return receiptUrlFromLatestCharge(
        (pi as Stripe.PaymentIntent).latest_charge
      );
    }
  } catch (e) {
    console.error("invoiceOrReceiptUrl:", e);
  }
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  console.log("🔔 Webhook received:", {
    signature: signature ? "present" : "missing",
    bodyLength: body.length,
    eventType: body.includes('"type":') ? JSON.parse(body).type : "unknown"
  });

  if (!signature) {
    console.error("❌ Missing Stripe signature");
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
    console.log("✅ Webhook signature verified, event type:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const promoMeta = session.metadata?.promoCodeId;
        if (promoMeta && session.id) {
          const pid = parseInt(promoMeta, 10);
          if (!Number.isNaN(pid)) {
            const already = await prisma.promoRedemptionLog.findUnique({
              where: { checkoutSessionId: session.id },
            });
            if (!already) {
              try {
                await prisma.$transaction([
                  prisma.promoRedemptionLog.create({
                    data: {
                      checkoutSessionId: session.id,
                      promoCodeId: pid,
                    },
                  }),
                  prisma.promoCode.update({
                    where: { id: pid },
                    data: { timesRedeemed: { increment: 1 } },
                  }),
                ]);
              } catch (e) {
                console.error("Promo redemption log failed:", e);
              }
            }
          }
        }

        const rawMeta = session.metadata || {};
        const clientEmail = String(rawMeta.clientEmail || "")
          .trim()
          .toLowerCase();
        const clientName = String(rawMeta.clientName || "").trim() || "Customer";
        const plan = rawMeta.plan;

        if (!clientEmail || !plan) {
          console.error("Missing metadata in checkout session", session.id);
          return NextResponse.json(
            { error: "Missing metadata" },
            { status: 400 }
          );
        }

        let customerId: string | null =
          typeof session.customer === "string"
            ? session.customer
            : session.customer && typeof session.customer === "object"
              ? (session.customer as Stripe.Customer).id
              : null;

        if (!customerId) {
          const full = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["customer", "payment_intent"],
          });
          customerId =
            typeof full.customer === "string"
              ? full.customer
              : full.customer?.id ?? null;
        }

        // Create or update client
        let client = await prisma.client.findUnique({
          where: { email: clientEmail },
        });

        let portalCode: string | undefined;
        const numSitesMeta =
          plan === "multi_site"
            ? Math.max(
                1,
                Math.min(50, Number(session.metadata?.numSites || 1))
              )
            : undefined;

        if (!client) {
          portalCode = generatePortalCode();
          const portalCodeHash = await bcrypt.hash(portalCode, 10);

          client = await prisma.client.create({
            data: {
              name: clientName,
              email: clientEmail,
              pricingTier: plan,
              numSites: numSitesMeta ?? 1,
              stripeCustomerId: customerId ?? undefined,
              portalCodeHash,
            },
          });
        } else {
          const updateData: {
            stripeCustomerId?: string;
            pricingTier: string;
            name: string;
            numSites?: number;
            portalCodeHash?: string;
          } = {
            pricingTier: plan,
            name: clientName,
          };
          if (customerId) {
            updateData.stripeCustomerId = customerId;
          }
          if (numSitesMeta !== undefined) {
            updateData.numSites = numSitesMeta;
          }
          if (!client.portalCodeHash) {
            portalCode = generatePortalCode();
            updateData.portalCodeHash = await bcrypt.hash(portalCode, 10);
          }
          client = await prisma.client.update({
            where: { id: client.id },
            data: updateData,
          });
        }

        const receiptUrl = await receiptUrlFromCheckoutSession(session.id);

        const stripePayId = paymentIntentIdFromSession(session);
        const existingPay = await prisma.payment.findUnique({
          where: { stripePaymentId: stripePayId },
        });
        if (!existingPay) {
          await prisma.payment.create({
            data: {
              clientId: client.id,
              stripePaymentId: stripePayId,
              amount: session.amount_total || 0,
              paymentType: "one_time",
              status: "succeeded",
              paidAt: new Date(),
              invoiceUrl: receiptUrl,
            },
          });
        } else if (
          receiptUrl &&
          (!existingPay.invoiceUrl || looksLikeCheckoutPageUrl(existingPay.invoiceUrl))
        ) {
          await prisma.payment.update({
            where: { id: existingPay.id },
            data: { invoiceUrl: receiptUrl },
          });
        }

        // Send welcome email
        try {
          await sendWelcomeEmail({
            clientName,
            email: clientEmail,
            billingDate: new Date(),
            amount: session.amount_total || 0,
            portalCode,
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }

        // Create subscription for any payment that needs one
        // If payment amount is $200, assume they want subscription
        if (session.amount_total === 20000) {
          console.log(`🔄 Creating subscription for $200 payment, client: ${client.id}, customerId: ${customerId}`);
          
          if (!customerId) {
            console.error("❌ No Stripe customer id on checkout session; cannot create subscription", session.id);
            // Try to find customer by email
            try {
              const customers = await stripe.customers.list({ email: clientEmail, limit: 1 });
              if (customers.data.length > 0) {
                customerId = customers.data[0].id;
                console.log(`🔍 Found customer by email: ${customerId}`);
                await prisma.client.update({
                  where: { id: client.id },
                  data: { stripeCustomerId: customerId }
                });
              }
            } catch (findErr) {
              console.error("❌ Failed to find customer by email:", findErr);
            }
          }
          
          if (!customerId) {
            console.error("❌ Still no customer ID after lookup, skipping subscription creation");
          } else {
            const subscriptionPrice = 5000; // $50/mo
            
            console.log(`💰 Creating subscription with price: $${subscriptionPrice/100}/mo`);
            
            try {
              // First create a product, then price, then subscription
              const product = await stripe.products.create({
                name: "Monthly Maintenance",
                description: "Site maintenance and support",
              });
              
              const price = await stripe.prices.create({
                currency: "usd",
                product: product.id,
                recurring: {
                  interval: "month",
                },
                unit_amount: subscriptionPrice,
              });
              
              console.log(`✅ Created product: ${product.id}, price: ${price.id}`);
              
              const stripeSubscription = await stripe.subscriptions.create(
                {
                  customer: customerId,
                  items: [
                    {
                      price: price.id,
                    },
                  ],
                  metadata: {
                    clientId: client.id.toString(),
                    checkoutSessionId: session.id,
                  },
                },
                { idempotencyKey: `checkout_sub_${session.id}` }
              );

              console.log(`✅ Created Stripe subscription: ${stripeSubscription.id} for client: ${client.id}`);

              const nextBillingDate = new Date(
                stripeSubscription.current_period_end * 1000
              );

              const existingSub = await prisma.subscription.findUnique({
                where: { stripeSubscriptionId: stripeSubscription.id },
              });
              if (!existingSub) {
                const createdSub = await prisma.subscription.create({
                  data: {
                    clientId: client.id,
                    stripeSubscriptionId: stripeSubscription.id,
                    status: "active",
                    currentPeriodStart: new Date(
                      stripeSubscription.current_period_start * 1000
                    ),
                    currentPeriodEnd: new Date(
                      stripeSubscription.current_period_end * 1000
                    ),
                    nextBillingDate: nextBillingDate,
                    amountMonthly: subscriptionPrice,
                  },
                });
                console.log(`✅ Created subscription in DB: ${createdSub.id} for client: ${client.id}`);
              } else {
                console.log(`ℹ️ Subscription already exists in DB: ${existingSub.id}`);
              }
            } catch (subError) {
              console.error("❌ Failed to create subscription:", {
                error: (subError as Error).message,
                stack: (subError as Error).stack,
                customerId,
                clientEmail,
                plan
              });
            }
          }
        } else {
          console.log(`ℹ️ No subscription needed for $${(session.amount_total || 0) / 100} payment`);
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const clientId = subscription.metadata?.clientId;

        if (clientId) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              status: subscription.status as string,
              currentPeriodStart: new Date(
                subscription.current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              nextBillingDate: new Date(
                subscription.current_period_end * 1000
              ),
            },
          });
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: "canceled",
          },
        });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription;

        if (subscriptionId && typeof subscriptionId === "string") {
          const subscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
          });

          if (subscription) {
            const docUrl = await invoiceOrReceiptUrl(invoice);
            await prisma.payment.create({
              data: {
                clientId: subscription.clientId,
                stripePaymentId: invoice.id,
                amount: invoice.total || 0,
                paymentType: "subscription",
                status: "succeeded",
                paidAt: new Date(
                  ((invoice as any).status_transitions?.paid_at
                    ? (invoice as any).status_transitions.paid_at * 1000
                    : Date.now())
                ),
                invoiceUrl: docUrl,
              },
            });
          }
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
