# 🔧 Guia de Configuração Supabase + Stripe

## Parte 1: Supabase (Banco de Dados)

### 1. Criar Projeto Supabase

1. Acesse https://app.supabase.com
2. Clique em **"New Project"**
3. Configure:
   - **Name**: `bella-flow`
   - **Password**: Salve com segurança (você precisará depois)
   - **Region**: Escolha a mais próxima do Brasil (São Paulo ou Canadá)
4. Clique **"Create new project"** (pode levar 2-3 minutos)

### 2. Executar Migração SQL

1. No painel Supabase, vá para **"SQL Editor"**
2. Clique **"New query"**
3. Cole o conteúdo de `backend/migrations/001_create_salons.sql`:

```sql
CREATE TABLE IF NOT EXISTS salons (
  id text PRIMARY KEY,
  name text,
  phone text UNIQUE,
  apiKey text UNIQUE,
  plan text,
  config jsonb,
  appointments jsonb,
  messagesUsed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_salons_phone ON salons (phone);
CREATE INDEX IF NOT EXISTS idx_salons_apikey ON salons (apiKey);
```

4. Clique **"Run"** (deve mostrar "Success")

### 3. Obter Credenciais Supabase

1. No painel, vá para **"Settings"** → **"API"**
2. Copie:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **Anon Key**: `eyJ...` (comece com `eyJ`)
3. Cole em `.env.production`:
   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   ```

### 4. (Opcional) Migrar Dados Locais

Se você tem `salons.json` com dados locais:

```bash
cd backend
node migrate.js
```

Este comando importa dados de `salons.json` para Supabase.

---

## Parte 2: Stripe (Pagamentos)

### 1. Criar Conta Stripe

1. Acesse https://dashboard.stripe.com
2. Crie uma conta (ou faça login)
3. Complete o onboarding (endereço, banco, etc.)

### 2. Criar 3 Planos

#### Plano 1: Starter (R$ 99/mês)

1. Vá para **"Products"** → **"Create product"**
2. Configure:
   - **Name**: `Starter`
   - **Description**: `500 mensagens por mês`
   - **Price type**: `Recurring`
   - **Billing period**: `Monthly`
   - **Price**: `99.00` (ou em USD se preferir)
3. Clique **"Create"**
4. **Copie o Price ID** (aparece como `price_1xxxx...` no lado direito)
5. Cole em `.env.production` como `STRIPE_PRICE_STARTER`

#### Plano 2: Pro (R$ 299/mês)

1. Vá para **"Products"** → **"Create product"**
2. Configure:
   - **Name**: `Pro`
   - **Description**: `5.000 mensagens por mês`
   - **Price**: `299.00`
3. **Copie o Price ID** → `.env.production` como `STRIPE_PRICE_PRO`

#### Plano 3: Agency (R$ 799/mês)

1. Vá para **"Products"** → **"Create product"**
2. Configure:
   - **Name**: `Agency`
   - **Description**: `Ilimitado`
   - **Price**: `799.00`
3. **Copie o Price ID** → `.env.production` como `STRIPE_PRICE_AGENCY`

### 3. Configurar Webhook

1. Vá para **"Developers"** → **"Webhooks"**
2. Clique **"Add endpoint"**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/webhook/stripe`
   - **Events to send**: Selecione:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
4. Clique **"Add endpoint"**
5. Clique no endpoint criado
6. **Copie o Signing Secret** (começa com `whsec_`)
7. Cole em `.env.production` como `STRIPE_WEBHOOK_SECRET`

### 4. Obter API Key

1. Vá para **"Developers"** → **"API keys"**
2. Você verá 2 chaves:
   - **Publishable key** (pk_live_... ou pk_test_...)
   - **Secret key** (sk_live_... ou sk_test_...)
3. **Copie a Secret Key** → `.env.production` como `STRIPE_SECRET`

---

## Parte 3: Preencher .env.production

Seu arquivo deve ficar assim:

```env
NODE_ENV=production
PORT=3333

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...

# CORS
CORS_ORIGIN=https://seu-dominio.com

# Frontend
VITE_API_URL=https://seu-dominio.com

# Stripe
STRIPE_SECRET=sk_live_xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
STRIPE_PRICE_STARTER=price_1xxxxx...
STRIPE_PRICE_PRO=price_1xxxxx...
STRIPE_PRICE_AGENCY=price_1xxxxx...
```

---

## Parte 4: Testar Configuração

### Testar Supabase

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://seu-projeto.supabase.co',
  'eyJ...'
);
supabase.from('salons').select('*').then(r => console.log(r));
"
```

### Testar Stripe

```bash
curl -X GET https://api.stripe.com/v1/products \
  -u sk_live_xxxxx:
```

### Testar Backend

```bash
# Inicie o servidor
npm run dev

# Em outro terminal, teste
curl -X POST http://localhost:3333/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Salão Teste","phone":"11999999999"}'
```

---

## ✅ Checklist

- [ ] Projeto Supabase criado
- [ ] SQL migração executada
- [ ] SUPABASE_URL obtido
- [ ] SUPABASE_ANON_KEY obtido
- [ ] 3 planos Stripe criados
- [ ] 3 Price IDs copiados
- [ ] Webhook Stripe configurado
- [ ] STRIPE_SECRET obtido
- [ ] STRIPE_WEBHOOK_SECRET obtido
- [ ] .env.production preenchido completamente
- [ ] Backend testado localmente
- [ ] Pronto para deploy!

---

## 🆘 Problemas Comuns

### "SUPABASE_URL não encontrado"
- Verifique se `.env.production` está na raiz do projeto
- Reinicie o backend após editar `.env.production`

### "webhook secret é inválido"
- Copie o **Signing Secret** do Stripe, não o token
- Certifique-se de estar no painel correto (Webhooks, não API Keys)

### "Price not found"
- Verifique se os Price IDs começam com `price_`
- Certifique-se de estar usando IDs **do modo LIVE** (não test)

---

## 📚 Documentação Oficial

- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs/api
- Bella Flow: [DEPLOY.md](DEPLOY.md)
