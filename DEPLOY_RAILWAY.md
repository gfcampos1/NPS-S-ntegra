# 🚀 DEPLOY NO RAILWAY - Guia Passo a Passo

## 📋 Pré-requisitos

- ✅ Código no GitHub
- ✅ Conta no Railway (https://railway.app)

---

## PASSO 1: Preparar o Repositório GitHub

### 1.1 Inicializar Git (se ainda não fez)

```powershell
cd c:\Scripts\NPS

# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "feat: Sistema NPS Síntegra - implementação inicial"
```

### 1.2 Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `NPS-Sintegra` ou `sintegra-nps`
3. Descrição: `Sistema de coleta de dados NPS para médicos e distribuidores`
4. **Importante:** Marque como **Private** (dados sensíveis)
5. Clique em "Create repository"

### 1.3 Fazer Push para o GitHub

```powershell
# Adicionar remote (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/gfcampos1/NPS-Sintegra.git

# Renomear branch para main
git branch -M main

# Push
git push -u origin main
```

---

## PASSO 2: Configurar Railway

### 2.1 Criar Conta e Fazer Login

1. Acesse: https://railway.app
2. Clique em "Login" ou "Start a New Project"
3. Faça login com **GitHub** (recomendado)
4. Autorize o Railway a acessar seus repositórios

### 2.2 Criar Novo Projeto

1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Selecione o repositório: `gfcampos1/NPS-Sintegra`
4. Railway vai começar a detectar o projeto

### 2.3 Adicionar PostgreSQL

1. No mesmo projeto, clique em **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Aguarde a criação (30-60 segundos)

---

## PASSO 3: Configurar Build Settings

### 3.1 Configurar Root Directory

1. Clique no serviço do seu app (não no database)
2. Vá em **"Settings"**
3. Em **"Build"**, encontre **"Root Directory"**
4. Configure como: `frontend`
5. Salve

### 3.2 Build Command (Opcional - já está no railway.json)

Se Railway não detectar automaticamente:

**Build Command:**
```
npm ci && npx prisma generate && npm run build
```

**Start Command:**
```
npx prisma migrate deploy && npm start
```

---

## PASSO 4: Configurar Variáveis de Ambiente

### 4.1 Acessar Variables

1. No serviço do app, clique em **"Variables"**
2. Clique em **"+ New Variable"**

### 4.2 Adicionar Variáveis ESSENCIAIS

Adicione uma por uma:

#### DATABASE_URL
```
Valor: ${{Postgres.DATABASE_URL}}
```
⚠️ **Importante:** Use exatamente `${{Postgres.DATABASE_URL}}` - Railway vai substituir automaticamente

#### NEXTAUTH_URL
```
Valor: ${{RAILWAY_PUBLIC_DOMAIN}}
```
Ou depois que o deploy acontecer, use a URL gerada tipo:
```
https://nps-sintegra-production.up.railway.app
```

#### NEXTAUTH_SECRET
Gere um secret forte:

**No PowerShell:**
```powershell
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Cole o resultado em NEXTAUTH_SECRET.

#### NODE_ENV
```
Valor: production
```

### 4.3 Variáveis Opcionais (pode adicionar depois)

```
RESEND_API_KEY=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

---

## PASSO 5: Fazer Deploy

### 5.1 Trigger Deploy

1. Após configurar tudo, clique em **"Deploy"** ou faça um novo push no GitHub
2. Railway vai:
   - ✅ Clonar o repositório
   - ✅ Instalar dependências
   - ✅ Gerar Prisma Client
   - ✅ Build do Next.js
   - ✅ Executar migrações
   - ✅ Iniciar aplicação

### 5.2 Acompanhar Logs

1. Clique em **"Deployments"**
2. Selecione o deploy em andamento
3. Veja os logs em tempo real
4. Aguarde aparecer "✓ Ready in..."

### 5.3 Acessar a URL

1. Vá em **"Settings"**
2. Em **"Networking"**, clique em **"Generate Domain"**
3. Railway vai gerar algo como: `nps-sintegra-production.up.railway.app`
4. Acesse a URL gerada

---

## PASSO 6: Popular Banco de Dados

### 6.1 Executar Seed via Railway CLI (Opcional)

Instale Railway CLI:
```powershell
iwr https://railway.app/install.ps1 | iex
```

Faça login:
```powershell
railway login
```

Link ao projeto:
```powershell
railway link
```

Execute o seed:
```powershell
railway run npm run db:seed
```

### 6.2 OU Criar Admin Manualmente via Prisma Studio

```powershell
# Local, apontando para o Railway
# Copie a DATABASE_URL do Railway e cole no .env.local
npm run db:studio

# Acesse http://localhost:5555
# Crie usuário admin manualmente
```

### 6.3 OU Via SQL Direto no Railway

1. No Railway, clique no PostgreSQL
2. Vá em **"Query"**
3. Execute:

```sql
-- Criar usuário admin
-- Senha: admin123 (hash bcrypt)
INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'admin_' || substr(md5(random()::text), 1, 20),
  'admin@sintegra.com.br',
  'Administrador',
  '$2a$10$YourBcryptHashHere',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

**Para gerar o hash da senha:**
```javascript
// No navegador console ou Node.js
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

---

## PASSO 7: Testar o Sistema

1. Acesse a URL do Railway
2. Você deve ver a página de login
3. Entre com:
   - Email: `admin@sintegra.com.br`
   - Senha: `admin123`

---

## 🔧 TROUBLESHOOTING

### Deploy Falha no Build

**Erro:** "Cannot find module @prisma/client"
**Solução:** Verifique se `railway.json` está correto

**Erro:** "Database connection failed"
**Solução:** Verifique se `DATABASE_URL` está como `${{Postgres.DATABASE_URL}}`

### Aplicação não Inicia

Verifique logs:
1. Railway Dashboard
2. Deployments
3. Veja os logs de erro

### Migrations Fail

Execute manualmente via Railway CLI:
```powershell
railway run npx prisma migrate deploy
```

### Site Carrega mas Login Dá Erro

**Erro 401:** Banco vazio, execute seed
**Erro 500:** Verifique `NEXTAUTH_SECRET` e `NEXTAUTH_URL`

---

## 📊 MONITORAMENTO

### Logs em Tempo Real

```powershell
railway logs
```

### Métricas

No Railway Dashboard:
- CPU Usage
- Memory Usage
- Request Count
- Response Time

---

## 🎯 CHECKLIST FINAL

Antes de considerar completo:

- [ ] Repositório no GitHub (private)
- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado
- [ ] Root directory: `frontend`
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] Domínio gerado
- [ ] Seed executado (admin criado)
- [ ] Login funcionando
- [ ] Dashboard carregando

---

## 💡 DICAS

### 1. Domínio Customizado

Depois pode adicionar domínio próprio:
- Settings → Networking → Custom Domain
- Adicione: `nps.sintegra.com.br`

### 2. Ambientes

Crie ambientes separados:
- `production` (main branch)
- `staging` (develop branch)

### 3. CI/CD Automático

Railway faz deploy automático a cada push no GitHub!

### 4. Backups

Configure backups automáticos do PostgreSQL:
- Railway já faz snapshots diários
- Exporte dados importantes: `railway run npx prisma db pull`

---

## 🚀 PRÓXIMOS PASSOS APÓS DEPLOY

1. ✅ Testar todas as funcionalidades
2. ✅ Adicionar logo real da Síntegra
3. ✅ Configurar email (Resend)
4. ✅ Implementar CRUD de formulários
5. ✅ Convidar usuários teste

---

## 📞 SUPORTE

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Troubleshooting: `/docs/TROUBLESHOOTING.md`

**BOA SORTE! 🎉**
