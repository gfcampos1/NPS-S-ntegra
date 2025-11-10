# ✅ Checklist - Configuração Ambiente Staging

Use este checklist para garantir que o ambiente de staging foi configurado corretamente.

---

## 📋 Pré-Requisitos

- [ ] Acesso ao Railway Dashboard
- [ ] Repositório GitHub conectado ao Railway
- [ ] Acesso ao branch de desenvolvimento
- [ ] Railway CLI instalado (opcional)

---

## 🏗️ Configuração Inicial

### **1. Ambiente Railway**

- [ ] Ambiente `staging` criado no Railway
- [ ] Ambiente isolado do production
- [ ] Nome do ambiente: `staging`

### **2. Banco de Dados**

- [ ] PostgreSQL adicionado ao ambiente staging
- [ ] Banco separado do production
- [ ] `DATABASE_URL` gerada automaticamente
- [ ] Conexão testada

### **3. Serviço Frontend**

- [ ] Serviço frontend criado no staging
- [ ] Branch configurado: `claude/survey-moments-structure-011CUzvYqawdBPmyRzZ95qRk`
- [ ] Root directory: `frontend`
- [ ] Build command configurado (via railway.json)
- [ ] Start command configurado (via railway.json)

---

## ⚙️ Variáveis de Ambiente

### **Obrigatórias**

- [ ] `DATABASE_URL` - Conectada ao Postgres staging
- [ ] `NEXTAUTH_URL` - Domínio público do Railway
- [ ] `NEXTAUTH_SECRET` - Secret única (32+ chars)
- [ ] `NEXT_PUBLIC_APP_URL` - Domínio público
- [ ] `NEXT_PUBLIC_API_URL` - Domínio/api
- [ ] `NODE_ENV=staging`

### **Opcionais mas Recomendadas**

- [ ] `RESEND_API_KEY` - Para testes de email
- [ ] `RESEND_FROM_EMAIL` - Email staging
- [ ] `RESEND_FROM_NAME` - Nome com [STAGING]
- [ ] Feature flags configuradas
- [ ] Rate limiting configurado

---

## 🚀 Deploy e Inicialização

### **Deploy Inicial**

- [ ] Primeiro deploy executado com sucesso
- [ ] Build completou sem erros
- [ ] Migrations executadas automaticamente
- [ ] Serviço está "running"
- [ ] Logs não mostram erros críticos

### **Domínio**

- [ ] Domínio Railway gerado automaticamente
- [ ] Domínio acessível via browser
- [ ] HTTPS funcionando
- [ ] `NEXTAUTH_URL` aponta para domínio correto

---

## 🗄️ Banco de Dados

### **Migrations**

- [ ] Migrations aplicadas com sucesso
- [ ] Schema atualizado
- [ ] Tabelas criadas corretamente

Verificar com:
```bash
railway run --environment staging npx prisma migrate status
```

### **Dados de Teste**

- [ ] Seed executado (se aplicável)
- [ ] Super Admin criado
- [ ] Dados de teste populados (opcional)

Executar seed:
```bash
railway run --environment staging npm run db:seed
```

---

## 🔐 Segurança e Acesso

### **Autenticação**

- [ ] Login com super admin funciona
- [ ] NextAuth funcionando corretamente
- [ ] Sessions persistem
- [ ] Logout funciona

### **Credenciais de Teste**

- [ ] Email: `admin@sintegra.com.br`
- [ ] Senha: `Admin123!` (padrão seed)
- [ ] Senha alterada após primeiro login (recomendado)

### **Proteções**

- [ ] API keys staging (não production)
- [ ] Dados sensíveis não expostos
- [ ] Logs não mostram secrets
- [ ] HTTPS ativo

---

## 🧪 Testes Funcionais

### **Navegação**

- [ ] Home page carrega
- [ ] Login page carrega
- [ ] Dashboard admin carrega
- [ ] Sidebar funciona
- [ ] Navegação entre páginas OK

### **Funcionalidades Core**

- [ ] Dashboard mostra dados
- [ ] Formulários listam corretamente
- [ ] Criar novo formulário funciona
- [ ] Editar formulário funciona
- [ ] Respondentes aparecem
- [ ] Feedbacks carregam

### **Performance**

- [ ] Tempo de carregamento < 3s
- [ ] Sem timeouts
- [ ] Queries otimizadas
- [ ] Imagens carregam

---

## 📊 Monitoramento

### **Logs**

- [ ] Logs acessíveis via Railway dashboard
- [ ] Logs via CLI funcionam
- [ ] Sem erros críticos nos logs
- [ ] Warnings investigados

```bash
railway logs --environment staging --follow
```

### **Métricas**

- [ ] CPU usage monitorado
- [ ] Memory usage OK (<80%)
- [ ] Database connections OK
- [ ] Network traffic normal

### **Alertas**

- [ ] Notificações Railway configuradas (opcional)
- [ ] Email de alertas configurado (opcional)

---

## 🔄 CI/CD

### **Deploy Automático**

- [ ] Push para branch staging → deploy automático
- [ ] Webhook GitHub configurado
- [ ] Deploy pipeline verde
- [ ] Rollback disponível

### **Branches**

- [ ] Branch staging sincronizada com repo
- [ ] Auto-deploy habilitado
- [ ] Deploy on push configurado

---

## 📚 Documentação

- [ ] `.env.staging.example` criado
- [ ] `STAGING_SETUP.md` revisado
- [ ] Time informado sobre staging
- [ ] Credenciais compartilhadas (seguramente)

---

## ✨ Validação Final

### **Smoke Tests**

Execute os seguintes testes no staging:

```bash
# 1. Login como admin
✓ Acessar /login
✓ Entrar com credenciais seed
✓ Redirecionar para /admin/dashboard

# 2. Dashboard
✓ Carregar estatísticas
✓ Ver formulários
✓ Ver gráficos

# 3. Formulários
✓ Listar formulários
✓ Criar novo formulário
✓ Editar formulário existente
✓ Preview de formulário

# 4. Respondentes
✓ Listar respondentes
✓ Ver detalhes

# 5. Feedbacks
✓ Carregar feedbacks
✓ Filtrar por formulário
```

---

## 🎯 Próximos Passos

Após completar este checklist:

1. ✅ Staging está pronto para desenvolvimento
2. ✅ Começar implementação de "Momentos de Pesquisa"
3. ✅ Testar cada fase em staging antes de produção
4. ✅ Validar com stakeholders
5. ✅ Deploy para produção quando aprovado

---

## 🆘 Troubleshooting

### **Deploy Falhou**

```bash
# Ver erro específico
railway logs --environment staging

# Rebuild
railway redeploy --environment staging
```

### **Database Não Conecta**

```bash
# Verificar variável
railway variables --environment staging | grep DATABASE

# Testar conexão
railway run --environment staging npx prisma db pull
```

### **Login Não Funciona**

- Verificar `NEXTAUTH_SECRET` configurado
- Verificar `NEXTAUTH_URL` correto
- Verificar seed executou
- Limpar cookies do browser

### **Performance Ruim**

- Verificar métricas Railway
- Verificar logs de erro
- Otimizar queries Prisma
- Considerar upgrade de plano

---

## 📞 Contatos

**Railway Support:**
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway

**Time Interno:**
- Tech Lead: [adicionar]
- DevOps: [adicionar]

---

**Data Configuração:** __/__/____
**Configurado por:** _____________
**Revisado por:** _____________
**Status:** [ ] Pendente [ ] Em Progresso [ ] Completo

---

**Assinaturas:**

- [ ] Configuração técnica aprovada
- [ ] Testes funcionais aprovados
- [ ] Segurança validada
- [ ] Pronto para desenvolvimento
