import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
// Prefer service role key on server (secure). Fallback to anon key if not provided.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Em ambiente sem Supabase configurado, exportamos `null` para permitir
// execução local/dev sem crash. O resolver fará fallback quando necessário.
export let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}
