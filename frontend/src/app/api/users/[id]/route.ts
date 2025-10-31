import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

const updateUserSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'VIEWER']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Apenas super administradores podem alterar roles' },
      { status: 403 }
    )
  }

  if (!params.id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  if (session.user.id === params.id) {
    return NextResponse.json(
      { error: 'Você não pode alterar o próprio role' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const payload = updateUserSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: payload.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Apenas super administradores podem excluir usuários' },
      { status: 403 }
    )
  }

  if (!params.id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  if (session.user.id === params.id) {
    return NextResponse.json(
      { error: 'Você não pode remover o próprio usuário enquanto estiver conectado' },
      { status: 400 }
    )
  }

  try {
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Erro ao remover usuário' },
      { status: 500 }
    )
  }
}
