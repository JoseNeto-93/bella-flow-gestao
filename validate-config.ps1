# Bella Flow — Validação de Configuração (PowerShell)
# Execute: powershell -ExecutionPolicy Bypass -File validate-config.ps1

Write-Host "🔍 Validando configuração de deploy..." -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Função para checker arquivo
function Check-File {
    param([string]$path, [string]$description)
    
    if (Test-Path $path) {
        Write-Host "✓" -ForegroundColor Green -NoNewline
        Write-Host " Existe: $description"
    }
    else {
        Write-Host "✗" -ForegroundColor Red -NoNewline
        Write-Host " NÃO ENCONTRADO: $description"
        $script:errors++
    }
}

Write-Host "📁 Verificando arquivos essenciais..." -ForegroundColor Yellow
Write-Host ""

Check-File ".env.production" ".env.production"
Check-File "backend/migrations/001_create_salons.sql" "SQL Migration"
Check-File "backend/migrate.js" "Migrate Script"
Check-File "backend/auth.js" "Auth Module"
Check-File "SETUP_GUIDE.md" "Setup Guide"
Check-File "DEPLOY_CHECKLIST.md" "Deploy Checklist"
Check-File "QUICK_DEPLOY.md" "Quick Deploy"

Write-Host ""
Write-Host "🔐 Verificando segurança..." -ForegroundColor Yellow
Write-Host ""

Check-File "ecosystem.config.js" "PM2 Config"
Check-File "setup-production.sh" "Setup Script"

Write-Host ""
Write-Host "🗄️  Verificando migrations..." -ForegroundColor Yellow
Write-Host ""

Check-File "backend/migrations/001_create_salons.sql" "Salons Migration"

Write-Host ""
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
Write-Host ""

Check-File "package.json" "package.json (raiz)"
Check-File "backend/package.json" "package.json (backend)"

Write-Host ""
Write-Host "═════════════════════════════════════════" -ForegroundColor Cyan

if ($errors -eq 0) {
    Write-Host "✅ TUDO ESTÁ PRONTO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximas ações:" -ForegroundColor Cyan
    Write-Host "1. Ler QUICK_DEPLOY.md"
    Write-Host "2. Configurar Supabase"
    Write-Host "3. Configurar Stripe"
    Write-Host "4. Preencher .env.production"
    Write-Host "5. Deploy!"
}
else {
    Write-Host "✗ $errors erro(s) encontrado(s)!" -ForegroundColor Red
}

Write-Host "═════════════════════════════════════════" -ForegroundColor Cyan

