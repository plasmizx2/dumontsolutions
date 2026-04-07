import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const role = (session?.user as { role?: string })?.role;
    const clientId = (session?.user as { clientId?: number })?.clientId;

    const result = {
      session: !!session,
      role,
      clientId,
      authorized: !!(session && role === "client" && clientId)
    };

    if (!result.authorized) {
      return NextResponse.json({
        ...result,
        error: "Not authorized"
      });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        email: true,
        name: true,
        pricingTier: true,
        stripeCustomerId: true,
        _count: {
          select: {
            payments: true,
            subscriptions: true
          }
        }
      }
    });

    return NextResponse.json({
      ...result,
      client,
      canBuySubscription: true, // Anyone can buy subscription now
      subscriptionAvailable: true
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
