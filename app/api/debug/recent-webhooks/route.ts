import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get recent payments and subscriptions
    const recentPayments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        client: {
          select: {
            email: true,
            name: true,
            pricingTier: true,
            stripeCustomerId: true
          }
        }
      }
    });

    const recentSubscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        client: {
          select: {
            email: true,
            name: true,
            pricingTier: true
          }
        }
      }
    });

    return NextResponse.json({
      recentPayments,
      recentSubscriptions,
      totalPayments: recentPayments.length,
      totalSubscriptions: recentSubscriptions.length,
      lastPayment: recentPayments[0]?.createdAt || null,
      lastSubscription: recentSubscriptions[0]?.createdAt || null
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
