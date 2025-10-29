import { prisma } from '@/lib/prisma'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { QuestionInsights } from '@/components/dashboard/QuestionInsights'

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
  totalResponses: number
  questions: QuestionInsight[]
}

type DashboardData = {
  npsScores: number[]
  totalForms: number
  totalRespondents: number
  totalResponses: number
  formInsights: FormInsight[]
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
        select: { id: true, title: true },
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

  const formAccumulator = new Map<
    string,
    {
      id: string
      title: string
      totalResponses: number
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

  const npsScores: number[] = []

  for (const response of responses) {
    const formId = response.form.id
    const formTitle = response.form.title

    let formEntry = formAccumulator.get(formId)
    if (!formEntry) {
      formEntry = {
        id: formId,
        title: formTitle,
        totalResponses: 0,
        questions: new Map(),
      }
      formAccumulator.set(formId, formEntry)
    }

    formEntry.totalResponses += 1

    for (const answer of response.answers) {
      const question = answer.question
      if (!question) continue

      if (question.type === 'NPS' && answer.numericValue !== null && answer.numericValue !== undefined) {
        npsScores.push(answer.numericValue)
      }

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
        totalResponses: form.totalResponses,
        questions,
      }
    })
    .filter((form) => form.questions.length > 0)
    .sort((a, b) => a.title.localeCompare(b.title))

  return {
    npsScores,
    totalForms,
    totalRespondents,
    totalResponses: responses.length,
    formInsights,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pesquisas realizadas</CardTitle>
            <CardDescription>Total de respostas concluídas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-600">{data.totalResponses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Formulários ativos</CardTitle>
            <CardDescription>Total cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalForms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Respondentes cadastrados</CardTitle>
            <CardDescription>Total de contatos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalRespondents}</div>
          </CardContent>
        </Card>
      </div>

      <QuestionInsights data={data.formInsights} />
    </div>
  )
}
