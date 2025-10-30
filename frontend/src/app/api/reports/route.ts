import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { generateReportCSV } from '@/lib/reports/csv-generator'

// GET /api/reports - Listar relatórios
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const reports = await prisma.report.findMany({
      include: {
        generator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar relatórios' },
      { status: 500 }
    )
  }
}

// POST /api/reports - Criar novo relatório
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const body = await request.json()
    const { title, description, formId, filters, format } = body

    // Valida campos obrigatórios
    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    // Busca dados para o relatório
    const whereClause = buildWhereClause(formId, filters)

    const responses = await prisma.response.findMany({
      where: whereClause,
      include: {
        form: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        respondent: {
          select: {
            name: true,
            email: true,
            type: true,
            category: true,
            specialty: true,
            region: true,
            company: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                text: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // Gera CSV
    let csvUrl: string | null = null
    let pdfUrl: string | null = null

    if (format === 'CSV' || format === 'BOTH') {
      csvUrl = await generateReportCSV(responses, title)
    }

    // PDF será implementado no futuro
    if (format === 'BOTH') {
      // pdfUrl = await generateReportPDF(responses, title)
    }

    // Salva relatório no banco
    const report = await prisma.report.create({
      data: {
        title,
        description,
        formId: formId || null,
        filters: filters || null,
        csvUrl,
        pdfUrl,
        generatedBy: userId,
      },
      include: {
        generator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Erro ao criar relatório' },
      { status: 500 }
    )
  }
}

// Helper: Constrói WHERE clause baseado nos filtros
function buildWhereClause(formId?: string | null, filters?: any) {
  const where: any = {
    status: 'COMPLETED',
  }

  // Filtro por formulário
  if (formId) {
    where.formId = formId
  }

  // Filtro por período
  if (filters?.dateRange) {
    where.completedAt = {}
    if (filters.dateRange.start) {
      where.completedAt.gte = new Date(filters.dateRange.start)
    }
    if (filters.dateRange.end) {
      where.completedAt.lte = new Date(filters.dateRange.end)
    }
  }

  // Filtro por tipo de respondente
  if (filters?.respondentType) {
    where.respondent = {
      type: filters.respondentType,
    }
  }

  // Filtro por categorias
  if (filters?.categories && Array.isArray(filters.categories) && filters.categories.length > 0) {
    where.respondent = {
      ...where.respondent,
      OR: [
        { category: { in: filters.categories } },
        { specialty: { in: filters.categories } },
        { region: { in: filters.categories } },
        { company: { in: filters.categories } },
      ],
    }
  }

  return where
}
