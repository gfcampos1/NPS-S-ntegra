/**
 * Validação de força de senha de acordo com CWE-521
 * Previne senhas fracas e comuns
 */

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number // 0-100
}

/**
 * Valida força e complexidade da senha
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // Comprimento
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres')
  } else if (password.length >= 8) {
    score += 20
  }
  
  if (password.length >= 12) {
    score += 10
  }
  
  if (password.length >= 16) {
    score += 10
  }

  if (password.length > 128) {
    errors.push('Senha muito longa (máximo 128 caracteres)')
    return { valid: false, errors, strength: 'weak', score: 0 }
  }

  // Letras minúsculas
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula')
  } else {
    score += 15
  }

  // Letras maiúsculas
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula')
  } else {
    score += 15
  }

  // Números
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número')
  } else {
    score += 15
  }

  // Caracteres especiais
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial (!@#$%...)')
  } else {
    score += 15
  }

  // Verificar padrões comuns (CWE-521)
  const commonPatterns = [
    { pattern: /^123456/, message: 'Senha muito comum (123456...)' },
    { pattern: /^password/i, message: 'Senha muito comum (password)' },
    { pattern: /^qwerty/i, message: 'Senha muito comum (qwerty)' },
    { pattern: /^abc123/i, message: 'Senha muito comum (abc123)' },
    { pattern: /^admin/i, message: 'Senha muito comum (admin)' },
    { pattern: /^letmein/i, message: 'Senha muito comum (letmein)' },
    { pattern: /^welcome/i, message: 'Senha muito comum (welcome)' },
    { pattern: /^monkey/i, message: 'Senha muito comum (monkey)' },
    { pattern: /^1234567890/, message: 'Sequência numérica muito óbvia' },
    { pattern: /^(.)\1{3,}/, message: 'Muitos caracteres repetidos' },
  ]

  for (const { pattern, message } of commonPatterns) {
    if (pattern.test(password)) {
      errors.push(message)
      score = Math.max(0, score - 30)
    }
  }

  // Verificar sequências
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    errors.push('Evite sequências alfabéticas')
    score = Math.max(0, score - 10)
  }

  // Bonus: diversidade de caracteres
  const uniqueChars = new Set(password).size
  if (uniqueChars >= password.length * 0.7) {
    score += 10
  }

  // Determinar força baseada no score
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  
  if (score < 40) {
    strength = 'weak'
  } else if (score < 60) {
    strength = 'medium'
  } else if (score < 80) {
    strength = 'strong'
  } else {
    strength = 'very-strong'
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score: Math.min(100, score),
  }
}

/**
 * Verifica se senha é comum (top 10000 senhas mais usadas)
 * Para uso futuro com lista completa
 */
export function isCommonPassword(password: string): boolean {
  const top100Common = [
    '123456', 'password', '12345678', 'qwerty', '123456789',
    '12345', '1234', '111111', '1234567', 'dragon',
    '123123', 'baseball', 'iloveyou', 'trustno1', '1234567890',
    'sunshine', 'master', 'welcome', 'shadow', 'ashley',
    'football', 'jesus', 'michael', 'ninja', 'mustang',
    'password1', '123321', 'admin', 'letmein', 'monkey',
  ]

  return top100Common.includes(password.toLowerCase())
}

/**
 * Gera sugestões para melhorar a senha
 */
export function getPasswordImprovementSuggestions(result: PasswordValidationResult): string[] {
  const suggestions: string[] = []

  if (result.errors.length === 0) {
    return ['Sua senha está forte! 🎉']
  }

  if (result.errors.some(e => e.includes('8 caracteres'))) {
    suggestions.push('💡 Adicione mais caracteres (recomendado: 12+)')
  }

  if (result.errors.some(e => e.includes('minúscula'))) {
    suggestions.push('💡 Inclua letras minúsculas (a-z)')
  }

  if (result.errors.some(e => e.includes('maiúscula'))) {
    suggestions.push('💡 Inclua letras maiúsculas (A-Z)')
  }

  if (result.errors.some(e => e.includes('número'))) {
    suggestions.push('💡 Inclua números (0-9)')
  }

  if (result.errors.some(e => e.includes('especial'))) {
    suggestions.push('💡 Inclua caracteres especiais (!@#$%)')
  }

  if (result.errors.some(e => e.includes('comum'))) {
    suggestions.push('⚠️ Evite senhas comuns ou previsíveis')
  }

  if (result.errors.some(e => e.includes('sequência'))) {
    suggestions.push('⚠️ Evite sequências como "abc" ou "123"')
  }

  return suggestions
}

/**
 * Retorna cor para barra de força da senha
 */
export function getPasswordStrengthColor(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'strong':
      return 'bg-blue-500'
    case 'very-strong':
      return 'bg-green-500'
  }
}

/**
 * Retorna texto descritivo da força
 */
export function getPasswordStrengthLabel(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'weak':
      return 'Fraca'
    case 'medium':
      return 'Média'
    case 'strong':
      return 'Forte'
    case 'very-strong':
      return 'Muito Forte'
  }
}
