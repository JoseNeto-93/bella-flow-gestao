import { PLANS } from './plans.js';
import { getSalonPlan, getMessageUsage } from './dataService.js';

export function canProcessMessage(salonId) {
  const plan = getSalonPlan(salonId);
  const usage = getMessageUsage(salonId);
  const limit = PLANS[plan].messageLimit;

  return usage < limit;
}

export function limitReachedMessage(plan) {
  return (
    `🚫 Limite de mensagens atingido.\n\n` +
    `Plano atual: *${plan.toUpperCase()}*\n\n` +
    `Faça upgrade para continuar atendendo seus clientes 🚀`
  );
}
