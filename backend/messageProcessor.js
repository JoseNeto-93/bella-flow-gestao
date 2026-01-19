import {
  getSalonConfig,
  getStoredAppointments,
  saveAppointments,
  incrementMessageUsage,
  getSalonPlan,
} from './dataService.js';

import {
  getAvailableTimeSlots,
  isTimeAvailable,
} from './schedulingService.js';

import {
  canProcessMessage,
  limitReachedMessage,
} from './messageLimiter.js';

import crypto from 'crypto';

const sessions = new Map();

/**
 * salonId  → salão pagante
 * sessionId → cliente final (WhatsApp)
 */
export function processMessage(salonId, sessionId, message) {
  // 🔒 Limite SaaS
  if (!canProcessMessage(salonId)) {
    return limitReachedMessage(getSalonPlan(salonId));
  }

  incrementMessageUsage(salonId);

  const text = message.toLowerCase().trim();
  const config = getSalonConfig(salonId);

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      step: 'start',
      service: null,
      date: null,
    });
  }

  const session = sessions.get(sessionId);

  /* =====================
     STEP 1 — INÍCIO
  ====================== */
  if (session.step === 'start') {
    session.step = 'choose_service';

    return (
      `👋 Olá! Bem-vindo(a) ao *${config.name}* 💅\n\n` +
      `Como posso te ajudar hoje? Você pode:\n\n` +
      `🔹 Escolher um dos nossos serviços:\n` +
      config.services.map(s => `   • ${s.name} - R$ ${s.price}`).join('\n') +
      `\n\n🔹 Ou me diga o que você precisa!\n` +
      `(Ex: "Quero fazer unha", "Preciso cortar o cabelo", etc)`
    );
  }

  /* =====================
     STEP 2 — SERVIÇO
  ====================== */
  if (session.step === 'choose_service') {
    // Mapeamento de palavras-chave para serviços
    const keywordMap = {
      // Unhas
      'unha': ['manicure', 'pedicure', 'alongamento'],
      'manicure': ['manicure'],
      'pedicure': ['pedicure'],
      'alongamento': ['alongamento'],
      'pé': ['pedicure'],
      'pes': ['pedicure'],
      'mao': ['manicure'],
      'mão': ['manicure'],
      'alongar': ['alongamento'],
      'fibra': ['alongamento'],
      // Cabelo
      'cabelo': ['pintar', 'progressiva', 'penteado', 'corte', 'escova', 'hidratação'],
      'pintar': ['pintar'],
      'tingir': ['pintar'],
      'colorir': ['pintar'],
      'tintura': ['pintar'],
      'progressiva': ['progressiva'],
      'penteado': ['penteado'],
      'pentear': ['penteado'],
      'cortar': ['corte'],
      'corte': ['corte'],
      'escova': ['escova'],
      'hidratação': ['hidratação'],
      'hidratar': ['hidratação'],
      'hidrata': ['hidratação'],
      // Outros
      'sobrancelha': ['design'],
      'outro': ['outro']
    };

    // Primeiro tenta match direto
    let service = config.services.find(s => {
      const serviceLower = s.name.toLowerCase();
      return text.includes(serviceLower);
    });

    // Se não encontrou, tenta por palavras-chave
    if (!service) {
      for (const [keyword, serviceNames] of Object.entries(keywordMap)) {
        if (text.includes(keyword)) {
          service = config.services.find(s => 
            serviceNames.some(name => s.name.toLowerCase().includes(name))
          );
          if (service) break;
        }
      }
    }

    if (!service) {
      return (
        `❌ Desculpe, não entendi qual serviço você quer.\n\n` +
        `Temos estes serviços disponíveis:\n\n` +
        config.services.map(s => `• ${s.name} - R$ ${s.price}`).join('\n') +
        `\n\nPor favor, escolha um! Pode digitar:\n` +
        `"manicure", "pintar cabelo", "progressiva", etc 😊`
      );
    }

    session.service = service;
    session.step = 'choose_date';

    return (
      `✨ Perfeito! Você escolheu: *${service.name}*\n` +
      `💰 Valor: R$ ${service.price}\n\n` +
      `📅 Para qual data você gostaria de agendar?\n` +
      `(Use o formato DD/MM, exemplo: 15/01)`
    );
  }

  /* =====================
     STEP 3 — DATA
  ====================== */
  if (session.step === 'choose_date') {
    const match = text.match(/(\d{2})\/(\d{2})/);
    if (!match) {
      return '❌ Data inválida. Use o formato DD/MM.';
    }

    const [, d, m] = match;
    const year = new Date().getFullYear();
    session.date = `${year}-${m}-${d}`;
    session.step = 'choose_time';

    const appointments = getStoredAppointments(salonId);

    const times = getAvailableTimeSlots(
      appointments,
      session.date,
      session.service.name
    );

    if (!times.length) {
      session.step = 'choose_date';
      return '❌ Não há horários disponíveis nesse dia. Escolha outra data.';
    }

    return (
      `📆 Ótimo! Para o dia ${d}/${m}:\n\n` +
      `⏰ Horários disponíveis:\n\n` +
      times.map(t => `   • ${t}`).join('\n') +
      `\n\nQual horário você prefere? (Digite o horário)`
    );
  }

  /* =====================
     STEP 4 — HORÁRIO
  ====================== */
  if (session.step === 'choose_time') {
    const time = text.match(/\d{2}:\d{2}/)?.[0];
    if (!time) {
      return (
        `❌ Não consegui entender o horário.\n\n` +
        `Por favor, digite no formato: HH:MM\n` +
        `Exemplo: 14:30 ou 09:00`
      );
    }

    const appointments = getStoredAppointments(salonId);

    const available = isTimeAvailable(
      appointments,
      session.date,
      time,
      session.service.name
    );

    if (!available) {
      return '❌ Esse horário já está ocupado. Escolha outro.';
    }

    const newAppointment = {
      id: crypto.randomUUID(),
      customerName: 'Cliente WhatsApp',
      service: session.service.name,
      date: session.date,
      time,
      value: session.service.price,
      status: 'scheduled',
    };

    appointments.push(newAppointment);
    
    saveAppointments(salonId, appointments);
    sessions.delete(sessionId);

    return (
      `✅ *Agendamento Confirmado!*\n\n` +
      `💅 *Serviço:* ${session.service.name}\n` +
      `💰 *Valor:* R$ ${session.service.price}\n` +
      `📅 *Data:* ${session.date.split('-').reverse().join('/')}\n` +
      `⏰ *Horário:* ${time}\n\n` +
      `Estamos te esperando! 🎉\n` +
      `Caso precise remarcar, é só mandar mensagem! 😊`
    );
  }

  return '❓ Digite *oi* para iniciar o atendimento.';
}