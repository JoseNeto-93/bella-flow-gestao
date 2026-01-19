/**
 * Email e SMS Service - Envio de notificações
 * 
 * Suporta:
 * - SendGrid (Email)
 * - Twilio (SMS)
 */

import nodemailer from 'nodemailer';

// Transporter de email (SendGrid ou SMTP genérico)
let emailTransporter = null;

if (process.env.SMTP_HOST || process.env.SENDGRID_API_KEY) {
  const config = process.env.SENDGRID_API_KEY
    ? {
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      }
    : {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

  emailTransporter = nodemailer.createTransport(config);
  console.log('[Email] Transporter configurado');
}

// Cliente Twilio (SMS)
let twilioClient = null;

async function initTwilio() {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = await import('twilio');
      twilioClient = twilio.default(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('[SMS] Twilio configurado');
    } catch (err) {
      console.warn('[SMS] Twilio não disponível:', err.message);
    }
  }
}

// Inicializar Twilio assincronamente
initTwilio();

/**
 * Enviar email
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!emailTransporter) {
    console.warn('[Email] Transporter não configurado');
    return { success: false, error: 'Email não configurado' };
  }

  try {
    const from = process.env.EMAIL_FROM || 'noreply@frontzap.com.br';

    const info = await emailTransporter.sendMail({
      from,
      to,
      subject,
      text,
      html: html || text,
    });

    console.log(`[Email] Enviado para ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Erro ao enviar:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Enviar SMS via Twilio
 */
export async function sendSMS(to, body) {
  if (!twilioClient) {
    console.warn('[SMS] Twilio não configurado');
    return { success: false, error: 'SMS não configurado' };
  }

  try {
    const from = process.env.TWILIO_PHONE_NUMBER;

    const message = await twilioClient.messages.create({
      from,
      to,
      body,
    });

    console.log(`[SMS] Enviado para ${to}: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (err) {
    console.error('[SMS] Erro ao enviar:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Enviar token de recuperação de senha
 */
export async function sendPasswordResetToken(phone, token) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  // Preferir SMS para celulares brasileiros
  if (twilioClient && phone.match(/^\+?55/)) {
    const message = `🔐 Sua senha FrontZap\n\nCódigo de recuperação: ${token}\n\nOu acesse: ${resetUrl}\n\nVálido por 15 minutos.`;
    return sendSMS(phone, message);
  }

  // Fallback: email (se configurado)
  if (emailTransporter) {
    const html = `
      <h2>Recuperação de Senha - FrontZap</h2>
      <p>Você solicitou a recuperação de senha.</p>
      <p><strong>Código:</strong> <code>${token}</code></p>
      <p>Ou <a href="${resetUrl}">clique aqui para redefinir</a></p>
      <p><em>Válido por 15 minutos.</em></p>
    `;

    return sendEmail({
      to: phone, // Assume que phone pode ser email
      subject: '🔐 Recuperação de Senha - FrontZap',
      text: `Código de recuperação: ${token}\nVálido por 15 minutos.`,
      html,
    });
  }

  // Se nada estiver configurado, retornar erro
  console.warn('[Notification] Nenhum serviço configurado para envio');
  return { success: false, error: 'Serviços de notificação não configurados' };
}

/**
 * Enviar notificação de pagamento
 */
export async function sendPaymentNotification(salon, plan, status) {
  const phone = salon.phone;
  const subject = status === 'success' ? '✅ Pagamento Confirmado' : '❌ Falha no Pagamento';
  
  const message = status === 'success'
    ? `Olá ${salon.name}! Seu pagamento do plano ${plan.toUpperCase()} foi confirmado. Obrigado! 🎉`
    : `Olá ${salon.name}. Identificamos uma falha no pagamento do plano ${plan.toUpperCase()}. Por favor, atualize seus dados.`;

  // Tentar SMS primeiro
  if (twilioClient) {
    return sendSMS(phone, message);
  }

  // Fallback: email
  if (emailTransporter) {
    return sendEmail({
      to: phone,
      subject,
      text: message,
    });
  }

  return { success: false, error: 'Nenhum serviço configurado' };
}

/**
 * Enviar alerta de limite de mensagens
 */
export async function sendUsageLimitAlert(salon, percentage) {
  const phone = salon.phone;
  const message = percentage >= 100
    ? `⚠️ ${salon.name}, você atingiu o limite de mensagens do seu plano. Faça upgrade para continuar!`
    : `⚠️ ${salon.name}, você já usou ${percentage.toFixed(0)}% das mensagens do seu plano. Considere fazer upgrade.`;

  // Tentar SMS primeiro
  if (twilioClient) {
    return sendSMS(phone, message);
  }

  // Fallback: email
  if (emailTransporter) {
    return sendEmail({
      to: phone,
      subject: '⚠️ Alerta de Uso - FrontZap',
      text: message,
    });
  }

  return { success: false, error: 'Nenhum serviço configurado' };
}
