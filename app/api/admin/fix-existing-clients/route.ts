import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const session = await getServerSession(authConfig);
    const role = (session?.user as any)?.role as string | undefined;

    if (!session || role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    console.log("🔧 Fixing existing clients who paid but have no subscription...");

    // Get all clients who have payments but no active subscription
    const clients = await prisma.client.findMany({
      include: {
        payments: true,
        subscriptions: true,
      },
    });

    const fixedClients = [];

    for (const client of clients) {
      if (client.payments.length > 0 && client.subscriptions.length === 0) {
        console.log(`🔍 Found client with payments but no subscription: ${client.id} (${client.email})`);

        // Check if they paid $200 (site_subscription plan)
        const has200Payment = client.payments.some(p => p.amount === 20000);
        
        if (has200Payment) {
          console.log(`💰 Client ${client.id} paid $200, updating pricing tier...`);
          
          // Update pricing tier to site_subscription
          await prisma.client.update({
            where: { id: client.id },
            data: { pricingTier: 'site_subscription' }
          });

          fixedClients.push({
            clientId: client.id,
            email: client.email,
            payments: client.payments.length,
            updated: true
          });
        }
      }
    }

    console.log(`✅ Fixed ${fixedClients.length} existing clients`);

    return NextResponse.json({
      message: "Fixed existing clients",
      fixedClients,
      totalFixed: fixedClients.length
    });

  } catch (error) {
    console.error("Error fixing existing clients:", error);
    return NextResponse.json(
      { error: "Failed to fix existing clients" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
