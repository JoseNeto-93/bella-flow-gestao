import { supabase } from './supabaseClient.js';
import { getSalonByPhone, getSalonByApiKey, createSalonAccount, ensureLocalFromRemote } from './dataService.js';

export async function resolveSalonByPhone(phone) {
  // Prefer in-memory index (SaaS mode)
  const local = getSalonByPhone(phone);
  if (local) return { id: local.id, ...local };

  // If Supabase configured, try there
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('phone', phone)
        .single();

      if (!error && data) {
        // ensure local copy exists
        ensureLocalFromRemote(data);
        return data;
      }
    } catch (err) {
      console.error('supabase lookup error', err);
    }
  }

  // Dev/test fallback
  const isTestPhone = typeof phone === 'string' && phone.startsWith('SALAO_');
  const isDev = process.env.NODE_ENV !== 'production';

  if (isTestPhone || isDev) {
    // create a temporary local salon account for dev/test phones
    const { id, apiKey } = await createSalonAccount({ 
      name: 'Bella Flow (dev)', 
      phone,
      password: '12345' 
    });
    return { id, name: 'Bella Flow (dev)', phone, apiKey };
  }

  return null;
}

export function resolveSalonByApiKey(key) {
  if (!key) return null;

  const local = getSalonByApiKey(key);
  if (local) return local;

  // If supabase had API keys, implement lookup here (omitted)
  return null;
}
