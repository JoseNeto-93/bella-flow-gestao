import 'dotenv/config';
import { supabase } from './supabaseClient.js';
import { listSalons } from './dataService.js';

async function migrate() {
  if (!supabase) {
    console.error('SUPABASE not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in env.');
    process.exit(1);
  }

  const salons = listSalons();
  console.log('Found', salons.length, 'local salons to migrate');

  for (const s of salons) {
    const payload = {
      id: s.id,
      name: s.name,
      phone: s.phone,
      apiKey: s.apiKey,
      plan: s.plan,
      config: s.config,
      appointments: s.appointments,
      messagesUsed: s.messagesUsed || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('salons').upsert([payload], { returning: 'minimal' });
      if (error) {
        console.error('Upsert error for', s.id, error);
      } else {
        console.log('Migrated', s.id);
      }
    } catch (err) {
      console.error('Exception migrating', s.id, err);
    }
  }

  console.log('Migration finished');
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
});
