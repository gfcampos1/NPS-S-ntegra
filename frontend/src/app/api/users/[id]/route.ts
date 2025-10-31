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
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            forms: true,
            reports: true,
            auditLogs: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Deleta as relações primeiro (em ordem de dependência)
    await prisma.$transaction([
      // Deleta os audit logs
      prisma.auditLog.deleteMany({
        where: { userId: params.id },
      }),
      // Deleta os reports
      prisma.report.deleteMany({
        where: { createdBy: params.id },
      }),
      // Deleta os forms (que automaticamente deletará questions, responses, etc devido ao cascade)
      prisma.form.deleteMany({
        where: { createdBy: params.id },
      }),
      // Finalmente deleta o usuário
      prisma.user.delete({
        where: { id: params.id },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: `Usuário removido com sucesso. ${user._count.forms} formulários, ${user._count.reports} relatórios e ${user._count.auditLogs} logs foram removidos.`
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Erro ao remover usuário. Por favor, tente novamente.' },
      { status: 500 }
    )
  }
}
