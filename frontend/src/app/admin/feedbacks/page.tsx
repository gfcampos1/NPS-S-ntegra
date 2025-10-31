'use client'

import { useEffect, useState } from 'react'
import { TextResponsesViewer } from '@/components/dashboard/TextResponsesViewer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, MessageSquare, FileText, Filter, Calendar, ClipboardList } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TextQuestion {
  id: string
  text: string
  type: 'TEXT_SHORT' | 'TEXT_LONG'
  formId: string
  formTitle: string
  formType: string
  totalResponses: number
  responses: Array<{
    id: string
    value: string
    respondent: {
      name: string
      type: string
      category?: string
      specialty?: string
      region?: string
      company?: string
    } | null
    completedAt: Date | string
  }>
}

export default function FeedbacksPage() {
  const [questions, setQuestions] = useState<TextQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'ALL' | 'TEXT_SHORT' | 'TEXT_LONG'>('ALL')

  useEffect(() => {
    fetchTextQuestions()
  }, [])

  const fetchTextQuestions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/questions/text-responses')

      if (!response.ok) {
        throw new Error('Erro ao carregar feedbacks')
      }

      const data = await response.json()
      setQuestions(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar feedbacks')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtra por tipo
  const filteredQuestions = questions.filter((q) => {
    if (filterType === 'ALL') return true
    return q.type === filterType
  })

  // Calcula estatísticas
  const stats = {
    totalQuestions: questions.length,
    totalResponses: questions.reduce((sum, q) => sum + q.totalResponses, 0),
    shortQuestions: questions.filter((q) => q.type === 'TEXT_SHORT').length,
    longQuestions: questions.filter((q) => q.type === 'TEXT_LONG').length,
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-gray-600">Carregando feedbacks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Feedbacks e Comentários
            </CardTitle>
            <CardDescription>
              Visualize e analise respostas de texto dos seus formulários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum feedback ainda
              </h3>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Quando os respondentes preencherem perguntas de texto nos seus
                formulários, os feedbacks aparecerão aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Feedbacks e Comentários
        </h1>
        <p className="text-gray-600">
          Visualize e analise todas as respostas de texto dos seus formulários
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Perguntas com Texto
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalQuestions}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Respostas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalResponses}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Textos Curtos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.shortQuestions}
                </p>
                <p className="text-xs text-gray-500 mt-1">perguntas</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Textos Longos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.longQuestions}
                </p>
                <p className="text-xs text-gray-500 mt-1">perguntas</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="ALL">Todos os tipos ({questions.length})</option>
          <option value="TEXT_SHORT">
            Apenas textos curtos ({stats.shortQuestions})
          </option>
          <option value="TEXT_LONG">
            Apenas textos longos ({stats.longQuestions})
          </option>
        </select>

        {filteredQuestions.length !== questions.length && (
          <span className="text-sm text-gray-600">
            Mostrando {filteredQuestions.length} de {questions.length} perguntas
          </span>
        )}
      </div>

      {/* Lista de Perguntas com Respostas */}
      {filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-sm text-center py-8">
              Nenhuma pergunta encontrada com esse filtro
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((question) => {
            // Agrupa respostas por formulário para melhor organização
            const formTypeLabels: Record<string, string> = {
              MEDICOS: 'Médicos',
              DISTRIBUIDORES: 'Distribuidores',
              CUSTOM: 'Personalizado'
            }

            // Calcula a resposta mais recente e mais antiga
            const sortedDates = question.responses
              .map(r => new Date(r.completedAt))
              .sort((a, b) => b.getTime() - a.getTime())

            const mostRecentDate = sortedDates[0]
            const oldestDate = sortedDates[sortedDates.length - 1]

            return (
              <Card key={question.id} className="overflow-hidden">
                {/* Cabeçalho com info do formulário */}
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="space-y-3">
                    {/* Título do Formulário */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                          <ClipboardList className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {question.formTitle}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {formTypeLabels[question.formType] || question.formType}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {question.type === 'TEXT_SHORT' ? 'Texto Curto' : 'Texto Longo'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contador de respostas */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-900">
                          {question.totalResponses}
                        </div>
                        <div className="text-xs text-gray-600">
                          {question.totalResponses === 1 ? 'resposta' : 'respostas'}
                        </div>
                      </div>
                    </div>

                    {/* Informações de data */}
                    {mostRecentDate && (
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Mais recente:</span>
                          <span>
                            {format(mostRecentDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                          <span className="text-gray-500">
                            ({formatDistanceToNow(mostRecentDate, { addSuffix: true, locale: ptBR })})
                          </span>
                        </div>

                        {question.totalResponses > 1 && oldestDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-medium">Mais antiga:</span>
                            <span>
                              {format(oldestDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                {/* Corpo com as respostas */}
                <CardContent className="pt-6">
                  <TextResponsesViewer
                    questionText={question.text}
                    questionType={question.type}
                    responses={question.responses}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
