# 🔄 Git & GitHub - Sistema NPS Síntegra

Guia de versionamento e boas práticas com Git/GitHub.

## 🎯 Estrutura do Repositório

```
sintegra-nps/                 # Repositório GitHub
├── .git/                     # Controle de versão
├── .gitignore               # Arquivos ignorados
├── README.md                 # Documentação principal
├── NEXT_STEPS.md            # Roadmap
├── CHECKLIST.md             # Checklist
├── docs/                     # Documentação técnica
├── database/                 # Schema Prisma
├── frontend/                 # Aplicação Next.js
└── assets/                   # Logos e imagens
```

---

## 🚀 Setup Inicial

### 1. Inicializar Git (se ainda não fez)

```bash
cd c:/Scripts/NPS

# Inicializar repositório
git init

# Verificar status
git status
```

### 2. Configurar Git (primeira vez)

```bash
# Seu nome
git config --global user.name "Seu Nome"

# Seu email
git config --global user.email "seu.email@sintegra.com.br"

# Editor padrão (VS Code)
git config --global core.editor "code --wait"

# Branch padrão = main
git config --global init.defaultBranch main
```

### 3. Criar `.gitignore` na Raiz

Já existe, mas verifique se tem tudo:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Env files (NUNCA commitar .env com secrets!)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Keep examples
!.env.example

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Prisma
/prisma/migrations/*.sql
!prisma/migrations/migration_lock.toml

# TypeScript
*.tsbuildinfo
next-env.d.ts

# PWA
public/sw.js
public/workbox-*.js
public/sw.js.map
public/workbox-*.js.map

# Vercel
.vercel

# Railway
.railway

# Logs
logs/
*.log
```

### 4. Primeiro Commit

```bash
# Adicionar tudo
git add .

# Verificar o que será commitado
git status

# Primeiro commit
git commit -m "feat: Initial commit - Sistema NPS Síntegra

- Estrutura completa do projeto
- Documentação técnica
- Schema do banco de dados
- Configurações Next.js + Tailwind
- Design system Síntegra aplicado"
```

---

## 📝 Convenção de Commits

Use **Conventional Commits** para commits padronizados:

### Formato

```
<tipo>(<escopo>): <descrição curta>

<descrição detalhada (opcional)>

<footer (opcional)>
```

### Tipos

| Tipo | Quando usar | Exemplo |
|------|-------------|---------|
| `feat` | Nova funcionalidade | `feat(forms): adicionar builder de perguntas` |
| `fix` | Correção de bug | `fix(api): corrigir cálculo de NPS` |
| `docs` | Documentação | `docs(readme): atualizar guia de setup` |
| `style` | Formatação | `style(forms): ajustar espaçamento dos botões` |
| `refactor` | Refatoração | `refactor(auth): simplificar lógica de login` |
| `test` | Testes | `test(nps): adicionar testes de cálculo` |
| `chore` | Manutenção | `chore(deps): atualizar Next.js para 14.1` |
| `perf` | Performance | `perf(dashboard): otimizar queries` |
| `ci` | CI/CD | `ci(railway): configurar deploy automático` |

### Exemplos Bons

```bash
git commit -m "feat(forms): adicionar lógica condicional de perguntas"
git commit -m "fix(responses): corrigir salvamento de progresso"
git commit -m "docs(api): documentar endpoints de relatórios"
git commit -m "style: aplicar cores Síntegra no dashboard"
git commit -m "refactor(nps): extrair cálculo para função separada"
```

### Exemplos Ruins ❌

```bash
git commit -m "alterações"
git commit -m "fix"
git commit -m "WIP"
git commit -m "atualizando coisas"
```

---

## 🌿 Estratégia de Branches

### Branch Principal

- **`main`**: Código em produção (sempre estável)

### Feature Branches

Para cada nova funcionalidade:

```bash
# Criar branch
git checkout -b feature/nome-da-funcionalidade

# Exemplo:
git checkout -b feature/form-builder
git checkout -b feature/nps-calculation
git checkout -b feature/email-distribution
```

### Hotfix Branches

Para correções urgentes em produção:

```bash
git checkout -b hotfix/corrigir-bug-critico
```

### Release Branches (opcional)

```bash
git checkout -b release/v1.0.0
```

---

## 🔄 Workflow de Desenvolvimento

### 1. Criar Nova Funcionalidade

```bash
# 1. Atualizar main
git checkout main
git pull origin main

# 2. Criar branch
git checkout -b feature/form-builder

# 3. Desenvolver...
# (escrever código)

# 4. Commitar progressivamente
git add src/components/forms/FormBuilder.tsx
git commit -m "feat(forms): adicionar componente FormBuilder"

git add src/app/admin/forms/new/page.tsx
git commit -m "feat(forms): criar página de novo formulário"

# 5. Push para GitHub
git push origin feature/form-builder
```

### 2. Criar Pull Request

No GitHub:
1. Vá para o repositório
2. Clique em **"Pull Requests"**
3. Clique em **"New Pull Request"**
4. Compare: `main` ← `feature/form-builder`
5. Adicione descrição:

```markdown
## 📋 Descrição

Implementa o Form Builder drag-and-drop para criação de formulários.

## ✅ Features

- [x] Componente FormBuilder
- [x] Adicionar/remover perguntas
- [x] Preview em tempo real
- [x] Validação de formulário

## 🧪 Testes

- [x] Criar formulário com 5+ perguntas
- [x] Preview responsivo
- [x] Salvar formulário

## 📸 Screenshots

![Form Builder](...)

## 🔗 Issues Relacionadas

Closes #12
```

6. Clique em **"Create Pull Request"**

### 3. Code Review

Aguardar aprovação de outro dev ou tech lead.

### 4. Merge

Após aprovação:
```bash
# No GitHub: clicar em "Merge Pull Request"
# OU via linha de comando:

git checkout main
git pull origin main
git merge feature/form-builder
git push origin main

# Deletar branch local
git branch -d feature/form-builder

# Deletar branch remota
git push origin --delete feature/form-builder
```

---

## 🏷️ Tags e Releases

### Criar Tag de Versão

```bash
# Tag anotada (recomendado)
git tag -a v1.0.0 -m "Release v1.0.0

- Form Builder completo
- Sistema de autenticação
- Dashboard de analytics
- Relatórios PDF"

# Push tags
git push origin v1.0.0

# Ou todas as tags
git push origin --tags
```

### Semantic Versioning

Use **SemVer**: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): Novas features compatíveis
- **PATCH** (0.0.1): Bug fixes

Exemplos:
- `v1.0.0` - Lançamento inicial
- `v1.1.0` - Adicionar relatórios PDF
- `v1.1.1` - Corrigir bug no cálculo NPS
- `v2.0.0` - Mudança na API (breaking)

---

## 🔍 Comandos Úteis

### Status e Histórico

```bash
# Status atual
git status

# Ver mudanças
git diff

# Ver histórico
git log --oneline --graph --all

# Ver commits de um arquivo
git log --follow -- frontend/src/app/api/forms/route.ts
```

### Desfazer Mudanças

```bash
# Desfazer mudanças não commitadas
git checkout -- arquivo.ts

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Desfazer último commit (descarta mudanças)
git reset --hard HEAD~1

# Reverter commit específico
git revert abc123
```

### Stash (Guardar Mudanças)

```bash
# Guardar mudanças temporariamente
git stash

# Listar stashes
git stash list

# Aplicar último stash
git stash pop

# Aplicar stash específico
git stash apply stash@{0}
```

### Branches

```bash
# Listar branches
git branch

# Listar branches remotas
git branch -r

# Deletar branch local
git branch -d nome-da-branch

# Deletar branch forçadamente
git branch -D nome-da-branch
```

---

## 🚫 O Que NUNCA Fazer

### ❌ Nunca Commitar Secrets

```bash
# NUNCA commitar:
.env
.env.local
API keys
Senhas
Tokens
Certificados
```

Se acidentalmente commitou:
```bash
# 1. Remover do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 2. Force push (CUIDADO!)
git push origin --force --all

# 3. TROCAR TODAS AS SENHAS/TOKENS IMEDIATAMENTE!
```

### ❌ Nunca Force Push em `main`

```bash
# NUNCA fazer:
git push origin main --force
```

### ❌ Nunca Commitar `node_modules`

Sempre deve estar no `.gitignore`.

---

## 📦 GitHub Actions (CI/CD)

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint
      
      - name: Type check
        working-directory: ./frontend
        run: npm run type-check
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

---

## 🏷️ Issues e Projects

### Criar Issue

Template de Issue:

```markdown
## 📋 Descrição

Implementar cálculo automático de NPS no dashboard.

## ✅ Tarefas

- [ ] Criar função `calculateNPS()`
- [ ] Integrar com API de responses
- [ ] Adicionar ao dashboard
- [ ] Testes unitários

## 🎯 Critérios de Aceitação

- NPS calculado corretamente (fórmula: (P-D)/T * 100)
- Atualiza em tempo real
- Mostra breakdown (promotores/neutros/detratores)

## 🔗 Links

- [Documentação NPS](docs/API.md#nps)
```

### GitHub Projects

Organizar sprints:
1. Ir em **"Projects"**
2. Criar **"Novo Project"**
3. Template: **"Team backlog"**
4. Adicionar issues nas colunas:
   - 📋 Backlog
   - 🏃 In Progress
   - 👀 In Review
   - ✅ Done

---

## 📊 Estatísticas

Ver contributors, commits, etc:

```bash
# Contributors
git shortlog -sn

# Commits por autor
git log --author="Seu Nome" --oneline | wc -l

# Linhas adicionadas/removidas
git log --author="Seu Nome" --pretty=tformat: --numstat | \
  awk '{ add += $1; subs += $2; loc += $1 - $2 } END \
  { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }'
```

---

## 🆘 Troubleshooting

### Conflitos no Merge

```bash
# 1. Atualizar main
git checkout main
git pull origin main

# 2. Voltar para sua branch
git checkout feature/sua-branch

# 3. Fazer rebase
git rebase main

# 4. Resolver conflitos manualmente
# Editar arquivos conflitantes

# 5. Adicionar arquivos resolvidos
git add arquivo-resolvido.ts

# 6. Continuar rebase
git rebase --continue

# 7. Push (pode precisar force)
git push origin feature/sua-branch --force-with-lease
```

### Recuperar Arquivo Deletado

```bash
git checkout HEAD~1 -- arquivo-deletado.ts
```

---

**Sistema NPS Síntegra - Versionamento Profissional com Git/GitHub**
