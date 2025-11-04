import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { generateReportCSV } from '@/lib/reports/csv-generator'
import { generateReportXLSX } from '@/lib/reports/xlsx-generator'

// GET /api/reports/[id]/export?format=csv|xlsx
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    // Busca o relatório
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }

    // Reconstrói os filtros para buscar os dados
    const whereClause = buildWhereClause(report.formId, report.filters as any)

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

    // Gera arquivo baseado no formato
    if (format === 'csv') {
      const csv = generateReportCSV(responses as any, report.title)

      // Retorna o CSV como arquivo para download
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${sanitizeFilename(report.title)}.csv"`,
        },
      })
    } else if (format === 'xlsx') {
      const xlsx = generateReportXLSX(responses as any, report.title)

      // Retorna o Excel como arquivo para download
      return new NextResponse(new Blob([xlsx]), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${sanitizeFilename(report.title)}.xlsx"`,
        },
      })
    }

    return NextResponse.json(
      { error: 'Formato inválido. Use csv ou xlsx' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar relatório' },
      { status: 500 }
    )
  }
}

// Helper: Sanitiza nome do arquivo
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_\-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
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
