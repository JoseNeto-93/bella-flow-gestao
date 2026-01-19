#!/bin/bash
# Bella Flow — Setup Completo para Produção
# Este script configura o projeto para deploy em produção

set -e

echo "🚀 Bella Flow — Setup Completo para Produção"
echo "=============================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -e "${YELLOW}Step 1: Verificando Node.js${NC}"
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓${NC} Node: $NODE_VERSION"
echo -e "${GREEN}✓${NC} NPM: $NPM_VERSION"
echo ""

# 2. Instalar dependências
echo -e "${YELLOW}Step 2: Instalando dependências${NC}"
echo "   Frontend..."
npm install
echo "   Backend..."
cd backend
npm install
cd ..
echo -e "${GREEN}✓${NC} Dependências instaladas"
echo ""

# 3. Build frontend
echo -e "${YELLOW}Step 3: Buildando frontend${NC}"
npm run build
echo -e "${GREEN}✓${NC} Build concluído (dist/)"
echo ""

# 4. Configurar .env.production
echo -e "${YELLOW}Step 4: Configurando ambiente${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}⚠${NC}  .env.production não encontrado!"
    echo "    Certifique-se de criar: .env.production"
    echo "    Você pode usar como template: .env.production.example"
else
    echo -e "${GREEN}✓${NC} .env.production encontrado"
fi
echo ""

# 5. Validar migrations
echo -e "${YELLOW}Step 5: Validando migrations${NC}"
if [ -f "backend/migrations/001_create_salons.sql" ]; then
    echo -e "${GREEN}✓${NC} Schema SQL pronto: backend/migrations/001_create_salons.sql"
else
    echo -e "${RED}✗${NC} Schema SQL não encontrado!"
fi
if [ -f "backend/migrate.js" ]; then
    echo -e "${GREEN}✓${NC} Script de migração pronto: backend/migrate.js"
else
    echo -e "${RED}✗${NC} Script de migração não encontrado!"
fi
echo ""

# 6. Resumo e próximos passos
echo "=============================================="
echo -e "${GREEN}✅ Setup Concluído!${NC}"
echo "=============================================="
echo ""
echo "📋 Próximos Passos:"
echo ""
echo "1️⃣  SUPABASE:"
echo "   a) Criar projeto em https://app.supabase.com"
echo "   b) Executar SQL em SQL Editor:"
echo "      cat backend/migrations/001_create_salons.sql"
echo "   c) Copiar SUPABASE_URL + SUPABASE_ANON_KEY"
echo "   d) (Opcional) Migrar dados: node backend/migrate.js"
echo ""
echo "2️⃣  STRIPE:"
echo "   a) Criar conta em https://dashboard.stripe.com"
echo "   b) Criar 3 planos em Products:"
echo "      - Starter (R$ 99/mês, 500 msgs)"
echo "      - Pro (R$ 299/mês, 5k msgs)"
echo "      - Agency (R$ 799/mês, ilimitado)"
echo "   c) Copiar Price IDs (price_xxx)"
echo "   d) Criar webhook em Settings → Webhooks"
echo "      URL: https://seu-dominio.com/api/webhook/stripe"
echo "      Eventos: checkout.session.completed, customer.subscription.*"
echo "   e) Copiar Webhook Secret (whsec_xxx)"
echo ""
echo "3️⃣  CONFIGURAR .env.production:"
echo "   Editar com credenciais reais do Supabase + Stripe"
echo ""
echo "4️⃣  DEPLOY:"
echo "   Opção A (Recomendado):"
echo "      - Frontend: Vercel (npm run build + vercel --prod)"
echo "      - Backend: Railway/Render (git push)"
echo ""
echo "   Opção B (VPS):"
echo "      - npm install -g pm2"
echo "      - pm2 start ecosystem.config.js --env production"
echo ""
echo "5️⃣  TESTAR:"
echo "   POST /api/register"
echo "   POST /api/login"
echo "   GET /api/dashboard"
echo "   POST /webhook/frontzap (WhatsApp)"
echo "   POST /api/webhook/stripe (pagamentos)"
echo ""
echo "📚 Documentação:"
echo "   - DEPLOY.md — Guia detalhado"
echo "   - READY_FOR_SALE.md — Checklist SaaS"
echo "   - README.md — Visão geral do projeto"
echo ""
echo "🎉 Pronto para vender!"
echo ""
