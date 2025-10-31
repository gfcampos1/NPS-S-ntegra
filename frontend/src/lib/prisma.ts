import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Remover 'query' para não expor SQL em logs (CWE-522)
    // Em produção, não logar nada para evitar exposição de dados sensíveis
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
