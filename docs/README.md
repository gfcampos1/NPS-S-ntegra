# 📚 Documentação - Sistema NPS Síntegra

Índice centralizado de toda a documentação do projeto.

---

## 🚀 Início Rápido

| Documento | Descrição | Tempo |
|-----------|-----------|-------|
| [STAGING_QUICKSTART.md](./STAGING_QUICKSTART.md) | ⚡ Configurar staging em 10 minutos | 10 min |
| [START_HERE.md](../START_HERE.md) | Visão geral do projeto | 5 min |

---

## 🧪 Ambiente de Homologação (Staging)

### Configuração e Setup

| Documento | O que contém |
|-----------|--------------|
| [STAGING_QUICKSTART.md](./STAGING_QUICKSTART.md) | Guia rápido: configurar staging em 10 minutos |
| [STAGING_SETUP.md](./STAGING_SETUP.md) | Guia completo: configuração detalhada do Railway |
| [STAGING_CHECKLIST.md](./STAGING_CHECKLIST.md) | Checklist: validar configuração do staging |

### Workflow e Desenvolvimento

| Documento | O que contém |
|-----------|--------------|
| [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) | Fluxo completo: dev → staging → produção |

### Scripts e Ferramentas

| Script | Descrição |
|--------|-----------|
| [validate-staging.sh](../scripts/validate-staging.sh) | Valida configuração do ambiente staging |

### Configuração

| Arquivo | Descrição |
|---------|-----------|
| [.env.staging.example](../frontend/.env.staging.example) | Template de variáveis de ambiente para staging |

---

## 🏗️ Feature: Momentos de Pesquisa

### Planejamento

**Status:** 📋 Em planejamento

**Objetivo:** Dividir o app por momentos/contextos de pesquisa para melhor organização e análise de dados.

**Fases:**
1. ✅ Design e Planejamento
2. ⏳ Banco de Dados - Modelo SurveyMoment
3. ⏳ Backend - APIs de gerenciamento
4. ⏳ Interface Admin - Gerenciamento de momentos
5. ⏳ Dashboard - Reorganização por momentos
6. ⏳ Formulários - Seleção de momento
7. ⏳ Migração de Dados
8. ✅ Ambiente de Homologação
9. ⏳ Testes
10. ⏳ Deploy Produção

**Documentação:**
- Design e arquitetura: Ver Fase 1 (a ser criado)
- API specs: Ver Fase 3 (a ser criado)
- UI/UX mockups: Ver Fase 4 (a ser criado)

---

## 📖 Documentação Geral

| Documento | Descrição |
|-----------|-----------|
| [README.md](../README.md) | Visão geral e setup do projeto |
| [START_HERE.md](../START_HERE.md) | Ponto de partida para novos desenvolvedores |
| [NEXT_STEPS.md](../NEXT_STEPS.md) | Próximos passos e roadmap |

---

## 🔒 Segurança

| Documento | Descrição |
|-----------|-----------|
| [RELATORIO_AUDITORIA_SEGURANCA_CWE.md](../RELATORIO_AUDITORIA_SEGURANCA_CWE.md) | Relatório completo de auditoria de segurança |
| [ANALISE_SEGURANCA_SENHAS_CWE.md](../ANALISE_SEGURANCA_SENHAS_CWE.md) | Análise de segurança de senhas |

---

## 🗄️ Banco de Dados

### Schema

| Arquivo | Descrição |
|---------|-----------|
| [schema.prisma](../frontend/prisma/schema.prisma) | Schema Prisma do banco de dados |

### Migrations

```bash
# Ver status das migrations
npx prisma migrate status

# Criar nova migration
npx prisma migrate dev --name <nome>

# Aplicar migrations em produção
npx prisma migrate deploy
```

### Seed

```bash
# Popular banco com dados de teste
npm run db:seed
```

Arquivo: [seed.ts](../frontend/prisma/seed.ts)

---

## 🎨 Frontend

### Estrutura

```
frontend/
├── src/
│   ├── app/           # Pages (Next.js App Router)
│   ├── components/    # Componentes React
│   ├── lib/           # Utilitários e configs
│   └── styles/        # Estilos globais
├── public/            # Assets estáticos
└── prisma/            # Schema e migrations
```

### Tecnologias

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, Tailwind CSS
- **Componentes:** Radix UI, shadcn/ui
- **Forms:** React Hook Form, Zod
- **Auth:** NextAuth.js
- **Database:** Prisma ORM
- **Charts:** Recharts
- **Animations:** Framer Motion

---

## 🔧 Comandos Úteis

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Railway (Staging/Produção)

```bash
# Login
railway login

# Link ao projeto
railway link

# Ver logs
railway logs --environment staging --follow

# Executar comando
railway run --environment staging <comando>

# Deploy
railway up --environment staging
```

### Prisma

```bash
# Gerar client
npm run db:generate

# Push schema (dev)
npm run db:push

# Criar migration
npm run db:migrate

# Aplicar migrations (prod)
npx prisma migrate deploy

# Prisma Studio
npm run db:studio

# Seed
npm run db:seed
```

---

## 🌍 Ambientes

| Ambiente | URL | Branch | Database | Propósito |
|----------|-----|--------|----------|-----------|
| **Local** | `localhost:3000` | `feature/*` | PostgreSQL local | Desenvolvimento |
| **Staging** | `nps-staging.railway.app` | `staging` | Railway Postgres | Testes |
| **Production** | `nps.sintegra.com.br` | `main` | Railway Postgres | Produção |

---

## 📊 Monitoramento

### Logs

```bash
# Railway - Staging
railway logs --environment staging --follow

# Railway - Production
railway logs --environment production --follow
```

### Métricas

Acessar Railway Dashboard:
- CPU Usage
- Memory Usage
- Network Traffic
- Database Connections

### Status

- Railway Status: https://status.railway.app/
- Uptime: Ver Railway Dashboard

---

## 🆘 Troubleshooting

### Problemas Comuns

| Problema | Solução | Documento |
|----------|---------|-----------|
| Staging não conecta | Ver troubleshooting | [STAGING_SETUP.md](./STAGING_SETUP.md) |
| Login não funciona | Verificar NEXTAUTH_SECRET | [STAGING_QUICKSTART.md](./STAGING_QUICKSTART.md) |
| Migration falhou | Ver guia de migrations | [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) |
| Deploy falhou | Ver logs Railway | [STAGING_SETUP.md](./STAGING_SETUP.md) |

### Scripts de Diagnóstico

```bash
# Validar staging
./scripts/validate-staging.sh

# Verificar database
railway run --environment staging npx prisma migrate status

# Testar conexão
railway run --environment staging npx prisma db pull
```

---

## 🤝 Contribuindo

### Fluxo de Trabalho

1. Criar feature branch
2. Desenvolver localmente
3. Push para staging
4. Testar em staging
5. Code review
6. Merge para main
7. Deploy produção

Ver: [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)

### Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
refactor: refatora código
test: adiciona testes
chore: tarefas diversas
```

---

## 📞 Suporte

### Railway
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway
- Status: https://status.railway.app/

### Prisma
- Docs: https://www.prisma.io/docs/
- Discord: https://discord.gg/prisma

### Next.js
- Docs: https://nextjs.org/docs
- Discord: https://discord.gg/nextjs

---

## 📝 Changelog

Ver: [CHANGELOG.md](./CHANGELOG.md) (a ser criado)

---

## 📄 Licença

Proprietary - Síntegra

---

**Última atualização:** 2025-11-10
**Versão da documentação:** 1.0
**Mantido por:** Time de Desenvolvimento Síntegra
