import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reorderSchema = z.object({
  momentId: z.string(),
  newOrder: z.number().int().min(0),
})

// POST /api/survey-moments/reorder - Reordenar momentos (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas Super Admins podem reordenar momentos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { momentId, newOrder } = reorderSchema.parse(body)

    // Buscar momento atual
    const moment = await prisma.surveyMoment.findUnique({
      where: { id: momentId },
      select: { order: true },
    })

    if (!moment) {
      return NextResponse.json(
        { error: 'Momento não encontrado' },
        { status: 404 }
      )
    }

    const oldOrder = moment.order

    // Se movendo para cima (ordem menor)
    if (newOrder < oldOrder) {
      // Incrementar todos entre newOrder e oldOrder-1
      await prisma.surveyMoment.updateMany({
        where: {
          order: {
            gte: newOrder,
            lt: oldOrder,
          },
        },
        data: {
          order: {
            increment: 1,
          },
        },
      })
    }
    // Se movendo para baixo (ordem maior)
    else if (newOrder > oldOrder) {
      // Decrementar todos entre oldOrder+1 e newOrder
      await prisma.surveyMoment.updateMany({
        where: {
          order: {
            gt: oldOrder,
            lte: newOrder,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      })
    }

    // Atualizar ordem do momento
    await prisma.surveyMoment.update({
      where: { id: momentId },
      data: { order: newOrder },
    })

    // Retornar lista atualizada
    const updatedMoments = await prisma.surveyMoment.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            forms: true,
          },
        },
      },
    })

    return NextResponse.json(updatedMoments)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao reordenar momentos:', error)
    return NextResponse.json(
      { error: 'Erro ao reordenar momentos' },
      { status: 500 }
    )
  }
}
