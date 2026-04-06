import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log("🧪 Test webhook received:", {
      type: body.type || 'unknown',
      data: body.data || 'no data',
      timestamp: new Date().toISOString()
    });

    // If this is a checkout.session.completed test, create a test payment
    if (body.type === 'checkout.session.completed') {
      // Find or create test client
      let client = await prisma.client.findFirst({
        where: { email: 'plasmiz75@gmail.com' }
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            name: 'Test User',
            email: 'plasmiz75@gmail.com',
            pricingTier: 'basic_site',
            stripeCustomerId: 'cus_test_123456'
          }
        });
      }

      // Create test payment
      const payment = await prisma.payment.create({
        data: {
          clientId: client.id,
          stripePaymentId: 'pi_test_' + Date.now(),
          amount: 22500,
          paymentType: 'one_time',
          status: 'succeeded',
          paidAt: new Date(),
          invoiceUrl: 'https://stripe.com/receipt/test'
        }
      });

      console.log("✅ Created test payment:", payment.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Test webhook processed",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Test webhook error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
