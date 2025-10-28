# 🚀 Guia de Instalação e Deploy

## 📋 Pré-requisitos

- **Node.js**: 18.0.0 ou superior
- **npm**: 9.0.0 ou superior
- **PostgreSQL**: 14.0 ou superior (via Supabase recomendado)
- **Git**: Para controle de versão

## 🛠️ Instalação Local

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd NPS
```

### 2. Configurar Variáveis de Ambiente

```bash
cd frontend
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[gere com: openssl rand -base64 32]"

# Resend (Email)
RESEND_API_KEY="re_[sua-chave]"
RESEND_FROM_EMAIL="nps@seudominio.com.br"

# Cloudinary (Storage)
CLOUDINARY_CLOUD_NAME="[seu-cloud-name]"
CLOUDINARY_API_KEY="[sua-api-key]"
CLOUDINARY_API_SECRET="[seu-secret]"
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Configurar Banco de Dados

```bash
# Copiar schema do Prisma
cp ../database/schema.prisma ./prisma/schema.prisma

# Gerar Prisma Client
npm run db:generate

# Rodar migrations
npm run db:migrate

# (Opcional) Popular com dados de exemplo
npx prisma db seed
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🗄️ Configuração do Banco de Dados (Supabase)

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Clique em "New Project"
3. Escolha um nome: `sintegra-nps`
4. Defina uma senha forte
5. Escolha região: `South America (São Paulo)`

### 2. Obter Connection String

```bash
# No dashboard do Supabase, vá em Settings > Database
# Copie a "Connection string" em modo "Transaction"
# Substitua [YOUR-PASSWORD] pela senha definida
```

### 3. Configurar RLS (Row Level Security)

```sql
-- Desabilitar RLS para as tabelas do Prisma
-- (Prisma gerencia a segurança via código)

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE respondents DISABLE ROW LEVEL SECURITY;
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
-- ... repetir para todas as tabelas
```

## 📧 Configuração de Email (Resend)

### 1. Criar Conta no Resend

1. Acesse https://resend.com
2. Crie uma conta gratuita
3. Verifique seu domínio (ou use o sandbox para testes)

### 2. Gerar API Key

```bash
# No dashboard do Resend:
# 1. Vá em "API Keys"
# 2. Clique em "Create API Key"
# 3. Dê permissões de "Sending access"
# 4. Copie a chave (começa com "re_")
```

### 3. Verificar Domínio

```bash
# Para produção, adicione os registros DNS:
# - TXT: v=DKIM1; k=rsa; p=[sua-chave-publica]
# - CNAME: em1.resend.com
```

## 🖼️ Configuração de Storage (Cloudinary)

### 1. Criar Conta no Cloudinary

1. Acesse https://cloudinary.com
2. Crie uma conta gratuita
3. Acesse o Dashboard

### 2. Obter Credenciais

```bash
# No Dashboard, copie:
Cloud Name: [seu-cloud-name]
API Key: [sua-api-key]
API Secret: [seu-secret]
```

### 3. Criar Upload Preset

```bash
# Settings > Upload > Upload presets
# Clique em "Add upload preset"
# Nome: nps_uploads
# Signing Mode: Unsigned
# Folder: nps/reports
```

## 🔐 Configuração de Autenticação (NextAuth)

### Gerar Secret

```bash
openssl rand -base64 32
```

Copie o resultado para `NEXTAUTH_SECRET` no `.env.local`

### Configurar Providers

Por padrão, o sistema usa **Credentials Provider** (email/senha).

Para adicionar OAuth (Google, Microsoft):

```typescript
// src/app/api/auth/[...nextauth]/route.ts
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // ... outros providers
]
```

## 🚀 Deploy em Produção

### Opção 1: Vercel (Recomendado)

#### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
cd frontend
vercel
```

#### 3. Configurar Variáveis de Ambiente

```bash
# No dashboard da Vercel:
# Settings > Environment Variables
# Adicione todas as variáveis do .env.local
```

#### 4. Conectar Domínio

```bash
# Settings > Domains
# Adicione: nps.seudominio.com.br
```

### Opção 2: Railway

#### 1. Criar Conta no Railway

```bash
# Acesse https://railway.app
# Conecte com GitHub
```

#### 2. Deploy via CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### 3. Adicionar PostgreSQL

```bash
railway add postgresql
# Copie a DATABASE_URL gerada
```

### Opção 3: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build e Run
docker build -t sintegra-nps .
docker run -p 3000:3000 --env-file .env.local sintegra-nps
```

## 🔄 CI/CD com GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🧪 Testes

### Testes Unitários

```bash
npm run test
```

### Testes E2E (Playwright)

```bash
npm run test:e2e
```

### Testes de Performance

```bash
npm run lighthouse
```

## 📊 Monitoramento

### Logs (Vercel)

```bash
# Ver logs em tempo real
vercel logs --follow
```

### Analytics

Configure Vercel Analytics:

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 🔧 Troubleshooting

### Erro: "Prisma Client not generated"

```bash
npm run db:generate
```

### Erro: "Connection refused" (Database)

```bash
# Verifique se DATABASE_URL está correta
# Teste conexão:
npx prisma db push
```

### Erro: "Invalid NEXTAUTH_SECRET"

```bash
# Gere um novo secret:
openssl rand -base64 32
```

### Build falha no Vercel

```bash
# Adicione nas Environment Variables:
SKIP_ENV_VALIDATION=true
```

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e migrado
- [ ] Domínio configurado e SSL ativo
- [ ] Email verificado (Resend)
- [ ] Storage configurado (Cloudinary)
- [ ] Logs configurados
- [ ] Analytics habilitado
- [ ] Backup automático ativo
- [ ] Testes passando
- [ ] Performance > 90 (Lighthouse)

## 🆘 Suporte

- **Documentação**: `/docs`
- **Issues**: GitHub Issues
- **Email**: dev@seudominio.com.br

---

**Boa sorte com o deploy! 🚀**
