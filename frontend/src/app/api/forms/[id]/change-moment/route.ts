import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const changeMomentSchema = z.object({
  surveyMomentId: z.string().nullable(),
})

// PATCH /api/forms/[id]/change-moment - Mudar momento do formulário
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas SUPER_ADMIN pode mover formulários entre momentos
    const user = session.user as any
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas Super Admins podem mover formulários entre momentos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { surveyMomentId } = changeMomentSchema.parse(body)

    // Verificar se formulário existe
    const form = await prisma.form.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, surveyMomentId: true },
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Formulário não encontrado' },
        { status: 404 }
      )
    }

    // Se surveyMomentId não é null, verificar se momento existe
    if (surveyMomentId) {
      const moment = await prisma.surveyMoment.findUnique({
        where: { id: surveyMomentId },
        select: { id: true, name: true },
      })

      if (!moment) {
        return NextResponse.json(
          { error: 'Momento de pesquisa não encontrado' },
          { status: 404 }
        )
      }
    }

    // Atualizar formulário
    const updatedForm = await prisma.form.update({
      where: { id: params.id },
      data: { surveyMomentId },
      include: {
        surveyMoment: {
          select: { id: true, name: true, color: true },
        },
      },
    })

    // Log da mudança (auditoria)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CHANGE_FORM_MOMENT',
        entityType: 'Form',
        entityId: form.id,
        changes: {
          formTitle: form.title,
          oldMomentId: form.surveyMomentId,
          newMomentId: surveyMomentId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Momento do formulário atualizado com sucesso',
      form: updatedForm,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao mudar momento:', error)
    return NextResponse.json(
      { error: 'Erro ao mudar momento do formulário' },
      { status: 500 }
    )
  }
}
