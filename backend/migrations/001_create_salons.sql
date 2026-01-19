-- Supabase/Postgres migration: create salons table

CREATE TABLE IF NOT EXISTS salons (
  id text PRIMARY KEY,
  name text,
  phone text UNIQUE,
  apiKey text UNIQUE,
  hashedPassword text, -- Hash bcrypt da senha (NUNCA salvar senha em texto plano)
  plan text,
  config jsonb,
  appointments jsonb,
  messagesUsed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_salons_phone ON salons (phone);
CREATE INDEX IF NOT EXISTS idx_salons_apikey ON salons (apiKey);
