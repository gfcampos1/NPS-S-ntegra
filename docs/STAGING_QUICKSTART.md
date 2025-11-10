# ⚡ Quick Start - Configurar Staging em 10 Minutos

Guia rápido para configurar o ambiente de staging no Railway.

---

## 🎯 O que você vai fazer:

1. Criar ambiente staging no Railway (2 min)
2. Adicionar banco PostgreSQL (1 min)
3. Configurar variáveis de ambiente (3 min)
4. Deploy inicial (4 min)
5. Validar funcionamento (2 min)

**Tempo total: ~10-15 minutos**

---

## 📋 Pré-Requisitos

- [ ] Conta no Railway
- [ ] Projeto NPS-Síntegra já existe no Railway
- [ ] Acesso ao repositório GitHub

---

## 🚀 Passo a Passo

### **1. Criar Ambiente Staging (2 min)**

#### Via Railway Dashboard:

1. Acesse: https://railway.app/
2. Abra o projeto **NPS-Síntegra**
3. Clique em **Settings** → **Environments**
4. Clique em **"+ New Environment"**
5. Nome: `staging`
6. Clique em **"Create"**

✅ **Checkpoint:** Ambiente `staging` criado

---

### **2. Adicionar Banco PostgreSQL (1 min)**

1. Certifique-se de estar no ambiente **staging** (dropdown superior)
2. Clique em **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Aguarde provisionamento (30-60 segundos)

✅ **Checkpoint:** PostgreSQL aparece no dashboard

---

### **3. Configurar Serviço Frontend (2 min)**

1. No ambiente **staging**, clique em **"+ New"** → **"GitHub Repo"**
2. Selecione: `gfcampos1/NPS-Síntegra`
3. Configurar:
   - **Name:** `frontend-staging`
   - **Branch:** `claude/survey-moments-structure-011CUzvYqawdBPmyRzZ95qRk`
   - **Root Directory:** `frontend`
4. Clique em **"Deploy"**

✅ **Checkpoint:** Serviço frontend criado (vai falhar, normal!)

---

### **4. Configurar Variáveis de Ambiente (3 min)**

1. Clique no serviço **frontend-staging**
2. Vá em **"Variables"**
3. Clique em **"+ New Variable"**
4. Adicione as seguintes variáveis:

**Copie e cole (substitua onde necessário):**

```bash
# Database (auto-conecta)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Auth (GERAR NOVA SECRET!)
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=<COLE_AQUI_SECRET_GERADA_ABAIXO>

# App URLs
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_API_URL=${{RAILWAY_PUBLIC_DOMAIN}}/api
NODE_ENV=staging

# Features (desabilitar em staging)
NEXT_PUBLIC_ENABLE_PWA=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DARK_MODE=false
```

**Gerar NEXTAUTH_SECRET:**

```bash
# No seu terminal local:
openssl rand -base64 32
```

Copie o resultado e cole em `NEXTAUTH_SECRET`

✅ **Checkpoint:** Variáveis configuradas

---

### **5. Deploy (4 min)**

1. Clique em **"Deploy"** (ou aguarde deploy automático)
2. Acompanhe os logs em tempo real
3. Aguarde até ver: `✓ Build completed` e `✓ Service running`

**O que acontece durante o build:**
- ✅ Instala dependências (`npm ci`)
- ✅ Gera Prisma Client (`prisma generate`)
- ✅ Build Next.js (`npm run build`)
- ✅ Executa migrations (`prisma migrate deploy`)
- ✅ Inicia servidor (`npm start`)

✅ **Checkpoint:** Deploy concluído com sucesso

---

### **6. Copiar URL Staging (1 min)**

1. No serviço **frontend-staging**, vá em **"Settings"** → **"Domains"**
2. Copie a URL pública:
   - Exemplo: `frontend-staging-production-xxxx.up.railway.app`
3. Acesse no navegador

✅ **Checkpoint:** Site abre (pode ter erro de login, normal!)

---

### **7. Popular Banco com Seed (2 min)**

#### Via Railway CLI:

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Selecionar ambiente staging
railway environment staging

# Executar seed
railway run npm run db:seed
```

#### OU via Railway Dashboard:

1. Clique no serviço **frontend-staging**
2. Vá em **"..." (menu)** → **"Run Command"**
3. Digite: `npm run db:seed`
4. Clique em **"Run"**

✅ **Checkpoint:** Seed executado

---

### **8. Validar Funcionamento (2 min)**

1. Acesse a URL staging no navegador
2. Vá para `/login`
3. Entre com credenciais seed:
   - **Email:** `admin@sintegra.com.br`
   - **Senha:** `Admin123!`
4. Você deve ser redirecionado para o dashboard

**Teste rápido:**
- [ ] Dashboard carrega
- [ ] Formulários aparecem
- [ ] Sidebar funciona
- [ ] Feedbacks carregam

✅ **Checkpoint:** Staging funcionando! 🎉

---

## 🧪 Validação Completa (Opcional)

Execute o script de validação:

```bash
cd /home/user/NPS-S-ntegra
./scripts/validate-staging.sh
```

Isso verifica:
- ✅ Railway CLI configurado
- ✅ Projeto linkado
- ✅ Ambiente staging existe
- ✅ Variáveis configuradas
- ✅ Serviço rodando
- ✅ Banco conectado
- ✅ Migrations aplicadas

---

## 🎯 URLs Importantes

Salve estas URLs:

```
Staging Home:
https://<seu-dominio>.up.railway.app

Login:
https://<seu-dominio>.up.railway.app/login

Dashboard:
https://<seu-dominio>.up.railway.app/admin/dashboard

Railway Dashboard:
https://railway.app/project/<project-id>
```

---

## 🔧 Comandos Úteis

```bash
# Ver logs
railway logs --environment staging --follow

# Ver variáveis
railway variables --environment staging

# Restart serviço
railway restart --environment staging

# Executar comando
railway run --environment staging <comando>

# Prisma Studio (visualizar banco)
railway run --environment staging npx prisma studio
```

---

## 🆘 Troubleshooting Rápido

### **Deploy Falhou**

```bash
# Ver erro
railway logs --environment staging

# Verificar variáveis
railway variables --environment staging

# Rebuild
railway redeploy --environment staging
```

### **Login Não Funciona**

1. Verificar `NEXTAUTH_SECRET` está configurado
2. Verificar `NEXTAUTH_URL` aponta para domínio correto
3. Executar seed novamente: `railway run npm run db:seed`
4. Limpar cookies do navegador

### **Banco Não Conecta**

```bash
# Testar conexão
railway run --environment staging npx prisma db pull

# Verificar DATABASE_URL
railway variables --environment staging | grep DATABASE
```

### **Migrations Falharam**

```bash
# Ver status
railway run --environment staging npx prisma migrate status

# Aplicar migrations
railway run --environment staging npx prisma migrate deploy

# Reset (APAGA DADOS!)
railway run --environment staging npx prisma migrate reset
```

---

## ✅ Checklist Final

- [ ] Ambiente staging criado
- [ ] PostgreSQL adicionado
- [ ] Frontend staging deployado
- [ ] Variáveis configuradas
- [ ] Deploy bem-sucedido
- [ ] Seed executado
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] URL staging salva

---

## 🎉 Pronto!

Seu ambiente de staging está configurado e funcionando!

**Próximos passos:**

1. ✅ Começar desenvolvimento da feature "Momentos de Pesquisa"
2. ✅ Testar cada fase em staging
3. ✅ Validar com time
4. ✅ Deploy para produção quando aprovado

---

## 📚 Documentação Completa

Para informações detalhadas, consulte:

- [STAGING_SETUP.md](./STAGING_SETUP.md) - Guia completo de setup
- [STAGING_CHECKLIST.md](./STAGING_CHECKLIST.md) - Checklist detalhado
- [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) - Workflow dev → staging → prod

---

## 🤝 Precisa de Ajuda?

**Railway:**
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway

**Prisma:**
- Docs: https://www.prisma.io/docs/
- Discord: https://discord.gg/prisma

---

**Tempo gasto:** _____ minutos
**Configurado por:** _____________
**Data:** __/__/____

✨ **Parabéns! Staging configurado com sucesso!** ✨
