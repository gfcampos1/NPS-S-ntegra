import { prisma } from '@/lib/prisma'
import { calculateNPS, interpretNPS } from '@/lib/nps'
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

  const npsData = calculateNPS(data.npsScores)
  const interpretation = interpretNPS(npsData.nps)
  const npsSampleSize = data.npsScores.length

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <CardDescription>Status atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: interpretation.color }}>
              {npsData.nps}
            </div>
            <p className="text-xs text-slate-500">
              {interpretation.label} &mdash; {interpretation.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Respostas concluídas</CardTitle>
            <CardDescription>Pesquisas finalizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalResponses}</div>
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

      <Card>
        <CardHeader>
          <CardTitle>Como calculamos o NPS</CardTitle>
          <CardDescription>
            O Net Promoter Score é calculado subtraindo a porcentagem de detratores da porcentagem de promotores.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
              <p className="font-semibold text-slate-700 mb-2">Fórmula</p>
              <p className="font-mono text-sm text-slate-700">
                ((Promotores - Detratores) / Total de respostas) × 100
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Promotores</p>
                <p className="text-lg font-semibold text-slate-800">{npsData.promoters}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Neutros</p>
                <p className="text-lg font-semibold text-slate-800">{npsData.neutrals}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Detratores</p>
                <p className="text-lg font-semibold text-slate-800">{npsData.detractors}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 bg-gradient-to-br from-white to-slate-50">
            <p className="text-sm text-slate-500 mb-2">Amostra recente</p>
            <p className="text-3xl font-bold text-slate-800 mb-1">{npsSampleSize}</p>
            <p className="text-sm text-slate-500">
              respostas válidas de NPS consideradas neste cálculo.
            </p>
            <div className="mt-4 rounded-md bg-slate-900 text-slate-100 p-4 font-mono text-sm leading-relaxed">
              <span className="text-green-400">{npsData.promoters}</span>
              <span> - </span>
              <span className="text-red-400">{npsData.detractors}</span>
              <span> ÷ </span>
              <span className="text-blue-300">{npsSampleSize || 1}</span>
              <span> × 100 = </span>
              <span className="text-amber-300">{npsData.nps}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <QuestionInsights data={data.formInsights} />
    </div>
  )
}
