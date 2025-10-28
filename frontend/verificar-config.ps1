# Script de Verificação - Sistema NPS

Write-Host "🔍 VERIFICANDO CONFIGURAÇÃO DO SISTEMA NPS" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Verificar se está na pasta correta
$currentPath = Get-Location
Write-Host "📁 Pasta atual: $currentPath" -ForegroundColor Yellow

# Verificar .env.local
Write-Host ""
Write-Host "1️⃣ Verificando .env.local..." -ForegroundColor Cyan
if (Test-Path ".env.local") {
    Write-Host "   ✅ Arquivo .env.local existe" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match 'DATABASE_URL="postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^"]+)"') {
        $dbUser = $matches[1]
        $dbHost = $matches[3]
        $dbPort = $matches[4]
        $dbName = $matches[5]
        
        Write-Host "   📊 Configuração do Banco:" -ForegroundColor Yellow
        Write-Host "      - Host: $dbHost" -ForegroundColor White
        Write-Host "      - Porta: $dbPort" -ForegroundColor White
        Write-Host "      - Usuário: $dbUser" -ForegroundColor White
        Write-Host "      - Database: $dbName" -ForegroundColor White
        
        if ($dbUser -eq "usuario" -or $dbHost -eq "localhost" -and $dbName -eq "sintegra_nps") {
            Write-Host "   ⚠️  DATABASE_URL parece estar com valores de exemplo!" -ForegroundColor Red
            Write-Host "   📝 Você precisa configurar com valores reais." -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ DATABASE_URL não encontrada ou mal formatada" -ForegroundColor Red
    }
    
    if ($envContent -match 'NEXTAUTH_SECRET="([^"]+)"') {
        $secret = $matches[1]
        if ($secret -like "*sua-chave*" -or $secret -like "*exemplo*") {
            Write-Host "   ⚠️  NEXTAUTH_SECRET precisa ser gerado!" -ForegroundColor Red
        } else {
            Write-Host "   ✅ NEXTAUTH_SECRET configurado" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ NEXTAUTH_SECRET não encontrado" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Arquivo .env.local NÃO existe!" -ForegroundColor Red
}

# Verificar node_modules
Write-Host ""
Write-Host "2️⃣ Verificando dependências..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules existe" -ForegroundColor Green
    $packageCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host "   📦 $packageCount pacotes instalados" -ForegroundColor White
} else {
    Write-Host "   ❌ node_modules NÃO existe - Execute: npm install" -ForegroundColor Red
}

# Verificar Prisma Client
Write-Host ""
Write-Host "3️⃣ Verificando Prisma Client..." -ForegroundColor Cyan
if (Test-Path "node_modules\.prisma\client") {
    Write-Host "   ✅ Prisma Client gerado" -ForegroundColor Green
} else {
    Write-Host "   ❌ Prisma Client NÃO gerado - Execute: npx prisma generate" -ForegroundColor Red
}

# Verificar PostgreSQL (se local)
Write-Host ""
Write-Host "4️⃣ Verificando PostgreSQL (se local)..." -ForegroundColor Cyan
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Host "   ✅ PostgreSQL está RODANDO" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  PostgreSQL está PARADO" -ForegroundColor Yellow
        Write-Host "   💡 Inicie com: Start-Service $($pgService.Name)" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ℹ️  PostgreSQL não instalado localmente (pode estar usando Railway)" -ForegroundColor Gray
}

# Resumo
Write-Host ""
Write-Host "=" * 60
Write-Host "📋 RESUMO" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Configure DATABASE_URL no .env.local com valores reais"
Write-Host "2. Gere NEXTAUTH_SECRET (veja CONFIGURAR_BANCO.md)"
Write-Host "3. Execute: npx prisma migrate dev --name init"
Write-Host "4. Execute: npm run db:seed"
Write-Host "5. Execute: npm run dev"
Write-Host ""
Write-Host "📖 Guia completo: CONFIGURAR_BANCO.md" -ForegroundColor Cyan
Write-Host "=" * 60
