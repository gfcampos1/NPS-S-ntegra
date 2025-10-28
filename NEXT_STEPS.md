# 🎯 PRÓXIMOS PASSOS - Sistema NPS Síntegra

Roadmap detalhado para iniciar o desenvolvimento.

## ✅ O que já está pronto

- ✅ Estrutura de pastas organizada
- ✅ Schema do banco de dados (Prisma)
- ✅ Design System completo
- ✅ Configurações do Next.js
- ✅ Documentação técnica completa
- ✅ Paleta de cores da Síntegra
- ✅ Plano de desenvolvimento (14 sprints)

## 🚀 Como Começar (Agora!)

### Fase 1: Setup Inicial (Hoje - 1 hora)

#### 1. Configurar Supabase
```bash
# Acesse: https://supabase.com/dashboard
# Crie projeto: "sintegra-nps"
# Região: South America (São Paulo)
# Copie a Connection String
```

#### 2. Instalar Dependências
```bash
cd frontend
npm install
```

#### 3. Configurar Ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

#### 4. Inicializar Banco
```bash
cp ../database/schema.prisma ./prisma/schema.prisma
npm run db:migrate
npm run db:studio  # Visualizar banco
```

#### 5. Testar
```bash
npm run dev
# Acesse: http://localhost:3000
```

---

## 📅 Sprint 1-2: Fundação (Semana 1-2)

### Objetivo
Criar estrutura base da aplicação com autenticação funcional.

### Tarefas

#### ✅ Backend

- [ ] **Configurar NextAuth.js**
  - Arquivo: `src/app/api/auth/[...nextauth]/route.ts`
  - Providers: Credentials
  - Callbacks personalizados

- [ ] **Criar API de Usuários**
  - `POST /api/users` - Criar usuário
  - `GET /api/users` - Listar usuários
  - Validação com Zod

- [ ] **Server Actions básicas**
  - `src/lib/actions/auth.ts` - Login/Logout
  - `src/lib/actions/users.ts` - CRUD usuários

#### 🎨 Frontend

- [ ] **Layout principal**
  - `src/app/layout.tsx` - Root layout
  - Header com logo Síntegra
  - Navigation sidebar (admin)

- [ ] **Páginas de autenticação**
  - `/login` - Tela de login
  - `/register` - Cadastro de admin
  - Formulários com React Hook Form + Zod

- [ ] **Dashboard básico**
  - `/admin` - Home do admin
  - Cards com estatísticas básicas
  - Sidebar de navegação

#### 🎨 Componentes UI (shadcn/ui)

```bash
# Instalar componentes necessários
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
```

### Entregável Sprint 1-2
- ✅ Login funcional
- ✅ Dashboard básico
- ✅ Navegação entre páginas
- ✅ Design system aplicado

---

## 📅 Sprint 3-4: Form Builder (Semana 3-4)

### Objetivo
Criar interface de criação de formulários com drag-and-drop.

### Tarefas

#### ✅ Backend

- [ ] **API de Formulários**
  - `POST /api/forms` - Criar formulário
  - `GET /api/forms` - Listar formulários
  - `PATCH /api/forms/:id` - Atualizar
  - `DELETE /api/forms/:id` - Deletar

- [ ] **API de Perguntas**
  - `POST /api/forms/:id/questions` - Adicionar pergunta
  - `PATCH /api/questions/:id` - Editar pergunta
  - `DELETE /api/questions/:id` - Remover pergunta

- [ ] **Validação de lógica condicional**
  - Validar regras de dependência
  - Aplicar makeRequired dinamicamente

#### 🎨 Frontend

- [ ] **Página de formulários**
  - `/admin/forms` - Lista de formulários
  - Tabela com filtros e busca
  - Ações: Editar, Deletar, Publicar

- [ ] **Form Builder**
  - `/admin/forms/new` - Criar novo
  - `/admin/forms/:id/edit` - Editar
  - Componentes:
    - Question Builder
    - Preview em tempo real (desktop/mobile)
    - Biblioteca de tipos de pergunta

- [ ] **Tipos de Pergunta**
  - Rating 1-5
  - Comparação (Melhor/Igual/Pior)
  - Texto curto/longo
  - Múltipla escolha

- [ ] **Lógica Condicional UI**
  - Interface para definir regras
  - "Tornar obrigatório se..."
  - "Mostrar se..."

#### 🧩 Componentes

```typescript
// src/components/forms/QuestionBuilder.tsx
// src/components/forms/RatingQuestion.tsx
// src/components/forms/ComparisonQuestion.tsx
// src/components/forms/TextQuestion.tsx
// src/components/forms/FormPreview.tsx
// src/components/forms/ConditionalLogicEditor.tsx
```

### Entregável Sprint 3-4
- ✅ Criar formulário completo
- ✅ Adicionar todos os tipos de pergunta
- ✅ Lógica condicional funcional
- ✅ Preview responsivo

---

## 📅 Sprint 5-6: Interface de Resposta (Semana 5-6)

### Objetivo
Criar experiência mobile-first para respondentes.

### Tarefas

#### ✅ Backend

- [ ] **API de Respostas**
  - `GET /api/r/:token` - Buscar formulário
  - `POST /api/r/:token/answer` - Salvar resposta
  - Validação de token único
  - Aplicar lógica condicional

#### 🎨 Frontend

- [ ] **Página de resposta**
  - `/r/[token]` - Página pública
  - Tela de boas-vindas
  - Uma pergunta por vez (mobile)
  - Barra de progresso
  - Tela de agradecimento

- [ ] **Componentes de Resposta**
  - Rating buttons (grandes, touch-friendly)
  - Textarea com contador de caracteres
  - Validação em tempo real
  - Salvamento automático

- [ ] **PWA básico**
  - Manifest.json
  - Service Worker básico
  - Funciona offline

### Entregável Sprint 5-6
- ✅ Responder formulário completo
- ✅ Mobile-first funcional
- ✅ Salvamento de progresso
- ✅ PWA instalável

---

## 📅 Sprint 7-8: Gestão de Respondentes (Semana 7-8)

### Objetivo
Gerenciar médicos e distribuidores.

### Tarefas

#### ✅ Backend

- [ ] **API de Respondentes**
  - `POST /api/respondents` - Cadastrar
  - `GET /api/respondents` - Listar
  - `POST /api/respondents/import` - Importar CSV
  - Validação de duplicados

- [ ] **Sistema de Distribuição**
  - `POST /api/forms/:id/distribute` - Enviar links
  - Geração de tokens únicos
  - Integração com Resend (email)

#### 🎨 Frontend

- [ ] **Gestão de Respondentes**
  - `/admin/respondents` - Lista
  - Filtros por tipo, categoria
  - Importação CSV
  - Cadastro manual

- [ ] **Distribuição de Formulários**
  - `/admin/forms/:id/distribute`
  - Selecionar respondentes
  - Preview do email
  - Agendamento de envio

### Entregável Sprint 7-8
- ✅ Cadastrar respondentes
- ✅ Importar via CSV
- ✅ Enviar links por email
- ✅ Tracking de envios

---

## 📅 Sprint 9-10: Analytics e Dashboard (Semana 9-10)

### Objetivo
Visualização de dados e cálculo de NPS.

### Tarefas

#### ✅ Backend

- [ ] **API de Analytics**
  - `GET /api/analytics/nps` - Calcular NPS
  - `GET /api/analytics/ratings` - Ratings por pergunta
  - `GET /api/analytics/comments` - Comentários
  - Agregações e filtros

#### 🎨 Frontend

- [ ] **Dashboard de Analytics**
  - `/admin/analytics` - Dashboard principal
  - NPS Score grande (visual destaque)
  - Gráficos:
    - Distribuição de scores
    - Evolução temporal
    - Comparação por categoria
  - Filtros interativos

- [ ] **Componentes de Visualização**
  - NPSScoreCard
  - DistributionChart (Recharts)
  - TrendChart
  - CommentsTable
  - RatingDistribution

### Entregável Sprint 9-10
- ✅ Dashboard completo
- ✅ NPS calculado automaticamente
- ✅ Gráficos interativos
- ✅ Filtros funcionais

---

## 📅 Sprint 11-12: Relatórios (Semana 11-12)

### Objetivo
Geração de relatórios em PDF e CSV.

### Tarefas

#### ✅ Backend

- [ ] **Geração de PDF**
  - Biblioteca: Puppeteer ou @react-pdf/renderer
  - Templates customizáveis
  - Upload para Cloudinary

- [ ] **Exportação CSV**
  - Dados brutos
  - Filtros aplicados

#### 🎨 Frontend

- [ ] **Interface de Relatórios**
  - `/admin/reports` - Lista de relatórios
  - `/admin/reports/new` - Criar novo
  - Configuração de filtros
  - Preview antes de gerar

### Entregável Sprint 11-12
- ✅ Gerar relatório PDF
- ✅ Exportar CSV
- ✅ Templates personalizáveis
- ✅ Histórico de relatórios

---

## 📅 Sprint 13-14: Polimento e Deploy (Semana 13-14)

### Objetivo
Finalizar e colocar em produção.

### Tarefas

- [ ] **Testes de usabilidade**
  - Testar com usuários reais
  - Ajustar UX baseado em feedback

- [ ] **Performance**
  - Lighthouse score > 90
  - Otimizar imagens
  - Code splitting

- [ ] **Deploy**
  - Configurar Vercel
  - Domínio customizado
  - SSL configurado

- [ ] **Documentação**
  - Vídeos tutoriais
  - Manual do usuário
  - FAQ

### Entregável Sprint 13-14
- ✅ Sistema em produção
- ✅ Performance otimizada
- ✅ Documentação completa
- ✅ Usuários treinados

---

## 🛠️ Ferramentas Recomendadas

### Desenvolvimento
- **VS Code** + Extensões:
  - Prisma
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

### Design
- **Figma** (opcional): Protótipos de telas
- **Excalidraw**: Diagramas de fluxo

### Comunicação
- **Slack/Discord**: Comunicação da equipe
- **Linear/Jira**: Gestão de tarefas

### Monitoramento
- **Vercel Analytics**: Performance
- **Sentry**: Error tracking
- **LogRocket**: Session replay

---

## 📚 Recursos de Aprendizado

### Next.js
- [Documentação Oficial](https://nextjs.org/docs)
- [Next.js 14 Tutorial](https://nextjs.org/learn)

### Prisma
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

### shadcn/ui
- [Components](https://ui.shadcn.com/docs/components)
- [Examples](https://ui.shadcn.com/examples)

### Tailwind CSS
- [Docs](https://tailwindcss.com/docs)
- [Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)

---

## 🎯 Métricas de Sucesso

### Técnicas
- ✅ Lighthouse Score > 90
- ✅ 100% TypeScript coverage
- ✅ < 2s tempo de resposta (p95)
- ✅ 99.9% uptime

### Produto
- ✅ 80%+ taxa de resposta
- ✅ < 5 min tempo médio de resposta
- ✅ NPS do próprio sistema > 70
- ✅ 0 bugs críticos em produção

---

## 🆘 Suporte Durante Desenvolvimento

### Dúvidas Técnicas
1. Consulte a documentação em `/docs`
2. Verifique exemplos de código
3. GitHub Issues do projeto

### Bloqueios
- **Backend**: Revisar logs do Prisma
- **Frontend**: React DevTools
- **Deploy**: Logs da Vercel

---

## 🎉 Dica Final

**Comece pequeno, itere rápido!**

Não tente fazer tudo de uma vez. Siga o roadmap sprint por sprint e sempre:

1. ✅ Faça funcionar
2. ✅ Faça direito
3. ✅ Faça rápido

Boa sorte com o desenvolvimento! 🚀

---

**Sistema NPS Síntegra - Revolucionando a coleta de feedback no setor médico**
