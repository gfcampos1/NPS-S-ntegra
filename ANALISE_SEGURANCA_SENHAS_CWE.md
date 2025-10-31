# Análise de Segurança de Senhas - CWE

## ✅ Conformidades Implementadas

### CWE-916: Use of Password Hash With Insufficient Computational Effort
**Status**: ⚠️ **PARCIALMENTE CONFORME**

**Atual**: bcrypt com 10 salt rounds
```typescript
return bcrypt.hash(password, 10)
```

**Recomendação CWE**: Usar **12 ou mais rounds** para segurança adequada

**Impacto**:
- 10 rounds = ~100ms por hash (vulnerável a ataques de força bruta modernos)
- 12 rounds = ~400ms por hash (recomendado para 2025)
- 14 rounds = ~1.6s por hash (ideal para dados críticos)

**Correção necessária**:
```typescript
export async function hashPassword(password: string): Promise<string> {
  // ✅ Aumentar para 12 rounds (mínimo recomendado)
  return bcrypt.hash(password, 12)
}
```

### CWE-521: Weak Password Requirements
**Status**: ⚠️ **PARCIALMENTE CONFORME**

**Implementado**:
- ✅ Mínimo de 8 caracteres
- ❌ Sem validação de complexidade (maiúsculas, minúsculas, números, símbolos)
- ❌ Sem verificação contra senhas comuns
- ❌ Sem verificação de reutilização de senha

**Recomendações**:

1. **Adicionar validação de complexidade**:
```typescript
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres')
  }

  if (password.length > 128) {
    errors.push('Senha muito longa (máximo 128 caracteres)')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial')
  }

  // Verificar padrões comuns
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^admin/i,
  ]

  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('Senha muito comum ou previsível')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

2. **Adicionar verificação de senhas vazadas** (opcional):
```typescript
// Integração com HaveIBeenPwned API
export async function checkPasswordBreach(password: string): Promise<boolean> {
  const crypto = require('crypto')
  const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
  const prefix = hash.substring(0, 5)
  const suffix = hash.substring(5)

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
    const hashes = await response.text()
    
    return hashes.includes(suffix)
  } catch {
    // Em caso de erro, permitir a senha mas logar
    console.warn('Failed to check password breach')
    return false
  }
}
```

### CWE-798: Use of Hard-coded Credentials
**Status**: ✅ **CONFORME**

- ✅ Senhas armazenadas apenas como hash bcrypt
- ✅ Credenciais em variáveis de ambiente (.env)
- ✅ .env excluído do Git via .gitignore

### CWE-257: Storing Passwords in a Recoverable Format
**Status**: ⚠️ **PARCIALMENTE CONFORME**

**Problema**: Campo `tempPassword` armazena senha temporária em **texto claro**

```typescript
// schema.prisma
tempPassword String? // ❌ Armazenada em texto claro
```

**Riscos**:
- Administrador mal-intencionado pode acessar senhas temporárias
- Vazamento de backup do banco expõe senhas
- Viola princípio de "nunca armazenar senhas em texto claro"

**Correção recomendada**:

**Opção 1**: Remover `tempPassword` após exibição ao admin
```typescript
// Após resetar senha
await prisma.user.update({
  where: { id: userId },
  data: {
    password: hashedTempPassword,
    requirePasswordChange: true,
    tempPassword: null, // ✅ Não armazenar
  },
})

return NextResponse.json({
  tempPassword: tempPasswordPlainText, // Apenas retornar na resposta
})
```

**Opção 2**: Usar hash também para tempPassword
```typescript
tempPassword String? // Hash bcrypt da senha temporária
```

**Opção 3**: Sistema de token de reset (mais seguro)
```typescript
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique // Hash do token
  expiresAt DateTime
  used      Boolean  @default(false)
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([token])
  @@index([expiresAt])
}
```

### CWE-307: Improper Restriction of Excessive Authentication Attempts
**Status**: ✅ **CONFORME**

- ✅ Rate limiting implementado
- ✅ 5 tentativas por 5 minutos
- ✅ Bloqueio de 15 minutos após exceder limite

### CWE-620: Unverified Password Change
**Status**: ✅ **CONFORME**

- ✅ Requer senha atual para alterar
- ✅ Validação de senha atual via bcrypt.compare
- ✅ Auditoria de trocas de senha

### CWE-640: Weak Password Recovery Mechanism for Forgotten Password
**Status**: ✅ **CONFORME** (para admin reset)

- ✅ Reset apenas por Super Admin (não self-service)
- ✅ Senha temporária criptograficamente segura (16 chars)
- ✅ Força troca de senha no próximo login

**Limitação**: Não há self-service password reset (pode ser feature futura)

## 📊 Score de Conformidade

| CWE | Descrição | Status | Prioridade |
|-----|-----------|--------|------------|
| CWE-916 | Salt rounds insuficientes | ⚠️ Não Conforme | Alta |
| CWE-521 | Requisitos fracos de senha | ⚠️ Parcial | Média |
| CWE-798 | Credenciais hardcoded | ✅ Conforme | - |
| CWE-257 | Senha recuperável (tempPassword) | ⚠️ Não Conforme | Alta |
| CWE-307 | Rate limiting | ✅ Conforme | - |
| CWE-620 | Troca de senha não verificada | ✅ Conforme | - |
| CWE-640 | Recovery fraco | ✅ Conforme | - |

**Total**: 3/7 totalmente conforme, 2/7 parcialmente conforme, 2/7 não conforme

## 🔧 Correções Prioritárias

### 1. ALTA PRIORIDADE: Aumentar bcrypt rounds
```typescript
// src/lib/auth.ts
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12) // Era 10, agora 12
}
```

### 2. ALTA PRIORIDADE: Remover armazenamento de tempPassword em texto claro
```typescript
// src/app/api/users/[id]/reset-password/route.ts
// Não salvar tempPassword no banco, apenas retornar na response
```

### 3. MÉDIA PRIORIDADE: Adicionar validação de complexidade
```typescript
// Criar src/lib/password-validation.ts com funções de validação
```

## 🎯 Recomendações Futuras

1. **Histórico de senhas**: Prevenir reutilização das últimas 5 senhas
2. **Expiração de senha**: Forçar troca a cada 90 dias (para contas privilegiadas)
3. **MFA/2FA**: Autenticação de dois fatores para Super Admins
4. **Self-service password reset**: Email com token de reset
5. **Força da senha visual**: Barra indicando força durante digitação
6. **Política de senha configurável**: Permitir ajustar requisitos via admin
