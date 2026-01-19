import { getSalon, getMessageUsage, incrementMessageUsage, getSalonPlan } from './dataService.js';
import { PLANS } from './plans.js';
import { sendUsageLimitAlert } from './notificationService.js';

/**
 * Verificar se o salão atingiu o limite de mensagens do plano
 */
export function checkMessageLimit(salonId) {
  const salon = getSalon(salonId);
  const plan = PLANS[salon.plan] || PLANS.starter;
  const used = salon.messagesUsed || 0;
  
  return {
    allowed: used < plan.messageLimit,
    used,
    limit: plan.messageLimit,
    remaining: Math.max(0, plan.messageLimit - used),
    percentage: Math.min(100, (used / plan.messageLimit) * 100),
  };
}

/**
 * Middleware para verificar limite antes de processar mensagem
 */
export function checkLimitMiddleware(salonId) {
  const check = checkMessageLimit(salonId);
  
  if (!check.allowed) {
    return {
      error: 'message_limit_exceeded',
      message: `Limite de ${check.limit} mensagens atingido. Faça upgrade do seu plano.`,
      used: check.used,
      limit: check.limit,
    };
  }
  
  return { allowed: true };
}

/**
 * Processar mensagem com verificação de limite
 */
export async function processMessageWithLimit(salonId, sessionId, message, processorFn) {
  // Verificar limite
  const limitCheck = checkLimitMiddleware(salonId);
  
  if (limitCheck.error) {
    return limitCheck.message;
  }
  
  // Verificar se está próximo do limite (90%)
  const check = checkMessageLimit(salonId);
  if (check.percentage >= 90 && !check.alertSent) {
    const salon = getSalon(salonId);
    sendUsageLimitAlert(salon, check.percentage).catch(err => 
      console.error('[MessageLimit] Erro ao enviar alerta:', err)
    );
    salon.alertSent = true; // Evitar spam
  }
  
  // Processar mensagem
  const reply = processorFn(salonId, sessionId, message);
  
  // Incrementar contador
  incrementMessageUsage(salonId);
  
  return reply;
}

/**
 * Obter estatísticas de uso do salão
 */
export function getUsageStats(salonId) {
  const salon = getSalon(salonId);
  const plan = PLANS[salon.plan] || PLANS.starter;
  const check = checkMessageLimit(salonId);
  
  return {
    plan: {
      name: plan.name,
      type: salon.plan,
      price: plan.price,
    },
    messages: {
      used: check.used,
      limit: check.limit,
      remaining: check.remaining,
      percentage: check.percentage.toFixed(1),
    },
    appointments: {
      total: salon.appointments?.length || 0,
      pending: salon.appointments?.filter(a => a.status === 'scheduled').length || 0,
      completed: salon.appointments?.filter(a => a.status === 'completed').length || 0,
    },
    status: check.percentage >= 90 ? 'warning' : check.percentage >= 100 ? 'blocked' : 'active',
  };
}
