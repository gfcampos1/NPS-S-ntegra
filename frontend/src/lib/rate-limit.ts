import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

/**
 * Rate limiting simples em memória
 * Para produção, considerar usar Redis ou Upstash
 */
export function rateLimit(
  request: NextRequest,
  options: { max: number; windowMs: number } = { max: 10, windowMs: 60000 }
): { success: boolean; remaining: number; resetAt: number } {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const key = `${ip}:${request.nextUrl.pathname}`

  const now = Date.now()
  const record = store[key]

  // Primeira requisição ou janela expirada
  if (!record || now > record.resetAt) {
    store[key] = {
      count: 1,
      resetAt: now + options.windowMs,
    }
    return { success: true, remaining: options.max - 1, resetAt: now + options.windowMs }
  }

  // Limite atingido
  if (record.count >= options.max) {
    return { success: false, remaining: 0, resetAt: record.resetAt }
  }

  // Incrementar contador
  record.count++
  return {
    success: true,
    remaining: options.max - record.count,
    resetAt: record.resetAt,
  }
}

/**
 * Limpar registros antigos a cada 5 minutos
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const key in store) {
      if (store[key].resetAt < now) {
        delete store[key]
      }
    }
  }, 5 * 60 * 1000)
}
