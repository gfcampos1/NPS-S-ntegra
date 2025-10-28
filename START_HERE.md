# 🚀 COMECE AQUI - Primeiros Passos

Siga esta ordem para configurar o Sistema NPS Síntegra.

---

## ✅ Checklist de Início Rápido

### 1️⃣ Instalar Dependências (OBRIGATÓRIO)

```powershell
# Navegue até a pasta frontend
cd c:\Scripts\NPS\frontend

# Instale todas as dependências
npm install

# Aguarde a instalação (2-3 minutos)
# Você verá: added 345 packages in 2m
```

**Resultado esperado:**
- ✅ Pasta `node_modules` criada
- ✅ Arquivo `package-lock.json` criado
- ✅ Erros do Tailwind CSS desaparecem

---

### 2️⃣ Adicionar Logo da Síntegra

```powershell
# Copie o logo Síntegra (120x120px) para:
c:\Scripts\NPS\assets\logos\sintegra-logo.png

# Formatos aceitos: PNG, SVG, JPG
# Tamanho recomendado: 120x120 pixels
```

**Localização do logo:**
- 📂 `/assets/logos/sintegra-logo.png`
- 📄 Instruções completas em: `/assets/logos/README.md`

---

### 3️⃣ Configurar Variáveis de Ambiente

```powershell
# Na pasta frontend, renomeie o arquivo exemplo
cd c:\Scripts\NPS\frontend
Copy-Item .env.example .env.local

# Edite o arquivo .env.local e configure:
```

**Variáveis ESSENCIAIS:**
```bash
# Database (Railway PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth (gere com: openssl rand -base64 32)
NEXTAUTH_SECRET="seu-secret-super-secreto-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend API - opcional no início)
RESEND_API_KEY=""

# Cloudinary (opcional no início)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

---

### 4️⃣ Configurar Banco de Dados

#### Opção A: Railway (Recomendado - Produção)

1. **Criar conta no Railway:**
   - Acesse: https://railway.app
   - Login com GitHub

2. **Criar projeto PostgreSQL:**
   - New Project → Provision PostgreSQL
   - Copie o `DATABASE_URL`

3. **Configurar no `.env.local`:**
   ```bash
   DATABASE_URL="postgresql://postgres:password@host.railway.app:port/railway"
   ```

4. **Rodar migrações:**
   ```powershell
   cd c:\Scripts\NPS\frontend
   npx prisma migrate dev --name init
   ```

#### Opção B: PostgreSQL Local (Desenvolvimento)

1. **Instalar PostgreSQL:**
   - Download: https://www.postgresql.org/download/windows/

2. **Criar database:**
   ```sql
   CREATE DATABASE nps_sintegra;
   ```

3. **Configurar `.env.local`:**
   ```bash
   DATABASE_URL="postgresql://postgres:senha@localhost:5432/nps_sintegra"
   ```

4. **Rodar migrações:**
   ```powershell
   npx prisma migrate dev --name init
   ```

---

### 5️⃣ Iniciar Servidor de Desenvolvimento

```powershell
# Na pasta frontend
cd c:\Scripts\NPS\frontend

# Iniciar servidor
npm run dev

# Acesse no navegador:
# http://localhost:3000
```

**Você deve ver:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

---

### 6️⃣ Criar Primeiro Usuário Admin

```powershell
# Abrir Prisma Studio
npm run db:studio

# Acesse: http://localhost:5555
```

**Criar usuário manualmente:**
1. Clique em **User**
2. **Add Record**
3. Preencha:
   - `name`: Seu Nome
   - `email`: admin@sintegra.com.br
   - `password`: Use bcrypt hash (veja abaixo)
   - `role`: ADMIN

**Gerar hash de senha:**
```powershell
# Instalar bcrypt globalmente
npm install -g bcrypt-cli

# Gerar hash para senha "admin123"
bcrypt-cli admin123

# Copie o hash gerado (exemplo: $2b$10$...)
```

---

### 7️⃣ Configurar Git e GitHub

```powershell
# Inicializar Git
cd c:\Scripts\NPS
git init

# Adicionar arquivos
git add .

# Primeiro commit
git commit -m "feat: Initial commit - Sistema NPS Síntegra"

# Criar repositório no GitHub
# Acesse: https://github.com/new
# Nome: sintegra-nps
# Descrição: Sistema de coleta de dados NPS - Síntegra

# Conectar ao GitHub
git remote add origin https://github.com/SEU-USUARIO/sintegra-nps.git
git branch -M main
git push -u origin main
```

**Documentação completa:** `/docs/GIT.md`

---

### 8️⃣ Deploy no Railway

1. **Criar conta:** https://railway.app

2. **Novo Projeto:**
   - New Project → Deploy from GitHub Repo
   - Selecione: `sintegra-nps`

3. **Configurar Build:**
   - Settings → Build
   - **Root Directory**: `frontend`
   - Build Command: `npm ci && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm start`

4. **Adicionar PostgreSQL:**
   - New → Database → Add PostgreSQL
   - Copie `DATABASE_URL`

5. **Variáveis de Ambiente:**
   - Settings → Variables
   - Adicione todas as variáveis do `.env.local`
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`

6. **Deploy:**
   - Vai fazer deploy automaticamente!

**Documentação completa:** `/docs/RAILWAY.md`

---

## 🎯 Validar Instalação

### Checklist Final

- [ ] ✅ `npm install` executado com sucesso
- [ ] ✅ Logo Síntegra adicionado em `/assets/logos/`
- [ ] ✅ `.env.local` criado e configurado
- [ ] ✅ Database conectado (Railway ou local)
- [ ] ✅ Migrações executadas (`npx prisma migrate dev`)
- [ ] ✅ Servidor rodando (`npm run dev`)
- [ ] ✅ Acesso ao http://localhost:3000 funcionando
- [ ] ✅ Primeiro usuário admin criado
- [ ] ✅ Git inicializado e código no GitHub
- [ ] ✅ Deploy no Railway (opcional - pode fazer depois)

### Testar Funcionalidades Básicas

1. **Acesse:** http://localhost:3000
2. **Login:** Use credenciais do admin criado
3. **Dashboard:** Deve aparecer dashboard vazio
4. **Criar Form:** Tente criar um formulário teste
5. **Prisma Studio:** `npm run db:studio` → Ver dados

---

## 📚 Próximos Passos

Agora que está tudo configurado:

### Leitura Obrigatória

1. **README.md** - Visão geral do projeto
2. **docs/QUICKSTART.md** - Tutorial de 5 minutos
3. **docs/ARCHITECTURE.md** - Entender a arquitetura
4. **docs/DESIGN_SYSTEM.md** - Paleta de cores e componentes

### Desenvolvimento

1. **Criar Forms Templates:**
   - Implementar formulário de Médicos (4 dimensões)
   - Implementar formulário de Distribuidores (4 dimensões)

2. **Dashboard Admin:**
   - Criar tela de visualização de respostas
   - Implementar cálculo de NPS
   - Gráficos com Recharts

3. **Interface Mobile:**
   - Otimizar resposta de formulários
   - Testar em dispositivos móveis

### Roadmap Completo

Consulte: **NEXT_STEPS.md** para ver os 14 sprints planejados (~3.5 meses)

---

## 🆘 Problemas?

### Erros Comuns

**"Tailwind CSS não funciona"**
→ Rode `npm install` e reinicie o VS Code

**"Prisma Client not found"**
→ Rode `npx prisma generate`

**"Database connection failed"**
→ Verifique `DATABASE_URL` no `.env.local`

**"Build failed"**
→ Rode `npm run build` para ver erros

### Documentação de Troubleshooting

📖 **docs/TROUBLESHOOTING.md** - Soluções para todos os erros

---

## 💡 Dicas

### VS Code Extensions Recomendadas

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense** (já instalada)
- **Prisma** (syntax highlighting)
- **GitLens** (Git superpowers)
- **Error Lens** (inline errors)

### Atalhos Úteis

```powershell
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Servidor de produção

# Database
npm run db:studio        # Prisma Studio
npm run db:migrate       # Rodar migrações
npm run db:generate      # Gerar Prisma Client
npm run db:seed          # Popular banco (quando implementado)

# Qualidade
npm run lint             # ESLint
npm run type-check       # TypeScript check
```

---

## 🎉 Tudo Pronto!

Se você completou todos os passos acima, seu ambiente está 100% configurado!

**Agora é só começar a desenvolver! 🚀**

---

**Quick Start - Sistema NPS Síntegra**  
📅 Última atualização: Janeiro 2024
