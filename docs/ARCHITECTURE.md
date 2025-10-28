# 🏗️ Arquitetura do Sistema - NPS Síntegra

Documentação técnica da arquitetura do sistema.

## 📐 Visão Geral

Sistema **Full-Stack** desenvolvido com Next.js 14, utilizando **App Router**, **Server Components** e **Server Actions** para máxima performance.

```
┌─────────────────────────────────────────────────────────┐
│                      USUÁRIOS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Admin (PC)  │  │Médico(Mobile)│  │ Dist.(Mobile)│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
          ┌──────────────────▼──────────────────┐
          │         VERCEL CDN/EDGE             │
          │      (Next.js App Router)           │
          └──────────────┬──────────────────────┘
                         │
          ┌──────────────▼──────────────────────┐
          │         APLICAÇÃO NEXT.JS            │
          │  ┌────────────────────────────┐     │
          │  │  Frontend (React Server    │     │
          │  │  Components + Client)      │     │
          │  ├────────────────────────────┤     │
          │  │  API Routes (Backend)      │     │
          │  ├────────────────────────────┤     │
          │  │  Server Actions            │     │
          │  └────────────────────────────┘     │
          └──────────────┬──────────────────────┘
                         │
          ┌──────────────▼──────────────────────┐
          │         SERVIÇOS EXTERNOS            │
          │  ┌──────────┐  ┌──────────┐         │
          │  │PostgreSQL│  │ Resend   │         │
          │  │(Supabase)│  │ (Email)  │         │
          │  └──────────┘  └──────────┘         │
          │  ┌──────────┐  ┌──────────┐         │
          │  │Cloudinary│  │NextAuth  │         │
          │  │(Storage) │  │  (Auth)  │         │
          │  └──────────┘  └──────────┘         │
          └─────────────────────────────────────┘
```

---

## 🔀 Fluxo de Dados

### Fluxo 1: Admin Cria Formulário

```
Admin (PC)
    │
    ├─> Dashboard /admin/forms
    │
    ├─> Form Builder (Client Component)
    │   ├─> Adiciona perguntas
    │   ├─> Define lógica condicional
    │   └─> Preview em tempo real
    │
    ├─> Server Action: createForm()
    │   ├─> Valida com Zod
    │   ├─> Prisma.form.create()
    │   └─> Retorna formId
    │
    └─> Redireciona para /admin/forms/[id]
```

### Fluxo 2: Distribuição de Links

```
Admin
    │
    ├─> Seleciona respondentes
    │
    ├─> POST /api/forms/[id]/distribute
    │   ├─> Gera tokens únicos (crypto)
    │   ├─> Cria Response records
    │   └─> Envia emails (Resend)
    │       ├─> Template personalizado
    │       └─> Link: /r/[token]
    │
    └─> Tracking de envios
```

### Fluxo 3: Respondente Preenche

```
Médico/Distribuidor (Mobile)
    │
    ├─> Acessa /r/[token]
    │
    ├─> Server Component valida token
    │   ├─> Verifica expiração
    │   └─> Carrega form + respondent
    │
    ├─> Client Component renderiza
    │   ├─> Uma pergunta por vez (mobile)
    │   ├─> Valida em tempo real
    │   └─> Salva progresso (onBlur)
    │
    ├─> Server Action: saveAnswer()
    │   ├─> Prisma.answer.upsert()
    │   ├─> Aplica lógica condicional
    │   └─> Atualiza progress %
    │
    └─> Tela de agradecimento
        └─> Marca como COMPLETED
```

### Fluxo 4: Analytics e Relatórios

```
Admin
    │
    ├─> Dashboard /admin/analytics
    │
    ├─> Server Component carrega dados
    │   ├─> Calcula NPS
    │   ├─> Agrega ratings
    │   └─> Filtra comentários
    │
    ├─> Client Component renderiza
    │   ├─> Charts (Recharts)
    │   ├─> Filtros interativos
    │   └─> Tabelas de dados
    │
    └─> Gerar Relatório PDF
        ├─> POST /api/reports
        ├─> Background job
        ├─> Upload para Cloudinary
        └─> Notifica quando pronto
```

---

## 🧩 Camadas da Aplicação

### 1. Apresentação (Frontend)

**Tecnologias:**
- Next.js 14 App Router
- React Server Components (RSC)
- Client Components (interatividade)
- shadcn/ui + Tailwind CSS

**Responsabilidades:**
- Renderização de UI
- Validação client-side
- Interatividade (forms, modals)
- Animações e transições

**Estrutura:**
```
src/app/
├── (auth)/          # Rotas públicas (login)
├── (admin)/         # Rotas protegidas (dashboard)
├── r/               # Rotas públicas (respostas)
└── api/             # API Routes
```

### 2. Lógica de Negócio (Backend)

**Tecnologias:**
- Next.js API Routes
- Server Actions
- Prisma ORM

**Responsabilidades:**
- Regras de negócio
- Validação server-side (Zod)
- Cálculo de NPS
- Lógica condicional de formulários

**Estrutura:**
```
src/lib/
├── actions/         # Server Actions
│   ├── forms.ts
│   ├── responses.ts
│   └── analytics.ts
├── services/        # Business logic
│   ├── nps.ts
│   ├── email.ts
│   └── reports.ts
└── validations/     # Zod schemas
```

### 3. Dados (Database)

**Tecnologia:**
- PostgreSQL (Supabase)
- Prisma ORM

**Responsabilidades:**
- Persistência de dados
- Relacionamentos
- Queries otimizadas
- Migrations

### 4. Serviços Externos

**Autenticação:**
- NextAuth.js
- Credentials Provider
- Session management

**Email:**
- Resend API
- Templates personalizados
- Tracking de abertura

**Storage:**
- Cloudinary
- Upload de relatórios PDF
- Compressão automática

---

## 🔐 Segurança

### Autenticação e Autorização

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Protege rotas /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect('/login');
    }
  }
  
  // Valida role
  if (request.nextUrl.pathname.startsWith('/admin/users')) {
    if (token?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect('/admin');
    }
  }
}
```

### Validação de Dados

```typescript
// Todas as entradas são validadas com Zod
import { z } from 'zod';

const createFormSchema = z.object({
  title: z.string().min(3).max(100),
  type: z.enum(['MEDICOS', 'DISTRIBUIDORES', 'CUSTOM']),
  questions: z.array(questionSchema),
});

// Valida antes de processar
const result = createFormSchema.safeParse(data);
if (!result.success) {
  return { error: result.error };
}
```

### Proteção de Links Únicos

```typescript
// Tokens SHA-256 de 64 caracteres
import crypto from 'crypto';

const uniqueToken = crypto.randomBytes(32).toString('hex');

// Validação com rate limiting
const response = await prisma.response.findUnique({
  where: { uniqueToken },
});

if (!response || response.status === 'COMPLETED') {
  return { error: 'Link inválido ou expirado' };
}
```

### LGPD Compliance

- **Consentimento explícito**: Checkbox obrigatório
- **Anonimização**: Opção de resposta anônima
- **Direito ao esquecimento**: Soft delete de dados
- **Exportação de dados**: API para download
- **Logs de auditoria**: Todas as ações administrativas

---

## 📊 Performance

### Server Components (RSC)

```tsx
// Server Component (padrão)
// Renderiza no servidor, zero JS no cliente
export default async function FormsList() {
  const forms = await prisma.form.findMany({
    where: { status: 'PUBLISHED' },
  });
  
  return (
    <div>
      {forms.map(form => (
        <FormCard key={form.id} form={form} />
      ))}
    </div>
  );
}
```

### Streaming e Suspense

```tsx
// Loading states automáticos
export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <FormsList />
    </Suspense>
  );
}
```

### React Query para Cache

```typescript
// Cache de dados do cliente
const { data, isLoading } = useQuery({
  queryKey: ['forms', formId],
  queryFn: () => fetch(`/api/forms/${formId}`).then(r => r.json()),
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

### Imagens Otimizadas

```tsx
// Next.js Image component
import Image from 'next/image';

<Image
  src="/logos/sintegra-logo.svg"
  alt="Síntegra"
  width={120}
  height={120}
  priority // Carrega imediatamente
/>
```

---

## 🔄 Padrões de Código

### Server Actions

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createForm(formData: FormData) {
  // 1. Validação
  const validated = createFormSchema.safeParse({
    title: formData.get('title'),
    type: formData.get('type'),
  });
  
  if (!validated.success) {
    return { error: validated.error };
  }
  
  // 2. Autorização
  const session = await getServerSession();
  if (!session) {
    return { error: 'Não autorizado' };
  }
  
  // 3. Lógica de negócio
  const form = await prisma.form.create({
    data: {
      ...validated.data,
      createdBy: session.user.id,
    },
  });
  
  // 4. Revalidar cache
  revalidatePath('/admin/forms');
  
  return { success: true, formId: form.id };
}
```

### API Routes

```typescript
// app/api/forms/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    
    const forms = await prisma.form.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { questions: true, responses: true },
        },
      },
    });
    
    return NextResponse.json({ forms });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

---

## 📱 Progressive Web App (PWA)

### Service Worker

```javascript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('nps-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/r/[token]',
        '/styles/globals.css',
        '/logos/sintegra-logo.svg',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### Manifest

```json
// public/manifest.json
{
  "name": "Síntegra NPS",
  "short_name": "NPS",
  "description": "Sistema de coleta de NPS",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#4169B1",
  "theme_color": "#4169B1",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Jest)

```typescript
// __tests__/lib/nps.test.ts
describe('calculateNPS', () => {
  it('should calculate NPS correctly', () => {
    const responses = [
      { value: 9 }, // Promotor
      { value: 10 }, // Promotor
      { value: 7 }, // Neutro
      { value: 5 }, // Detrator
    ];
    
    const nps = calculateNPS(responses);
    
    expect(nps).toBe(25); // (50% - 25%) * 100
  });
});
```

### Integration Tests (Playwright)

```typescript
// e2e/forms.spec.ts
test('admin can create a form', async ({ page }) => {
  await page.goto('/admin/forms');
  await page.click('button:has-text("Novo Formulário")');
  
  await page.fill('[name="title"]', 'Teste Form');
  await page.selectOption('[name="type"]', 'MEDICOS');
  
  await page.click('button:has-text("Criar")');
  
  await expect(page).toHaveURL(/\/admin\/forms\/\w+/);
});
```

---

## 📈 Monitoramento

### Logs Estruturados

```typescript
import { logger } from '@/lib/logger';

logger.info('Form created', {
  formId: form.id,
  userId: session.user.id,
  type: form.type,
});

logger.error('Failed to send email', {
  error: error.message,
  recipientId: respondent.id,
});
```

### Métricas

- **Response Time**: p50, p95, p99
- **Error Rate**: % de erros por endpoint
- **NPS Score**: Média e tendência
- **Completion Rate**: % de formulários completados

---

**Arquitetura robusta, escalável e moderna para o Sistema NPS Síntegra**
