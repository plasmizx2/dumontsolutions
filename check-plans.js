// Check what plans were purchased and if subscriptions are missing
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPlans() {
  try {
    console.log('Checking clients and their plans...\n');
    
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
    
    console.log(`Found ${clients.length} clients:\n`);
    
    for (const client of clients) {
      console.log(`👤 Client: ${client.name} (${client.email})`);
      console.log(`   Pricing Tier: ${client.pricingTier}`);
      console.log(`   Stripe Customer ID: ${client.stripeCustomerId || 'None'}`);
      console.log(`   Created: ${client.createdAt.toLocaleDateString()}`);
      
      console.log(`   💰 Payments (${client.payments.length}):`);
      for (const payment of client.payments) {
        console.log(`     - $${(payment.amount / 100).toFixed(2)} ${payment.paymentType} on ${payment.paidAt?.toLocaleDateString()} - ${payment.status}`);
      }
      
      console.log(`   🔄 Subscriptions (${client.subscriptions.length}):`);
      for (const sub of client.subscriptions) {
        console.log(`     - ${sub.status} - $${(sub.amountMonthly / 100).toFixed(2)}/mo - ${sub.stripeSubscriptionId}`);
      }
      
      // Check if this client should have a subscription but doesn't
      const shouldHaveSubscription = client.pricingTier === 'site_maintenance' || client.pricingTier === 'multi_site';
      const hasSubscription = client.subscriptions.length > 0;
      
      if (shouldHaveSubscription && !hasSubscription) {
        console.log(`   ⚠️  WARNING: Client should have a subscription but doesn't!`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans();
