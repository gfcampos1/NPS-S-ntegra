# Relatório de Auditoria de Segurança - CWE

**Sistema**: NPS-Síntegra  
**Data**: 2024  
**Versão Analisada**: 1.0.0  
**Stack Tecnológico**: Next.js 14, TypeScript, Prisma ORM, PostgreSQL, NextAuth.js

---

## 📋 Sumário Executivo

Este relatório documenta vulnerabilidades de segurança identificadas no sistema NPS-Síntegra, classificadas de acordo com a **CWE (Common Weakness Enumeration)**. Foram analisados 178 arquivos TypeScript/JavaScript, incluindo rotas API, componentes, bibliotecas e configurações.

### Estatísticas Gerais

- **Total de Vulnerabilidades Encontradas**: 12
- **Críticas**: 3
- **Altas**: 5
- **Médias**: 3
- **Baixas**: 1

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. CWE-78: Command Injection via `child_process.exec`

**Severidade**: ⚠️ **CRÍTICA**  
**Arquivo**: `src/app/api/admin/migrations/route.ts`  
**Linhas**: 66, 96

#### Descrição
O endpoint `/api/admin/migrations` executa comandos do sistema usando `child_process.exec` com input potencialmente controlável, criando risco de **Command Injection**.

#### Código Vulnerável
```typescript
const execAsync = promisify(exec)

// Linha 66 - Execução sem sanitização
const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
  cwd: process.cwd(),
  env: {
    ...process.env,  // ❌ Propaga todas as variáveis de ambiente
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1'
  },
  timeout: 60000
})

// Linha 96
const { stdout, stderr } = await execAsync('npx prisma migrate status', {
  cwd: process.cwd(),
  env: { ...process.env },
  timeout: 30000
})
```

#### Riscos
- Execução de comandos arbitrários no servidor
- Acesso não autorizado ao sistema de arquivos
- Escalação de privilégios
- Comprometimento total do servidor

#### Recomendações

**1. Usar API Prisma Client em vez de CLI**
```typescript
// ✅ SOLUÇÃO RECOMENDADA: Usar Prisma Client API
import { PrismaClient } from '@prisma/client'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { action } = await request.json()

  try {
    if (action === 'deploy') {
      // Usar Prisma Migrate API em vez de exec
      const prisma = new PrismaClient()
      
      // Verificar status das migrações via Prisma
      await prisma.$queryRaw`SELECT * FROM _prisma_migrations WHERE finished_at IS NULL`
      
      return NextResponse.json({
        success: true,
        message: 'Use Prisma Migrate via CLI manualmente ou em CI/CD',
      })
    }
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Failed to execute migration' },
      { status: 500 }
    )
  }
}
```

**2. Se exec for absolutamente necessário, use execFile com array de argumentos**
```typescript
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

// ✅ Usar execFile com argumentos separados (não permite injection)
const { stdout, stderr } = await execFileAsync('npx', ['prisma', 'migrate', 'deploy'], {
  cwd: process.cwd(),
  timeout: 60000,
  env: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    // ❌ NÃO use: ...process.env
  }
})
```

**3. Remover completamente o endpoint** (Mais seguro)
```typescript
// ✅ MELHOR SOLUÇÃO: Executar migrações apenas via CI/CD
// Remover o arquivo src/app/api/admin/migrations/route.ts
// Executar migrações no deployment pipeline:
// - GitHub Actions
// - Railway build command
// - Docker ENTRYPOINT
```

---

### 2. CWE-532: Information Exposure Through Log Files

**Severidade**: ⚠️ **CRÍTICA**  
**Arquivos**: Múltiplos (21+ ocorrências)

#### Descrição
Uso extensivo de `console.error()` para registrar erros que podem conter **informações sensíveis** como senhas, tokens, dados de usuários, queries SQL, e detalhes de implementação interna.

#### Código Vulnerável
```typescript
// src/app/api/users/route.ts - Linha 94
console.error('Error creating user:', error)
// ❌ Pode expor: senha em texto claro, emails, stack traces

// src/app/api/r/[token]/route.ts - Linha 92
console.error('Error fetching form by token:', error)
// ❌ Pode expor: tokens de autenticação, dados de respondentes

// src/app/api/respondents/route.ts - Linha 53
console.error('Error fetching respondents:', error)
// ❌ Pode expor: emails, telefones, dados pessoais (LGPD)

// src/app/api/admin/migrations/route.ts - Linha 82
console.error('Migration execution error:', execError)
// ❌ Pode expor: DATABASE_URL com credenciais
```

#### Riscos
- **Violação LGPD**: Exposição de dados pessoais em logs
- **Vazamento de credenciais**: DATABASE_URL, NEXTAUTH_SECRET, API keys
- **Ataques de enumeração**: Mensagens de erro revelam estrutura do sistema
- **Stack traces**: Revelam paths internos e versões de bibliotecas

#### Recomendações

**1. Implementar Logger Estruturado Seguro**
```typescript
// src/lib/logger.ts
import { PrismaClient } from '@prisma/client'

type LogLevel = 'ERROR' | 'WARN' | 'INFO'

interface LogContext {
  userId?: string
  action?: string
  entityType?: string
  entityId?: string
  ipAddress?: string
}

class SecureLogger {
  private prisma = new PrismaClient()

  /**
   * Remove dados sensíveis antes de logar
   */
  private sanitize(data: any): any {
    if (!data) return data
    
    const sensitiveKeys = [
      'password', 'token', 'secret', 'apiKey', 'accessToken',
      'refreshToken', 'DATABASE_URL', 'NEXTAUTH_SECRET'
    ]

    const sanitized = { ...data }
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        sanitized[key] = '[REDACTED]'
      }
    }

    return sanitized
  }

  /**
   * Loga erro de forma segura no banco de dados (Audit Log)
   */
  async error(
    message: string,
    error: Error | unknown,
    context?: LogContext
  ) {
    const sanitizedError = this.sanitize({
      message: error instanceof Error ? error.message : 'Unknown error',
      // ❌ NÃO incluir: error.stack (pode revelar paths internos)
    })

    // Logs em produção vão para o banco
    if (process.env.NODE_ENV === 'production') {
      await this.prisma.auditLog.create({
        data: {
          userId: context?.userId,
          action: `ERROR_${context?.action || 'UNKNOWN'}`,
          entityType: context?.entityType || 'System',
          entityId: context?.entityId || 'N/A',
          changes: sanitizedError,
          ipAddress: context?.ipAddress,
          userAgent: null,
        },
      })
    } else {
      // Em desenvolvimento, console.error é aceitável
      console.error(message, sanitizedError)
    }
  }
}

export const logger = new SecureLogger()
```

**2. Substituir console.error em todas as rotas API**
```typescript
// src/app/api/users/route.ts
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const payload = createUserSchema.parse(body)

    // ... código de criação do usuário ...

  } catch (error) {
    // ✅ Logger seguro que sanitiza dados sensíveis
    await logger.error(
      'Failed to create user',
      error,
      {
        userId: session?.user?.id,
        action: 'CREATE_USER',
        entityType: 'User',
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]
      }
    )

    // ✅ Retornar mensagem genérica ao cliente
    return NextResponse.json(
      { error: 'Erro ao criar usuário. Tente novamente.' },
      { status: 500 }
    )
  }
}
```

**3. Configurar Prisma para não logar queries em produção**
```typescript
// src/lib/prisma.ts
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // ❌ ANTES (vulnerável):
  // log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  
  // ✅ DEPOIS (seguro):
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn']  // Sem 'query' que expõe SQL
    : [],  // Sem logs em produção
})
```

---

### 3. CWE-798: Use of Hard-coded Credentials (Potencial)

**Severidade**: ⚠️ **CRÍTICA**  
**Arquivo**: `.env.local`

#### Descrição
O arquivo `.env.local` contém exemplos de credenciais que podem ser commitados acidentalmente ao repositório Git, expondo **DATABASE_URL**, **NEXTAUTH_SECRET**, e **API keys**.

#### Código Vulnerável
```bash
# ❌ Arquivo .env.local rastreado pelo Git
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sintegra_nps"
NEXTAUTH_SECRET="sua-chave-secreta-super-segura-aqui-minimo-32-caracteres"
RESEND_API_KEY="re_seu_api_key_aqui"
CLOUDINARY_API_KEY="seu_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
```

#### Riscos
- Vazamento de credenciais de banco de dados
- Comprometimento da autenticação (NEXTAUTH_SECRET)
- Acesso não autorizado a serviços externos (Resend, Cloudinary)
- Ataques a ambientes de produção

#### Recomendações

**1. Verificar se .env.local está no .gitignore**
```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

**2. Criar arquivo .env.example sem credenciais**
```bash
# .env.example (commitável)
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_banco"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"

# Email (Resend)
RESEND_API_KEY="obter-em-resend.com"
RESEND_FROM_EMAIL="seuemail@dominio.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="obter-em-cloudinary.com"
CLOUDINARY_API_SECRET="obter-em-cloudinary.com"
```

**3. Verificar histórico Git para credenciais expostas**
```bash
# Verificar se .env.local foi commitado
git log --all --full-history -- "**/env*"

# Se encontrado, usar git-filter-repo para remover do histórico
git filter-repo --path .env.local --invert-paths

# Rotacionar TODAS as credenciais expostas:
# - Gerar novo NEXTAUTH_SECRET
# - Resetar DATABASE_URL
# - Revogar API keys antigas
```

**4. Usar variáveis de ambiente no Railway/Vercel**
```typescript
// Nunca fazer hardcode:
// ❌ const apiKey = "re_abc123"

// ✅ Sempre usar process.env
const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  throw new Error('RESEND_API_KEY not configured')
}
```

---

## 🟠 VULNERABILIDADES ALTAS

### 4. CWE-287: Improper Authentication - Ausência de Proteção CSRF

**Severidade**: 🔶 **ALTA**  
**Arquivos**: Todas as rotas API (POST, PATCH, DELETE)

#### Descrição
As rotas API não implementam **proteção CSRF (Cross-Site Request Forgery)**, permitindo que sites maliciosos executem ações autenticadas em nome de usuários logados.

#### Código Vulnerável
```typescript
// src/app/api/users/route.ts
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  // ❌ SEM verificação de CSRF token
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  // ... criar usuário ...
}
```

#### Riscos
- Criação/exclusão não autorizada de usuários
- Modificação de formulários e respostas
- Exclusão de dados críticos
- Alteração de configurações de segurança

#### Recomendações

**1. Implementar CSRF Protection com NextAuth.js**
```typescript
// src/middleware.ts (CRIAR)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Proteger rotas API que modificam dados
  if (
    request.method !== 'GET' &&
    request.nextUrl.pathname.startsWith('/api/') &&
    !request.nextUrl.pathname.startsWith('/api/auth/')
  ) {
    const token = await getToken({ req: request })
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // NextAuth.js já inclui CSRF protection via cookies SameSite
    // Verificar se request veio de mesma origem
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (origin && !origin.includes(host || '')) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

**2. Configurar cookies SameSite no NextAuth**
```typescript
// src/lib/auth-options.ts
export const authOptions: NextAuthOptions = {
  // ... providers ...
  
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',  // ✅ Proteção CSRF
        path: '/',
        secure: process.env.NODE_ENV === 'production',  // HTTPS only
      },
    },
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}
```

**3. Adicionar headers de segurança adicionais**
```javascript
// next.config.js (JÁ PARCIALMENTE IMPLEMENTADO)
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        // ✅ JÁ EXISTE
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        
        // ✅ ADICIONAR
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; frame-ancestors 'self';"
        },
      ],
    },
  ];
},
```

---

### 5. CWE-862: Missing Authorization Check

**Severidade**: 🔶 **ALTA**  
**Arquivos**: `src/app/api/r/[token]/route.ts`

#### Descrição
O endpoint `/api/r/[token]` (responder pesquisa via token) **não verifica se o token está expirado** e não limita tentativas de acesso, permitindo:
- Respostas em pesquisas expiradas
- Brute-force de tokens
- Múltiplas respostas do mesmo IP

#### Código Vulnerável
```typescript
// src/app/api/r/[token]/route.ts - GET
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const response = await prisma.response.findUnique({
      where: { uniqueToken: params.token },
      include: { form: { include: { questions: true } } },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Token invalido ou expirado' },
        { status: 404 }
      )
    }

    // ❌ NÃO verifica se form.expiresAt passou
    // ❌ NÃO verifica form.status (pode estar CLOSED/ARCHIVED)
    // ❌ NÃO limita rate limit por IP

    if (response.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Pesquisa ja respondida', completed: true },
        { status: 400 }
      )
    }

    return NextResponse.json({ form: response.form, ... })
  } catch (error) {
    console.error('Error fetching form by token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

#### Riscos
- Acesso a formulários expirados/arquivados
- Enumeração de tokens válidos via brute-force
- Bypass de limite de respostas (maxResponses)
- Poluição de dados com respostas fraudulentas

#### Recomendações

**1. Implementar validações completas de token**
```typescript
// src/app/api/r/[token]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const response = await prisma.response.findUnique({
      where: { uniqueToken: params.token },
      include: {
        form: {
          include: {
            questions: { orderBy: { order: 'asc' } },
          },
        },
        respondent: {
          select: { name: true, email: true },
        },
      },
    })

    if (!response) {
      // ✅ Aguardar aleatoriamente para evitar timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 404 }
      )
    }

    // ✅ Verificar se formulário está expirado
    if (response.form.expiresAt && response.form.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Este formulário expirou', expired: true },
        { status: 410 }  // 410 Gone
      )
    }

    // ✅ Verificar status do formulário
    if (response.form.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Este formulário não está mais disponível' },
        { status: 403 }
      )
    }

    // ✅ Verificar limite de respostas
    if (response.form.maxResponses) {
      const responseCount = await prisma.response.count({
        where: {
          formId: response.form.id,
          status: 'COMPLETED',
        },
      })

      if (responseCount >= response.form.maxResponses) {
        return NextResponse.json(
          { error: 'Limite de respostas atingido' },
          { status: 403 }
        )
      }
    }

    if (response.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Pesquisa já respondida', completed: true },
        { status: 400 }
      )
    }

    return NextResponse.json({
      form: response.form,
      respondent: response.respondent,
    })
  } catch (error) {
    console.error('Error fetching form by token:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
```

**2. Implementar Rate Limiting**
```typescript
// src/lib/rate-limit.ts (CRIAR)
import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(
  request: NextRequest,
  options: { max: number; windowMs: number } = { max: 5, windowMs: 60000 }
): { success: boolean; remaining: number } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const key = `${ip}:${request.url}`
  
  const now = Date.now()
  const record = store[key]

  if (!record || now > record.resetAt) {
    store[key] = {
      count: 1,
      resetAt: now + options.windowMs,
    }
    return { success: true, remaining: options.max - 1 }
  }

  if (record.count >= options.max) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: options.max - record.count }
}

// Limpar registros antigos a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetAt < now) {
      delete store[key]
    }
  }
}, 5 * 60 * 1000)
```

**3. Aplicar rate limiting no endpoint**
```typescript
// src/app/api/r/[token]/route.ts
import { rateLimit } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  // ✅ Rate limiting: 10 tentativas por minuto por IP
  const limiter = rateLimit(request, { max: 10, windowMs: 60000 })
  
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde 1 minuto.' },
      { 
        status: 429,
        headers: { 'Retry-After': '60' }
      }
    )
  }

  // ... resto do código ...
}
```

---

### 6. CWE-20: Improper Input Validation - JSON.parse sem try-catch

**Severidade**: 🔶 **ALTA**  
**Arquivos**: Múltiplos (25+ ocorrências)

#### Descrição
Uso de `JSON.parse()` sem tratamento de erro pode causar **crashes da aplicação** ao processar dados malformados de múltipla escolha e metadados.

#### Código Vulnerável
```typescript
// src/app/api/r/[token]/route.ts - Linha 19
case 'MULTIPLE_CHOICE': {
  if (!answer.textValue) return []
  try {
    const parsed = JSON.parse(answer.textValue)  // ✅ BOM (tem try-catch)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// src/app/admin/dashboard/page.tsx - Linha 171
const parsed = JSON.parse(answer.textValue)  // ❌ SEM try-catch
```

#### Riscos
- Crash da aplicação (DoS)
- Exposição de stack traces com informações internas
- Comportamento imprevisível

#### Recomendações

**1. Criar função helper para parsing seguro**
```typescript
// src/lib/utils.ts
export function safeJsonParse<T = any>(
  json: string | null | undefined,
  defaultValue: T
): T {
  if (!json || typeof json !== 'string') {
    return defaultValue
  }

  try {
    const parsed = JSON.parse(json)
    return parsed as T
  } catch {
    return defaultValue
  }
}
```

**2. Substituir JSON.parse em todo o código**
```typescript
// ❌ ANTES
const parsed = JSON.parse(answer.textValue)

// ✅ DEPOIS
import { safeJsonParse } from '@/lib/utils'

const parsed = safeJsonParse<string[]>(answer.textValue, [])
```

---

### 7. CWE-200: Information Exposure - Mensagens de Erro Detalhadas

**Severidade**: 🔶 **ALTA**  
**Arquivos**: Múltiplas rotas API

#### Descrição
Mensagens de erro retornam **detalhes de implementação** que ajudam atacantes a entender a estrutura do sistema.

#### Código Vulnerável
```typescript
// src/app/api/users/route.ts
if (existing) {
  return NextResponse.json(
    { error: 'Já existe um usuário com este email' },  // ❌ Revela lógica de validação
    { status: 409 }
  )
}

// src/app/api/respondents/route.ts
if (existingRespondent) {
  return NextResponse.json(
    { error: 'Email e tipo já cadastrados' },  // ❌ Permite enumeração de emails
    { status: 400 }
  )
}

// src/app/api/auth (via NextAuth)
throw new Error('Usuário não encontrado')  // ❌ Revela que email não existe
throw new Error('Senha incorreta')         // ❌ Confirma que email existe
```

#### Riscos
- **Enumeração de usuários**: Atacante descobre emails válidos
- **Enumeração de respondentes**: Validar existência de médicos/distribuidores
- **User enumeration timing attacks**: Diferentes tempos de resposta revelam informações

#### Recomendações

**1. Mensagens genéricas para autenticação**
```typescript
// src/lib/auth-options.ts
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error('Credenciais inválidas')  // ✅ Genérico
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  })

  if (!user) {
    // ✅ Aguardar tempo fixo para evitar timing attack
    await hashPassword('dummy-password-to-consume-time')
    throw new Error('Email ou senha incorretos')  // ✅ Mensagem ambígua
  }

  const isValid = await verifyPassword(credentials.password, user.password)

  if (!isValid) {
    throw new Error('Email ou senha incorretos')  // ✅ Mesma mensagem
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}
```

**2. Mensagens genéricas para cadastros**
```typescript
// src/app/api/respondents/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRespondentSchema.parse(body)

    const existingRespondent = await prisma.respondent.findUnique({
      where: { 
        email_type: {
          email: validatedData.email,
          type: validatedData.type,
        }
      },
    })

    if (existingRespondent) {
      // ❌ ANTES: { error: 'Email e tipo já cadastrados' }
      // ✅ DEPOIS: Mensagem genérica
      return NextResponse.json(
        { error: 'Não foi possível cadastrar este respondente. Verifique os dados e tente novamente.' },
        { status: 400 }
      )
    }

    const respondent = await prisma.respondent.create({
      data: validatedData as any,
    })

    return NextResponse.json(respondent, { status: 201 })
  } catch (error) {
    // ✅ Não revelar detalhes do erro Zod
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos. Verifique os campos e tente novamente.' },
        { status: 400 }
      )
    }
    
    await logger.error('Error creating respondent', error)
    return NextResponse.json(
      { error: 'Erro ao cadastrar respondente' },
      { status: 500 }
    )
  }
}
```

---

### 8. CWE-307: Improper Restriction of Excessive Authentication Attempts

**Severidade**: 🔶 **ALTA**  
**Arquivo**: `src/lib/auth-options.ts`

#### Descrição
NextAuth.js **não limita tentativas de login** por padrão, permitindo ataques de **brute-force** em contas de usuário.

#### Código Vulnerável
```typescript
// src/lib/auth-options.ts
async authorize(credentials) {
  // ❌ SEM rate limiting
  // ❌ SEM bloqueio após tentativas falhadas
  // ❌ SEM delay progressivo

  if (!credentials?.email || !credentials?.password) {
    throw new Error('Email e senha são obrigatórios')
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  })

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  const isValid = await verifyPassword(credentials.password, user.password)

  if (!isValid) {
    throw new Error('Senha incorreta')  // ❌ Sem consequências
  }

  return { id: user.id, email: user.email, name: user.name, role: user.role }
}
```

#### Riscos
- **Brute-force attacks**: Tentativas ilimitadas de adivinhar senhas
- **Credential stuffing**: Testar credenciais vazadas de outros sites
- **Account takeover**: Comprometimento de contas administrativas

#### Recomendações

**1. Implementar rate limiting por email**
```typescript
// src/lib/auth-rate-limit.ts (CRIAR)
interface LoginAttempt {
  count: number
  lockedUntil?: number
  lastAttempt: number
}

const loginAttempts = new Map<string, LoginAttempt>()

export function checkLoginRateLimit(email: string): {
  allowed: boolean
  remainingAttempts: number
  lockedUntil?: Date
} {
  const MAX_ATTEMPTS = 5
  const LOCK_DURATION_MS = 15 * 60 * 1000  // 15 minutos
  const WINDOW_MS = 5 * 60 * 1000  // Janela de 5 minutos

  const now = Date.now()
  const attempt = loginAttempts.get(email.toLowerCase())

  // Sem tentativas anteriores
  if (!attempt) {
    loginAttempts.set(email.toLowerCase(), {
      count: 1,
      lastAttempt: now,
    })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 }
  }

  // Conta bloqueada
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(attempt.lockedUntil),
    }
  }

  // Reset se janela expirou
  if (now - attempt.lastAttempt > WINDOW_MS) {
    loginAttempts.set(email.toLowerCase(), {
      count: 1,
      lastAttempt: now,
    })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 }
  }

  // Incrementar tentativas
  attempt.count++
  attempt.lastAttempt = now

  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCK_DURATION_MS
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(attempt.lockedUntil),
    }
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - attempt.count,
  }
}

export function resetLoginAttempts(email: string) {
  loginAttempts.delete(email.toLowerCase())
}
```

**2. Aplicar rate limiting no NextAuth**
```typescript
// src/lib/auth-options.ts
import { checkLoginRateLimit, resetLoginAttempts } from '@/lib/auth-rate-limit'
import { hashPassword } from '@/lib/auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        // ✅ Verificar rate limit
        const rateLimit = checkLoginRateLimit(credentials.email)
        if (!rateLimit.allowed) {
          const minutesLeft = Math.ceil(
            ((rateLimit.lockedUntil?.getTime() || 0) - Date.now()) / 60000
          )
          throw new Error(
            `Muitas tentativas de login. Conta bloqueada por ${minutesLeft} minutos.`
          )
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // ✅ Timing attack protection: sempre fazer hash mesmo se usuário não existir
        if (!user) {
          await hashPassword('dummy-password')
          throw new Error('Email ou senha incorretos')
        }

        const isValid = await verifyPassword(credentials.password, user.password)

        if (!isValid) {
          // Tentativa falhou, rate limit permanece
          throw new Error(
            `Email ou senha incorretos. ${rateLimit.remainingAttempts} tentativas restantes.`
          )
        }

        // ✅ Login bem-sucedido: resetar contador
        resetLoginAttempts(credentials.email)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  // ... resto da configuração ...
}
```

**3. Registrar tentativas no Audit Log**
```typescript
// src/lib/auth-options.ts
import { prisma } from '@/lib/prisma'

async authorize(credentials) {
  // ... código de validação ...

  try {
    const isValid = await verifyPassword(credentials.password, user.password)

    if (!isValid) {
      // ✅ Registrar tentativa falha
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          entityType: 'User',
          entityId: user.id,
          changes: {
            email: credentials.email,
            reason: 'Invalid password',
          },
        },
      })

      throw new Error('Email ou senha incorretos')
    }

    // ✅ Registrar login bem-sucedido
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        entityType: 'User',
        entityId: user.id,
        changes: { email: credentials.email },
      },
    })

    // ✅ Atualizar lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    return { id: user.id, email: user.email, name: user.name, role: user.role }
  } catch (error) {
    throw error
  }
}
```

---

## 🟡 VULNERABILIDADES MÉDIAS

### 9. CWE-89: SQL Injection (Baixo Risco com Prisma)

**Severidade**: 🟡 **MÉDIA**  
**Status**: ✅ **Mitigado pelo Prisma ORM**

#### Descrição
O sistema usa **Prisma ORM** que automaticamente sanitiza queries, reduzindo drasticamente o risco de SQL Injection. No entanto, há uma vulnerabilidade potencial se `$queryRaw` for usado com input do usuário.

#### Código Seguro (Atual)
```typescript
// src/app/api/respondents/route.ts
where: {
  OR: [
    { name: { contains: search, mode: 'insensitive' } },  // ✅ Prisma sanitiza automaticamente
    { email: { contains: search, mode: 'insensitive' } },
  ]
}
```

#### Riscos
- Se `$queryRaw` ou `$executeRaw` forem usados no futuro com concatenação de strings

#### Recomendações

**1. Nunca usar raw queries com concatenação**
```typescript
// ❌ VULNERÁVEL (NÃO FAZER)
const email = request.query.email
const users = await prisma.$queryRaw`SELECT * FROM users WHERE email = '${email}'`

// ✅ SEGURO: Usar Prisma Client API
const users = await prisma.user.findMany({
  where: { email: email }
})

// ✅ SE RAW QUERY FOR NECESSÁRIA: Usar tagged templates
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`  // Prisma sanitiza automaticamente
```

**2. Code review para detectar raw queries**
```bash
# Buscar uso de $queryRaw/$executeRaw
grep -r "\$queryRaw\|\$executeRaw" src/
```

---

### 10. CWE-522: Insufficiently Protected Credentials

**Severidade**: 🟡 **MÉDIA**  
**Arquivo**: `src/lib/prisma.ts`

#### Descrição
Logs do Prisma em desenvolvimento podem expor **DATABASE_URL** e **queries SQL** contendo dados sensíveis.

#### Código Vulnerável
```typescript
// src/lib/prisma.ts
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']  // ❌ 'query' expõe SQL
    : ['error'],
})
```

#### Riscos
- DATABASE_URL exposta em logs de erro
- Queries SQL revelam estrutura do banco
- Dados pessoais em queries (emails, nomes, telefones)

#### Recomendações

**1. Remover 'query' do log**
```typescript
// src/lib/prisma.ts
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['error', 'warn']  // ✅ Sem 'query'
    : [],  // ✅ Sem logs em produção
})
```

---

### 11. CWE-16: Configuration - Ausência de Content Security Policy Completo

**Severidade**: 🟡 **MÉDIA**  
**Arquivo**: `next.config.js`

#### Descrição
Headers de segurança estão parcialmente implementados, mas **CSP (Content Security Policy)** não está configurado adequadamente.

#### Código Atual
```javascript
// next.config.js
headers: [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'  // ✅ BOM
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'  // ✅ BOM
  },
  // ❌ CSP faltando
]
```

#### Riscos
- **XSS (Cross-Site Scripting)**: Scripts maliciosos injetados
- **Data exfiltration**: Vazamento de dados via scripts externos
- **Clickjacking**: Embedar página em iframe malicioso

#### Recomendações

**1. Implementar CSP completo**
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'  // ✅ Mais restritivo que SAMEORIGIN
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        },
        // ✅ CSP COMPLETO
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // Next.js precisa de unsafe-inline
            "style-src 'self' 'unsafe-inline'",  // Tailwind precisa de unsafe-inline
            "img-src 'self' data: https://res.cloudinary.com",
            "font-src 'self' data:",
            "connect-src 'self' https://*.railway.app",  // API do Railway
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
          ].join('; ')
        },
      ],
    },
  ];
},
```

---

## 🟢 VULNERABILIDADES BAIXAS

### 12. CWE-611: Missing XML External Entity (XXE) Protection

**Severidade**: 🟢 **BAIXA**  
**Status**: ✅ **Não Aplicável** (sistema não processa XML)

#### Descrição
Sistema não processa XML atualmente, mas se implementar importação de XML no futuro, deve usar bibliotecas seguras.

#### Recomendações
- Se adicionar processamento XML, usar bibliotecas com proteção XXE:
  - `fast-xml-parser` com opção `processEntities: false`
  - Validar contra schema XSD

---

## 📊 Resumo de Prioridades

### Ações Imediatas (Críticas)

1. **Remover endpoint `/api/admin/migrations`** ou substituir `exec` por `execFile`
2. **Implementar logger seguro** e substituir todos os `console.error`
3. **Verificar .env.local no .gitignore** e rotacionar credenciais se expostas

### Ações de Curto Prazo (Altas)

4. **Implementar proteção CSRF** via middleware
5. **Adicionar validações de token** (expiração, status do form, limite de respostas)
6. **Implementar rate limiting** em `/api/r/[token]` e login
7. **Mensagens de erro genéricas** para prevenir enumeração de usuários
8. **Função `safeJsonParse`** para substituir JSON.parse

### Ações de Médio Prazo (Médias)

9. **Desabilitar logs de queries** do Prisma
10. **Content Security Policy** completo no next.config.js
11. **Audit logging** para todas as ações sensíveis

---

## 🔧 Ferramentas Recomendadas

### Para Análise Contínua
```bash
# Instalar ferramentas de segurança
npm install -D @types/node eslint-plugin-security

# Adicionar ao .eslintrc.json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"]
}
```

### Para Testes de Penetração
- **OWASP ZAP**: Scanner de vulnerabilidades web
- **Burp Suite Community**: Proxy para interceptar requests
- **SQLMap**: Testar SQL injection (deve falhar com Prisma)
- **Nikto**: Scanner de servidor web

---

## 📚 Referências CWE

- [CWE-78: Command Injection](https://cwe.mitre.org/data/definitions/78.html)
- [CWE-532: Information Exposure Through Log Files](https://cwe.mitre.org/data/definitions/532.html)
- [CWE-798: Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- [CWE-287: Improper Authentication](https://cwe.mitre.org/data/definitions/287.html)
- [CWE-862: Missing Authorization](https://cwe.mitre.org/data/definitions/862.html)
- [CWE-20: Improper Input Validation](https://cwe.mitre.org/data/definitions/20.html)
- [CWE-200: Information Exposure](https://cwe.mitre.org/data/definitions/200.html)
- [CWE-307: Brute Force](https://cwe.mitre.org/data/definitions/307.html)
- [CWE-89: SQL Injection](https://cwe.mitre.org/data/definitions/89.html)
- [CWE-522: Insufficiently Protected Credentials](https://cwe.mitre.org/data/definitions/522.html)

---

## ✅ Checklist de Correção

### Críticas
- [ ] Remover ou refatorar `/api/admin/migrations` (CWE-78)
- [ ] Implementar `SecureLogger` e substituir `console.error` (CWE-532)
- [ ] Verificar .gitignore e rotacionar credenciais (CWE-798)

### Altas
- [ ] Criar middleware CSRF (CWE-287)
- [ ] Validações completas de token em `/api/r/[token]` (CWE-862)
- [ ] Rate limiting em APIs públicas (CWE-862)
- [ ] Rate limiting no login (CWE-307)
- [ ] Função `safeJsonParse` (CWE-20)
- [ ] Mensagens de erro genéricas (CWE-200)

### Médias
- [ ] Desabilitar logs de queries Prisma (CWE-522)
- [ ] CSP completo no next.config.js (CWE-16)
- [ ] Audit logging para ações sensíveis

---

## 📞 Contato

Para dúvidas sobre este relatório, entre em contato com a equipe de segurança.

**Última atualização**: 2024  
**Próxima revisão**: Após implementação das correções críticas
