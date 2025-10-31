# Script para executar migrations do Prisma
# Carrega variáveis do .env.local

$envFile = ".env.local"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#].+?)=(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
    Write-Host "Variáveis de ambiente carregadas de $envFile" -ForegroundColor Green
}

# Executa a migration
npx prisma migrate dev --name add_password_reset_fields
