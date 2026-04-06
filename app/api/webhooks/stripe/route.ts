import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { sendWelcomeEmail } from "@/lib/emails";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
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
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { clientName, clientEmail, plan } = session.metadata || {};

        if (!clientName || !clientEmail || !plan) {
          console.error("Missing metadata in checkout session");
          return NextResponse.json(
            { error: "Missing metadata" },
            { status: 400 }
          );
        }

        // Create or update client
        let client = await prisma.client.findUnique({
          where: { email: clientEmail },
        });

        if (!client) {
          client = await prisma.client.create({
            data: {
              name: clientName,
              email: clientEmail,
              pricingTier: plan,
              numSites: plan === "multi_site" ? 1 : 1,
              stripeCustomerId: session.customer as string,
            },
          });
        }

        // Create payment record
        await prisma.payment.create({
          data: {
            clientId: client.id,
            stripePaymentId: session.payment_intent as string,
            amount: session.amount_total || 0,
            paymentType: "one_time",
            status: "succeeded",
            paidAt: new Date(),
            invoiceUrl: session.url || null,
          },
        });

        // Send welcome email
        try {
          await sendWelcomeEmail({
            clientName,
            email: clientEmail,
            billingDate: new Date(),
            amount: session.amount_total || 0,
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }

        // If site_maintenance or multi_site, create subscription
        if (plan === "site_maintenance" || plan === "multi_site") {
          const subscriptionPrice = 6000; // $60.00/month
          const stripeSubscription = await stripe.subscriptions.create({
            customer: session.customer as string,
            items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: "Monthly Maintenance",
                    description: "Site maintenance and support",
                  },
                  recurring: {
                    interval: "month",
                  },
                  unit_amount: subscriptionPrice,
                },
              },
            ],
            metadata: { clientId: client.id.toString() },
          });

          const nextBillingDate = new Date(
            stripeSubscription.current_period_end * 1000
          );

          await prisma.subscription.create({
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
            await prisma.payment.create({
              data: {
                clientId: subscription.clientId,
                stripePaymentId: invoice.id,
                amount: invoice.total || 0,
                paymentType: "subscription",
                status: "succeeded",
                paidAt: new Date(invoice.paid_date ? invoice.paid_date * 1000 : Date.now()),
                invoiceUrl: invoice.hosted_invoice_url,
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
