@echo off
REM Bella Flow — Validação de Configuração (Batch)
REM Execute: validate-config.bat

echo.
echo ================================
echo Bella Flow — Validacao
echo ================================
echo.

set missing=0

echo Verificando arquivos essenciais...
echo.

if exist ".env.production" (
    echo [OK] .env.production
) else (
    echo [FALTA] .env.production
    set /a missing+=1
)

if exist "backend\migrations\001_create_salons.sql" (
    echo [OK] SQL Migration
) else (
    echo [FALTA] SQL Migration
    set /a missing+=1
)

if exist "backend\migrate.js" (
    echo [OK] Migrate Script
) else (
    echo [FALTA] Migrate Script
    set /a missing+=1
)

if exist "backend\auth.js" (
    echo [OK] Auth Module
) else (
    echo [FALTA] Auth Module
    set /a missing+=1
)

if exist "SETUP_GUIDE.md" (
    echo [OK] Setup Guide
) else (
    echo [FALTA] Setup Guide
    set /a missing+=1
)

if exist "DEPLOY_CHECKLIST.md" (
    echo [OK] Deploy Checklist
) else (
    echo [FALTA] Deploy Checklist
    set /a missing+=1
)

if exist "QUICK_DEPLOY.md" (
    echo [OK] Quick Deploy
) else (
    echo [FALTA] Quick Deploy
    set /a missing+=1
)

echo.
echo ================================

if %missing% equ 0 (
    echo.
    echo [SUCCESS] Tudo esta pronto!
    echo.
    echo Proximas acoes:
    echo 1. Ler QUICK_DEPLOY.md
    echo 2. Configurar Supabase
    echo 3. Configurar Stripe
    echo 4. Preencher .env.production
    echo 5. Deploy!
    echo.
) else (
    echo.
    echo [ERROR] %missing% arquivo(s) faltando!
    echo.
)

echo ================================
pause
