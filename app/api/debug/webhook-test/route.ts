import { NextResponse } from "next/server";

export async function POST() {
  try {
    // This endpoint helps verify webhook configuration
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'https://your-app.onrender.com'}/api/webhooks/stripe`;
    
    return NextResponse.json({
      message: "Webhook test endpoint",
      webhookUrl,
      environment: process.env.NODE_ENV,
      stripeSecretSet: !!process.env.STRIPE_SECRET_KEY,
      webhookSecretSet: !!process.env.STRIPE_WEBHOOK_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      instructions: [
        "1. Go to Stripe Dashboard → Developers → Webhooks",
        "2. Add endpoint URL: " + webhookUrl,
        "3. Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded",
        "4. Copy webhook secret to STRIPE_WEBHOOK_SECRET env var",
        "5. Test with Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
