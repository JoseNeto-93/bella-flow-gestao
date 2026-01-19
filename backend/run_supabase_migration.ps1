<#
PowerShell script to run the Supabase/Postgres migration SQL file using psql.
Usage:
  - Set the environment variable PG_CONN (Postgres connection string) or pass as parameter:
    .\run_supabase_migration.ps1 -PG_CONN "postgres://user:pass@host:5432/dbname"
  - Ensure `psql` (Postgres client) is installed and in PATH.
#>
param(
  [string]$PG_CONN = $env:PG_CONN
)

if (-not $PG_CONN) {
  $PG_CONN = Read-Host 'Informe a connection string do Postgres (postgres://user:pass@host:5432/db)'
}

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
  Write-Host "psql não encontrado. Instale o cliente Postgres (psql) e adicione ao PATH." -ForegroundColor Yellow
  Write-Host "No Windows, instale 'PostgreSQL' (inclui psql) ou use WSL." -ForegroundColor Yellow
  exit 1
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath 'migrations/001_create_salons.sql'
if (-not (Test-Path $scriptPath)) {
  Write-Host "Arquivo de migração não encontrado: $scriptPath" -ForegroundColor Red
  exit 1
}

Write-Host "Executando migração em: $PG_CONN" -ForegroundColor Cyan

# Run psql with the SQL file
$cmd = "psql '$PG_CONN' -f '$scriptPath'"
Write-Host "Comando: $cmd" -ForegroundColor Gray

try {
  & psql $PG_CONN -f $scriptPath
  Write-Host "Migração executada com sucesso." -ForegroundColor Green
} catch {
  Write-Host "Erro ao executar migração:" $_.Exception.Message -ForegroundColor Red
  exit 1
}
