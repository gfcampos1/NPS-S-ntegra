import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const migrateSchema = z.object({
  strategy: z.enum(['auto', 'manual']),
  manual: z.array(
    z.object({
      formId: z.string(),
      momentId: z.string(),
    })
  ).optional(),
})

// POST /api/survey-moments/migrate - Migrar formulários existentes (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas Super Admins podem executar migração' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { strategy, manual } = migrateSchema.parse(body)

    const results = {
      total: 0,
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
      details: [] as any[],
    }

    if (strategy === 'auto') {
      // Migração automática baseada em palavras-chave

      // Buscar momentos
      const satisfactionMoment = await prisma.surveyMoment.findUnique({
        where: { slug: 'satisfacao-pos-mercado' },
      })

      const cadaverLabMoment = await prisma.surveyMoment.findUnique({
        where: { slug: 'treinamento-cadaver-lab' },
      })

      if (!satisfactionMoment || !cadaverLabMoment) {
        return NextResponse.json(
          { error: 'Momentos padrão não encontrados. Execute a migration primeiro.' },
          { status: 400 }
        )
      }

      // Buscar todos os formulários sem momento
      const forms = await prisma.form.findMany({
        where: {
          surveyMomentId: null,
        },
        select: {
          id: true,
          title: true,
        },
      })

      results.total = forms.length

      for (const form of forms) {
        try {
          const title = form.title.toLowerCase()

          // Palavras-chave para Cadáver Lab
          const cadaverLabKeywords = [
            'treinamento',
            'lab',
            'laboratório',
            'laboratorio',
            'cadaver',
            'cadáver',
            'curso',
            'workshop',
            'prático',
            'pratico',
          ]

          // Verificar se o título contém alguma palavra-chave do Cadáver Lab
          const isCadaverLab = cadaverLabKeywords.some(keyword =>
            title.includes(keyword)
          )

          const momentId = isCadaverLab
            ? cadaverLabMoment.id
            : satisfactionMoment.id

          const momentName = isCadaverLab
            ? 'Treinamento Cadáver Lab'
            : 'Satisfação e Pós-Mercado'

          await prisma.form.update({
            where: { id: form.id },
            data: { surveyMomentId: momentId },
          })

          results.migrated++
          results.details.push({
            formId: form.id,
            formTitle: form.title,
            momentId,
            momentName,
            status: 'success',
          })
        } catch (error) {
          results.errors.push(`Erro ao migrar formulário ${form.title}: ${error}`)
          results.details.push({
            formId: form.id,
            formTitle: form.title,
            status: 'error',
            error: String(error),
          })
        }
      }
    } else if (strategy === 'manual' && manual) {
      // Migração manual
      results.total = manual.length

      for (const item of manual) {
        try {
          // Verificar se momento existe
          const moment = await prisma.surveyMoment.findUnique({
            where: { id: item.momentId },
            select: { id: true, name: true },
          })

          if (!moment) {
            results.errors.push(`Momento ${item.momentId} não encontrado`)
            results.skipped++
            continue
          }

          // Atualizar formulário
          const form = await prisma.form.update({
            where: { id: item.formId },
            data: { surveyMomentId: item.momentId },
            select: { id: true, title: true },
          })

          results.migrated++
          results.details.push({
            formId: form.id,
            formTitle: form.title,
            momentId: moment.id,
            momentName: moment.name,
            status: 'success',
          })
        } catch (error) {
          results.errors.push(`Erro ao migrar formulário ${item.formId}: ${error}`)
          results.skipped++
          results.details.push({
            formId: item.formId,
            status: 'error',
            error: String(error),
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migração concluída: ${results.migrated}/${results.total} formulários migrados`,
      results,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro na migração:', error)
    return NextResponse.json(
      { error: 'Erro ao executar migração', details: String(error) },
      { status: 500 }
    )
  }
}

// GET /api/survey-moments/migrate - Preview da migração
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas Super Admins podem visualizar migração' },
        { status: 403 }
      )
    }

    // Buscar formulários sem momento
    const formsWithoutMoment = await prisma.form.findMany({
      where: {
        surveyMomentId: null,
      },
      select: {
        id: true,
        title: true,
        type: true,
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
    })

    // Buscar formulários já migrados
    const formsWithMoment = await prisma.form.findMany({
      where: {
        surveyMomentId: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        surveyMoment: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Buscar momentos disponíveis
    const moments = await prisma.surveyMoment.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        icon: true,
      },
      orderBy: {
        order: 'asc',
      },
    })

    // Preview de migração automática
    const preview = formsWithoutMoment.map(form => {
      const title = form.title.toLowerCase()
      const cadaverLabKeywords = [
        'treinamento',
        'lab',
        'laboratório',
        'laboratorio',
        'cadaver',
        'cadáver',
        'curso',
        'workshop',
      ]

      const isCadaverLab = cadaverLabKeywords.some(keyword =>
        title.includes(keyword)
      )

      const suggestedMoment = isCadaverLab
        ? moments.find(m => m.slug === 'treinamento-cadaver-lab')
        : moments.find(m => m.slug === 'satisfacao-pos-mercado')

      return {
        ...form,
        suggestedMoment,
      }
    })

    return NextResponse.json({
      summary: {
        total: formsWithoutMoment.length + formsWithMoment.length,
        pendingMigration: formsWithoutMoment.length,
        alreadyMigrated: formsWithMoment.length,
      },
      formsWithoutMoment: preview,
      formsWithMoment,
      availableMoments: moments,
    })
  } catch (error) {
    console.error('Erro ao buscar preview de migração:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados de migração' },
      { status: 500 }
    )
  }
}
