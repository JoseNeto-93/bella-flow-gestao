/**
 * Stripe Webhook Handler - Automação de assinaturas
 * 
 * Gerencia eventos do Stripe:
 * - customer.subscription.created: Nova assinatura
 * - customer.subscription.updated: Mudança de plano
 * - customer.subscription.deleted: Cancelamento
 * - invoice.payment_succeeded: Pagamento confirmado
 * - invoice.payment_failed: Falha no pagamento
 */

import Stripe from 'stripe';
import { getSalon, updateSalonPlan } from './dataService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET || '', {
  apiVersion: '2023-10-16',
});

// Mapeamento Price ID → Plan Type
const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRICE_STARTER]: 'starter',
  [process.env.STRIPE_PRICE_PRO]: 'pro',
  [process.env.STRIPE_PRICE_AGENCY]: 'agency',
};

/**
 * Processa evento do Stripe
 */
export async function handleStripeWebhook(event) {
  console.log(`[Stripe] Evento recebido: ${event.type}`);

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return handleSubscriptionChange(event.data.object);

    case 'customer.subscription.deleted':
      return handleSubscriptionCancelled(event.data.object);

    case 'invoice.payment_succeeded':
      return handlePaymentSucceeded(event.data.object);

    case 'invoice.payment_failed':
      return handlePaymentFailed(event.data.object);

    default:
      console.log(`[Stripe] Evento ignorado: ${event.type}`);
      return { received: true };
  }
}

/**
 * Assinatura criada ou atualizada
 */
async function handleSubscriptionChange(subscription) {
  const { customer, metadata, items, status, trial_end } = subscription;

  // Identificar salão pelo metadata.salonId ou customer.metadata
  const salonId = metadata?.salonId || metadata?.salon_id;

  if (!salonId) {
    console.error('[Stripe] subscription sem salonId no metadata');
    return { error: 'missing_salon_id' };
  }

  const salon = getSalon(salonId);
  if (!salon) {
    console.error(`[Stripe] Salão ${salonId} não encontrado`);
    return { error: 'salon_not_found' };
  }

  // Identificar plano pelo Price ID
  const priceId = items.data[0]?.price?.id;
  const planType = PRICE_TO_PLAN[priceId];

  if (!planType) {
    console.error(`[Stripe] Price ID desconhecido: ${priceId}`);
    return { error: 'unknown_price_id' };
  }

  // Atualizar plano do salão
  const isActive = status === 'active' || status === 'trialing';
  const planStatus = isActive ? 'active' : 'inactive';

  updateSalonPlan(salonId, planType, {
    stripeCustomerId: customer,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    planStatus,
    trialEnd: trial_end ? new Date(trial_end * 1000).toISOString() : null,
  });

  console.log(`[Stripe] Salão ${salon.name} atualizado para plano ${planType} (${planStatus})`);

  return { success: true, plan: planType, status: planStatus };
}

/**
 * Assinatura cancelada
 */
async function handleSubscriptionCancelled(subscription) {
  const { metadata } = subscription;
  const salonId = metadata?.salonId || metadata?.salon_id;

  if (!salonId) {
    console.error('[Stripe] subscription.deleted sem salonId');
    return { error: 'missing_salon_id' };
  }

  const salon = getSalon(salonId);
  if (!salon) {
    console.error(`[Stripe] Salão ${salonId} não encontrado`);
    return { error: 'salon_not_found' };
  }

  // Downgrade para plano gratuito (se existir) ou desativar
  updateSalonPlan(salonId, 'starter', {
    planStatus: 'cancelled',
    stripeSubscriptionId: null,
  });

  console.log(`[Stripe] Assinatura cancelada para salão ${salon.name}`);

  return { success: true, status: 'cancelled' };
}

/**
 * Pagamento bem-sucedido
 */
async function handlePaymentSucceeded(invoice) {
  const { customer, subscription, amount_paid, billing_reason } = invoice;

  console.log(
    `[Stripe] Pagamento confirmado: R$${(amount_paid / 100).toFixed(2)} (${billing_reason})`
  );

  // Se for primeira cobrança, ativar período de trial (já tratado em subscription.created)
  // Se for renovação, garantir que plano está ativo

  if (subscription) {
    const sub = await stripe.subscriptions.retrieve(subscription);
    return handleSubscriptionChange(sub);
  }

  return { success: true };
}

/**
 * Falha no pagamento
 */
async function handlePaymentFailed(invoice) {
  const { customer, subscription, amount_due, attempt_count } = invoice;

  console.error(
    `[Stripe] Falha no pagamento: R$${(amount_due / 100).toFixed(2)} (tentativa ${attempt_count})`
  );

  // Após 3 tentativas, suspender acesso
  if (attempt_count >= 3 && subscription) {
    const sub = await stripe.subscriptions.retrieve(subscription);
    const salonId = sub.metadata?.salonId || sub.metadata?.salon_id;

    if (salonId) {
      updateSalonPlan(salonId, null, { planStatus: 'payment_failed' });
      console.log(`[Stripe] Acesso suspenso para salão ${salonId} (3 falhas)`);
    }
  }

  return { success: true, suspended: attempt_count >= 3 };
}

/**
 * Verifica assinatura do Stripe Webhook (segurança)
 */
export function verifyStripeSignature(payload, signature, endpointSecret) {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    return event;
  } catch (err) {
    console.error(`[Stripe] Assinatura inválida: ${err.message}`);
    throw new Error('invalid_signature');
  }
}
