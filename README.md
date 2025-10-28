# 🎯 Sistema NPS - Síntegra

Sistema completo de coleta e análise de NPS (Net Promoter Score) para médicos e distribuidores.

## 📋 Visão Geral

Web App moderno e intuitivo para:
- **Administradores**: Criar formulários e analisar dados (Desktop)
- **Médicos e Distribuidores**: Responder pesquisas (Mobile-first)

## 🏗️ Arquitetura do Projeto

```
NPS/
├── frontend/              # Next.js 14+ App
│   ├── src/
│   │   ├── app/          # App Router
│   │   ├── components/   # Componentes React
│   │   ├── lib/          # Utilities e configs
│   │   └── styles/       # Estilos globais
│   ├── public/           # Assets estáticos
│   └── package.json
│
├── database/             # Prisma Schema e Migrations
│   ├── schema.prisma
│   └── migrations/
│
├── docs/                 # Documentação
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
└── assets/
    └── logos/            # Logo Síntegra (120x120px)
```

## 🎨 Stack Tecnológica

### Frontend
- **Framework**: Next.js 14+ (App Router + TypeScript)
- **UI**: shadcn/ui + Tailwind CSS
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Estado**: Zustand + React Query
- **Animações**: Framer Motion

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Storage**: Cloudinary

### Infraestrutura
- **Hosting**: Railway
- **Database**: PostgreSQL (Railway)
- **Email**: Resend
- **Versionamento**: GitHub

## 📊 Modelo de Dados Principal

### Entidades Core
```
Users (Administradores)
├── id, email, name, role, createdAt

Respondents (Médicos/Distribuidores)
├── id, name, email, phone, type, category
├── createdAt, updatedAt

Forms (Formulários NPS)
├── id, title, description, type, status
├── createdBy, createdAt, publishedAt

Questions (Perguntas)
├── id, formId, type, text, order
├── required, options, conditionalLogic

Responses (Respostas)
├── id, formId, respondentId, uniqueLink
├── completedAt, ipAddress

Answers (Respostas individuais)
├── id, responseId, questionId, value
├── textValue, numericValue

Reports (Relatórios)
├── id, title, filters, generatedBy
├── createdAt, pdfUrl
```

## 🎯 Tipos de Perguntas Suportadas

### 1. Escala de Avaliação (1-5)
```json
{
  "type": "rating_scale",
  "scale": "1-5",
  "labels": {
    "5": "Excelente",
    "4": "Boa",
    "3": "Regular",
    "2": "Ruim",
    "1": "Péssima"
  }
}
```

### 2. Comparação com Concorrentes
```json
{
  "type": "comparison",
  "options": ["Melhor", "Igual", "Pior"]
}
```

### 3. Campo de Texto
```json
{
  "type": "text",
  "required": false,
  "conditionalRequired": {
    "when": "previous_question_value <= 3",
    "message": "Campo obrigatório para avaliações ≤ 3"
  }
}
```

### 4. NPS (0-10)
```json
{
  "type": "nps",
  "scale": "0-10",
  "labels": {
    "0-6": "Detratores",
    "7-8": "Neutros",
    "9-10": "Promotores"
  }
}
```

## 🔄 Lógica Condicional

### Regra: Comentário Obrigatório
```typescript
// Quando avaliação ≤ 3, comentário se torna obrigatório
if (ratingAnswer <= 3) {
  commentQuestion.required = true;
  commentQuestion.placeholder = "Por favor, explique sua avaliação";
}
```

### Implementação no Schema
```prisma
model Question {
  id               String   @id @default(cuid())
  conditionalLogic Json?    // Regras de lógica condicional
  
  // Exemplo de conditionalLogic:
  // {
  //   "makeRequired": {
  //     "dependsOn": "question_id",
  //     "condition": "<=",
  //     "value": 3
  //   }
  // }
}
```

## 📱 Exemplos de Formulários

### Questionário para Distribuidores

**Estrutura de Perguntas:**

1. **Qualidade dos produtos médicos**
   - Tipo: Escala 1-5
   - Obrigatória: Sim
   
2. **Comparação qualidade vs concorrentes**
   - Tipo: Múltipla escolha (Melhor/Igual/Pior)
   - Obrigatória: Sim
   
3. **Comentário sobre qualidade**
   - Tipo: Texto livre
   - Condicional: Obrigatório se Q1 ≤ 3

4. **Suporte em educação médica**
   - Tipo: Escala 1-5
   
5. **Comparação suporte vs concorrentes**
   - Tipo: Múltipla escolha
   
6. **Comentário sobre suporte**
   - Tipo: Texto livre
   - Condicional: Obrigatório se Q4 ≤ 3

*[Continua para todas as 4 dimensões]*

### Questionário para Médicos

**Estrutura Similar:**
1. Qualidade dos produtos
2. Facilidade de uso
3. Qualidade da educação médica
4. Atendimento do distribuidor

## 🚀 Roadmap de Desenvolvimento

### Sprint 1-2: Fundação (2-3 semanas)
- [ ] Setup Next.js + Prisma + Supabase
- [ ] Autenticação (NextAuth.js)
- [ ] Design System (Tailwind + shadcn/ui)
- [ ] Landing page + Login
- [ ] Estrutura do banco de dados

### Sprint 3-4: Builder de Formulários (2-3 semanas)
- [ ] CRUD de formulários
- [ ] Tipos de pergunta: Rating 1-5, Comparação, Texto
- [ ] Lógica condicional (comentário obrigatório)
- [ ] Preview em tempo real
- [ ] Template: Distribuidor
- [ ] Template: Médico

### Sprint 5-6: Interface de Resposta Mobile (2-3 semanas)
- [ ] Layout mobile-first responsivo
- [ ] Uma pergunta por tela
- [ ] Validação condicional em tempo real
- [ ] Barra de progresso
- [ ] Salvamento de progresso
- [ ] Tela de agradecimento

### Sprint 7-8: Gestão de Respondentes (2-3 semanas)
- [ ] Cadastro de médicos/distribuidores
- [ ] Categorização (especialidade, região)
- [ ] Importação CSV
- [ ] Geração de links únicos
- [ ] Sistema de envio (email/WhatsApp)
- [ ] Tracking de respostas

### Sprint 9-10: Dashboard e Analytics (2-3 semanas)
- [ ] Dashboard principal
- [ ] Cálculo NPS por dimensão
- [ ] Gráficos: Evolução temporal, Distribuição
- [ ] Filtros: Período, Categoria, Tipo
- [ ] Visualização de comentários
- [ ] Alertas para avaliações baixas

### Sprint 11-12: Relatórios (2-3 semanas)
- [ ] Gerador de PDF
- [ ] Templates personalizáveis
- [ ] Comparação entre períodos
- [ ] Segmentação por categoria
- [ ] Exportação CSV
- [ ] Compartilhamento seguro

### Sprint 13-14: Polimento (2 semanas)
- [ ] PWA (Progressive Web App)
- [ ] Otimização de performance
- [ ] Testes de usabilidade
- [ ] Documentação completa
- [ ] Deploy produção

## 🎨 Design System - Cores Síntegra

### Paleta Principal (da identidade visual)
```css
/* Extraídas do anexo da marca */
--sintegra-blue-light: #5BA4D9;    /* Azul claro */
--sintegra-blue-primary: #4169B1;  /* Azul principal */
--sintegra-gray-light: #A8A8A8;    /* Cinza claro */
--sintegra-gray-dark: #3D3D3D;     /* Cinza escuro */
```

### Paleta Complementar (UI)
```css
/* Status e Feedback */
--success: #10B981;      /* Verde - Promotores (9-10) */
--warning: #F59E0B;      /* Amarelo - Neutros (7-8) */
--danger: #EF4444;       /* Vermelho - Detratores (0-6) */

/* Neutros */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-900: #111827;
```

## 🔒 Segurança e Compliance

### LGPD
- ✅ Consentimento explícito na primeira resposta
- ✅ Opção de anonimização
- ✅ Direito ao esquecimento (exclusão de dados)
- ✅ Exportação de dados pessoais

### Segurança
- ✅ Links únicos com hash SHA-256
- ✅ Rate limiting (5 tentativas/minuto)
- ✅ Criptografia de dados sensíveis
- ✅ Logs de auditoria
- ✅ Expiração de links (30 dias)

## 📦 Setup Inicial

### Pré-requisitos
- Node.js 18+
- PostgreSQL (via Supabase ou Railway)
- Git
- Conta GitHub (versionamento)
- Conta Railway (deploy)

### Instalação Local

```bash
# 1. Clonar repositório
git clone https://github.com/SEU_USUARIO/sintegra-nps.git
cd sintegra-nps

# 2. Instalar dependências
cd frontend
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Configurar banco de dados
cp ../database/schema.prisma ./prisma/schema.prisma
npx prisma generate
npx prisma migrate dev

# 5. Iniciar desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### Setup Git/GitHub

```bash
# Inicializar Git na raiz do projeto
cd c:/Scripts/NPS
git init
git add .
git commit -m "feat: Initial commit - Sistema NPS Síntegra"

# Conectar com GitHub
git remote add origin https://github.com/SEU_USUARIO/sintegra-nps.git
git branch -M main
git push -u origin main
```

**Leia mais:** `docs/GIT.md`

### Deploy no Railway

```bash
# 1. Criar projeto no Railway (https://railway.app)
# 2. Conectar repositório GitHub
# 3. Adicionar PostgreSQL
# 4. Configurar variáveis de ambiente
# 5. Deploy automático!
```

**Leia mais:** `docs/RAILWAY.md`

### Variáveis de Ambiente
```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# Email
RESEND_API_KEY="..."

# Storage
CLOUDINARY_URL="..."
```

## 📱 Progressive Web App (PWA)

### Features
- ✅ Instalável no celular
- ✅ Funciona offline
- ✅ Notificações push
- ✅ Sincronização em background

## 📊 Métricas e KPIs

### Dashboard Admin
- **NPS Score Geral**: -100 a +100
- **Taxa de Resposta**: % de links abertos
- **Tempo Médio de Resposta**: Minutos
- **Distribuição**: Detratores/Neutros/Promotores
- **Tendência**: Comparação período anterior

### Alertas Automáticos
- 🔴 Avaliação ≤ 2 → Email imediato
- 🟡 NPS abaixo de meta → Notificação semanal
- 🟢 NPS melhoria > 10 pontos → Celebração!

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Propriedade da **Síntegra** - Todos os direitos reservados.

## 📞 Suporte

- Email: suporte@sintegra.com.br
- Documentação: [docs/](./docs/)

---

**Desenvolvido com ❤️ para revolucionar a experiência de NPS no setor médico**
