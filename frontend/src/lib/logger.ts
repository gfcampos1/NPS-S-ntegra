import { PrismaClient } from '@prisma/client'

type LogLevel = 'ERROR' | 'WARN' | 'INFO'

interface LogContext {
  userId?: string
  action?: string
  entityType?: string
  entityId?: string
  ipAddress?: string
}

class SecureLogger {
  private prisma = new PrismaClient()

  /**
   * Remove dados sensíveis antes de logar
   */
  private sanitize(data: any): any {
    if (!data) return data

    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'accessToken',
      'refreshToken',
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'RESEND_API_KEY',
      'CLOUDINARY_API_SECRET',
      'authorization',
      'cookie',
    ]

    // Se é string, verificar se contém informações sensíveis
    if (typeof data === 'string') {
      for (const key of sensitiveKeys) {
        if (data.toLowerCase().includes(key.toLowerCase())) {
          return '[REDACTED]'
        }
      }
      return data
    }

    // Se é objeto, sanitizar recursivamente
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = Array.isArray(data) ? [] : {}

      for (const key of Object.keys(data)) {
        const lowerKey = key.toLowerCase()
        const isSensitive = sensitiveKeys.some((sk) =>
          lowerKey.includes(sk.toLowerCase())
        )

        if (isSensitive) {
          sanitized[key] = '[REDACTED]'
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          sanitized[key] = this.sanitize(data[key])
        } else {
          sanitized[key] = data[key]
        }
      }

      return sanitized
    }

    return data
  }

  /**
   * Loga erro de forma segura
   */
  async error(message: string, error: Error | unknown, context?: LogContext) {
    const sanitizedError = this.sanitize({
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Error',
      // ❌ NÃO incluir: error.stack (pode revelar paths internos em produção)
    })

    // Logs em produção vão apenas para o banco de dados
    if (process.env.NODE_ENV === 'production') {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: context?.userId || null,
            action: `ERROR_${context?.action || 'UNKNOWN'}`,
            entityType: context?.entityType || 'System',
            entityId: context?.entityId || 'N/A',
            changes: sanitizedError,
            ipAddress: context?.ipAddress || null,
            userAgent: null,
          },
        })
      } catch (logError) {
        // Evitar loop infinito se logging falhar
        console.error('Failed to log error to database:', logError)
      }
    } else {
      // Em desenvolvimento, console.error é aceitável
      console.error(`[${context?.action || 'ERROR'}]`, message, sanitizedError)
    }
  }

  /**
   * Loga warning de forma segura
   */
  async warn(message: string, data?: any, context?: LogContext) {
    const sanitizedData = this.sanitize(data)

    if (process.env.NODE_ENV === 'production') {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: context?.userId || null,
            action: `WARN_${context?.action || 'UNKNOWN'}`,
            entityType: context?.entityType || 'System',
            entityId: context?.entityId || 'N/A',
            changes: { message, data: sanitizedData },
            ipAddress: context?.ipAddress || null,
            userAgent: null,
          },
        })
      } catch (logError) {
        console.error('Failed to log warning to database:', logError)
      }
    } else {
      console.warn(`[${context?.action || 'WARN'}]`, message, sanitizedData)
    }
  }

  /**
   * Loga informações importantes (apenas em desenvolvimento)
   */
  info(message: string, data?: any, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      const sanitizedData = this.sanitize(data)
      console.log(`[${context?.action || 'INFO'}]`, message, sanitizedData)
    }
  }
}

export const logger = new SecureLogger()
