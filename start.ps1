# Script para iniciar o sistema Bella Flow
Write-Host "=== Iniciando Bella Flow ===" -ForegroundColor Cyan

# Matar processos existentes na porta 3000 e 3333
Write-Host "`nVerificando portas..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 3333 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 2

# Iniciar Backend
Write-Host "`n=== Iniciando Backend (porta 3333) ===" -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "`n=== Iniciando Frontend (porta 3000) ===" -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host "`n✅ Sistema iniciado!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3333" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nAguarde alguns segundos e acesse o navegador." -ForegroundColor Yellow
