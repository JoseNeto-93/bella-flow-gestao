import { supabase } from './supabaseClient.js';

export async function resolveSalonByPhone(phone) {
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error) return null;
  return data;
}
