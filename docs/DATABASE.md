# 📋 Documentação do Banco de Dados

## Visão Geral

Sistema de banco de dados PostgreSQL gerenciado pelo Prisma ORM para o sistema NPS da Síntegra.

## 🗄️ Estrutura de Tabelas

### Users (Administradores)
Gerencia os usuários administradores do sistema.

```sql
┌─────────────┬──────────────┬─────────────┐
│ Campo       │ Tipo         │ Descrição   │
├─────────────┼──────────────┼─────────────┤
│ id          │ String (PK)  │ CUID único  │
│ email       │ String       │ Email único │
│ name        │ String       │ Nome        │
│ password    │ String       │ Hash bcrypt │
│ role        │ Enum         │ Permissões  │
│ avatar      │ String?      │ URL avatar  │
│ createdAt   │ DateTime     │ Data criação│
│ updatedAt   │ DateTime     │ Atualização │
│ lastLogin   │ DateTime?    │ Último login│
└─────────────┴──────────────┴─────────────┘
```

**Roles disponíveis:**
- `SUPER_ADMIN`: Acesso total
- `ADMIN`: Criar/editar formulários e relatórios
- `VIEWER`: Apenas visualizar dados

**Índices:**
- `email` (único)

---

### Respondents (Médicos e Distribuidores)
Cadastro dos respondentes das pesquisas.

```sql
┌──────────────┬──────────────┬──────────────────────┐
│ Campo        │ Tipo         │ Descrição            │
├──────────────┼──────────────┼──────────────────────┤
│ id           │ String (PK)  │ CUID único           │
│ name         │ String       │ Nome completo        │
│ email        │ String       │ Email                │
│ phone        │ String?      │ Telefone             │
│ type         │ Enum         │ MEDICO/DISTRIBUIDOR  │
│ category     │ String?      │ Segmentação          │
│ specialty    │ String?      │ Especialidade médica │
│ region       │ String?      │ Região geográfica    │
│ company      │ String?      │ Empresa (dist.)      │
│ metadata     │ Json?        │ Dados adicionais     │
│ consent      │ Boolean      │ LGPD                 │
│ consentDate  │ DateTime?    │ Data consentimento   │
│ createdAt    │ DateTime     │ Data criação         │
│ updatedAt    │ DateTime     │ Atualização          │
└──────────────┴──────────────┴──────────────────────┘
```

**Tipos de Respondente:**
- `MEDICO`: Médicos que usam os produtos
- `DISTRIBUIDOR`: Distribuidores parceiros

**Exemplos de category:**
- Médicos: "Cardiologia", "Ortopedia", "Cirurgia Geral"
- Distribuidores: "Região Sul", "Região Nordeste"

**Índices:**
- `email, type` (único composto)
- `email`
- `type`
- `category`

---

### Forms (Formulários)
Definição dos formulários de pesquisa.

```sql
┌──────────────┬──────────────┬─────────────────────┐
│ Campo        │ Tipo         │ Descrição           │
├──────────────┼──────────────┼─────────────────────┤
│ id           │ String (PK)  │ CUID único          │
│ title        │ String       │ Título              │
│ description  │ String?      │ Descrição           │
│ type         │ Enum         │ Tipo formulário     │
│ status       │ Enum         │ Status publicação   │
│ welcomeTitle │ String?      │ Título boas-vindas  │
│ welcomeText  │ String?      │ Texto inicial       │
│ thankYouTitle│ String?      │ Título agradecimento│
│ thankYouText │ String?      │ Texto final         │
│ expiresAt    │ DateTime?    │ Data expiração      │
│ maxResponses │ Int?         │ Limite respostas    │
│ createdBy    │ String (FK)  │ ID do criador       │
│ createdAt    │ DateTime     │ Data criação        │
│ updatedAt    │ DateTime     │ Atualização         │
│ publishedAt  │ DateTime?    │ Data publicação     │
└──────────────┴──────────────┴─────────────────────┘
```

**Tipos de Formulário:**
- `MEDICOS`: Questionário para médicos
- `DISTRIBUIDORES`: Questionário para distribuidores
- `CUSTOM`: Formulário personalizado

**Status:**
- `DRAFT`: Rascunho (editável)
- `PUBLISHED`: Publicado e aceitando respostas
- `PAUSED`: Pausado temporariamente
- `CLOSED`: Encerrado (não aceita mais respostas)
- `ARCHIVED`: Arquivado

**Índices:**
- `type`
- `status`
- `createdBy`

---

### Questions (Perguntas)
Perguntas dentro de cada formulário.

```sql
┌──────────────────┬──────────────┬────────────────────────┐
│ Campo            │ Tipo         │ Descrição              │
├──────────────────┼──────────────┼────────────────────────┤
│ id               │ String (PK)  │ CUID único             │
│ formId           │ String (FK)  │ ID do formulário       │
│ text             │ String       │ Texto da pergunta      │
│ description      │ String?      │ Texto auxiliar         │
│ type             │ Enum         │ Tipo de pergunta       │
│ order            │ Int          │ Ordem de exibição      │
│ required         │ Boolean      │ Obrigatória?           │
│ options          │ Json?        │ Opções múltipla escolha│
│ scaleMin         │ Int?         │ Valor mínimo escala    │
│ scaleMax         │ Int?         │ Valor máximo escala    │
│ scaleLabels      │ Json?        │ Labels da escala       │
│ conditionalLogic │ Json?        │ Regras condicionais    │
│ createdAt        │ DateTime     │ Data criação           │
│ updatedAt        │ DateTime     │ Atualização            │
└──────────────────┴──────────────┴────────────────────────┘
```

**Tipos de Pergunta:**

| Tipo             | Uso                                    | Exemplo                    |
|------------------|----------------------------------------|----------------------------|
| RATING_1_5       | Avaliação 1-5 (Péssima a Excelente)   | "Como avalia a qualidade?" |
| RATING_0_10      | NPS clássico (0-10)                    | "Recomendaria? 0-10"       |
| COMPARISON       | Melhor/Igual/Pior vs concorrentes      | "Comparado aos concorrentes?"|
| TEXT_SHORT       | Texto curto (1 linha)                  | Nome, Email                |
| TEXT_LONG        | Texto longo (comentários)              | "Deixe seu comentário"     |
| MULTIPLE_CHOICE  | Múltipla seleção                       | Selecione suas preferências|
| SINGLE_CHOICE    | Escolha única                          | Sim/Não/Talvez             |
| YES_NO           | Sim/Não                                | "Recomendaria?"            |

**Exemplo de conditionalLogic:**
```json
{
  "makeRequired": {
    "dependsOn": "question_id_anterior",
    "condition": "<=",
    "value": 3,
    "message": "Campo obrigatório para avaliações ≤ 3"
  }
}
```

**Índices:**
- `formId`
- `order`

---

### Responses (Respostas ao Formulário)
Registro de cada resposta ao formulário.

```sql
┌──────────────┬──────────────┬─────────────────────┐
│ Campo        │ Tipo         │ Descrição           │
├──────────────┼──────────────┼─────────────────────┤
│ id           │ String (PK)  │ CUID único          │
│ formId       │ String (FK)  │ ID do formulário    │
│ respondentId │ String? (FK) │ ID respondente      │
│ uniqueToken  │ String       │ Token único (link)  │
│ status       │ Enum         │ Status resposta     │
│ progress     │ Int          │ Progresso 0-100%    │
│ startedAt    │ DateTime     │ Início resposta     │
│ completedAt  │ DateTime?    │ Conclusão           │
│ ipAddress    │ String?      │ IP do respondente   │
│ userAgent    │ String?      │ Navegador/Device    │
│ deviceType   │ String?      │ mobile/tablet/desktop│
└──────────────┴──────────────┴─────────────────────┘
```

**Status da Resposta:**
- `IN_PROGRESS`: Em andamento
- `COMPLETED`: Completa
- `ABANDONED`: Abandonada (não finalizada)

**Índices:**
- `formId`
- `respondentId`
- `uniqueToken` (único)
- `status`

---

### Answers (Respostas Individuais)
Respostas para cada pergunta específica.

```sql
┌────────────────┬──────────────┬────────────────────┐
│ Campo          │ Tipo         │ Descrição          │
├────────────────┼──────────────┼────────────────────┤
│ id             │ String (PK)  │ CUID único         │
│ responseId     │ String (FK)  │ ID da resposta     │
│ questionId     │ String (FK)  │ ID da pergunta     │
│ numericValue   │ Int?         │ Valor numérico     │
│ textValue      │ String?      │ Valor texto        │
│ selectedOption │ String?      │ Opção selecionada  │
│ createdAt      │ DateTime     │ Data criação       │
│ updatedAt      │ DateTime     │ Atualização        │
└────────────────┴──────────────┴────────────────────┘
```

**Mapeamento de valores por tipo:**

| Tipo Pergunta    | Campo Usado      | Exemplo               |
|------------------|------------------|-----------------------|
| RATING_1_5       | numericValue     | 1, 2, 3, 4, 5        |
| RATING_0_10      | numericValue     | 0-10                 |
| COMPARISON       | selectedOption   | "Melhor", "Igual"    |
| TEXT_SHORT/LONG  | textValue        | "Ótimo atendimento"  |
| MULTIPLE_CHOICE  | selectedOption   | "Opção A"            |
| YES_NO           | selectedOption   | "Sim", "Não"         |

**Constraint:**
- `responseId + questionId` (único composto)

**Índices:**
- `responseId`
- `questionId`

---

### Reports (Relatórios)
Relatórios gerados pelos administradores.

```sql
┌──────────────┬──────────────┬─────────────────────┐
│ Campo        │ Tipo         │ Descrição           │
├──────────────┼──────────────┼─────────────────────┤
│ id           │ String (PK)  │ CUID único          │
│ title        │ String       │ Título              │
│ description  │ String?      │ Descrição           │
│ formId       │ String?      │ ID formulário       │
│ filters      │ Json?        │ Filtros aplicados   │
│ pdfUrl       │ String?      │ URL do PDF          │
│ csvUrl       │ String?      │ URL do CSV          │
│ generatedBy  │ String (FK)  │ ID do gerador       │
│ createdAt    │ DateTime     │ Data geração        │
└──────────────┴──────────────┴─────────────────────┘
```

**Exemplo de filters:**
```json
{
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "respondentType": "MEDICO",
  "category": "Cardiologia",
  "minRating": 3,
  "npsSegment": "PROMOTORES"
}
```

**Índices:**
- `formId`
- `generatedBy`

---

## 🔄 Relacionamentos

```
User
 ├─→ forms (1:N)
 ├─→ reports (1:N)
 └─→ auditLogs (1:N)

Form
 ├─→ questions (1:N)
 ├─→ responses (1:N)
 └─← createdBy (N:1) → User

Question
 ├─→ answers (1:N)
 └─← formId (N:1) → Form

Respondent
 └─→ responses (1:N)

Response
 ├─→ answers (1:N)
 ├─← formId (N:1) → Form
 └─← respondentId (N:1) → Respondent

Answer
 ├─← responseId (N:1) → Response
 └─← questionId (N:1) → Question

Report
 └─← generatedBy (N:1) → User
```

## 📊 Queries Úteis

### Calcular NPS de um formulário

```typescript
// Promotores (9-10), Neutros (7-8), Detratores (0-6)
const npsScore = await prisma.$queryRaw`
  SELECT 
    COUNT(CASE WHEN a.numericValue >= 9 THEN 1 END) as promoters,
    COUNT(CASE WHEN a.numericValue BETWEEN 7 AND 8 THEN 1 END) as passives,
    COUNT(CASE WHEN a.numericValue <= 6 THEN 1 END) as detractors,
    COUNT(*) as total
  FROM answers a
  INNER JOIN questions q ON a.questionId = q.id
  WHERE q.formId = ${formId}
    AND q.type = 'RATING_0_10'
`;

// NPS = ((Promotores - Detratores) / Total) * 100
const nps = ((promoters - detractors) / total) * 100;
```

### Buscar respostas com avaliação baixa

```typescript
const lowRatings = await prisma.answer.findMany({
  where: {
    numericValue: { lte: 3 },
    question: {
      type: 'RATING_1_5',
    },
  },
  include: {
    question: true,
    response: {
      include: {
        respondent: true,
        form: true,
      },
    },
  },
});
```

### Taxa de resposta por formulário

```typescript
const stats = await prisma.response.groupBy({
  by: ['formId', 'status'],
  _count: true,
});
```

## 🔐 Segurança

### Senhas
```typescript
import bcrypt from 'bcryptjs';

// Criar hash
const hashedPassword = await bcrypt.hash(password, 10);

// Verificar
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Tokens únicos
```typescript
import crypto from 'crypto';

// Gerar token para link único
const uniqueToken = crypto.randomBytes(32).toString('hex');
```

## 🚀 Migrations

### Criar migration
```bash
npx prisma migrate dev --name add_conditional_logic_to_questions
```

### Aplicar em produção
```bash
npx prisma migrate deploy
```

### Resetar banco (APENAS DEV!)
```bash
npx prisma migrate reset
```

## 📦 Seed Data

Criar dados iniciais para desenvolvimento:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Admin padrão
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sintegra.com.br',
      name: 'Administrador',
      password: await bcrypt.hash('admin123', 10),
      role: 'SUPER_ADMIN',
    },
  });

  // Template Formulário Médicos
  const formMedicos = await prisma.form.create({
    data: {
      title: 'Pesquisa de Satisfação - Médicos',
      type: 'MEDICOS',
      status: 'PUBLISHED',
      createdBy: admin.id,
      questions: {
        create: [
          {
            text: 'Como você avalia a qualidade dos produtos?',
            type: 'RATING_1_5',
            order: 1,
            required: true,
            scaleMin: 1,
            scaleMax: 5,
            scaleLabels: {
              '1': 'Péssima',
              '2': 'Ruim',
              '3': 'Regular',
              '4': 'Boa',
              '5': 'Excelente',
            },
          },
          // ... mais perguntas
        ],
      },
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

**Desenvolvido com Prisma ORM para PostgreSQL**
