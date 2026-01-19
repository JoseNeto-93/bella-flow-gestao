# Bella Flow — Guia de Deploy em Produção

## 1. Preparar Banco de Dados (Supabase)

### 1.1 Criar Projeto Supabase
1. Acesse https://app.supabase.com
2. Clique em "New Project"
3. Configure nome, região (escolha a mais próxima do Brasil)
4. Salve a senha do banco

### 1.2 Executar Migração SQL
1. No painel Supabase, vá para "SQL Editor"
2. Execute o arquivo `backend/migrations/001_create_salons.sql`:

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

### 1.3 Obter Credenciais
Na página "API Settings" do Supabase, copie:
- **SUPABASE_URL**: URL do projeto (ex: https://xxx.supabase.co)
- **SUPABASE_ANON_KEY**: Chave pública (anon/public)

### 1.4 Migrar Dados Locais (se houver)
```bash
cd backend
SUPABASE_URL=https://xxx.supabase.co SUPABASE_ANON_KEY=xxx npm run node migrate.js
```

## 2. Configurar Stripe (Pagamentos)

### 2.1 Criar Contas Stripe
1. Acesse https://dashboard.stripe.com
2. Vá para "Products" e crie 3 planos:
   - **Starter**: R$ 99/mês
   - **Pro**: R$ 299/mês
   - **Agency**: R$ 799/mês

### 2.2 Obter Price IDs
Para cada plano, copie o **Price ID** (começa com `price_`)

### 2.3 Configurar Webhook
1. Em "Webhooks", clique "Add endpoint"
2. URL: `https://seu-dominio.com/api/webhook/stripe`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copie o **Signing Secret** (começa com `whsec_`)

### 2.4 Obter Credenciais
- **STRIPE_SECRET**: API Key Secreta (começa com `sk_live_` ou `sk_test_`)
- **STRIPE_WEBHOOK_SECRET**: Do passo anterior

## 3. Preparar Arquivo .env Produção

Crie `.env.production` na raiz com:

```dotenv
# Backend
NODE_ENV=production
PORT=3333

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# CORS (seu domínio)
CORS_ORIGIN=https://seu-dominio.com

# Stripe
STRIPE_SECRET=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_AGENCY=price_xxx

# Frontend
VITE_API_URL=https://seu-dominio.com
```

⚠️ **NUNCA commite este arquivo no Git!** Use variáveis de ambiente do servidor.

## 4. Deploy no Servidor

### 4.1 Opção A: Vercel (Recomendado para Frontend)

```bash
# Frontend
npm run build
vercel --prod
```

### 4.2 Opção B: Railway, Render ou Heroku (Backend + Frontend)

```bash
# Build frontend
npm run build

# Deploy backend com dist/
# Railway/Render: conecte o repo GitHub, configure vars de env
# Heroku: heroku create bella-flow && git push heroku main
```

### 4.3 Opção C: VPS/Cloud (Node.js com PM2)

```bash
# No servidor
sudo apt-get update
sudo apt-get install nodejs npm

# Clone o repo
git clone seu-repo
cd bella-flow

# Instale dependências
npm install
cd backend && npm install && cd ..

# Configure variáveis de ambiente
cp .env.production .env

# Starte com PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production

# Configurar como serviço
pm2 startup
pm2 save
```

## 5. Configurar HTTPS e Proxy (se VPS)

### 5.1 Nginx como Proxy Reverso

```nginx
server {
  listen 80;
  server_name seu-dominio.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl;
  server_name seu-dominio.com;

  ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

  location / {
    proxy_pass http://localhost:3333;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### 5.2 Certificado SSL (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certbot --nginx -d seu-dominio.com
```

## 6. Checklist Final de Deploy

- [ ] Supabase: Projeto criado, tabelas migradas, dados sincronizados
- [ ] Stripe: Produtos criados, Price IDs copiados, webhook configurado
- [ ] .env.production: Preenchido com todas as vars (sem commitá-lo)
- [ ] CORS_ORIGIN: Apontando para seu domínio produção
- [ ] HTTPS: Ativo com certificado válido
- [ ] PM2 ou equivalente: Rodando em background com auto-restart
- [ ] Backups: Configurados no Supabase
- [ ] Logs: Monitorando erros (Sentry ou similar)
- [ ] DNS: Apontando para seu servidor

## 7. Testar em Produção

```bash
# Login
curl -X POST https://seu-dominio.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"11999999999","apiKey":"api_xxx"}'

# Dashboard
curl https://seu-dominio.com/api/dashboard \
  -H "Authorization: Bearer tok_xxx"

# Webhook FrontZap
curl -X POST https://seu-dominio.com/webhook/frontzap \
  -H "Content-Type: application/json" \
  -d '{"phone":"11999999999","message":"teste"}'
```

## 8. Monitoramento em Produção

### Recomendações:
- **Logs**: Papertrail, LogRocket ou Sentry
- **Uptime**: UptimeRobot, StatusCake
- **Métricas**: Datadog, New Relic
- **Backups**: Automáticos via Supabase

## Suporte

Dúvidas? Contate: deploy@bellaflow.com

---

**Bella Flow v1.0** — Ready for Production 🚀
