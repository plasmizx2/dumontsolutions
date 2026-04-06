import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all payments for debugging
    const allPayments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
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

    // Get all clients to see what's in the database
    const allClients = await prisma.client.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        pricingTier: true,
        createdAt: true,
        _count: {
          select: {
            payments: true,
            subscriptions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      totalPayments: allPayments.length,
      totalClients: allClients.length,
      payments: allPayments,
      clients: allClients
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
