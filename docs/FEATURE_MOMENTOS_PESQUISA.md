# 📊 Feature: Momentos de Pesquisa

## 🎯 Objetivo

Organizar formulários por momentos/contextos de pesquisa para facilitar análise e visualização de dados separados por finalidade.

**Exemplos de Momentos:**
- 📊 Satisfação e Pós-Mercado
- 🎓 Treinamento Cadáver Lab
- 📅 Eventos e Congressos
- 🏥 Avaliação de Produtos

---

## ✅ Status da Implementação

**Status:** ✅ **COMPLETO e PRONTO PARA PRODUÇÃO**

**Branch:** `claude/survey-moments-structure-011CUzvYqawdBPmyRzZ95qRk`

---

## 📦 O que foi Implementado

### **1. Banco de Dados**

#### **Novo Modelo: SurveyMoment**

```prisma
model SurveyMoment {
  id          String   @id @default(cuid())
  name        String   // Ex: "Satisfação e Pós-Mercado"
  description String?  // Descrição do momento
  slug        String   @unique // URL-friendly
  color       String?  // Cor visual (#hex)
  icon        String?  // Ícone (lucide-react)
  order       Int      @default(0) // Ordem de exibição
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relações
  forms       Form[]
}
```

#### **Alteração no Modelo Form**

```prisma
model Form {
  // ... campos existentes ...

  surveyMomentId String?
  surveyMoment   SurveyMoment? @relation(...)
}
```

#### **Migration**

- Arquivo: `20251111000000_add_survey_moments/migration.sql`
- Cria tabela `survey_moments`
- Adiciona campo `surveyMomentId` em `forms` (nullable)
- Insere 2 momentos iniciais
- Cria índices para performance

---

### **2. APIs REST**

#### **GET /api/survey-moments**
- Lista todos os momentos ativos
- Inclui contagem de formulários
- Ordenado por `order`
- Autenticação: Requerida

#### **POST /api/survey-moments**
- Cria novo momento
- Validação com Zod
- Slug único obrigatório
- Autenticação: Super Admin only

#### **GET /api/survey-moments/[id]**
- Detalhes de um momento
- Inclui formulários associados
- Autenticação: Requerida

#### **PUT /api/survey-moments/[id]**
- Atualiza momento existente
- Permite alterar: nome, descrição, cor, ícone
- Slug não pode ser alterado
- Autenticação: Super Admin only

#### **DELETE /api/survey-moments/[id]**
- Arquiva momento (soft delete)
- Define `isActive = false`
- Formulários associados não são afetados
- Autenticação: Super Admin only

#### **POST /api/survey-moments/reorder**
- Reordena momentos (↑↓)
- Atualiza campo `order`
- Autenticação: Super Admin only

#### **GET /api/survey-moments/migrate**
- Preview da migração de dados
- Lista formulários sem momento
- Sugere categorização automática
- Autenticação: Super Admin only

#### **POST /api/survey-moments/migrate**
- Executa migração de dados
- Estratégia automática ou manual
- Retorna estatísticas da migração
- Autenticação: Super Admin only

---

### **3. Interfaces Admin (Super Admin Only)**

#### **3.1 Gerenciamento de Momentos**

**URL:** `/admin/settings/survey-moments`

**Funcionalidades:**
- ✅ Listar todos os momentos
- ✅ Criar novo momento
  - Nome, descrição, slug, cor, ícone
  - Slug gerado automaticamente a partir do nome
  - Validação de slug único
- ✅ Editar momento existente
  - Alterar nome, descrição, cor, ícone
  - Slug não editável
- ✅ Reordenar momentos (botões ↑↓)
- ✅ Arquivar momento
  - Confirmação antes de arquivar
  - Soft delete (isActive = false)
- ✅ Ver quantidade de formulários por momento
- ✅ Ver data de criação

**UI/UX:**
- Cards com cor visual do momento
- Botões de reordenação intuitivos
- Modals para criar/editar
- Badges com ordem de exibição
- Informações de data relativa (ex: "há 2 dias")

#### **3.2 Migração de Dados**

**URL:** `/admin/settings/data-migration`

**Funcionalidades:**
- ✅ Dashboard de migração
  - Total de formulários
  - Formulários pendentes
  - Formulários já migrados
- ✅ Preview de migração automática
  - Visualizar sugestão de categorização
  - Baseado em palavras-chave no título
- ✅ Executar migração automática
  - Confirmação antes de executar
  - Loading state durante processo
  - Resultado com estatísticas
- ✅ Visualizar formulários migrados
  - Lista com momento atribuído
  - Feedback visual de sucesso

**Critérios de Migração Automática:**
- Keywords para "Treinamento Cadáver Lab":
  - treinamento, lab, laboratório, cadaver, cadáver
  - curso, workshop, prático
- Outros formulários → "Satisfação e Pós-Mercado"

**UI/UX:**
- Cards com estatísticas visuais
- Preview com setas indicando categorização
- Alert explicando como funciona a migração
- Confirmação com detalhes da operação
- Feedback de sucesso/erro
- Lista scrollable de formulários

---

### **4. Formulários**

#### **Criação de Formulários**

**Arquivo:** `/admin/forms/new/page.tsx`

**Novidades:**
- ✅ Campo "Momento de Pesquisa" adicionado
- ✅ Select com momentos disponíveis
- ✅ Opção "Sem categoria" (valor vazio)
- ✅ Loading state enquanto carrega momentos
- ✅ Texto de ajuda explicativo
- ✅ Campo opcional (backward compatible)

**Validação:**
- Atualizado `createFormSchema`: `surveyMomentId` opcional
- Atualizado `updateFormSchema`: `surveyMomentId` opcional

---

### **5. Sidebar**

**Arquivo:** `frontend/src/components/layout/Sidebar.tsx`

**Novos Itens (Super Admin Only):**
- 📅 Momentos de Pesquisa (`/admin/settings/survey-moments`)
- 💾 Migração de Dados (`/admin/settings/data-migration`)

**Localização:** Seção "Configurações" (expansível)

**Ícones:** Calendar e Database (lucide-react)

---

## 🗂️ Estrutura de Arquivos Criados/Modificados

```
frontend/
├── prisma/
│   ├── schema.prisma                                    # ✏️ Modificado
│   └── migrations/
│       └── 20251111000000_add_survey_moments/
│           └── migration.sql                            # ✨ Novo
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── forms/
│   │   │   │   └── new/
│   │   │   │       └── page.tsx                        # ✏️ Modificado
│   │   │   └── settings/
│   │   │       ├── survey-moments/
│   │   │       │   └── page.tsx                        # ✨ Novo
│   │   │       └── data-migration/
│   │   │           └── page.tsx                        # ✨ Novo
│   │   └── api/
│   │       └── survey-moments/
│   │           ├── route.ts                            # ✨ Novo
│   │           ├── [id]/
│   │           │   └── route.ts                        # ✨ Novo
│   │           ├── reorder/
│   │           │   └── route.ts                        # ✨ Novo
│   │           └── migrate/
│   │               └── route.ts                        # ✨ Novo
│   ├── components/
│   │   └── layout/
│   │       └── Sidebar.tsx                             # ✏️ Modificado
│   └── lib/
│       └── validations/
│           └── form.ts                                 # ✏️ Modificado

docs/
├── DEPLOY_PRODUCTION.md                                # ✨ Novo
├── FEATURE_MOMENTOS_PESQUISA.md                        # ✨ Novo (este arquivo)
├── STAGING_SETUP.md                                    # ✨ Novo
├── STAGING_QUICKSTART.md                               # ✨ Novo
├── STAGING_CHECKLIST.md                                # ✨ Novo
└── DEVELOPMENT_WORKFLOW.md                             # ✨ Novo

scripts/
└── validate-staging.sh                                 # ✨ Novo
```

---

## 🔒 Segurança

### **Controles de Acesso**

| Funcionalidade | Acesso |
|----------------|--------|
| Visualizar momentos | Todos os admins |
| Criar momento | Super Admin only |
| Editar momento | Super Admin only |
| Arquivar momento | Super Admin only |
| Reordenar momentos | Super Admin only |
| Ver migração de dados | Super Admin only |
| Executar migração | Super Admin only |

### **Validações**

- ✅ Zod schema em todas as APIs
- ✅ Slug único (validação no banco)
- ✅ NextAuth session check
- ✅ Role verification (SUPER_ADMIN)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React escape automático)

---

## 🎨 Design e UX

### **Cores Padrão dos Momentos Iniciais**

- **Satisfação e Pós-Mercado:** `#3B82F6` (Blue)
- **Treinamento Cadáver Lab:** `#10B981` (Green)

### **Ícones Padrão**

- **Satisfação:** `BarChart3`
- **Treinamento:** `GraduationCap`

### **Componentes UI Usados**

- shadcn/ui components
- Radix UI primitives
- Lucide React icons
- Framer Motion (sidebar)
- Tailwind CSS

---

## 📊 Fluxo de Uso

### **1. Primeiro Acesso Pós-Deploy**

```
Admin (Super) acessa sistema
  ↓
Vai em: Configurações → Migração de Dados
  ↓
Vê formulários sem momento
  ↓
Clica em "Executar Migração Automática"
  ↓
Confirma migração
  ↓
✅ Formulários categorizados
```

### **2. Criar Novo Momento**

```
Admin (Super) acessa: Configurações → Momentos de Pesquisa
  ↓
Clica em "Novo Momento"
  ↓
Preenche:
  - Nome (ex: "Eventos 2025")
  - Descrição
  - Cor (#hex)
  - Ícone (lucide name)
  ↓
Clica em "Criar Momento"
  ↓
✅ Momento criado e disponível
```

### **3. Criar Formulário com Momento**

```
Admin acessa: Formulários → Novo Formulário
  ↓
Preenche:
  - Título
  - Descrição
  - Tipo
  - **Momento de Pesquisa** (novo!)
  ↓
Clica em "Criar e Adicionar Perguntas"
  ↓
✅ Formulário criado categorizado
```

### **4. Reorganizar Momentos**

```
Admin (Super) acessa: Configurações → Momentos de Pesquisa
  ↓
Clica em ↑ ou ↓ para reordenar
  ↓
✅ Ordem atualizada automaticamente
```

---

## 🚀 Deploy em Produção

### **Guia Completo**

Ver: `docs/DEPLOY_PRODUCTION.md`

### **Resumo Rápido**

```bash
# 1. Backup
railway run pg_dump $DATABASE_URL > backup.sql

# 2. Merge e Push
git checkout main
git merge claude/survey-moments-structure-011CUzvYqawdBPmyRzZ95qRk
git push origin main

# 3. Railway deploy automático (5-10 min)
# - Build
# - Migration
# - Start

# 4. Acessar /admin/settings/data-migration
# - Executar migração de dados

# 5. Validar
# - Momentos criados
# - Formulários migrados
# - Tudo funcionando
```

---

## 🧪 Testes

### **Testes Manuais Recomendados**

1. **Criar Momento**
   - ✅ Nome obrigatório
   - ✅ Slug único
   - ✅ Cor visual funciona
   - ✅ Aparece na lista

2. **Editar Momento**
   - ✅ Altera nome
   - ✅ Altera cor
   - ✅ Slug não editável

3. **Reordenar Momentos**
   - ✅ Botão ↑ desabilitado no topo
   - ✅ Botão ↓ desabilitado no fim
   - ✅ Ordem atualiza

4. **Arquivar Momento**
   - ✅ Confirmação exigida
   - ✅ Formulários não afetados
   - ✅ Momento some da lista

5. **Migração de Dados**
   - ✅ Preview correto
   - ✅ Categorização baseada em keywords
   - ✅ Estatísticas corretas
   - ✅ Pode executar novamente

6. **Criar Formulário**
   - ✅ Campo de momento aparece
   - ✅ Lista momentos ativos
   - ✅ Pode deixar vazio
   - ✅ Salva corretamente

---

## 📈 Métricas de Sucesso

### **KPIs Esperados**

- **Formulários categorizados:** 100%
- **Tempo de categorização:** < 1 minuto
- **Taxa de erro em migração:** 0%
- **Uptime durante deploy:** 100%
- **Satisfação dos admins:** Alta

### **Monitoramento**

- Verificar uso da feature
- Coletar feedback dos admins
- Monitorar performance das queries
- Validar UX da interface

---

## 🔄 Próximas Iterações (Futuro)

### **V2: Dashboard por Momentos**

- Filtrar dashboard por momento
- Gráficos separados por contexto
- Comparação entre momentos

### **V3: Relatórios Avançados**

- Relatórios segmentados por momento
- Export CSV/Excel por momento
- Analytics por contexto

### **V4: Melhorias UX**

- Drag & drop para reordenar
- Bulk categorização
- Templates de momentos
- Permissões granulares

---

## 📞 Suporte

### **Dúvidas sobre a Feature**

- Ver: `docs/DEPLOY_PRODUCTION.md`
- Ver: `docs/STAGING_SETUP.md`
- Ver: `docs/DEVELOPMENT_WORKFLOW.md`

### **Problemas Técnicos**

- Ver logs: `railway logs --environment production`
- Ver migration status: `railway run npx prisma migrate status`
- Rollback: Ver `docs/DEPLOY_PRODUCTION.md` seção Rollback

---

## 🎯 Conclusão

A feature **Momentos de Pesquisa** está completamente implementada e pronta para produção.

**Principais Benefícios:**
- ✅ Organização clara dos formulários
- ✅ Análise separada por contexto
- ✅ Fácil categorização (automática + manual)
- ✅ Interface intuitiva para Super Admins
- ✅ Zero impacto em dados existentes
- ✅ Backward compatible

**Deploy:**
Siga o guia em `docs/DEPLOY_PRODUCTION.md` para deploy seguro em produção.

---

**Implementado por:** Claude Code (Anthropic)
**Data:** 2025-11-11
**Versão:** 1.0.0
**Status:** ✅ Pronto para Produção
