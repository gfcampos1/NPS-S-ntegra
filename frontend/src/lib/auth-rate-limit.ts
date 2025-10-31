interface LoginAttempt {
  count: number
  lockedUntil?: number
  lastAttempt: number
}

const loginAttempts = new Map<string, LoginAttempt>()

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutos
const WINDOW_MS = 5 * 60 * 1000 // Janela de 5 minutos

/**
 * Verifica rate limit para tentativas de login
 * Bloqueia conta após 5 tentativas falhadas em 5 minutos
 */
export function checkLoginRateLimit(email: string): {
  allowed: boolean
  remainingAttempts: number
  lockedUntil?: Date
} {
  const now = Date.now()
  const normalizedEmail = email.toLowerCase().trim()
  const attempt = loginAttempts.get(normalizedEmail)

  // Sem tentativas anteriores
  if (!attempt) {
    loginAttempts.set(normalizedEmail, {
      count: 1,
      lastAttempt: now,
    })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 }
  }

  // Conta bloqueada
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(attempt.lockedUntil),
    }
  }

  // Reset se janela expirou
  if (now - attempt.lastAttempt > WINDOW_MS) {
    loginAttempts.set(normalizedEmail, {
      count: 1,
      lastAttempt: now,
    })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 }
  }

  // Incrementar tentativas
  attempt.count++
  attempt.lastAttempt = now

  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCK_DURATION_MS
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(attempt.lockedUntil),
    }
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - attempt.count,
  }
}

/**
 * Reseta tentativas de login após sucesso
 */
export function resetLoginAttempts(email: string) {
  loginAttempts.delete(email.toLowerCase().trim())
}

/**
 * Limpar tentativas antigas a cada 30 minutos
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [email, attempt] of loginAttempts.entries()) {
      // Remover se passou mais de 30 minutos desde a última tentativa
      if (now - attempt.lastAttempt > 30 * 60 * 1000) {
        loginAttempts.delete(email)
      }
    }
  }, 30 * 60 * 1000)
}
