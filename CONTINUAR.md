# 🎯 COMO CONTINUAR - Guia Rápido

## ✅ Status Atual

**Implementado até agora:**
- ✅ Frontend completo configurado (Next.js 14 + TypeScript + Tailwind)
- ✅ Autenticação com NextAuth.js
- ✅ Dashboard admin com métricas NPS
- ✅ Página de login
- ✅ Layout admin com navegação
- ✅ Listagem de formulários
- ✅ Componentes UI base (Button, Input, Card, etc)
- ✅ Prisma Client + Schema
- ✅ Biblioteca de cálculo de NPS
- ✅ Seed script (admin padrão)

---

## 🚀 PASSO A PASSO PARA RODAR AGORA

### 1. Configure o Banco de Dados

#### Opção A: Railway (Recomendado)

```powershell
# 1. Acesse https://railway.app
# 2. Crie novo projeto
# 3. Add PostgreSQL
# 4. Copie a DATABASE_URL
```

#### Opção B: PostgreSQL Local

```powershell
# Instale PostgreSQL
# Crie banco: CREATE DATABASE nps_sintegra;
```

### 2. Configure Variáveis de Ambiente

Edite: `c:\Scripts\NPS\frontend\.env.local`

```bash
# Database (Cole a URL do Railway ou local)
DATABASE_URL="postgresql://postgres:senha@host:port/database"

# NextAuth Secret (Gere abaixo)
NEXTAUTH_SECRET="gere-um-secret-aleatorio"
NEXTAUTH_URL="http://localhost:3000"
```

**Gerar NEXTAUTH_SECRET:**
```powershell
# PowerShell
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### 3. Execute Migrações

```powershell
cd c:\Scripts\NPS\frontend

# Criar migração inicial
npx prisma migrate dev --name init

# Popular banco com admin padrão
npm run db:seed
```

### 4. Inicie o Servidor

```powershell
npm run dev
```

Acesse: http://localhost:3000

**Login:**
- Email: `admin@sintegra.com.br`
- Senha: `admin123`

---

## 📋 PRÓXIMAS IMPLEMENTAÇÕES

### Sprint Atual (Formulários)

#### 1. Criar Formulário (Página)
**Arquivo:** `src/app/admin/forms/new/page.tsx`

**O que fazer:**
- Formulário para criar novo form
- Campos: título, descrição, tipo (MEDICOS/DISTRIBUIDORES)
- Botão salvar que chama API

**API Route:** `src/app/api/forms/route.ts`
```typescript
// POST /api/forms
export async function POST(request: Request) {
  const data = await request.json()
  const form = await prisma.form.create({ data })
  return Response.json(form)
}
```

#### 2. Editar Formulário
**Arquivo:** `src/app/admin/forms/[id]/edit/page.tsx`

**O que fazer:**
- Carregar dados do form
- Permitir editar título, descrição, status
- Adicionar/remover perguntas
- Reordenar perguntas (drag & drop)

#### 3. Gerenciar Perguntas
**Componente:** `src/components/question-builder.tsx`

**Funcionalidades:**
- Adicionar pergunta (tipo: RATING_1_5, NPS, TEXT_LONG, etc)
- Configurar opções
- Definir lógica condicional
- Reordenar

#### 4. Preview do Formulário
**Componente:** `src/components/form-preview.tsx`

**O que fazer:**
- Mostrar como o form aparecerá no mobile
- Testar lógica condicional
- Simular preenchimento

### Sprint Seguinte (Respondentes)

#### 1. Listar Respondentes
**Arquivo:** `src/app/admin/respondents/page.tsx`

#### 2. Adicionar Respondente
**Arquivo:** `src/app/admin/respondents/new/page.tsx`

#### 3. Importar CSV
**Componente:** `src/components/csv-import.tsx`

### Sprint Distribuição

#### 1. Interface de Resposta
**Arquivo:** `src/app/survey/[token]/page.tsx`

**Mobile-first:**
- Botões grandes
- Navegação por swipe
- Progress bar
- Validações em tempo real

#### 2. Envio de Emails
**API Route:** `src/app/api/forms/[id]/distribute/route.ts`

**Usar Resend:**
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
```

---

## 🛠️ FERRAMENTAS ÚTEIS

### Prisma Studio
```powershell
npm run db:studio
# Acesse: http://localhost:5555
# Visualize e edite dados diretamente
```

### Verificar Erros
```powershell
npm run type-check  # TypeScript
npm run lint        # ESLint
```

### Banco de Dados
```powershell
npx prisma migrate dev    # Criar migração
npx prisma db push        # Push schema sem migração
npx prisma generate       # Gerar Prisma Client
```

---

## 📦 COMPONENTES ADICIONAIS NECESSÁRIOS

### 1. Select Component
```bash
# Já instalado o @radix-ui/react-select
# Criar: src/components/ui/select.tsx
```

### 2. Dialog Component
```bash
# Já instalado o @radix-ui/react-dialog
# Criar: src/components/ui/dialog.tsx
```

### 3. Table Component
```bash
# Já instalado o @tanstack/react-table
# Criar: src/components/ui/table.tsx
```

### 4. Form Component (React Hook Form)
```bash
# Já instalado react-hook-form + zod
# Criar: src/components/ui/form.tsx
```

---

## 🎨 EXEMPLOS DE CÓDIGO

### API Route Example
```typescript
// src/app/api/forms/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const forms = await prisma.form.findMany({
    where: { createdBy: session.user.id },
  })

  return Response.json(forms)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.json()
  
  const form = await prisma.form.create({
    data: {
      ...data,
      createdBy: session.user.id,
    },
  })

  return Response.json(form)
}
```

### Server Component Example
```typescript
// src/app/admin/forms/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function FormDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const form = await prisma.form.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { responses: true },
      },
    },
  })

  if (!form) {
    notFound()
  }

  return (
    <div>
      <h1>{form.title}</h1>
      {/* Renderizar detalhes */}
    </div>
  )
}
```

### Client Component with Form
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const formSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().optional(),
  type: z.enum(['MEDICOS', 'DISTRIBUIDORES', 'CUSTOM']),
})

export function CreateFormForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data) {
    const response = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    // Handle response
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos do formulário */}
    </form>
  )
}
```

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

### Já Criados
- `IMPLEMENTATION.md` - O que foi implementado
- `START_HERE.md` - Guia inicial completo
- `docs/TROUBLESHOOTING.md` - Erros comuns
- `docs/API.md` - Documentação de API
- `docs/DESIGN_SYSTEM.md` - Cores e componentes
- `NEXT_STEPS.md` - Roadmap de 14 sprints

### Links Úteis
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://next-auth.js.org
- Tailwind: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- React Hook Form: https://react-hook-form.com

---

## 🎯 CHECKLIST RÁPIDO

Antes de começar a desenvolver:

- [ ] Banco configurado (Railway ou local)
- [ ] `.env.local` com DATABASE_URL e NEXTAUTH_SECRET
- [ ] Migrações executadas (`npx prisma migrate dev`)
- [ ] Seed executado (`npm run db:seed`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Login funcionando (admin@sintegra.com.br / admin123)
- [ ] Dashboard aparecendo (pode estar vazio)
- [ ] Página de formulários carregando

---

## 💡 DICAS

1. **Sempre rode Prisma Studio** enquanto desenvolve:
   ```powershell
   npm run db:studio
   ```

2. **Use Server Components** sempre que possível (mais rápido)

3. **Client Components** apenas quando precisar de:
   - Hooks (useState, useEffect)
   - Event handlers (onClick, onChange)
   - Browser APIs

4. **Faça commits frequentes:**
   ```bash
   git add .
   git commit -m "feat: adicionar CRUD de formulários"
   git push
   ```

5. **Teste no mobile** desde o início:
   - Abra DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Teste em iPhone/Android

---

## 🚨 ERROS COMUNS

### "Prisma Client não encontrado"
```powershell
npx prisma generate
```

### "Cannot find module"
```powershell
npm install
```

### "Database connection failed"
- Verifique `.env.local`
- PostgreSQL está rodando?
- Firewall bloqueando?

### "NextAuth error"
- `NEXTAUTH_SECRET` configurado?
- `NEXTAUTH_URL` correto?

---

## 🎉 VOCÊ ESTÁ PRONTO!

**O que você tem:**
- ✅ Sistema base 100% funcional
- ✅ Autenticação completa
- ✅ Dashboard com NPS
- ✅ Listagem de forms
- ✅ Navegação admin
- ✅ Componentes UI prontos
- ✅ Database estruturado

**Próximo arquivo a criar:**
👉 `src/app/admin/forms/new/page.tsx`

**Boa sorte! 🚀**
