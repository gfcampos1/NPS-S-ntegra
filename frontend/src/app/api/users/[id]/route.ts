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
    // Parse request body to get transferFormsToUserId if provided
    const body = await request.json().catch(() => ({}))
    const transferFormsToUserId = body.transferFormsToUserId || null

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

    // Se transferência foi solicitada, verificar se o novo dono existe
    if (transferFormsToUserId) {
      const newOwner = await prisma.user.findUnique({
        where: { id: transferFormsToUserId },
        select: { id: true, name: true, email: true },
      })

      if (!newOwner) {
        return NextResponse.json(
          { error: 'Usuário destinatário não encontrado' },
          { status: 404 }
        )
      }

      // Não pode transferir para si mesmo
      if (newOwner.id === params.id) {
        return NextResponse.json(
          { error: 'Não é possível transferir formulários para o próprio usuário que será excluído' },
          { status: 400 }
        )
      }
    }

    // Executar deleção/transferência em transação
    await prisma.$transaction(async (tx) => {
      // Se transferência foi solicitada, transferir formulários
      if (transferFormsToUserId && user._count.forms > 0) {
        await tx.form.updateMany({
          where: { createdBy: params.id },
          data: { createdBy: transferFormsToUserId },
        })
      } else {
        // Caso contrário, deletar formulários
        await tx.form.deleteMany({
          where: { createdBy: params.id },
        })
      }

      // Deleta os audit logs
      await tx.auditLog.deleteMany({
        where: { userId: params.id },
      })

      // Deleta os reports
      await tx.report.deleteMany({
        where: { generatedBy: params.id },
      })

      // Finalmente deleta o usuário
      await tx.user.delete({
        where: { id: params.id },
      })
    })

    let message = `Usuário removido com sucesso.`
    if (transferFormsToUserId && user._count.forms > 0) {
      message += ` ${user._count.forms} formulário(s) transferido(s) para o novo proprietário.`
    } else if (user._count.forms > 0) {
      message += ` ${user._count.forms} formulário(s) removido(s).`
    }
    if (user._count.reports > 0) {
      message += ` ${user._count.reports} relatório(s) removido(s).`
    }

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Erro ao remover usuário. Por favor, tente novamente.' },
      { status: 500 }
    )
  }
}
