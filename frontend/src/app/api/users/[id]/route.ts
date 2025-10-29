import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

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
