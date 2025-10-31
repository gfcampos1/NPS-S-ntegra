import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse JSON de forma segura, retornando um valor padrão se falhar
 * Previne crashes da aplicação por JSON malformado (CWE-20)
 */
export function safeJsonParse<T = any>(
  json: string | null | undefined,
  defaultValue: T
): T {
  if (!json || typeof json !== 'string') {
    return defaultValue
  }

  try {
    const parsed = JSON.parse(json)
    return parsed as T
  } catch {
    return defaultValue
  }
}
