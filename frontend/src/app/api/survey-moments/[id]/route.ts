import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSurveyMomentSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

// GET /api/survey-moments/[id] - Obter detalhes de um momento
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const moment = await prisma.surveyMoment.findUnique({
      where: { id: params.id },
      include: {
        forms: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                responses: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            forms: true,
          },
        },
      },
    })

    if (!moment) {
      return NextResponse.json(
        { error: 'Momento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(moment)
  } catch (error) {
    console.error('Erro ao buscar momento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar momento de pesquisa' },
      { status: 500 }
    )
  }
}

// PUT /api/survey-moments/[id] - Atualizar momento (Super Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas Super Admins podem atualizar momentos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateSurveyMomentSchema.parse(body)

    const moment = await prisma.surveyMoment.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            forms: true,
          },
        },
      },
    })

    return NextResponse.json(moment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar momento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar momento de pesquisa' },
      { status: 500 }
    )
  }
}

// DELETE /api/survey-moments/[id] - Arquivar momento (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas Super Admins podem arquivar momentos' },
        { status: 403 }
      )
    }

    // Verificar se há formulários associados
    const moment = await prisma.surveyMoment.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            forms: true,
          },
        },
      },
    })

    if (!moment) {
      return NextResponse.json(
        { error: 'Momento não encontrado' },
        { status: 404 }
      )
    }

    // Arquivar (soft delete) ao invés de deletar
    const archived = await prisma.surveyMoment.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'Momento arquivado com sucesso',
      formsAffected: moment._count.forms,
      moment: archived,
    })
  } catch (error) {
    console.error('Erro ao arquivar momento:', error)
    return NextResponse.json(
      { error: 'Erro ao arquivar momento de pesquisa' },
      { status: 500 }
    )
  }
}
