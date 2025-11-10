#!/bin/bash

###############################################################################
# Script de Validação - Ambiente Staging
# Valida se o ambiente de staging está configurado corretamente
###############################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
STAGING_ENV="staging"
REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
  "NEXT_PUBLIC_APP_URL"
)

###############################################################################
# Funções auxiliares
###############################################################################

print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

check_command() {
  if command -v $1 &> /dev/null; then
    print_success "$1 está instalado"
    return 0
  else
    print_error "$1 não está instalado"
    return 1
  fi
}

###############################################################################
# Validações
###############################################################################

print_header "Validação do Ambiente Staging"

# 1. Verificar Railway CLI
print_info "Verificando Railway CLI..."
if check_command "railway"; then
  RAILWAY_VERSION=$(railway --version 2>&1 | head -n 1)
  print_info "Versão: $RAILWAY_VERSION"
else
  print_warning "Railway CLI não encontrado. Instale com: npm install -g @railway/cli"
  print_info "Algumas verificações serão puladas..."
  exit 1
fi

# 2. Verificar se está linkado ao projeto
print_header "Verificando Projeto Railway"
if railway status &> /dev/null; then
  print_success "Projeto Railway linkado"
  PROJECT_INFO=$(railway status 2>&1)
  echo "$PROJECT_INFO"
else
  print_error "Não linkado ao projeto Railway"
  print_info "Execute: railway link"
  exit 1
fi

# 3. Verificar ambiente staging existe
print_header "Verificando Ambiente Staging"
if railway environment --environment "$STAGING_ENV" &> /dev/null; then
  print_success "Ambiente staging existe"
else
  print_error "Ambiente staging não encontrado"
  print_info "Crie com: railway environment create $STAGING_ENV"
  exit 1
fi

# 4. Verificar variáveis de ambiente
print_header "Verificando Variáveis de Ambiente"
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if railway variables --environment "$STAGING_ENV" 2>&1 | grep -q "$var"; then
    print_success "$var está configurada"
  else
    print_error "$var NÃO está configurada"
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  print_warning "Variáveis faltando: ${MISSING_VARS[*]}"
  print_info "Configure com: railway variables set KEY=value --environment $STAGING_ENV"
fi

# 5. Verificar se serviço está rodando
print_header "Verificando Status do Serviço"
SERVICE_STATUS=$(railway status --environment "$STAGING_ENV" 2>&1)

if echo "$SERVICE_STATUS" | grep -q "running"; then
  print_success "Serviço está rodando"
elif echo "$SERVICE_STATUS" | grep -q "crashed"; then
  print_error "Serviço crashed"
  print_info "Veja os logs: railway logs --environment $STAGING_ENV"
  exit 1
else
  print_warning "Status desconhecido"
  echo "$SERVICE_STATUS"
fi

# 6. Testar conexão com banco
print_header "Testando Conexão com Banco"
print_info "Executando: npx prisma db pull..."

if railway run --environment "$STAGING_ENV" npx prisma db pull --force 2>&1 | grep -q "Introspected"; then
  print_success "Conexão com banco OK"
else
  print_error "Falha ao conectar com banco"
  print_info "Verifique DATABASE_URL"
  exit 1
fi

# 7. Verificar migrations
print_header "Verificando Migrations"
print_info "Status das migrations..."

MIGRATION_STATUS=$(railway run --environment "$STAGING_ENV" npx prisma migrate status 2>&1)

if echo "$MIGRATION_STATUS" | grep -q "up to date"; then
  print_success "Migrations estão atualizadas"
elif echo "$MIGRATION_STATUS" | grep -q "pending"; then
  print_warning "Existem migrations pendentes"
  print_info "Execute: railway run --environment $STAGING_ENV npx prisma migrate deploy"
else
  print_info "Status: $MIGRATION_STATUS"
fi

# 8. Verificar domínio público
print_header "Verificando Domínio Público"
print_info "Buscando domínio staging..."

# Tentar obter domínio
DOMAIN=$(railway variables --environment "$STAGING_ENV" 2>&1 | grep "RAILWAY_PUBLIC_DOMAIN" | cut -d'=' -f2)

if [ -n "$DOMAIN" ]; then
  print_success "Domínio: $DOMAIN"

  # Testar se domínio responde
  print_info "Testando acesso ao domínio..."

  if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|301\|302"; then
    print_success "Domínio acessível"
  else
    print_warning "Domínio não está respondendo"
    print_info "Aguarde alguns minutos após o deploy"
  fi
else
  print_warning "Domínio público não encontrado"
  print_info "Configure um domínio no Railway Dashboard"
fi

# 9. Verificar logs recentes
print_header "Verificando Logs Recentes"
print_info "Últimas 10 linhas de log..."

railway logs --environment "$STAGING_ENV" --tail 10

# 10. Resumo final
print_header "Resumo da Validação"

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
  print_success "Todas as variáveis obrigatórias estão configuradas"
else
  print_error "${#MISSING_VARS[@]} variáveis faltando"
fi

print_info "Ambiente: $STAGING_ENV"
print_info "Status: Verificado"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Validação Concluída!${NC}"
echo -e "${GREEN}========================================${NC}\n"

print_info "Próximos passos:"
echo "  1. Acesse o domínio staging no navegador"
echo "  2. Faça login com credenciais seed"
echo "  3. Valide funcionalidades básicas"
echo "  4. Execute testes manuais"
echo ""
print_info "Comandos úteis:"
echo "  railway logs --environment staging --follow"
echo "  railway run --environment staging npm run db:studio"
echo "  railway restart --environment staging"
echo ""

exit 0
