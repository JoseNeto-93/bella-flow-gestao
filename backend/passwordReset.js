import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getSalonByPhone, updateSalonPassword } from './dataService.js';
import { sendPasswordResetToken } from './notificationService.js';

// Armazenamento temporário de tokens de reset (em produção, use Redis)
const resetTokens = new Map(); // token -> { phone, expiresAt }

/**
 * Gerar token de reset de senha
 * Retorna { success, token, phone } ou { error }
 */
export async function generateResetToken(phone) {
  const salon = getSalonByPhone(phone);
  
  if (!salon) {
    return { error: 'phone_not_found' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

  resetTokens.set(token, {
    phone,
    salonId: salon.id,
    expiresAt,
  });

  // Enviar token por SMS/Email (se configurado)
  const notificationResult = await sendPasswordResetToken(phone, token);
  
  if (notificationResult.success) {
    console.log(`[PasswordReset] Token enviado para ${phone}`);
    return { success: true, message: 'Token enviado com sucesso' };
  } else {
    // Fallback: retornar token na resposta (apenas desenvolvimento)
    console.warn('[PasswordReset] Falha ao enviar, retornando token na resposta');
    return { success: true, token, phone, warning: 'Token não foi enviado, configure SMTP/Twilio' };
  }
}

/**
 * Verificar se token é válido
 */
export function verifyResetToken(token) {
  const data = resetTokens.get(token);
  
  if (!data) {
    return { error: 'invalid_token' };
  }

  if (Date.now() > data.expiresAt) {
    resetTokens.delete(token);
    return { error: 'token_expired' };
  }

  return { success: true, ...data };
}

/**
 * Resetar senha usando token
 */
export async function resetPassword(token, newPassword) {
  const verification = verifyResetToken(token);
  
  if (verification.error) {
    return verification;
  }

  const salon = getSalonByPhone(verification.phone);
  
  if (!salon) {
    return { error: 'salon_not_found' };
  }

  // Hash da nova senha
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Atualizar senha no banco
  await updateSalonPassword(salon.id, hashedPassword);

  // Invalidar token
  resetTokens.delete(token);

  return { success: true };
}

/**
 * Limpar tokens expirados (executar periodicamente)
 */
export function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expiresAt) {
      resetTokens.delete(token);
    }
  }
}

// Limpar tokens expirados a cada 5 minutos
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);
