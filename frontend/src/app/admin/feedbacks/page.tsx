'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, MessageSquare, FileText, Search, ChevronDown, ChevronRight, Calendar, Users as UsersIcon } from 'lucide-react'
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

interface GroupedForm {
  formId: string
  formTitle: string
  formType: string
  questions: TextQuestion[]
  totalResponses: number
  lastResponseDate: Date | null
}

export default function FeedbacksPage() {
  const [questions, setQuestions] = useState<TextQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'TEXT_SHORT' | 'TEXT_LONG'>('ALL')
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set())
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

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

  // Agrupa perguntas por formulário
  const groupedByForm = (): GroupedForm[] => {
    const filtered = questions.filter((q) => {
      const matchesType = filterType === 'ALL' || q.type === filterType
      const matchesSearch = searchTerm === '' ||
        q.formTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.text.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesType && matchesSearch
    })

    const grouped = filtered.reduce((acc, question) => {
      const existing = acc.find(g => g.formId === question.formId)

      if (existing) {
        existing.questions.push(question)
        existing.totalResponses += question.totalResponses

        // Atualiza a data mais recente
        const questionLastDate = question.responses.length > 0
          ? new Date(question.responses[0].completedAt)
          : null

        if (questionLastDate && (!existing.lastResponseDate || questionLastDate > existing.lastResponseDate)) {
          existing.lastResponseDate = questionLastDate
        }
      } else {
        const lastDate = question.responses.length > 0
          ? new Date(question.responses[0].completedAt)
          : null

        acc.push({
          formId: question.formId,
          formTitle: question.formTitle,
          formType: question.formType,
          questions: [question],
          totalResponses: question.totalResponses,
          lastResponseDate: lastDate
        })
      }

      return acc
    }, [] as GroupedForm[])

    // Ordena por data mais recente
    return grouped.sort((a, b) => {
      if (!a.lastResponseDate) return 1
      if (!b.lastResponseDate) return -1
      return b.lastResponseDate.getTime() - a.lastResponseDate.getTime()
    })
  }

  const toggleForm = (formId: string) => {
    const newExpanded = new Set(expandedForms)
    if (newExpanded.has(formId)) {
      newExpanded.delete(formId)
    } else {
      newExpanded.add(formId)
    }
    setExpandedForms(newExpanded)
  }

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const formTypeLabels: Record<string, string> = {
    MEDICOS: 'Médicos',
    DISTRIBUIDORES: 'Distribuidores',
    CUSTOM: 'Personalizado'
  }

  const stats = {
    totalQuestions: questions.length,
    totalResponses: questions.reduce((sum, q) => sum + q.totalResponses, 0),
    totalForms: new Set(questions.map(q => q.formId)).size,
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

  const groupedForms = groupedByForm()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Feedbacks e Comentários
        </h1>
        <p className="text-gray-600">
          Visualize e analise todas as respostas de texto organizadas por formulário
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Formulários com Respostas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalForms}
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
                  Perguntas com Texto
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalQuestions}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
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
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por formulário ou pergunta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de tipo */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="ALL">Todos os tipos</option>
              <option value="TEXT_SHORT">Textos curtos</option>
              <option value="TEXT_LONG">Textos longos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Formulários (Accordion) */}
      {groupedForms.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-sm text-center py-8">
              Nenhum resultado encontrado com os filtros aplicados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groupedForms.map((form) => {
            const isFormExpanded = expandedForms.has(form.formId)

            return (
              <Card key={form.formId} className="overflow-hidden">
                {/* Cabeçalho do Formulário - Clicável */}
                <button
                  onClick={() => toggleForm(form.formId)}
                  className="w-full text-left hover:bg-gray-50 transition-colors"
                >
                  <CardHeader className="cursor-pointer">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Ícone de expand/collapse */}
                        <div className="flex-shrink-0">
                          {isFormExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                        </div>

                        {/* Info do formulário */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {form.formTitle}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                              {formTypeLabels[form.formType] || form.formType}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>{form.questions.length} {form.questions.length === 1 ? 'pergunta' : 'perguntas'}</span>
                            <span>•</span>
                            <span>{form.totalResponses} {form.totalResponses === 1 ? 'resposta' : 'respostas'}</span>
                            {form.lastResponseDate && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDistanceToNow(form.lastResponseDate, { addSuffix: true, locale: ptBR })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contador destacado */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-900">
                          {form.totalResponses}
                        </div>
                        <div className="text-xs text-gray-500">
                          respostas
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {/* Conteúdo expansível - Perguntas */}
                {isFormExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-2 ml-8">
                      {form.questions.map((question) => {
                        const isQuestionExpanded = expandedQuestions.has(question.id)

                        return (
                          <div key={question.id} className="border rounded-lg overflow-hidden bg-white">
                            {/* Cabeçalho da Pergunta */}
                            <button
                              onClick={() => toggleQuestion(question.id)}
                              className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {isQuestionExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{question.text}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                          {question.type === 'TEXT_SHORT' ? 'Texto Curto' : 'Texto Longo'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {question.totalResponses} {question.totalResponses === 1 ? 'resposta' : 'respostas'}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex-shrink-0 text-right">
                                      <div className="text-lg font-semibold text-gray-900">
                                        {question.totalResponses}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </button>

                            {/* Respostas expansíveis */}
                            {isQuestionExpanded && (
                              <div className="border-t bg-gray-50 p-4">
                                <div className="space-y-3">
                                  {question.responses.map((response) => (
                                    <div
                                      key={response.id}
                                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                                    >
                                      <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2">
                                          {response.respondent && (
                                            <>
                                              <span className="font-medium text-gray-900">
                                                {response.respondent.name}
                                              </span>
                                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                                {response.respondent.type === 'MEDICO' ? 'Médico' : 'Distribuidor'}
                                              </span>
                                              {response.respondent.specialty && (
                                                <span className="text-xs text-gray-500">
                                                  • {response.respondent.specialty}
                                                </span>
                                              )}
                                              {response.respondent.company && (
                                                <span className="text-xs text-gray-500">
                                                  • {response.respondent.company}
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                          {format(new Date(response.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </span>
                                      </div>
                                      <p className="text-gray-700 whitespace-pre-wrap">{response.value}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
