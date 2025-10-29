'use client'

import { useMemo } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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

type QuestionInsightsProps = {
  data: FormInsight[]
}

function QuestionChart({ insight }: { insight: QuestionInsight }) {
  const chartData = useMemo(() => {
    if (insight.chartData.length === 0) {
      return []
    }

    return insight.chartData.map((item) => ({
      label: item.label,
      value: item.value,
    }))
  }, [insight.chartData])

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
        Sem dados suficientes para gerar o gráfico.
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.16)' }}
            contentStyle={{ borderRadius: '0.5rem', borderColor: '#CBD5F5' }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Bar dataKey="value" fill="#4169B1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function QuestionInsights({ data }: QuestionInsightsProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights por pergunta</CardTitle>
          <CardDescription>
            Os gráficos serão exibidos assim que houver respostas nos formulários publicados.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights por pergunta</CardTitle>
        <CardDescription>
          Explore as respostas consolidadas de cada pergunta. Abra um formulário para visualizar os gráficos correspondentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion.Root type="multiple" className="space-y-4">
          {data.map((form) => (
            <Accordion.Item
              key={form.id}
              value={form.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 data-[state=open]:border-b data-[state=open]:border-slate-200">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{form.title}</p>
                    <p className="text-xs text-slate-500">
                      {form.questions.length} perguntas &bull; {form.totalResponses}{' '}
                      respostas
                    </p>
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-5 pb-5 pt-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  {form.questions.map((question) => (
                    <div
                      key={question.id}
                      className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 shadow-sm"
                    >
                      <div className="mb-4 space-y-1">
                        <p className="font-medium text-slate-800">{question.text}</p>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {question.type.replace('_', ' ')} • {question.totalResponses}{' '}
                          respostas
                        </p>
                      </div>
                      <QuestionChart insight={question} />
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </CardContent>
    </Card>
  )
}
