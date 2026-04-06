// Test script to verify webhook processing
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testWebhook() {
  console.log('Testing webhook subscription creation...');
  
  try {
    // Create a test customer
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer'
    });
    
    console.log('Created customer:', customer.id);
    
    // First create a price
    const price = await stripe.prices.create({
      currency: 'usd',
      product_data: {
        name: 'Monthly Maintenance',
        description: 'Site maintenance and support',
      },
      recurring: {
        interval: 'month',
      },
      unit_amount: 6000, // $60.00
    });
    
    console.log('Created price:', price.id);
    
    // Create a test subscription using the price
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: price.id
      }],
      metadata: {
        clientId: '1', // Test client ID
        checkoutSessionId: 'test_session_' + Date.now()
      }
    });
    
    console.log('Created subscription:', subscription.id);
    console.log('Subscription status:', subscription.status);
    console.log('Amount:', subscription.items.data[0].price.unit_amount);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testWebhook();
