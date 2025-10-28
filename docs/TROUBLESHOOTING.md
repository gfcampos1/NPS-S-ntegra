# ⚠️ TROUBLESHOOTING - Erros Comuns

Soluções para problemas frequentes durante o desenvolvimento.

---

## 🎨 Erro: Tailwind CSS IntelliSense

### ❌ Problema

```
Error: Can't resolve 'tailwindcss/package.json' in 'c:/Scripts/NPS/frontend'
Error: Can't resolve 'tailwindcss-animate' in 'C:\Scripts\NPS\frontend'
node_modules doesn't exist or is not a directory
```

### ✅ Solução

**Causa**: As dependências ainda não foram instaladas.

```bash
# 1. Navegue até a pasta frontend
cd c:/Scripts/NPS/frontend

# 2. Instale as dependências
npm install

# 3. Aguarde a instalação (pode levar 2-3 minutos)
# Você verá algo como:
# added 345 packages in 2m

# 4. Reinicie o VS Code
# Pressione Ctrl+Shift+P
# Digite: "Reload Window"
# Ou feche e abra o VS Code novamente
```

### Verificar Instalação

```bash
# Verificar se node_modules existe
ls node_modules

# Verificar se Tailwind foi instalado
ls node_modules/tailwindcss

# Verificar se tailwindcss-animate foi instalado
ls node_modules/tailwindcss-animate
```

### Se o Erro Persistir

```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Gerar Prisma Client
npm run db:generate
```

---

## 🗄️ Erro: Prisma Client Not Generated

### ❌ Problema

```
Error: Cannot find module '@prisma/client'
PrismaClient is unable to be run in the browser
```

### ✅ Solução

```bash
cd frontend

# Gerar Prisma Client
npx prisma generate

# Ou usar o script do package.json
npm run db:generate
```

---

## 🔗 Erro: Database Connection Failed

### ❌ Problema

```
Error: Can't reach database server
P1001: Can't connect to database
```

### ✅ Soluções

#### 1. Verificar `.env.local`

```bash
# Certifique-se que DATABASE_URL está configurada
cat .env.local | grep DATABASE_URL

# Deve retornar algo como:
# DATABASE_URL="postgresql://..."
```

#### 2. Testar Conexão

```bash
# Via Prisma
npx prisma db pull

# Se funcionar, a conexão está OK
```

#### 3. Verificar Supabase/Railway

- Database está rodando?
- IP/porta estão corretos?
- Senha está correta?
- Firewall bloqueando?

#### 4. Railway: Usar URL Interna

No Railway, use a variável de ambiente:
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

---

## 🔐 Erro: NEXTAUTH_SECRET Not Set

### ❌ Problema

```
Error: NEXTAUTH_SECRET environment variable is not set
```

### ✅ Solução

```bash
# 1. Gerar secret
openssl rand -base64 32

# 2. Adicionar no .env.local
echo 'NEXTAUTH_SECRET="seu-secret-gerado-aqui"' >> .env.local

# 3. Reiniciar servidor
npm run dev
```

---

## 🏗️ Erro: Build Failed

### ❌ Problema

```
Error: Build failed
Type error: ...
```

### ✅ Soluções

#### 1. Verificar Erros de TypeScript

```bash
# Rodar type check
npm run type-check

# Ver erros específicos
```

#### 2. Limpar Build

```bash
# Deletar .next
rm -rf .next

# Rebuild
npm run build
```

#### 3. Verificar Imports

Certifique-se que todos os imports estão corretos:
```typescript
// ❌ Errado
import { Button } from 'components/ui/button'

// ✅ Correto
import { Button } from '@/components/ui/button'
```

---

## 📦 Erro: Module Not Found

### ❌ Problema

```
Error: Cannot find module 'next/server'
Module not found: Can't resolve '@/lib/prisma'
```

### ✅ Soluções

#### 1. Reinstalar Dependências

```bash
npm install
```

#### 2. Verificar Path Aliases

No `tsconfig.json`, deve ter:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 3. Criar Arquivo Faltante

Se o erro é sobre um arquivo que você criou:
```bash
# Exemplo: criar lib/prisma.ts
mkdir -p src/lib
touch src/lib/prisma.ts
```

---

## 🎨 Erro: Tailwind Classes Não Funcionam

### ❌ Problema

Classes Tailwind não aplicam estilos.

### ✅ Soluções

#### 1. Verificar `globals.css` Importado

```typescript
// src/app/layout.tsx
import '@/styles/globals.css'  // ← Deve estar aqui
```

#### 2. Verificar `tailwind.config.ts`

```typescript
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}', // ← Importante!
  ],
}
```

#### 3. Reiniciar Dev Server

```bash
# Ctrl+C para parar
npm run dev
```

---

## 🚀 Erro: Railway Deploy Failed

### ❌ Problema

Deploy no Railway falha.

### ✅ Soluções

#### 1. Ver Logs

```bash
railway logs
```

#### 2. Verificar `railway.json`

Deve estar em `frontend/railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start"
  }
}
```

#### 3. Verificar Root Directory

No Railway:
- Settings → Build
- **Root Directory**: `frontend`

#### 4. Variáveis de Ambiente

Certifique-se que todas estão configuradas no Railway.

---

## 🔄 Erro: Git Push Rejected

### ❌ Problema

```
! [rejected]        main -> main (fetch first)
error: failed to push some refs
```

### ✅ Solução

```bash
# 1. Atualizar local
git pull origin main

# 2. Resolver conflitos (se houver)
# Editar arquivos manualmente

# 3. Commitar merge
git add .
git commit -m "merge: Resolver conflitos"

# 4. Push novamente
git push origin main
```

---

## 💾 Erro: Out of Memory

### ❌ Problema

```
FATAL ERROR: Reached heap limit
JavaScript heap out of memory
```

### ✅ Soluções

#### 1. Aumentar Memória do Node

```bash
# Windows (PowerShell)
$env:NODE_OPTIONS="--max-old-space-size=4096"

# Linux/Mac
export NODE_OPTIONS="--max-old-space-size=4096"

# Rodar build novamente
npm run build
```

#### 2. Otimizar Next.js Config

```javascript
// next.config.js
module.exports = {
  experimental: {
    workerThreads: false,
    cpus: 1
  }
}
```

---

## 🌐 Erro: CORS

### ❌ Problema

```
Access to fetch blocked by CORS policy
```

### ✅ Solução

Adicionar headers no `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ]
  },
}
```

---

## 📱 Erro: PWA Não Funciona

### ❌ Problema

App não instala como PWA no mobile.

### ✅ Soluções

#### 1. Verificar HTTPS

PWA só funciona com HTTPS (exceto localhost).

#### 2. Verificar `manifest.json`

Deve estar em `public/manifest.json`:
```json
{
  "name": "Síntegra NPS",
  "short_name": "NPS",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#4169B1",
  "theme_color": "#4169B1",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

#### 3. Verificar Service Worker

```javascript
// public/sw.js deve existir
```

---

## 🔍 Depuração Geral

### Limpar Tudo e Recomeçar

```bash
# 1. Limpar caches
npm cache clean --force

# 2. Deletar arquivos temporários
rm -rf node_modules
rm -rf .next
rm package-lock.json

# 3. Reinstalar
npm install

# 4. Gerar Prisma
npx prisma generate

# 5. Testar
npm run dev
```

### Verificar Versões

```bash
node --version    # Deve ser >= 18
npm --version     # Deve ser >= 9
```

### Logs Detalhados

```bash
# Next.js com debug
npm run dev -- --debug

# Ver todas as variáveis de ambiente
npm run dev -- --experimental-debug-mode
```

---

## 🆘 Ainda com Problemas?

1. **Leia a documentação**: `docs/`
2. **Verifique logs**: Console do navegador (F12)
3. **GitHub Issues**: Criar issue detalhada
4. **Stack Overflow**: Buscar erro específico

### Template de Issue

```markdown
## 🐛 Bug Report

**Descrição:**
[Descreva o problema]

**Passos para Reproduzir:**
1. 
2. 
3. 

**Comportamento Esperado:**
[O que deveria acontecer]

**Comportamento Atual:**
[O que está acontecendo]

**Ambiente:**
- OS: Windows 10
- Node: 18.17.0
- npm: 9.8.1
- Browser: Chrome 120

**Logs:**
```
[Cole logs de erro aqui]
```

**Screenshots:**
[Se aplicável]
```

---

**Troubleshooting - Sistema NPS Síntegra**
