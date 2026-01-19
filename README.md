<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎉 Bella Flow — SaaS Pronto para Vender!

**Status: 🟢 VENDÁVEL EM PRODUÇÃO**

Um sistema completo de agendamento para salões de beleza com autenticação, dashboard, pagamentos Stripe e chat IA.

---

## ⚡ Quick Start (Hoje!)

**Tempo: ~2 horas** | **Custo: ~R$ 50/mês**

```bash
# 1. Ler guia
cat START_HERE.md

# 2. Configurar (ver SETUP_GUIDE.md)
# Supabase (15 min)
# Stripe (10 min)

# 3. Preencher .env.production (5 min)

# 4. Deploy (30-60 min)
# Opção A: Vercel + Railway
# Opção B: Render
# Opção C: VPS + PM2
```

👉 **[COMECE COM START_HERE.md](START_HERE.md)**

---

## 📚 Documentação Completa (Nova!)

| Arquivo | Para Quê |
|---------|----------|
| **[START_HERE.md](START_HERE.md)** | ⭐ COMECE AQUI! Resumo 5 min |
| **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** | ⚡ Deploy em 3 opções |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | 🔧 Passo-a-passo Supabase + Stripe |
| **[DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)** | ✅ Checklist pré/pós-deploy |
| **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** | 📖 Índice de docs |
| [DEPLOY.md](DEPLOY.md) | Guia original detalhado |
| [READY_FOR_SALE.md](READY_FOR_SALE.md) | Checklist vendável |

---

## Bella Flow — SaaS Pronto para Vender 🎉

**Status: 🟢 VENDÁVEL EM PRODUÇÃO**

Bella Flow é um sistema completo de agendamento para salões de beleza com:
- ✅ Autenticação segura (phone + apiKey)
- ✅ Dashboard administrativo

- ✅ Pagamentos recorrentes com Stripe
- ✅ Chat IA com WhatsApp
- ✅ Banco de dados PostgreSQL (Supabase)
- ✅ LGPD Compliant (Termos + Privacidade)

### 📚 Documentação de Deploy

Tudo que você precisa está documentado:

| Documento | Descrição |
|-----------|-----------|
| [**QUICK_DEPLOY.md**](QUICK_DEPLOY.md) | ⚡ Start aqui! Próximos passos em 5 min |
| [**SETUP_GUIDE.md**](SETUP_GUIDE.md) | Passo-a-passo Supabase + Stripe |
| [**DEPLOY_CHECKLIST.md**](DEPLOY_CHECKLIST.md) | Checklist completo pré/pós-deploy |
| [**DEPLOY.md**](DEPLOY.md) | Guia detalhado com 5 opções de hosting |
| [**READY_FOR_SALE.md**](READY_FOR_SALE.md) | Checklist SaaS + testes validados |

### 🚀 Quick Start (5 minutos)

1. **Ler** [QUICK_DEPLOY.md](QUICK_DEPLOY.md)
2. **Configurar** Supabase (15 min) — [ver SETUP_GUIDE.md](SETUP_GUIDE.md)
3. **Configurar** Stripe (10 min) — [ver SETUP_GUIDE.md](SETUP_GUIDE.md)
4. **Preencher** `.env.production` (5 min)
5. **Deploy** em Vercel + Railway (30 min) — [ver DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)

### 🔧 Desenvolvimento Local

1. Instalar dependências:
```bash
npm install
cd backend && npm install && cd ..
```

2. Rodar em desenvolvimento:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

3. Acessar em `http://localhost:5173`

### 📦 Build para Produção

```bash
npm run build          # Build frontend (cria dist/)
npm run serve         # Servir build localmente
```

### 🌐 Deploy em Produção

**Opção Rápida (Vercel + Railway)**: ~1 hora
```bash
# 1. Push para GitHub
git push origin main

# 2. Conectar Vercel ao repo (frontend)
# 3. Conectar Railway ao repo (backend)
# 4. Configurar variáveis de ambiente
```

Veja [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) para instruções detalhadas.

### 🔐 Variáveis de Ambiente

Arquivo `.env.production` necessário (já criado com template):

```env
# Backend
NODE_ENV=production
PORT=3333

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAi...

# CORS & Frontend
CORS_ORIGIN=https://seu-dominio.com
VITE_API_URL=https://seu-dominio.com

# Stripe
STRIPE_SECRET=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_AGENCY=price_xxx
```

⚠️ **NÃO commite `.env.production` no Git** (já está em .gitignore)

⚠️ **Nunca commite .env em Git!**

### Endpoints Principais

**Autenticação**
- `POST /api/register` — Cadastro de novo salão
- `POST /api/login` — Login com phone + apiKey

**Dashboard (Protegido)**
- `GET /api/dashboard` — Painel administrativo

**Chat & Webhook**
- `POST /webhook/frontzap` — Webhook do WhatsApp/FrontZap

**Pagamentos**
- `POST /api/create-checkout-session` — Stripe checkout
- `POST /api/webhook/stripe` — Webhook de assinatura

### Testar Localmente

```bash
# Registrar
curl -X POST http://localhost:3333/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Meu Salão","phone":"11999999999","plan":"starter"}'

# Login (use apiKey retornado acima)
curl -X POST http://localhost:3333/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"11999999999","apiKey":"api_xxx"}'

# Dashboard (use token retornado acima)
curl http://localhost:3333/api/dashboard \
  -H "Authorization: Bearer tok_xxx"

# Chat
curl -X POST http://localhost:3333/webhook/frontzap \
  -H "Content-Type: application/json" \
  -d '{"phone":"11999999999","message":"oi"}'
```

### Documentação

- [DEPLOY.md](DEPLOY.md) — Guia completo de deploy em produção
- [READY_FOR_SALE.md](READY_FOR_SALE.md) — Checklist SaaS + status
- [views/TermsView.tsx](views/TermsView.tsx) — Termos de Serviço
- [views/PrivacyView.tsx](views/PrivacyView.tsx) — Política de Privacidade (LGPD)

### Arquitetura

**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS  
**Backend**: Node.js 18+ + Express.js  
**Banco**: Supabase/PostgreSQL  
**Pagamentos**: Stripe (recorrente + webhooks)  
**Auth**: Tokens com localStorage  

### Planos

- **Starter**: R$ 99/mês — 500 mensagens/mês
- **Pro**: R$ 299/mês — 5.000 mensagens/mês
- **Agency**: R$ 799/mês — Ilimitado

Pagamento recorrente via Stripe com webhook para atualizar permissões automaticamente.

### Segurança

- ✅ HTTPS obrigatório em produção
- ✅ CORS restrito por domínio
- ✅ Rate limiting (500 req/15 min)
- ✅ Helmet headers de segurança
- ✅ Validação de input em todas as rotas
- ✅ Tokens de session com expiração

Pronto para vender! 🚀
