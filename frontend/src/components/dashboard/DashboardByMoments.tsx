'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calendar,
  GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuestionCharts } from './QuestionCharts'

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

const iconMap: Record<string, any> = {
  BarChart3,
  GraduationCap,
  Calendar,
  FileText,
}

export function DashboardByMoments({ data }: { data: DashboardData }) {
  const [expandedMoments, setExpandedMoments] = useState<Set<string>>(new Set())

  const toggleMoment = (momentId: string) => {
    setExpandedMoments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(momentId)) {
        newSet.delete(momentId)
      } else {
        newSet.add(momentId)
      }
      return newSet
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com Estatísticas Globais */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 mb-6">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary-600">
                Total de Formulários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="text-3xl font-bold">{data.totalForms}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary-600">
                Total de Respondentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-green-500" />
                <div className="text-3xl font-bold">{data.totalRespondents}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-secondary-600">
                Total de Respostas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div className="text-3xl font-bold">{data.totalResponses}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Momentos de Pesquisa */}
      <div className="space-y-4">
        {data.moments.map((moment) => {
          const isExpanded = expandedMoments.has(moment.id)
          const IconComponent = moment.icon ? iconMap[moment.icon] || BarChart3 : BarChart3

          return (
            <Card key={moment.id} className="overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-secondary-50 transition-colors"
                onClick={() => toggleMoment(moment.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: moment.color || '#3B82F6' }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-secondary-900">
                          {moment.name}
                        </h2>
                        <Badge variant="outline">{moment.totalForms} formulários</Badge>
                      </div>
                      {moment.description && (
                        <p className="text-sm text-secondary-600">{moment.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-secondary-900">
                        {moment.totalResponses}
                      </div>
                      <div className="text-xs text-secondary-500">respostas</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {isExpanded && moment.forms.length > 0 && (
                <div className="border-t bg-white p-6 space-y-6">
                  {moment.forms.map((form) => (
                    <div key={form.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900">
                            {form.title}
                          </h3>
                          <p className="text-sm text-secondary-600">
                            {form.totalResponses} respostas
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-white"
                        >
                          {form.type === 'MEDICOS' && 'Médicos'}
                          {form.type === 'DISTRIBUIDORES' && 'Distribuidores'}
                          {form.type === 'CUSTOM' && 'Personalizado'}
                        </Badge>
                      </div>

                      {form.questions.length > 0 && (
                        <QuestionCharts questions={form.questions} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isExpanded && moment.forms.length === 0 && (
                <div className="border-t bg-gray-50 p-6 text-center text-secondary-500">
                  Nenhum formulário neste momento ainda
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Formulários sem Momento */}
      {data.formsWithoutMoment.length > 0 && (
        <Card className="border-2 border-yellow-200 bg-yellow-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <span>Formulários Não Categorizados</span>
            </CardTitle>
            <CardDescription>
              {data.formsWithoutMoment.length} formulário(s) sem momento atribuído.
              Acesse Configurações → Migração de Dados para categorizá-los.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.formsWithoutMoment.map((form) => (
              <div
                key={form.id}
                className="p-4 bg-white rounded-lg border border-yellow-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-secondary-900">{form.title}</h4>
                  <Badge variant="outline">{form.totalResponses} respostas</Badge>
                </div>
                {form.questions.length > 0 && (
                  <QuestionCharts questions={form.questions} />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.moments.length === 0 && data.formsWithoutMoment.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-secondary-300 mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Nenhum Dado Disponível
            </h3>
            <p className="text-secondary-600 text-center max-w-md">
              Crie momentos de pesquisa e formulários para ver suas estatísticas aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
