import 'dotenv/config';
import Stripe from 'stripe';

async function main() {
  const secret = process.env.STRIPE_SECRET;
  if (!secret) {
    console.error('Set STRIPE_SECRET in environment before running this script.');
    process.exit(1);
  }

  const stripe = new Stripe(secret, { apiVersion: '2022-11-15' });

  const planDefs = [
    { key: 'starter', name: 'Bella Flow - Starter', amount: 9700 },
    { key: 'pro', name: 'Bella Flow - Pro', amount: 29900 },
    { key: 'agency', name: 'Bella Flow - Agency', amount: 79900 },
  ];

  const result = {};

  for (const p of planDefs) {
    // Try find existing product by name
    let product = null;
    try {
      const list = await stripe.products.list({ limit: 100 });
      product = list.data.find(x => x.name === p.name);
    } catch (err) {
      console.error('Error listing products', err.message || err);
    }

    if (!product) {
      product = await stripe.products.create({ name: p.name, description: `${p.name} mensal` });
      console.log('Created product', product.id, p.name);
    } else {
      console.log('Found existing product', product.id, p.name);
    }

    // Create a monthly recurring price
    const price = await stripe.prices.create({
      unit_amount: p.amount,
      currency: 'brl',
      recurring: { interval: 'month' },
      product: product.id,
      nickname: `${p.name} Monthly`,
    });

    console.log(`Created price for ${p.key}: ${price.id} (R$ ${(p.amount/100).toFixed(2)}/m)`);
    result[p.key] = { productId: product.id, priceId: price.id, amount: p.amount };
  }

  console.log('\nSummary:');
  console.log(JSON.stringify(result, null, 2));
  console.log('\nAdd these to your .env.production (STRIPE_PRICE_STARTER, STRIPE_PRICE_PRO, STRIPE_PRICE_AGENCY)');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
