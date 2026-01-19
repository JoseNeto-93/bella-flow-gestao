import { DEFAULT_CONFIG } from './constants.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabaseClient.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const salonDB = new Map();

// index maps for quick lookup
const phoneIndex = new Map();
const apiKeyIndex = new Map();

// persistence file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, 'salons.json');

function persistDB() {
  try {
    const obj = { salons: Array.from(salonDB.entries()) };
    fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist salons DB', err);
  }
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return;
    let raw = fs.readFileSync(DB_FILE, 'utf-8');
    
    // Remover BOM UTF-8 se existir
    if (raw.charCodeAt(0) === 0xFEFF) {
      raw = raw.slice(1);
    }
    
    // Trim whitespace
    raw = raw.trim();
    
    // Se vazio ou inválido, começar do zero
    if (!raw || raw === '') {
      return;
    }
    
    const obj = JSON.parse(raw);
    if (!obj || !Array.isArray(obj.salons)) return;
    obj.salons.forEach(([id, value]) => {
      salonDB.set(id, value);
      if (value.phone) phoneIndex.set(value.phone, id);
      if (value.apiKey) apiKeyIndex.set(value.apiKey, id);
    });
  } catch (err) {
    console.error('Failed to load salons DB', err);
    // Em caso de erro, começar com DB vazia
  }
}

loadDB();

// If Supabase is configured, try to fetch remote salons and merge into local DB
async function fetchRemoteAndMerge() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from('salons').select('*');
    if (error) throw error;
    if (Array.isArray(data)) {
      data.forEach(d => ensureLocalFromRemote(d));
      console.log('Synced', data.length, 'salons from Supabase');
    }
  } catch (err) {
    console.error('Failed to fetch remote salons from Supabase', err);
  }
}

if (supabase) {
  // run in background without blocking startup
  fetchRemoteAndMerge();
}

// Upsert a single salon to Supabase (background)
async function upsertSalonToSupabase(id) {
  if (!supabase) return;
  try {
    const local = salonDB.get(id);
    if (!local) return;
    const payload = {
      id,
      name: local.name,
      phone: local.phone,
      apiKey: local.apiKey,
      plan: local.plan,
      config: local.config,
      appointments: local.appointments,
      messagesUsed: local.messagesUsed,
      updated_at: new Date().toISOString(),
    };

    await supabase.from('salons').upsert([payload], { returning: 'minimal' });
  } catch (err) {
    console.error('Failed to upsert salon to Supabase', err);
  }
}

/**
 * Estrutura:
 * salonId → {
 *   config,
 *   appointments,
 *   messagesUsed,
 *   plan
 * }
 */

export function getSalon(salonId) {
  if (!salonDB.has(salonId)) {
    salonDB.set(salonId, {
      config: DEFAULT_CONFIG,
      appointments: [],
      messagesUsed: 0,
      plan: 'starter',
      phone: null,
      apiKey: null,
      name: DEFAULT_CONFIG.name,
    });
  }

  return salonDB.get(salonId);
}

// Validação de telefone brasileiro
function validateBrazilianPhone(phone) {
  if (!phone) return false;
  const clean = phone.replace(/\D/g, '');
  return /^[1-9]{2}9?[0-9]{8}$/.test(clean) && clean.length >= 10 && clean.length <= 11;
}

export async function createSalonAccount({ name, phone, password, plan = 'starter' } = {}) {
  // Validar telefone
  if (!validateBrazilianPhone(phone)) {
    throw new Error('Telefone inválido. Use formato brasileiro com DDD.');
  }

  // Verificar se telefone já existe
  const existingSalon = getSalonByPhone(phone);
  if (existingSalon) {
    throw new Error('Telefone já cadastrado.');
  }

  const id = `salon_${crypto.randomUUID()}`;
  const apiKey = `api_${crypto.randomUUID()}`;
  
  // Hash da senha com bcrypt (NUNCA salvar senha em texto plano)
  const hashedPassword = await bcrypt.hash(password, 10);

  // If Supabase available, write there first
  if (supabase) {
    try {
      const { data, error } = await supabase.from('salons').insert([
        {
          id,
          name: name || DEFAULT_CONFIG.name,
          phone: phone || null,
          plan,
          apiKey,
          hashedPassword, // Salvar hash, não senha
          config: { ...DEFAULT_CONFIG, name },
          appointments: [],
          messagesUsed: 0,
        },
      ]);

      if (error) throw error;
    } catch (err) {
      console.error('supabase insert salon failed', err);
    }
  }

  salonDB.set(id, {
    config: { ...DEFAULT_CONFIG, name },
    appointments: [],
    messagesUsed: 0,
    plan,
    phone: phone || null,
    apiKey,
    hashedPassword, // Salvar hash, não senha
    name: name || DEFAULT_CONFIG.name,
  });

  if (phone) phoneIndex.set(phone, id);
  apiKeyIndex.set(apiKey, id);

  persistDB();

  // attempt to persist remotely in background
  if (supabase) upsertSalonToSupabase(id).catch(e => console.error(e));

  return { id, apiKey };
}

export function getSalonByPhone(phone) {
  if (!phone) return null;
  // Normalizar telefone removendo caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Buscar no índice primeiro
  const id = phoneIndex.get(phone);
  if (id) return { id, ...getSalon(id) };
  
  // Buscar manualmente comparando telefones normalizados
  for (const [salonId, salon] of salonDB.entries()) {
    if (salon.phone && salon.phone.replace(/\D/g, '') === cleanPhone) {
      return { id: salonId, ...salon };
    }
  }
  
  return null;
}

export function getSalonByApiKey(key) {
  const id = apiKeyIndex.get(key);
  if (id) return { id, ...getSalon(id) };
  return null;
}

export function ensureLocalFromRemote(remote) {
  if (!remote || !remote.id) return null;
  const id = remote.id;
  if (salonDB.has(id)) return getSalon(id);

  salonDB.set(id, {
    config: remote.config || DEFAULT_CONFIG,
    appointments: remote.appointments || [],
    messagesUsed: remote.messagesUsed || 0,
    plan: remote.plan || 'starter',
    phone: remote.phone || null,
    apiKey: remote.apiKey || null,
    name: remote.name || DEFAULT_CONFIG.name,
  });

  if (remote.phone) phoneIndex.set(remote.phone, id);
  if (remote.apiKey) apiKeyIndex.set(remote.apiKey, id);
  persistDB();
  return getSalon(id);
}

export function getSalonConfig(salonId) {
  return getSalon(salonId).config;
}

export function saveSalonConfig(salonId, config) {
  getSalon(salonId).config = config;
  persistDB();
  if (supabase) upsertSalonToSupabase(salonId).catch(e => console.error(e));
}

export function getStoredAppointments(salonId) {
  return getSalon(salonId).appointments;
}

export function saveAppointments(salonId, appointments) {
  getSalon(salonId).appointments = appointments;
  persistDB();
  if (supabase) upsertSalonToSupabase(salonId).catch(e => console.error(e));
}

export function incrementMessageUsage(salonId) {
  getSalon(salonId).messagesUsed++;
  persistDB();
  if (supabase) upsertSalonToSupabase(salonId).catch(e => console.error(e));
}

export function getMessageUsage(salonId) {
  return getSalon(salonId).messagesUsed;
}

export function getSalonPlan(salonId) {
  return getSalon(salonId).plan;
}

export function setSalonPlan(salonId, plan) {
  getSalon(salonId).plan = plan;
  persistDB();
  if (supabase) upsertSalonToSupabase(salonId).catch(e => console.error(e));
}

// Atualizar plano e dados de assinatura do salão
export function updateSalonPlan(salonId, planType, additionalData = {}) {
  const salon = getSalon(salonId);
  if (!salon) throw new Error('Salon not found');
  
  if (planType) salon.plan = planType;
  Object.assign(salon, additionalData);
  
  persistDB();
  if (supabase) upsertSalonToSupabase(salonId).catch(e => console.error(e));
}

// Atualizar senha do salão
export async function updateSalonPassword(salonId, hashedPassword) {
  const salon = getSalon(salonId);
  if (!salon) throw new Error('Salon not found');
  
  salon.hashedPassword = hashedPassword;
  persistDB();
  
  // Atualizar no Supabase
  if (supabase) {
    try {
      await supabase
        .from('salons')
        .update({ hashedPassword, updated_at: new Date().toISOString() })
        .eq('id', salonId);
    } catch (err) {
      console.error('Failed to update password in Supabase', err);
    }
  }
}

export function listSalons() {
  return Array.from(salonDB.entries()).map(([id, data]) => ({ id, ...data }));
}
