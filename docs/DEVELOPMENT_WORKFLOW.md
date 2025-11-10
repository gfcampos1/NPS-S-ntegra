# 🔄 Workflow de Desenvolvimento com Staging

## 📋 Visão Geral

Este documento descreve o fluxo de trabalho para desenvolvimento e deploy da feature **"Momentos de Pesquisa"** usando o ambiente de staging.

---

## 🎯 Princípios

1. **Nunca desenvolver diretamente em produção**
2. **Todo código passa por staging antes de produção**
3. **Staging deve espelhar produção o máximo possível**
4. **Validação completa em staging antes do deploy**
5. **Rollback rápido se algo der errado**

---

## 🌳 Estrutura de Branches

```
main (production)
  ├── staging (ambiente de homologação)
  └── feature/survey-moments (desenvolvimento)
      └── claude/survey-moments-structure-...
```

### **Branches**

| Branch | Ambiente | Propósito |
|--------|----------|-----------|
| `main` | Production | Código estável em produção |
| `staging` | Staging | Testes e validação |
| `feature/*` | Desenvolvimento | Novas features |
| `hotfix/*` | Production | Correções urgentes |

---

## 🔄 Fluxo de Desenvolvimento

### **Fase 1: Desenvolvimento Local**

```bash
# 1. Criar/atualizar branch de feature
git checkout -b feature/survey-moments

# 2. Desenvolver localmente
npm run dev

# 3. Testar localmente
npm run type-check
npm run lint

# 4. Commit incremental
git add .
git commit -m "feat: adiciona modelo SurveyMoment"

# 5. Push para GitHub
git push origin feature/survey-moments
```

**Ambiente:** `localhost:3000`
**Database:** Local PostgreSQL
**Dados:** Seed de desenvolvimento

---

### **Fase 2: Deploy para Staging**

```bash
# 1. Merge feature branch → staging (ou push direto)
git checkout staging
git merge feature/survey-moments

# 2. Push para staging
git push origin staging

# 3. Railway faz deploy automático
# (Aguardar 5-10 minutos)

# 4. Verificar logs
railway logs --environment staging --follow

# 5. Validar deploy
./scripts/validate-staging.sh
```

**Ambiente:** `nps-staging.railway.app`
**Database:** PostgreSQL Staging (Railway)
**Dados:** Seed de staging ou dados de teste

---

### **Fase 3: Testes em Staging**

#### **Testes Manuais**

- [ ] Login como admin
- [ ] Testar criação de Momento
- [ ] Testar associação de formulário a momento
- [ ] Testar dashboard por momentos
- [ ] Testar ordenação por data
- [ ] Testar filtros
- [ ] Validar responsividade
- [ ] Testar em diferentes navegadores

#### **Testes Automatizados (se houver)**

```bash
# Executar testes contra staging
STAGING_URL=https://nps-staging.railway.app npm run test:e2e
```

#### **Testes de Performance**

```bash
# Lighthouse
npx lighthouse https://nps-staging.railway.app

# Load testing (opcional)
artillery quick --count 10 -n 20 https://nps-staging.railway.app
```

---

### **Fase 4: Validação com Stakeholders**

1. **Compartilhar URL staging** com time
2. **Apresentar funcionalidade** (demo)
3. **Coletar feedback** e bugs
4. **Iterar** se necessário (voltar Fase 1)
5. **Obter aprovação** para produção

**Checklist de Aprovação:**
- [ ] Funcionalidade atende requisitos
- [ ] Sem bugs críticos
- [ ] Performance aceitável
- [ ] UX validada
- [ ] Aprovação do Product Owner
- [ ] Documentação atualizada

---

### **Fase 5: Deploy para Produção**

#### **5.1 Preparação**

```bash
# 1. Criar backup do banco de produção
pg_dump $PROD_DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Documentar plano de rollback
# Ver seção "Rollback" abaixo

# 3. Comunicar ao time
# "Deploy agendado para [data/hora]"
```

#### **5.2 Deploy**

```bash
# 1. Merge staging → main
git checkout main
git merge staging

# 2. Tag de versão
git tag -a v1.1.0 -m "Release: Momentos de Pesquisa"

# 3. Push para produção
git push origin main --tags

# 4. Railway faz deploy automático
# (Aguardar 5-10 minutos)

# 5. Validar deploy
railway logs --environment production --follow
```

#### **5.3 Verificação Pós-Deploy**

```bash
# Smoke tests em produção
curl -I https://nps.sintegra.com.br
# Deve retornar 200 OK

# Testar login
# Testar criação de momento
# Verificar dashboard
# Monitorar métricas
```

#### **5.4 Comunicação**

- [ ] Avisar time que deploy foi concluído
- [ ] Atualizar documentação
- [ ] Enviar changelog para usuários (se aplicável)
- [ ] Monitorar logs por 1 hora

---

## 🔙 Rollback

### **Quando fazer rollback?**

- Erros críticos em produção
- Performance degradada significativamente
- Funcionalidade não funciona como esperado
- Dados corrompidos

### **Como fazer rollback?**

#### **Opção 1: Revert Commit (Recomendado)**

```bash
# 1. Identificar commit problemático
git log --oneline

# 2. Revert
git revert <commit-hash>

# 3. Push
git push origin main

# 4. Railway faz deploy do revert automaticamente
```

#### **Opção 2: Rollback via Railway UI**

1. Acessar Railway Dashboard
2. Ir em **Deployments**
3. Selecionar deployment anterior estável
4. Clicar em **Redeploy**

#### **Opção 3: Rollback de Database (Extremo)**

```bash
# CUIDADO: Isso apaga dados novos!
psql $PROD_DATABASE_URL < backup-YYYYMMDD-HHMMSS.sql

# Executar migration reversa
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## 📊 Monitoramento

### **Métricas a Monitorar**

| Métrica | Ferramenta | Alerta |
|---------|-----------|--------|
| Uptime | Railway | < 99% |
| Response Time | Railway | > 2s |
| Error Rate | Logs | > 1% |
| CPU Usage | Railway | > 80% |
| Memory Usage | Railway | > 80% |
| Database Connections | Railway | > 80 |

### **Logs**

```bash
# Produção
railway logs --environment production --follow

# Staging
railway logs --environment staging --follow

# Filtrar erros
railway logs --environment production | grep ERROR
```

### **Alertas**

Configurar no Railway:
- Email quando deploy falha
- Email quando CPU > 80%
- Email quando serviço fica offline

---

## 🔐 Segurança

### **Checklist de Segurança**

- [ ] Secrets não commitados
- [ ] API keys rotacionadas entre staging/prod
- [ ] Dados sensíveis sanitizados em staging
- [ ] HTTPS ativo
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente
- [ ] Headers de segurança ativos
- [ ] Autenticação funcionando
- [ ] Logs não expõem secrets

---

## 📝 Documentação

### **Manter Atualizado**

- [ ] README.md
- [ ] CHANGELOG.md
- [ ] API documentation
- [ ] Environment variables guide
- [ ] Deployment guide

---

## 🎯 Exemplo Completo: Feature "Momentos de Pesquisa"

### **Dia 1-2: Setup Staging**

```bash
# Setup inicial
railway environment create staging
railway add --database postgres --environment staging

# Deploy inicial
git push origin staging
railway deploy --environment staging

# Validar
./scripts/validate-staging.sh
```

### **Dia 3-5: Desenvolvimento**

```bash
# Fase 1: Schema
prisma migrate dev --name add_survey_moments

# Fase 2: Backend APIs
# ... implementar APIs ...

# Fase 3: Frontend
# ... implementar UI ...

# Deploy staging após cada fase
git push origin staging
```

### **Dia 6: Testes e Validação**

```bash
# Testes manuais em staging
# Feedback do time
# Correções de bugs

# Iterar até aprovação
```

### **Dia 7: Deploy Produção**

```bash
# Backup
pg_dump $PROD_DATABASE_URL > backup.sql

# Deploy
git checkout main
git merge staging
git push origin main

# Validar
# Monitorar por 1 hora
```

---

## 🚨 Troubleshooting

### **Deploy em Staging Falhou**

```bash
# Ver logs
railway logs --environment staging

# Rebuild
railway redeploy --environment staging

# Verificar variáveis
railway variables --environment staging
```

### **Migration Falhou**

```bash
# Ver status
railway run --environment staging npx prisma migrate status

# Aplicar manualmente
railway run --environment staging npx prisma migrate deploy

# Reset (CUIDADO em prod!)
railway run --environment staging npx prisma migrate reset
```

### **Produção com Problemas**

```bash
# 1. Verificar métricas Railway
# 2. Ver logs de erro
railway logs --environment production | grep ERROR

# 3. Se crítico, fazer rollback imediato
git revert HEAD
git push origin main

# 4. Investigar causa em staging
```

---

## 📞 Contatos de Emergência

**Produção Down?**
1. Verificar Railway Status: https://status.railway.app
2. Fazer rollback imediatamente
3. Notificar time no Slack/Discord
4. Investigar em staging

**Dúvidas Técnicas?**
- Railway Discord: https://discord.gg/railway
- Prisma Discord: https://discord.gg/prisma
- Next.js Discord: https://discord.gg/nextjs

---

## 📌 Boas Práticas

1. **Commits pequenos e frequentes**
2. **Messages descritivos** (conventional commits)
3. **Testar em staging** antes de produção
4. **Backup antes de deploy** em produção
5. **Monitorar após deploy** por 1 hora
6. **Documentar mudanças** no CHANGELOG
7. **Comunicar ao time** sobre deploys
8. **Nunca committar secrets**
9. **Code review** antes de merge
10. **Plano de rollback** sempre pronto

---

**Última atualização:** 2025-11-10
**Versão:** 1.0
**Autor:** Claude (Anthropic)
