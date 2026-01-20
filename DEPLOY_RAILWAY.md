# 🚀 DEPLOY RAILWAY - PASSO A PASSO

## ✅ Pré-requisitos (JÁ FEITO)
- [x] Código no GitHub: https://github.com/JoseNeto-93/bella-flow-gestao
- [x] Backend configurado (server.js)
- [x] Frontend buildável (Vite)
- [x] package.json com script "start"
- [x] Variáveis de ambiente documentadas (.env.example)

---

## 📋 PASSO A PASSO

### **1. Criar Conta no Railway** (2 minutos)

1. Acesse: https://railway.app/
2. Clique em **"Start a New Project"**
3. Login com GitHub (vai pedir permissões)
4. Autorize acesso ao repositório `bella-flow-gestao`

### **2. Criar Novo Projeto** (1 minuto)

1. No dashboard, clique **"+ New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha: **`JoseNeto-93/bella-flow-gestao`**
4. Railway vai detectar Node.js automaticamente

### **3. Configurar Variáveis de Ambiente** (5 minutos)

No painel do projeto, vá em **"Variables"** e adicione:

#### **OBRIGATÓRIAS:**

```bash
# Supabase (seu banco atual)
SUPABASE_URL=https://svqtidmsfnllgixaifoh.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Servidor
PORT=3333
NODE_ENV=production
CORS_ORIGIN=https://seu-dominio.up.railway.app
```

#### **STRIPE (quando configurar):**

```bash
STRIPE_SECRET=sk_live_sua-chave-aqui
STRIPE_WEBHOOK_SECRET=whsec_seu-webhook-secret
STRIPE_PRICE_STARTER=price_starter_id
STRIPE_PRICE_PRO=price_pro_id
STRIPE_PRICE_AGENCY=price_agency_id
```

#### **EMAIL (opcional - configure depois):**

```bash
# Opção 1: SendGrid
SENDGRID_API_KEY=SG.sua-chave-api
EMAIL_FROM=noreply@seudominio.com

# Opção 2: Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
EMAIL_FROM=seu-email@gmail.com
```

#### **SMS (opcional):**

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=seu-token
TWILIO_PHONE_NUMBER=+5511999999999
```

#### **FRONTEND URL:**

```bash
FRONTEND_URL=https://seu-dominio.up.railway.app
```

### **4. Deploy Automático** (5 minutos)

1. Railway vai fazer build automaticamente
2. Acompanhe logs na aba **"Deployments"**
3. Aguarde: `🚀 SaaS rodando na porta 3333`
4. Railway vai gerar URL: `https://bella-flow-production.up.railway.app`

### **5. Testar a Aplicação** (2 minutos)

1. Acesse a URL gerada
2. Teste cadastro: `/` → "Criar Conta"
3. Teste login: `/dashboard`
4. Teste API: `https://sua-url.up.railway.app/api/health`

Deve retornar:
```json
{"status":"ok"}
```

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### **Domínio Personalizado** (opcional)

1. Compre domínio (Registro.br, Hostinger, GoDaddy)
2. No Railway: **Settings** → **Domains** → **Add Custom Domain**
3. Configure DNS CNAME:
   ```
   CNAME: www → bella-flow-production.up.railway.app
   ```
4. Railway configura SSL automático (Let's Encrypt)

### **Configurar Stripe Webhook**

1. Acesse: https://dashboard.stripe.com/webhooks
2. Adicione endpoint: `https://sua-url.up.railway.app/api/webhook/stripe`
3. Eventos: `customer.subscription.*`, `invoice.*`
4. Copie **Webhook Secret**: `whsec_...`
5. Adicione em Railway Variables: `STRIPE_WEBHOOK_SECRET`

### **Monitoramento**

Railway oferece:
- ✅ Logs em tempo real
- ✅ Métricas (CPU, RAM, Network)
- ✅ Alertas por email
- ✅ Restart automático (se crashar)

---

## 💰 CUSTOS

### **Plano Hobby (gratuito):**
- $5 crédito/mês (≈ 166 horas)
- Suficiente para testes e validação
- SSL incluído
- Deploy ilimitados

### **Quando crescer:**
- **Pro Plan**: $20/mês
- Créditos extras: $0.000231/GB-hora
- Estimativa 100 usuários ativos: ~$10-15/mês

---

## 🚨 TROUBLESHOOTING

### **Build falhou?**

1. Verifique logs no Railway
2. Erro comum: falta `npm install` no backend
3. Solução: Railway roda `npm install` automaticamente

### **Porta errada?**

Railway define `PORT` automático. Código já usa:
```javascript
const PORT = process.env.PORT || 3333;
```

### **CORS error?**

Atualize `CORS_ORIGIN` com a URL real do Railway:
```bash
CORS_ORIGIN=https://bella-flow-production.up.railway.app
```

### **Supabase não conecta?**

Verifique variáveis:
```bash
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

---

## ✅ CHECKLIST PÓS-DEPLOY

- [ ] Aplicação acessível via HTTPS
- [ ] Cadastro funcionando
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] API /health respondendo
- [ ] Logs sem erros
- [ ] SSL válido (cadeado verde)
- [ ] CORS configurado

---

## 🎯 PRÓXIMOS PASSOS

1. **Semana 1:**
   - [ ] Testar fluxo completo
   - [ ] Configurar Stripe (produtos + webhook)
   - [ ] Configurar Email (Gmail App Password grátis)

2. **Semana 2:**
   - [ ] Domínio personalizado
   - [ ] Analytics (Google Analytics)
   - [ ] Primeiros clientes beta

3. **Semana 3:**
   - [ ] Twilio SMS (R$20 crédito teste)
   - [ ] Ajustar baseado em feedback
   - [ ] Lançamento oficial

---

## 🆘 SUPORTE

- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **Seu Repositório**: https://github.com/JoseNeto-93/bella-flow-gestao

---

**BOA SORTE COM O DEPLOY! 🚀**

Qualquer dúvida, Railway tem suporte excelente e comunidade ativa.
