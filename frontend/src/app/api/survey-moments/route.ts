import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação
const createSurveyMomentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor deve ser um hex válido').optional(),
  icon: z.string().optional(),
})

// GET /api/survey-moments - Listar todos os momentos
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const moments = await prisma.surveyMoment.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            forms: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json(moments)
  } catch (error) {
    console.error('Erro ao buscar momentos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar momentos de pesquisa' },
      { status: 500 }
    )
  }
}

// POST /api/survey-moments - Criar novo momento (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas SUPER_ADMIN pode criar momentos
    const user = session.user as any
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas Super Admins podem criar momentos de pesquisa' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createSurveyMomentSchema.parse(body)

    // Verificar se slug já existe
    const existingMoment = await prisma.surveyMoment.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingMoment) {
      return NextResponse.json(
        { error: 'Já existe um momento com este slug' },
        { status: 400 }
      )
    }

    // Obter próxima ordem
    const lastMoment = await prisma.surveyMoment.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const nextOrder = (lastMoment?.order ?? 0) + 1

    // Criar momento
    const moment = await prisma.surveyMoment.create({
      data: {
        ...validatedData,
        order: nextOrder,
      },
      include: {
        _count: {
          select: {
            forms: true,
          },
        },
      },
    })

    return NextResponse.json(moment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar momento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar momento de pesquisa' },
      { status: 500 }
    )
  }
}
