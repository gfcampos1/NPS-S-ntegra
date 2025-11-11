import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'VIEWER']).default('ADMIN'),
})

const sanitizeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  requirePasswordChange: user.requirePasswordChange,
  _count: user._count,
})

async function ensureSuperAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Apenas super administradores podem gerir usuários' },
      { status: 403 }
    )
  }

  return { session }
}

export async function GET(request: NextRequest) {
  const authResult = await ensureSuperAdmin(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          forms: true,
        },
      },
    },
  })

  return NextResponse.json(users.map(sanitizeUser))
}

export async function POST(request: NextRequest) {
  const authResult = await ensureSuperAdmin(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const body = await request.json()
    const payload = createUserSchema.parse(body)

    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(payload.password)

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: passwordHash,
        role: payload.role,
      },
    })

    return NextResponse.json(sanitizeUser(user), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Erro interno ao criar usuário' },
      { status: 500 }
    )
  }
}
