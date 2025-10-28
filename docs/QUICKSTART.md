# ⚡ Quick Start - Sistema NPS Síntegra

Guia rápido para começar a desenvolver em **5 minutos**.

## 🚀 Início Rápido

### 1. Clone e Instale (2 min)

```bash
# Clone o repositório
git clone <url-do-repo>
cd NPS/frontend

# Instale dependências
npm install
```

### 2. Configure o Ambiente (1 min)

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Use o Supabase para desenvolvimento rápido
# Crie em: https://supabase.com/dashboard
```

Edite `.env.local`:
```env
DATABASE_URL="postgresql://postgres:[SENHA]@db.[PROJECT].supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="qualquer-string-aqui-para-dev"
```

### 3. Configure o Banco (1 min)

```bash
# Copie o schema do Prisma
cp ../database/schema.prisma ./prisma/schema.prisma

# Execute as migrations
npm run db:migrate
```

### 4. Inicie o Servidor (1 min)

```bash
npm run dev
```

✅ Acesse: **http://localhost:3000**

---

## 📁 Estrutura de Pastas

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (admin)/           # Dashboard admin
│   │   │   ├── forms/         # Gerenciar formulários
│   │   │   ├── respondents/   # Gerenciar respondentes
│   │   │   ├── analytics/     # Analytics e NPS
│   │   │   └── reports/       # Relatórios
│   │   ├── r/                 # Respostas públicas
│   │   │   └── [token]/       # Página de resposta
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── forms/
│   │   │   ├── responses/
│   │   │   └── analytics/
│   │   └── layout.tsx
│   │
│   ├── components/            # Componentes React
│   │   ├── ui/               # shadcn/ui components
│   │   ├── forms/            # Form builder
│   │   ├── analytics/        # Gráficos e dashboards
│   │   └── shared/           # Componentes compartilhados
│   │
│   ├── lib/                  # Utilities
│   │   ├── prisma.ts         # Prisma client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── validations.ts    # Zod schemas
│   │   └── utils.ts          # Helpers
│   │
│   ├── hooks/                # Custom hooks
│   ├── types/                # TypeScript types
│   └── styles/               # Global CSS
│
├── public/                   # Assets estáticos
├── prisma/                   # Prisma schema
└── package.json
```

---

## 🎯 Primeiros Passos

### 1. Criar um Admin

```bash
# Via Prisma Studio
npm run db:studio

# Ou via API
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sintegra.com.br",
    "name": "Admin",
    "password": "senha123",
    "role": "ADMIN"
  }'
```

### 2. Fazer Login

Acesse: http://localhost:3000/login

```
Email: admin@sintegra.com.br
Senha: senha123
```

### 3. Criar Primeiro Formulário

1. Dashboard > **Formulários** > **Novo**
2. Escolha template: **Médicos** ou **Distribuidores**
3. Clique em **Publicar**

### 4. Testar Resposta

1. Dashboard > **Formulários** > **Distribuir**
2. Copie o link único gerado
3. Abra em modo anônimo/mobile
4. Responda o formulário

### 5. Ver Analytics

Dashboard > **Analytics** > Veja o NPS calculado!

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev
npm run build            # Build para produção
npm run start            # Inicia em produção

# Banco de Dados
npm run db:generate      # Gera Prisma Client
npm run db:push          # Push schema (dev)
npm run db:migrate       # Cria migration
npm run db:studio        # Abre Prisma Studio

# Qualidade
npm run lint             # ESLint
npm run type-check       # TypeScript check
```

---

## 📦 Templates Prontos

### Template: Formulário para Médicos

```typescript
const formMedicos = {
  title: "Pesquisa de Satisfação - Médicos",
  type: "MEDICOS",
  questions: [
    {
      text: "Como você avalia a qualidade dos produtos?",
      type: "RATING_1_5",
      required: true,
    },
    {
      text: "Comparado aos concorrentes:",
      type: "COMPARISON",
      options: ["Melhor", "Igual", "Pior"],
    },
    {
      text: "Comentários (obrigatório se avaliação ≤ 3):",
      type: "TEXT_LONG",
      conditionalLogic: {
        makeRequired: {
          dependsOn: "previous_question",
          condition: "<=",
          value: 3,
        },
      },
    },
  ],
};
```

### Template: Formulário para Distribuidores

```typescript
const formDistribuidores = {
  title: "Pesquisa de Satisfação - Distribuidores",
  type: "DISTRIBUIDORES",
  questions: [
    {
      text: "Qualidade dos produtos médicos fornecidos:",
      type: "RATING_1_5",
    },
    {
      text: "Suporte em educação médica:",
      type: "RATING_1_5",
    },
    {
      text: "Cumprimento de prazos:",
      type: "RATING_1_5",
    },
    {
      text: "Devolutiva sobre reclamações:",
      type: "RATING_1_5",
    },
  ],
};
```

---

## 🎨 Componentes Principais

### Rating Scale (1-5)

```tsx
import { RatingScale } from '@/components/forms/RatingScale';

<RatingScale
  value={rating}
  onChange={setRating}
  min={1}
  max={5}
  labels={{
    1: 'Péssima',
    5: 'Excelente',
  }}
/>
```

### NPS Display

```tsx
import { NPSScore } from '@/components/analytics/NPSScore';

<NPSScore
  score={52}
  breakdown={{
    promoters: 28,
    passives: 12,
    detractors: 5,
  }}
/>
```

### Chart de Distribuição

```tsx
import { NPSChart } from '@/components/analytics/NPSChart';

<NPSChart
  data={responses}
  type="distribution"
/>
```

---

## 🔧 Troubleshooting Rápido

### ❌ Erro: "Cannot find module '@prisma/client'"

```bash
npm run db:generate
```

### ❌ Erro: "Database connection failed"

Verifique `.env.local`:
- `DATABASE_URL` está correta?
- Banco de dados está rodando?

### ❌ Erro: "NEXTAUTH_SECRET not set"

Adicione no `.env.local`:
```env
NEXTAUTH_SECRET="qualquer-string-para-dev"
```

### ❌ Página em branco

Verifique o console do navegador (F12).
Provavelmente faltou importar CSS:

```tsx
// src/app/layout.tsx
import '@/styles/globals.css'
```

---

## 📚 Próximos Passos

1. **Leia a documentação completa**: `/docs/`
2. **Explore os componentes**: `shadcn/ui` components
3. **Configure email**: Resend para envio de links
4. **Customize o design**: Cores da Síntegra em `tailwind.config.ts`
5. **Deploy**: Siga o guia em `DEPLOYMENT.md`

---

## 🆘 Ajuda

- **Documentação**: Veja `/docs/`
- **Issues**: GitHub Issues
- **API**: Leia `docs/API.md`

---

**Pronto para começar! 🚀**

Agora você tem tudo configurado para desenvolver o sistema NPS da Síntegra.
