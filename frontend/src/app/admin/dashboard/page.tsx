import { prisma } from '@/lib/prisma'
import { DashboardClientRedesign } from '@/components/dashboard/DashboardClientRedesign'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type QuestionInsight = {
  id: string
  text: string
  type: string
  totalResponses: number
  chartData: { label: string; value: number }[]
}

type FormInsight = {
  id: string
  title: string
  type: string
  totalResponses: number
  questions: QuestionInsight[]
  responsesByDate: Record<string, number>
}

type DashboardData = {
  totalForms: number
  totalRespondents: number
  totalResponses: number
  formInsights: FormInsight[]
  responsesByType: Record<string, number>
  responsesByMonth: Record<string, number>
}

const SUPPORTED_CHART_TYPES = new Set([
  'NPS',
  'RATING_1_5',
  'COMPARISON',
  'MULTIPLE_CHOICE',
  'SINGLE_CHOICE',
])

async function getDashboardData(): Promise<DashboardData> {
  const responses = await prisma.response.findMany({
    where: { status: 'COMPLETED' },
    include: {
      form: {
        select: { id: true, title: true, type: true },
      },
      answers: {
        include: {
          question: {
            select: {
              id: true,
              text: true,
              type: true,
              options: true,
            },
          },
        },
      },
    },
  })

  const totalForms = await prisma.form.count()
  const totalRespondents = await prisma.respondent.count()

  // Contadores por tipo
  const responsesByType: Record<string, number> = {
    MEDICOS: 0,
    DISTRIBUIDORES: 0,
    CUSTOM: 0,
  }

  // Contadores por mês
  const responsesByMonth: Record<string, number> = {}

  const formAccumulator = new Map<
    string,
    {
      id: string
      title: string
      type: string
      totalResponses: number
      responsesByDate: Record<string, number>
      questions: Map<
        string,
        {
          id: string
          text: string
          type: string
          counts: Map<string, number>
          order: string[]
        }
      >
    }
  >()

  for (const response of responses) {
    const formId = response.form.id
    const formTitle = response.form.title
    const formType = response.form.type

    // Contar por tipo
    responsesByType[formType] = (responsesByType[formType] || 0) + 1

    // Contar por mês (formato: YYYY-MM)
    if (response.completedAt) {
      const monthKey = response.completedAt.toISOString().substring(0, 7)
      responsesByMonth[monthKey] = (responsesByMonth[monthKey] || 0) + 1
    }

    let formEntry = formAccumulator.get(formId)
    if (!formEntry) {
      formEntry = {
        id: formId,
        title: formTitle,
        type: formType,
        totalResponses: 0,
        responsesByDate: {},
        questions: new Map(),
      }
      formAccumulator.set(formId, formEntry)
    }

    formEntry.totalResponses += 1

    // Contar respostas por data neste formulário
    if (response.completedAt) {
      const monthKey = response.completedAt.toISOString().substring(0, 7)
      formEntry.responsesByDate[monthKey] = (formEntry.responsesByDate[monthKey] || 0) + 1
    }

    for (const answer of response.answers) {
      const question = answer.question
      if (!question) continue

      if (!SUPPORTED_CHART_TYPES.has(question.type)) {
        continue
      }

      let questionEntry = formEntry.questions.get(question.id)
      if (!questionEntry) {
        let defaultOrder: string[] = []

        if (question.type === 'RATING_1_5') {
          defaultOrder = Array.from({ length: 5 }, (_, idx) => String(idx + 1))
        } else if (question.type === 'NPS') {
          defaultOrder = Array.from({ length: 11 }, (_, idx) => String(idx))
        } else if (Array.isArray(question.options)) {
          defaultOrder = (question.options as unknown as string[]).map(String)
        }

        questionEntry = {
          id: question.id,
          text: question.text,
          type: question.type,
          counts: new Map<string, number>(),
          order: defaultOrder,
        }

        formEntry.questions.set(question.id, questionEntry)
      }

      const registerCount = (label: string | number) => {
        const key = String(label)
        questionEntry!.counts.set(key, (questionEntry!.counts.get(key) ?? 0) + 1)
      }

      if (question.type === 'MULTIPLE_CHOICE') {
        if (answer.textValue) {
          try {
            const parsed = JSON.parse(answer.textValue)
            if (Array.isArray(parsed)) {
              parsed.forEach(registerCount)
            }
          } catch (_) {
            /* noop */
          }
        }
      } else if (question.type === 'SINGLE_CHOICE' || question.type === 'COMPARISON') {
        if (answer.selectedOption) {
          registerCount(answer.selectedOption)
        }
      } else if (question.type === 'RATING_1_5' || question.type === 'NPS') {
        const value = answer.numericValue
        if (typeof value === 'number' && Number.isFinite(value)) {
          registerCount(value)
        }
      }
    }
  }

  const formInsights: FormInsight[] = Array.from(formAccumulator.values())
    .map((form) => {
      const questions: QuestionInsight[] = Array.from(form.questions.values())
        .map((question) => {
          const order =
            question.type === 'RATING_1_5' || question.type === 'NPS'
              ? question.order
              : question.order.length > 0
              ? question.order
              : Array.from(question.counts.keys())

          const chartData = order.map((label) => ({
            label,
            value: question.counts.get(label) ?? 0,
          }))

          const totalResponses = chartData.reduce((sum, entry) => sum + entry.value, 0)

          return {
            id: question.id,
            text: question.text,
            type: question.type,
            totalResponses,
            chartData,
          }
        })
        .filter((question) => question.totalResponses > 0)

      return {
        id: form.id,
        title: form.title,
        type: form.type,
        totalResponses: form.totalResponses,
        responsesByDate: form.responsesByDate,
        questions,
      }
    })
    .filter((form) => form.questions.length > 0)
    .sort((a, b) => a.title.localeCompare(b.title))

  return {
    totalForms,
    totalRespondents,
    totalResponses: responses.length,
    formInsights,
    responsesByType,
    responsesByMonth,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return <DashboardClientRedesign data={data} />
}
