import { getSalonByPhone, getSalonByApiKey } from './dataService.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const sessions = new Map();

/**
 * Simple in-memory token store (replace with Redis in production)
 * token → { salonId, apiKey, expiresAt }
 */
export function createSessionToken(salonId, apiKey) {
  const token = `tok_${crypto.randomUUID()}`;
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  sessions.set(token, { salonId, apiKey, expiresAt });
  return token;
}

export function verifySessionToken(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

/**
 * Login salon by phone + password
 * Returns { success, token, salonId, apiKey } or { error }
 */
export async function loginSalon(phone, password) {
  const salon = getSalonByPhone(phone);

  if (!salon || !salon.hashedPassword) {
    return { error: 'invalid_credentials' };
  }

  // Verificar senha com bcrypt
  const isValid = await bcrypt.compare(password, salon.hashedPassword);
  if (!isValid) {
    return { error: 'invalid_credentials' };
  }

  const token = createSessionToken(salon.id, salon.apiKey);
  return { success: true, token, salonId: salon.id, apiKey: salon.apiKey };
}

/**
 * Login alternativo com phone + apiKey (para compatibilidade)
 */
export function loginWithApiKey(phone, apiKey) {
  const byPhone = getSalonByPhone(phone);
  const byApiKey = getSalonByApiKey(apiKey);

  if (!byPhone || !byApiKey) {
    return { error: 'invalid_credentials' };
  }

  if (byPhone.id !== byApiKey.id) {
    return { error: 'invalid_credentials' };
  }

  const token = createSessionToken(byPhone.id, apiKey);
  return { success: true, token, salonId: byPhone.id };
}

/**
 * Middleware: extract and verify auth token or phone/apiKey headers
 */
export function authMiddleware(req, res, next) {
  // Try Bearer token first
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  const token = match ? match[1] : null;

  if (token) {
    const session = verifySessionToken(token);
    if (session) {
      req.salonId = session.salonId;
      req.apiKey = session.apiKey;
      return next();
    }
  }

  // Fallback to phone/apiKey headers
  const phone = req.headers['x-phone'];
  const apiKey = req.headers['x-apikey'];

  if (phone && apiKey) {
    const byPhone = getSalonByPhone(phone);
    const byApiKey = getSalonByApiKey(apiKey);

    if (byPhone && byApiKey && byPhone.id === byApiKey.id) {
      req.salonId = byPhone.id;
      req.apiKey = apiKey;
      return next();
    }
  }

  return res.status(401).json({ error: 'unauthorized' });
}
