import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword, hashPassword } from '@/lib/auth'
import { checkLoginRateLimit, resetLoginAttempts } from '@/lib/auth-rate-limit'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        // Rate limiting: bloquear após 5 tentativas falhadas (CWE-307)
        const rateLimit = checkLoginRateLimit(credentials.email)
        if (!rateLimit.allowed) {
          const minutesLeft = Math.ceil(
            ((rateLimit.lockedUntil?.getTime() || 0) - Date.now()) / 60000
          )
          throw new Error(
            `Muitas tentativas de login. Conta bloqueada por ${minutesLeft} minutos.`
          )
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // Timing attack protection: sempre fazer hash mesmo se usuário não existir (CWE-200)
        if (!user) {
          await hashPassword('dummy-password-to-consume-time')
          throw new Error('Email ou senha incorretos')
        }

        const isValid = await verifyPassword(credentials.password, user.password)

        if (!isValid) {
          // Mensagem genérica para não revelar se email existe (CWE-200)
          const remaining = rateLimit.remainingAttempts
          throw new Error(
            remaining > 0
              ? `Email ou senha incorretos. ${remaining} tentativas restantes.`
              : 'Email ou senha incorretos.'
          )
        }

        // Login bem-sucedido: resetar contador e registrar no audit log
        resetLoginAttempts(credentials.email)

        // Atualizar lastLogin
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        // Registrar login bem-sucedido no audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN_SUCCESS',
            entityType: 'User',
            entityId: user.id,
            changes: { email: credentials.email },
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          requirePasswordChange: user.requirePasswordChange || false,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.requirePasswordChange = (user as any).requirePasswordChange || false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.requirePasswordChange = token.requirePasswordChange as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax', // Proteção CSRF (CWE-287)
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only em produção
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
