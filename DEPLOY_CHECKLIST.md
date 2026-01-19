# 📋 Deploy Checklist — Bella Flow

## ✅ Pré-Deploy (LOCAL)

### Código
- [ ] Backend código limpo e sem erros (`npm run lint`)
- [ ] Frontend código limpo e sem erros
- [ ] Não há `TODO` ou `FIXME` comentários críticos
- [ ] Todas as dependências instaladas
- [ ] Build frontend testado: `npm run build`

### Configuração
- [ ] `.env.production` criado com credenciais reais
- [ ] `.env.production` está em `.gitignore` (não será commitado)
- [ ] `ecosystem.config.js` configurado para produção
- [ ] Portas corretas definidas (PORT=3333)

### Banco de Dados
- [ ] Supabase projeto criado
- [ ] SQL migrations executadas com sucesso
- [ ] SUPABASE_URL e SUPABASE_ANON_KEY obtidos
- [ ] Tabela `salons` criada com índices
- [ ] (Opcional) Dados locais migrados com `node backend/migrate.js`

### Pagamentos Stripe
- [ ] Conta Stripe criada e verificada
- [ ] 3 planos criados (Starter, Pro, Agency)
- [ ] Price IDs obtidos (price_xxx...)
- [ ] Webhook criado: `https://seu-dominio.com/api/webhook/stripe`
- [ ] Eventos webhook selecionados:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_failed
- [ ] STRIPE_SECRET obtido (sk_live_...)
- [ ] STRIPE_WEBHOOK_SECRET obtido (whsec_...)

### Segurança
- [ ] Helmet ativado (headers de segurança)
- [ ] CORS configurado corretamente para domínio
- [ ] Rate limiting ativo (500 req/15min)
- [ ] Input validation em todos endpoints
- [ ] Tokens com expiração (30 dias)
- [ ] Senhas do banco não em código
- [ ] API Key do Stripe protegida

### Legal & Compliance
- [ ] Termos de Serviço publicado (`/terms`)
- [ ] Política de Privacidade publicado (`/privacy`)
- [ ] LGPD dados coletados documentados
- [ ] Direitos de acesso/exclusão implementados

### Testes Funcionais
- [ ] ✅ POST `/api/register` → cria salon + apiKey
- [ ] ✅ POST `/api/login` (phone + apiKey) → token válido
- [ ] ✅ GET `/api/dashboard` (protegido) → retorna dados corretos
- [ ] ✅ POST `/webhook/frontzap` → chat IA responde
- [ ] ✅ POST `/api/create-checkout-session` → Stripe checkout funciona
- [ ] ✅ POST `/api/webhook/stripe` → webhooks processados
- [ ] ✅ CORS headers corretos em todas respostas

---

## 🚀 Deploy (PRODUÇÃO)

### Opção A: Vercel (Frontend) + Railway/Render (Backend)

#### Frontend (Vercel)

1. [ ] Projeto GitHub criado e pushado
2. [ ] Conectar Vercel a repositório GitHub
3. [ ] Configurar variáveis de ambiente:
   - [ ] `VITE_API_URL=https://seu-backend.railway.app`
4. [ ] Clicar "Deploy"
5. [ ] Teste: `https://seu-projeto.vercel.app`

#### Backend (Railway ou Render)

1. [ ] Criar novo projeto em Railway.app ou Render.com
2. [ ] Conectar repositório GitHub
3. [ ] Definir comando start: `node backend/server.js`
4. [ ] Configurar variáveis de ambiente (copiar de `.env.production`):
   - [ ] `NODE_ENV=production`
   - [ ] `PORT=3333`
   - [ ] `SUPABASE_URL`
   - [ ] `SUPABASE_ANON_KEY`
   - [ ] `CORS_ORIGIN=https://seu-projeto.vercel.app`
   - [ ] `VITE_API_URL=https://seu-projeto.vercel.app`
   - [ ] `STRIPE_SECRET`
   - [ ] `STRIPE_WEBHOOK_SECRET`
   - [ ] `STRIPE_PRICE_STARTER`
   - [ ] `STRIPE_PRICE_PRO`
   - [ ] `STRIPE_PRICE_AGENCY`
5. [ ] Clicar "Deploy"
6. [ ] Copiar URL do backend (ex: `https://bella-flow-backend.railway.app`)
7. [ ] Atualizar Vercel VITE_API_URL com URL do backend
8. [ ] Redeploy Vercel

### Opção B: VPS (Node.js + PM2 + Nginx)

#### Setup Servidor

1. [ ] Alugar VPS (AWS, Digital Ocean, Linode, etc.)
2. [ ] SSH para servidor: `ssh root@seu-ip`
3. [ ] Atualizar sistema:
   ```bash
   sudo apt-get update
   sudo apt-get upgrade -y
   ```
4. [ ] Instalar Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
5. [ ] Instalar Git:
   ```bash
   sudo apt-get install -y git
   ```
6. [ ] Instalar PM2 globalmente:
   ```bash
   sudo npm install -g pm2
   ```

#### Deploy Aplicação

1. [ ] Clonar repositório:
   ```bash
   cd /opt
   sudo git clone seu-repo bella-flow
   cd bella-flow
   ```
2. [ ] Instalar dependências:
   ```bash
   npm install
   cd backend && npm install && cd ..
   npm run build
   ```
3. [ ] Criar `.env.production` com credenciais (via SFTP ou nano):
   ```bash
   nano .env.production
   # Cole conteúdo de .env.production local, salve (Ctrl+X, Y, Enter)
   ```
4. [ ] Iniciar com PM2:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 startup
   pm2 save
   ```
5. [ ] Verificar logs:
   ```bash
   pm2 logs bella-flow-backend
   ```

#### Configurar Nginx (Proxy Reverso + SSL)

1. [ ] Instalar Nginx:
   ```bash
   sudo apt-get install -y nginx
   ```
2. [ ] Criar arquivo config:
   ```bash
   sudo nano /etc/nginx/sites-available/bella-flow
   ```
3. [ ] Cole:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com www.seu-dominio.com;

       location / {
           proxy_pass http://localhost:3333;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
4. [ ] Habilitar site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/bella-flow /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
5. [ ] Instalar SSL Let's Encrypt:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
   ```
6. [ ] Verificar renovação automática:
   ```bash
   sudo systemctl enable certbot.timer
   ```

---

## ✅ Pós-Deploy (VALIDAÇÃO)

### Testes de Produção

1. [ ] Acesso frontend: `https://seu-dominio.com`
2. [ ] Homepage carrega sem erros
3. [ ] Signup modal funciona
4. [ ] Posso registrar novo salão
5. [ ] Posso fazer login com phone + apiKey
6. [ ] Dashboard mostra dados corretos
7. [ ] Plano e uso de mensagens visível
8. [ ] Botão "Atualizar Plano" redireciona para Stripe
9. [ ] Stripe checkout abre sem erro
10. [ ] Webhook Stripe processa eventos (check logs)
11. [ ] Dashboard atualiza após pagamento
12. [ ] WhatsApp webhook funciona (`/webhook/frontzap`)

### Monitoramento

1. [ ] Logs backend monitorados (PM2 ou Railway)
2. [ ] Erros 500 reportados (considerar Sentry)
3. [ ] Performance monitorada (considerar Datadog)
4. [ ] Backups Supabase configurados
5. [ ] Alert para falhas de pagamento
6. [ ] Alert para downtime do servidor

### DNS & Domínio

1. [ ] Domínio apontado para servidor/Vercel
2. [ ] DNS propagação completa
3. [ ] HTTPS funcionando (cadeado verde)
4. [ ] Redirecionamento HTTP → HTTPS

---

## 🎯 Marcos de Sucesso

### Week 1
- [ ] Deploy produção concluído
- [ ] 5+ primeiros usuários registrados
- [ ] 0 erros críticos em produção

### Week 2
- [ ] 20+ usuários ativos
- [ ] 5+ pagamentos processados com sucesso
- [ ] Dashboard funcionando corretamente
- [ ] WhatsApp integration confirmada

### Week 4
- [ ] 100+ usuários
- [ ] Receita mensal inicial > R$ 500
- [ ] Taxa de churn < 5%
- [ ] Net Promoter Score > 30

---

## 🆘 Emergency Contacts

**Stripe Support**: https://support.stripe.com  
**Supabase Support**: https://supabase.com/docs  
**Node.js Docs**: https://nodejs.org/docs  

---

## 📝 Notas

```
Data do Deploy: _______________
URL Produção: _______________
Backend URL: _______________
Admin Email: _______________
Observações: _______________
```

---

**Status**: [ ] PRONTO PARA LANÇAR | [ ] EM PRODUÇÃO | [ ] VENDENDO
