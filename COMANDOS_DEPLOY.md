# 🚀 COMANDOS PARA DEPLOY NO RAILWAY

Execute estes comandos na ordem:

## 1️⃣ Preparar Git (se ainda não fez)

```powershell
cd c:\Scripts\NPS

# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: Sistema NPS Síntegra - implementação completa"
```

## 2️⃣ Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `NPS-Sintegra`
3. Privado: ✅ Sim (recomendado)
4. Clique em "Create repository"

## 3️⃣ Fazer Push para GitHub

```powershell
# Adicionar remote (seu repositório já existe)
git remote add origin https://github.com/gfcampos1/NPS-Sintegra.git

# Ou se já tem remote configurado
git remote set-url origin https://github.com/gfcampos1/NPS-Sintegra.git

# Fazer push
git branch -M main
git push -u origin main
```

## 4️⃣ Configurar Railway

### Criar Projeto
1. Acesse: https://railway.app
2. Login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha: `gfcampos1/NPS-Sintegra`

### Adicionar PostgreSQL
1. No mesmo projeto, clique "+ New"
2. Selecione "Database"
3. Escolha "Add PostgreSQL"
4. Aguarde criação (~30 segundos)

### Configurar Root Directory
1. Clique no serviço do app (não no database)
2. Settings → Build
3. **Root Directory:** `frontend`
4. Salve

### Adicionar Variáveis de Ambiente

Clique em "Variables" e adicione:

**DATABASE_URL:**
```
${{Postgres.DATABASE_URL}}
```

**NEXTAUTH_SECRET:**
```powershell
# Gere com este comando PowerShell:
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Cole o resultado aqui
```

**NEXTAUTH_URL:**
```
${{RAILWAY_PUBLIC_DOMAIN}}
```

**NODE_ENV:**
```
production
```

## 5️⃣ Fazer Deploy

1. Railway vai detectar o push e fazer deploy automaticamente
2. Ou clique em "Deploy" manualmente
3. Aguarde 5-10 minutos para o primeiro build

## 6️⃣ Gerar Domínio

1. Settings → Networking
2. Clique em "Generate Domain"
3. Railway vai criar: `nome-projeto-production.up.railway.app`

## 7️⃣ Executar Seed (Criar Admin)

### Opção A: Via Railway CLI

```powershell
# Instalar Railway CLI
iwr https://railway.app/install.ps1 | iex

# Login
railway login

# Link ao projeto
cd c:\Scripts\NPS\frontend
railway link

# Executar seed
railway run npm run db:seed
```

### Opção B: Via SQL Direto

1. No Railway, clique no PostgreSQL
2. Vá em "Query"
3. Execute:

```sql
-- Primeiro, gere o hash da senha
-- Use: https://bcrypt-generator.com
-- Senha: admin123
-- Rounds: 10

INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'clxyz123456789',
  'admin@sintegra.com.br',
  'Administrador',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

## 8️⃣ Testar

1. Acesse o domínio gerado
2. Login:
   - Email: `admin@sintegra.com.br`
   - Senha: `admin123`

---

## ✅ CHECKLIST

- [ ] Git inicializado
- [ ] Commit feito
- [ ] Repositório criado no GitHub
- [ ] Push para GitHub
- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado
- [ ] Root directory configurado: `frontend`
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy concluído (verde)
- [ ] Domínio gerado
- [ ] Seed executado
- [ ] Login testado

---

## 🆘 Se Der Erro

### Deploy Falha
```powershell
# Ver logs
railway logs

# Rebuild
railway up --detach
```

### Migrations Fail
```powershell
railway run npx prisma migrate deploy
```

### Prisma Client Error
```powershell
railway run npx prisma generate
```

---

## 📞 Links Úteis

- Railway Dashboard: https://railway.app/dashboard
- Guia Completo: `DEPLOY_RAILWAY.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`

**BOA SORTE! 🎉**
