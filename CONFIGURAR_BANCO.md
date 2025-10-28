# 🔧 CONFIGURAÇÃO DO BANCO DE DADOS - Passo a Passo

## ⚠️ IMPORTANTE: Você precisa configurar o banco ANTES de fazer login

O erro 401 que você está recebendo é porque o banco de dados não está configurado.

---

## OPÇÃO 1: PostgreSQL Local (Mais Rápido para Testar) ⚡

### Passo 1: Instalar PostgreSQL

Se ainda não tem instalado:
1. Download: https://www.postgresql.org/download/windows/
2. Instale com as configurações padrão
3. Anote a senha que você criar para o usuário `postgres`

### Passo 2: Criar o Banco de Dados

Abra o pgAdmin ou psql e execute:

```sql
CREATE DATABASE nps_sintegra;
```

Ou via PowerShell:

```powershell
# Usando psql (se estiver no PATH)
psql -U postgres -c "CREATE DATABASE nps_sintegra;"
```

### Passo 3: Configurar .env.local

Edite: `c:\Scripts\NPS\frontend\.env.local`

Substitua a linha DATABASE_URL por:

```bash
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/nps_sintegra"
```

**Exemplo:** Se sua senha é `admin123`:
```bash
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/nps_sintegra"
```

### Passo 4: Gerar NEXTAUTH_SECRET

No PowerShell:

```powershell
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copie o resultado e cole no `.env.local`:

```bash
NEXTAUTH_SECRET="resultado_do_comando_acima"
```

### Passo 5: Executar Migrações

```powershell
cd c:\Scripts\NPS\frontend

# Criar tabelas no banco
npx prisma migrate dev --name init

# Criar usuário admin padrão
npm run db:seed
```

### Passo 6: Iniciar Servidor

```powershell
npm run dev
```

Acesse: http://localhost:3000

**Login:**
- Email: `admin@sintegra.com.br`
- Senha: `admin123`

---

## OPÇÃO 2: Railway (Para Produção) 🚀

### Passo 1: Criar Conta no Railway

1. Acesse: https://railway.app
2. Faça login com GitHub

### Passo 2: Criar Projeto PostgreSQL

1. New Project
2. Provision PostgreSQL
3. Aguarde a criação

### Passo 3: Copiar DATABASE_URL

1. Clique no PostgreSQL
2. Aba "Connect"
3. Copie a "Database URL"

### Passo 4: Configurar .env.local

Cole no `.env.local`:

```bash
DATABASE_URL="postgresql://postgres:senha@containers-us-west-123.railway.app:5432/railway"
```

### Passo 5: Executar Migrações

```powershell
cd c:\Scripts\NPS\frontend
npx prisma migrate dev --name init
npm run db:seed
```

### Passo 6: Iniciar Servidor

```powershell
npm run dev
```

---

## 🆘 TROUBLESHOOTING

### Erro: "Can't reach database server"

**PostgreSQL Local:**
- PostgreSQL está rodando?
- Senha está correta?
- Nome do banco está correto?

Verifique serviços do Windows:
```powershell
Get-Service postgresql*
```

Se não estiver rodando:
```powershell
Start-Service postgresql-x64-[versão]
```

### Erro: "database nps_sintegra does not exist"

Crie o banco:
```sql
CREATE DATABASE nps_sintegra;
```

### Erro: "password authentication failed"

A senha no `.env.local` está incorreta. Verifique a senha do PostgreSQL.

### Erro: "Prisma Client not generated"

```powershell
npx prisma generate
```

---

## ✅ CHECKLIST FINAL

Antes de tentar fazer login, verifique:

- [ ] PostgreSQL instalado e rodando (ou Railway configurado)
- [ ] Banco `nps_sintegra` criado
- [ ] `DATABASE_URL` configurada no `.env.local`
- [ ] `NEXTAUTH_SECRET` gerado e configurado
- [ ] Migrações executadas: `npx prisma migrate dev`
- [ ] Seed executado: `npm run db:seed`
- [ ] Servidor reiniciado: `npm run dev`

---

## 🔍 VERIFICAR SE DEU CERTO

### Opção 1: Prisma Studio

```powershell
npm run db:studio
```

Acesse: http://localhost:5555

Deve aparecer a tabela `users` com 1 registro (admin).

### Opção 2: Teste Direto

No psql ou pgAdmin:

```sql
SELECT * FROM users;
```

Deve retornar 1 linha com o admin.

---

## 📞 Ainda com Problemas?

Execute este comando e me envie o resultado:

```powershell
cd c:\Scripts\NPS\frontend
npx prisma db pull
```

Isso vai testar a conexão com o banco.
