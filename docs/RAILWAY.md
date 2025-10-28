# 🚂 Deploy no Railway - Sistema NPS Síntegra

Guia completo para deploy da aplicação no Railway.

## 🎯 Visão Geral

Railway é uma plataforma moderna para deploy de aplicações full-stack com:
- ✅ Deploy automático via GitHub
- ✅ PostgreSQL integrado
- ✅ Variáveis de ambiente seguras
- ✅ SSL/HTTPS automático
- ✅ Logs em tempo real
- ✅ Preview deployments

---

## 📋 Pré-requisitos

- [x] Conta no GitHub
- [x] Repositório criado
- [x] Código commitado
- [x] Conta no Railway (gratuita)

---

## 🚀 Setup Completo

### Passo 1: Preparar Repositório GitHub

```bash
# Na raiz do projeto
cd c:/Scripts/NPS

# Inicializar Git (se ainda não fez)
git init

# Criar .gitignore na raiz (se não existe)
echo "node_modules/" >> .gitignore
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Primeiro commit
git add .
git commit -m "feat: Initial commit - Sistema NPS Síntegra"

# Criar repositório no GitHub
# Acesse: https://github.com/new
# Nome: sintegra-nps
# Deixe PÚBLICO ou PRIVADO

# Conectar e push
git remote add origin https://github.com/SEU_USUARIO/sintegra-nps.git
git branch -M main
git push -u origin main
```

### Passo 2: Criar Projeto no Railway

1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Escolha **"Deploy from GitHub repo"**
5. Selecione **sintegra-nps**

### Passo 3: Adicionar PostgreSQL

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database" → "PostgreSQL"**
3. Aguarde ~30 segundos
4. Clique no PostgreSQL
5. Vá em **"Connect"** e copie a **Connection URL**

Exemplo:
```
postgresql://postgres:abc123@containers-us-west-456.railway.app:7432/railway
```

### Passo 4: Configurar Serviço do Frontend

1. Clique no serviço **sintegra-nps**
2. Vá em **"Settings"**
3. Configure:
   - **Root Directory**: `frontend`
   - **Install Command**: `npm ci`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### Passo 5: Adicionar Variáveis de Ambiente

No serviço, vá em **"Variables"** e adicione:

```bash
# === DATABASE ===
DATABASE_URL=${{Postgres.DATABASE_URL}}

# === NEXTAUTH ===
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=GERAR_COM_COMANDO_ABAIXO

# === RESEND (Email) ===
RESEND_API_KEY=re_sua_chave
RESEND_FROM_EMAIL=nps@seudominio.com.br
RESEND_FROM_NAME=Síntegra NPS

# === CLOUDINARY (Storage) ===
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_key
CLOUDINARY_API_SECRET=seu_secret

# === APP CONFIG ===
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
PORT=3000
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Passo 6: Configurar Domínio

1. No serviço, vá em **"Settings" → "Networking"**
2. Clique em **"Generate Domain"**
3. Sua URL será algo como: `sintegra-nps.up.railway.app`

**Domínio Customizado (opcional):**
1. Clique em **"Custom Domain"**
2. Adicione: `nps.seudominio.com.br`
3. Configure DNS (CNAME):
   ```
   nps.seudominio.com.br → sintegra-nps.up.railway.app
   ```

---

## 🔧 Configurações do Projeto

### Arquivo: `frontend/railway.json`

Já foi criado automaticamente com:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Ajustar `package.json` (se necessário)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npx prisma generate && next build",
    "start": "next start",
    "postinstall": "npx prisma generate"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

---

## 🗄️ Executar Migrations no Railway

### Opção 1: Automático (no Deploy)

O `railway.json` já está configurado para rodar migrations automaticamente:
```bash
npx prisma migrate deploy
```

### Opção 2: Manual via CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Linkar projeto
railway link

# Executar migration
railway run npx prisma migrate deploy

# Visualizar logs
railway logs
```

---

## 🎨 Seed de Dados Iniciais (Opcional)

Criar admin padrão após primeiro deploy:

```bash
# Via Railway CLI
railway run npx prisma db seed
```

Ou criar arquivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sintegra.com.br' },
    update: {},
    create: {
      email: 'admin@sintegra.com.br',
      name: 'Administrador',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Admin criado:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

E adicionar no `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## 🔍 Monitoramento e Logs

### Ver Logs em Tempo Real

```bash
railway logs --follow
```

### Logs no Dashboard

1. No serviço, vá em **"Deployments"**
2. Clique no deploy ativo
3. Veja **"Deploy Logs"** e **"Build Logs"**

### Métricas

Railway mostra automaticamente:
- CPU usage
- Memory usage
- Network traffic
- Uptime

---

## 🔄 CI/CD Automático

Railway já configura CI/CD automaticamente:

1. **Push para GitHub** → Deploy automático
2. **Pull Request** → Preview deployment
3. **Merge to main** → Deploy para produção

### Configurar Branch

No Railway:
1. Vá em **"Settings" → "Deploy"**
2. Configure **"Production Branch"**: `main`
3. Habilite **"PR Deploys"** para previews

---

## 🐛 Troubleshooting

### Erro: "Prisma Client not generated"

```bash
# No railway.json, certifique-se que tem:
"buildCommand": "npm ci && npx prisma generate && npm run build"
```

### Erro: "Database connection failed"

Verifique se `DATABASE_URL` está configurada:
```bash
railway variables
```

### Build muito lento

Configure **Build Cache**:
```bash
# Settings → Build
# Habilite "Use Build Cache"
```

### Erro de memória no build

Aumente limite de memória no build:
```json
// next.config.js
module.exports = {
  experimental: {
    workerThreads: false,
    cpus: 1
  }
}
```

---

## 💰 Custos

### Plano Gratuito (Starter)
- ✅ 500 horas/mês
- ✅ 5 GB de banda
- ✅ PostgreSQL incluído
- ✅ Deploy ilimitado

**Estimativa NPS:**
- Frontend: ~100-200 horas/mês
- Database: Sempre ativo
- **Total: GRÁTIS** (dentro do limite)

### Plano Pro ($20/mês)
- 100 GB de banda
- Sem limite de horas
- Prioridade no suporte

---

## 🔐 Segurança

### Variables Encryption
Railway criptografa todas as variáveis automaticamente.

### Database Backups
Configure backups automáticos:
1. PostgreSQL service → **"Settings"**
2. Habilite **"Automated Backups"** (Pro plan)

### SSL/TLS
Automático para todos os domínios Railway.

---

## 📊 Healthcheck

Adicionar rota de health no Next.js:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Testar conexão com DB
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

Configurar no Railway:
```bash
# Settings → Healthcheck
Path: /api/health
Interval: 60s
```

---

## 🚀 Deploy Checklist

- [ ] Código commitado no GitHub
- [ ] `railway.json` configurado
- [ ] PostgreSQL criado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] `NEXTAUTH_SECRET` gerado
- [ ] Domínio configurado
- [ ] Primeiro deploy realizado
- [ ] Migrations executadas
- [ ] Admin seed criado
- [ ] Healthcheck funcionando
- [ ] Logs sem erros

---

## 🔄 Workflow de Deploy

```bash
# Desenvolvimento local
git checkout -b feature/nova-funcionalidade
# ... desenvolver ...
git commit -m "feat: Nova funcionalidade"
git push origin feature/nova-funcionalidade

# Railway cria preview deployment automaticamente

# Após aprovação, merge para main
git checkout main
git merge feature/nova-funcionalidade
git push origin main

# Railway faz deploy automático para produção
```

---

## 📞 Suporte Railway

- **Docs**: https://docs.railway.app
- **Discord**: https://discord.gg/railway
- **Status**: https://status.railway.app

---

**Sistema NPS Síntegra rodando no Railway! 🚂**
