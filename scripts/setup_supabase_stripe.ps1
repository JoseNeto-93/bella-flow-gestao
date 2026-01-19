<#
PowerShell helper to automate steps:
- set SUPABASE and STRIPE env vars for the session
- run backend/migrate.js to upsert local salons to Supabase
- run backend/create_stripe_products.js to create Stripe products/prices
- attempt to parse printed Price IDs and optionally append them to .env.production

Run from the repo root (where `backend/` is):
    pwsh ./scripts/setup_supabase_stripe.ps1

This script DOES NOT persist secrets unless you choose to append to `.env.production`.
#>

function Read-SecureInput($prompt) {
    Write-Host -NoNewline "$prompt: " -ForegroundColor Cyan
    $sec = Read-Host -AsSecureString
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

Clear-Host
Write-Host "=== Setup Supabase + Stripe (automated) ===" -ForegroundColor Green

$supabaseUrl = Read-Host "SUPABASE_URL (ex: https://<project>.supabase.co)"
$serviceRole = Read-SecureInput "SUPABASE_SERVICE_ROLE_KEY (secure)"
$stripeKey = Read-SecureInput "STRIPE_SECRET (secure)"

if (-not $supabaseUrl -or -not $serviceRole -or -not $stripeKey) {
    Write-Error "Todos os valores são obrigatórios. Saindo."
    exit 1
}

# Export for this PowerShell session
$env:SUPABASE_URL = $supabaseUrl
$env:SUPABASE_SERVICE_ROLE_KEY = $serviceRole
$env:STRIPE_SECRET = $stripeKey

Write-Host "Environment variables set for this session." -ForegroundColor Yellow

Write-Host "\n1) Running migration: node backend/migrate.js" -ForegroundColor Cyan
try {
    & node backend/migrate.js 2>&1 | Tee-Object -Variable migrateOutput
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Migration script failed. Check output above.";
        exit $LASTEXITCODE
    }
    Write-Host "Migration finished." -ForegroundColor Green
} catch {
    Write-Error "Error running migrate.js: $_"
    exit 1
}

Write-Host "\n2) Creating Stripe products/prices: node backend/create_stripe_products.js" -ForegroundColor Cyan
try {
    $createOut = & node backend/create_stripe_products.js 2>&1
    $createOut | Tee-Object -Variable stripeOutput
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Stripe creation script failed. Check output above.";
        exit $LASTEXITCODE
    }
} catch {
    Write-Error "Error running create_stripe_products.js: $_"
    exit 1
}

# Try to extract price IDs (pattern: price_...)
$pricePattern = 'price_[A-Za-z0-9_]+'
$found = Select-String -InputObject $stripeOutput -Pattern $pricePattern -AllMatches | ForEach-Object { $_.Matches } | ForEach-Object { $_.Value }

if ($found.Count -eq 0) {
    Write-Warning "Nenhum Price ID detectado automaticamente. Veja o output acima e copie manualmente.";
} else {
    $unique = $found | Select-Object -Unique
    Write-Host "Detected price IDs:" -ForegroundColor Green
    $unique | ForEach-Object { Write-Host " - $_" }

    # Map found prices into starter/pro/agency by asking user if ambiguous
    $envLines = @()
    foreach ($id in $unique) {
        $label = Read-Host "Qual etiqueta para Price ID '$id'? (ex: STARTER, PRO, AGENCY) (digite para aceitar)"
        if (-not $label) { $label = Read-Host "Sem etiqueta dada — associe manualmente (STARTER|PRO|AGENCY) para $id" }
        $labelUp = $label.ToUpper()
        switch ($labelUp) {
            'STARTER' { $envLines += "STRIPE_PRICE_STARTER=$id" }
            'PRO'     { $envLines += "STRIPE_PRICE_PRO=$id" }
            'AGENCY'  { $envLines += "STRIPE_PRICE_AGENCY=$id" }
            default   { $envLines += "# UNKNOWN_LABEL_$labelUp=$id" }
        }
    }

    $save = Read-Host "Salvar essas chaves em .env.production? (Y/n)"
    if ($save -eq '' -or $save -match '^[Yy]') {
        $envFile = Join-Path -Path (Get-Location) -ChildPath '.env.production'
        if (-not (Test-Path $envFile)) { New-Item -Path $envFile -ItemType File -Force | Out-Null }
        Add-Content -Path $envFile -Value "# Stripe price IDs added by setup_supabase_stripe.ps1 on $(Get-Date)"
        $envLines | ForEach-Object { Add-Content -Path $envFile -Value $_ }
        Write-Host ".env.production atualizado com os Price IDs." -ForegroundColor Green
    } else {
        Write-Host "Não salvei .env.production. Aqui estão as linhas sugeridas:" -ForegroundColor Yellow
        $envLines | ForEach-Object { Write-Host $_ }
    }
}

Write-Host "\nPronto. Revise os outputs acima e verifique o arquivo .env.production (se salvo)." -ForegroundColor Cyan
Write-Host "Depois configure o webhook no Stripe (URL: https://<seu-dominio>/api/webhook/stripe) e copie o STRIPE_WEBHOOK_SECRET para o ambiente." -ForegroundColor Cyan

Write-Host "Fim." -ForegroundColor Green
