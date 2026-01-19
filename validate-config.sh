#!/bin/bash
# ============================================
# Bella Flow — Validação de Configuração
# ============================================

echo "🔍 Validando configuração de deploy..."
echo ""

errors=0
warnings=0

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função para checker
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Existe: $1"
    else
        echo -e "${RED}✗${NC} NÃO ENCONTRADO: $1"
        errors=$((errors + 1))
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
    else
        echo -e "${RED}✗${NC} FALTA: $3 em $1"
        errors=$((errors + 1))
    fi
}

echo "📁 Verificando arquivos essenciais..."
echo ""

check_file ".env.production"
check_file "backend/migrations/001_create_salons.sql"
check_file "backend/migrate.js"
check_file "backend/auth.js"
check_file "SETUP_GUIDE.md"
check_file "DEPLOY_CHECKLIST.md"
check_file "QUICK_DEPLOY.md"

echo ""
echo "🔐 Verificando configurações de segurança..."
echo ""

if grep -q "SUPABASE_URL" .env.production 2>/dev/null; then
    echo -e "${GREEN}✓${NC} .env.production contém SUPABASE_URL"
else
    echo -e "${YELLOW}⚠${NC}  .env.production não preenchido (é template)"
    warnings=$((warnings + 1))
fi

if grep -q ".env.production" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC} .env.production está em .gitignore"
else
    echo -e "${RED}✗${NC} .env.production NÃO está em .gitignore!"
    errors=$((errors + 1))
fi

check_file "ecosystem.config.js"
check_file "setup-production.sh"

echo ""
echo "🗄️  Verificando migrations..."
echo ""

check_file "backend/migrations/001_create_salons.sql"

if [ -f "backend/migrations/001_create_salons.sql" ]; then
    if grep -q "CREATE TABLE.*salons" backend/migrations/001_create_salons.sql; then
        echo -e "${GREEN}✓${NC} Schema salons está definido"
    else
        echo -e "${RED}✗${NC} Schema salons NÃO encontrado"
        errors=$((errors + 1))
    fi
fi

echo ""
echo "📦 Verificando dependências..."
echo ""

if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json encontrado"
    
    if grep -q "\"vite\"" package.json; then
        echo -e "${GREEN}✓${NC} Vite configurado"
    else
        echo -e "${YELLOW}⚠${NC}  Vite não encontrado em package.json"
    fi
    
    if grep -q "\"express\"" backend/package.json 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Express configurado (backend)"
    else
        echo -e "${YELLOW}⚠${NC}  Express não encontrado em backend/package.json"
    fi
else
    echo -e "${RED}✗${NC} package.json NÃO ENCONTRADO"
    errors=$((errors + 1))
fi

echo ""
echo "🔗 Verificando endpoints críticos..."
echo ""

if grep -q "/api/register" backend/server.js 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Endpoint /api/register implementado"
else
    echo -e "${RED}✗${NC} Endpoint /api/register NÃO ENCONTRADO"
    errors=$((errors + 1))
fi

if grep -q "/api/login" backend/server.js 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Endpoint /api/login implementado"
else
    echo -e "${RED}✗${NC} Endpoint /api/login NÃO ENCONTRADO"
    errors=$((errors + 1))
fi

if grep -q "webhook.*stripe\|stripe.*webhook" backend/server.js 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Webhook Stripe implementado"
else
    echo -e "${YELLOW}⚠${NC}  Webhook Stripe não verificado"
fi

echo ""
echo "═════════════════════════════════════════"

if [ $errors -eq 0 ]; then
    if [ $warnings -eq 0 ]; then
        echo -e "${GREEN}✅ TUDO ESTÁ PRONTO!${NC}"
        echo ""
        echo "Próximas ações:"
        echo "1. Ler QUICK_DEPLOY.md"
        echo "2. Configurar Supabase"
        echo "3. Configurar Stripe"
        echo "4. Preencher .env.production"
        echo "5. Deploy!"
    else
        echo -e "${YELLOW}⚠${NC}  $warnings avisos encontrados"
        echo "Verifique acima e complete a configuração."
    fi
else
    echo -e "${RED}✗${NC} $errors erro(s) encontrado(s)!"
    echo "Corrija os problemas acima antes de fazer deploy."
    exit 1
fi

echo "═════════════════════════════════════════"
