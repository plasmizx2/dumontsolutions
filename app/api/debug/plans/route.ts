import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection first
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Get all clients with their payments and subscriptions
    const clients = await prisma.client.findMany({
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 2
        }
      }
    });
    
    let output = `Found ${clients.length} clients:\n\n`;
    const problematicClients = [];
    
    for (const client of clients) {
      output += `👤 Client: ${client.name} (${client.email})\n`;
      output += `   Pricing Tier: ${client.pricingTier}\n`;
      output += `   Stripe Customer ID: ${client.stripeCustomerId || 'None'}\n`;
      output += `   Created: ${client.createdAt.toLocaleDateString()}\n`;
      
      output += `   💰 Payments (${client.payments.length}):\n`;
      for (const payment of client.payments) {
        output += `     - $${(payment.amount / 100).toFixed(2)} ${payment.paymentType} on ${payment.paidAt?.toLocaleDateString()} - ${payment.status}\n`;
      }
      
      output += `   🔄 Subscriptions (${client.subscriptions.length}):\n`;
      for (const sub of client.subscriptions) {
        output += `     - ${sub.status} - $${(sub.amountMonthly / 100).toFixed(2)}/mo - ${sub.stripeSubscriptionId}\n`;
      }
      
      // Check if this client should have a subscription but doesn't
      const shouldHaveSubscription = client.pricingTier === 'site_maintenance' || client.pricingTier === 'multi_site';
      const hasSubscription = client.subscriptions.length > 0;
      
      if (shouldHaveSubscription && !hasSubscription) {
        output += `   ⚠️  WARNING: Client should have a subscription but doesn't!\n`;
        problematicClients.push({
          client: client.email,
          tier: client.pricingTier,
          stripeCustomerId: client.stripeCustomerId,
          payments: client.payments.length
        });
      }
      
      output += '\n';
    }
    
    return NextResponse.json({ 
      success: true,
      clients: clients,
      textOutput: output,
      count: clients.length,
      problematicClients
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        error: (error as Error).message,
        databaseUrl: process.env.DATABASE_URL ? 'set' : 'missing',
        directUrl: process.env.DIRECT_URL ? 'set' : 'missing'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
