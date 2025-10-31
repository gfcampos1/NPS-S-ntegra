import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * POST - Super Admin reseta senha de usuário
 * Gera senha temporária e força troca no próximo login
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Apenas SUPER_ADMIN pode resetar senhas
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas super administradores podem resetar senhas' },
        { status: 403 }
      )
    }

    const userId = params.id

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Gerar senha temporária criptograficamente segura
    const tempPassword = randomBytes(24).toString('base64url').slice(0, 16)

    // Hash da senha temporária
    const hashedPassword = await hashPassword(tempPassword)

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        tempPassword: tempPassword, // Armazenar para exibir ao admin
        requirePasswordChange: true, // Forçar troca no próximo login
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    // Registrar no audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'RESET_PASSWORD',
        entityType: 'User',
        entityId: userId,
        changes: {
          targetUser: updatedUser.email,
          resetBy: session.user.email,
        },
      },
    })

    return NextResponse.json({
      message: 'Senha resetada com sucesso',
      tempPassword: tempPassword,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Erro ao resetar senha' },
      { status: 500 }
    )
  }
}
