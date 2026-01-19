#!/bin/bash
# Bella Flow — Quick Start Script
# Execute este script para preparar o projeto para produção

set -e

echo "🚀 Bella Flow — Setup para Produção"
echo "=================================="

# 1. Check Node version
echo "✓ Verificando Node.js..."
NODE_VERSION=$(node -v)
echo "   Node versão: $NODE_VERSION"

# 2. Install dependencies
echo "✓ Instalando dependências..."
npm install
cd backend
npm install
cd ..

# 3. Build frontend
echo "✓ Buildando frontend..."
npm run build

# 4. Create .env.production
if [ ! -f ".env.production" ]; then
    echo "✓ Criando .env.production (PREENCHA COM VALORES REAIS!)"
    cp .env.production.example .env.production
    echo "   ⚠️  Edite .env.production com suas credenciais Supabase + Stripe"
else
    echo "   ✓ .env.production já existe"
fi

# 5. Migration check
echo "✓ Script de migração pronto em: backend/migrate.js"
echo "   Execute após configurar Supabase:"
echo "   $ node backend/migrate.js"

# 6. Summary
echo ""
echo "=================================="
echo "✅ Preparação Concluída!"
echo ""
echo "Próximos passos:"
echo "1. Editar .env.production com credenciais Supabase + Stripe"
echo "2. Configurar Supabase:"
echo "   - URL do projeto"
echo "   - Executar migrations/001_create_salons.sql"
echo "   - Obter SUPABASE_URL + SUPABASE_ANON_KEY"
echo "3. Configurar Stripe:"
echo "   - Criar 3 planos (Starter, Pro, Agency)"
echo "   - Obter Price IDs"
echo "   - Configurar webhook"
echo "4. Deploy:"
echo "   - npm run build (já feito)"
echo "   - Vercel, Railway ou VPS com PM2"
echo "5. Testar:"
echo "   - Signup → Login → Dashboard → Checkout → Webhook"
echo ""
echo "Documentação:"
echo "- DEPLOY.md — Guia passo a passo"
echo "- READY_FOR_SALE.md — Checklist completo"
echo ""
echo "🎉 Pronto para vender!"
