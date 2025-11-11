import { prisma } from '@/lib/prisma'
import { DashboardByMoments } from '@/components/dashboard/DashboardByMoments'

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
  createdAt: string
}

type MomentData = {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  totalForms: number
  totalResponses: number
  forms: FormInsight[]
  responsesByMonth: Record<string, number>
}

type DashboardData = {
  totalForms: number
  totalRespondents: number
  totalResponses: number
  moments: MomentData[]
  formsWithoutMoment: FormInsight[]
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
  // Buscar todos os momentos
  const moments = await prisma.surveyMoment.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })

  // Buscar todas as respostas completas
  const responses = await prisma.response.findMany({
    where: { status: 'COMPLETED' },
    include: {
      form: {
        select: {
          id: true,
          title: true,
          type: true,
          surveyMomentId: true,
          createdAt: true,
        },
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

  // Contadores globais por mês
  const globalResponsesByMonth: Record<string, number> = {}

  // Acumulador de formulários por momento
  const momentDataMap = new Map<string, {
    forms: Map<string, {
      id: string
      title: string
      type: string
      createdAt: Date
      totalResponses: number
      responsesByDate: Record<string, number>
      questions: Map<string, {
        id: string
        text: string
        type: string
        counts: Map<string, number>
        order: string[]
      }>
    }>
    responsesByMonth: Record<string, number>
  }>()

  // Acumulador de formulários sem momento
  const formsWithoutMomentMap = new Map<string, {
    id: string
    title: string
    type: string
    createdAt: Date
    totalResponses: number
    responsesByDate: Record<string, number>
    questions: Map<string, {
      id: string
      text: string
      type: string
      counts: Map<string, number>
      order: string[]
    }>
  }>()

  // Processar respostas
  for (const response of responses) {
    const { form } = response
    const momentId = form.surveyMomentId || 'without-moment'

    // Contador global por mês
    if (response.completedAt) {
      const monthKey = response.completedAt.toISOString().substring(0, 7)
      globalResponsesByMonth[monthKey] = (globalResponsesByMonth[monthKey] || 0) + 1
    }

    // Escolher o acumulador correto
    const targetMap = momentId === 'without-moment' ? formsWithoutMomentMap : null

    if (momentId !== 'without-moment') {
      if (!momentDataMap.has(momentId)) {
        momentDataMap.set(momentId, {
          forms: new Map(),
          responsesByMonth: {},
        })
      }
    }

    const momentData = momentId === 'without-moment' ? null : momentDataMap.get(momentId)!
    const formsMap = momentId === 'without-moment' ? formsWithoutMomentMap : momentData.forms

    // Obter ou criar entrada do formulário
    let formEntry = formsMap.get(form.id)
    if (!formEntry) {
      formEntry = {
        id: form.id,
        title: form.title,
        type: form.type,
        createdAt: form.createdAt,
        totalResponses: 0,
        responsesByDate: {},
        questions: new Map(),
      }
      formsMap.set(form.id, formEntry)
    }

    formEntry.totalResponses += 1

    // Contador por data no formulário
    if (response.completedAt) {
      const monthKey = response.completedAt.toISOString().substring(0, 7)
      formEntry.responsesByDate[monthKey] = (formEntry.responsesByDate[monthKey] || 0) + 1

      // Contador por mês no momento
      if (momentData) {
        momentData.responsesByMonth[monthKey] = (momentData.responsesByMonth[monthKey] || 0) + 1
      }
    }

    // Processar perguntas
    for (const answer of response.answers) {
      const question = answer.question
      if (!question || !SUPPORTED_CHART_TYPES.has(question.type)) continue

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
          counts: new Map(),
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
          } catch (_) {}
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

  // Converter dados para formato final
  const momentsData: MomentData[] = moments.map(moment => {
    const momentData = momentDataMap.get(moment.id)
    const forms: FormInsight[] = []
    let totalResponses = 0

    if (momentData) {
      for (const [, formData] of momentData.forms) {
        totalResponses += formData.totalResponses

        const questions: QuestionInsight[] = Array.from(formData.questions.values())
          .map(question => {
            const order = question.type === 'RATING_1_5' || question.type === 'NPS'
              ? question.order
              : question.order.length > 0
              ? question.order
              : Array.from(question.counts.keys())

            const chartData = order.map(label => ({
              label,
              value: question.counts.get(label) ?? 0,
            }))

            const questionTotalResponses = chartData.reduce((sum, entry) => sum + entry.value, 0)

            return {
              id: question.id,
              text: question.text,
              type: question.type,
              totalResponses: questionTotalResponses,
              chartData,
            }
          })
          .filter(question => question.totalResponses > 0)

        forms.push({
          id: formData.id,
          title: formData.title,
          type: formData.type,
          totalResponses: formData.totalResponses,
          questions,
          responsesByDate: formData.responsesByDate,
          createdAt: formData.createdAt.toISOString(),
        })
      }
    }

    // Ordenar formulários por data (mais recente primeiro)
    forms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return {
      id: moment.id,
      name: moment.name,
      description: moment.description,
      color: moment.color,
      icon: moment.icon,
      totalForms: forms.length,
      totalResponses,
      forms,
      responsesByMonth: momentData?.responsesByMonth || {},
    }
  })

  // Processar formulários sem momento
  const formsWithoutMoment: FormInsight[] = []
  for (const [, formData] of formsWithoutMomentMap) {
    const questions: QuestionInsight[] = Array.from(formData.questions.values())
      .map(question => {
        const order = question.type === 'RATING_1_5' || question.type === 'NPS'
          ? question.order
          : question.order.length > 0
          ? question.order
          : Array.from(question.counts.keys())

        const chartData = order.map(label => ({
          label,
          value: question.counts.get(label) ?? 0,
        }))

        const questionTotalResponses = chartData.reduce((sum, entry) => sum + entry.value, 0)

        return {
          id: question.id,
          text: question.text,
          type: question.type,
          totalResponses: questionTotalResponses,
          chartData,
        }
      })
      .filter(question => question.totalResponses > 0)

    formsWithoutMoment.push({
      id: formData.id,
      title: formData.title,
      type: formData.type,
      totalResponses: formData.totalResponses,
      questions,
      responsesByDate: formData.responsesByDate,
      createdAt: formData.createdAt.toISOString(),
    })
  }

  // Ordenar formulários sem momento por data
  formsWithoutMoment.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return {
    totalForms,
    totalRespondents,
    totalResponses: responses.length,
    moments: momentsData,
    formsWithoutMoment,
    responsesByMonth: globalResponsesByMonth,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return <DashboardByMoments data={data} />
}
