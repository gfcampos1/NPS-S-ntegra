'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts'

type QuestionInsight = {
  id: string
  text: string
  type: string
  totalResponses: number
  chartData: { label: string; value: number }[]
}

type QuestionChartsProps = {
  questions: QuestionInsight[]
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
      <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
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

export function QuestionCharts({ questions }: QuestionChartsProps) {
  if (questions.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {questions.map((question) => (
        <div
          key={question.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 space-y-1">
            <p className="font-medium text-gray-800">{question.text}</p>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {question.type.replace('_', ' ')} • {question.totalResponses} respostas
            </p>
          </div>
          <QuestionChart insight={question} />
        </div>
      ))}
    </div>
  )
}
