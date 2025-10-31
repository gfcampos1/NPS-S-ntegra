'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react'

type Question = {
  id: string
  type: string
  text: string
  description: string | null
  required: boolean
  options: string[] | null
  order: number
  conditionalLogic?: {
    dependsOn: string
    condition: string
    value: number | string
  } | null
}

type Form = {
  id: string
  title: string
  description: string | null
  questions: Question[]
}

export default function SurveyResponsePage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState<Form | null>(null)
  const [respondentName, setRespondentName] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [params.token])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/r/${params.token}`)
      const data = await response.json()

      if (!response.ok) {
        if (data.completed) {
          setIsCompleted(true)
        } else {
          setError(data.error || 'Erro ao carregar formulário')
        }
        return
      }

      setForm(data.form)
      setRespondentName(data.respondent.name)
      setAnswers(data.progress || {})
    } catch (err) {
      setError('Erro ao carregar formulário')
    } finally {
      setIsLoading(false)
    }
  }

  const saveProgress = async (finalAnswers?: Record<string, any>, complete = false) => {
    try {
      const response = await fetch(`/api/r/${params.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: finalAnswers || answers,
          completed: complete,
        }),
      })

      return response.ok
    } catch (err) {
      console.error('Error saving progress:', err)
      return false
    }
  }

  // Verifica se uma pergunta é obrigatória (base ou condicional)
  const isQuestionRequired = (question: Question): boolean => {
    // Se é sempre obrigatória
    if (question.required) return true

    // Se tem lógica condicional
    if (question.conditionalLogic) {
      const { dependsOn, condition, value: expectedValue } = question.conditionalLogic
      const actualValue = answers[dependsOn]

      // Se a pergunta da qual depende não foi respondida ainda, não é obrigatória
      if (actualValue === undefined || actualValue === null) return false

      // Avalia a condição
      const numericActual = typeof actualValue === 'number' ? actualValue : Number(actualValue)
      const numericExpected = typeof expectedValue === 'number' ? expectedValue : Number(expectedValue)

      switch (condition) {
        case '<':
          return numericActual < numericExpected
        case '<=':
          return numericActual <= numericExpected
        case '==':
          return actualValue == expectedValue // Comparação flexível
        case '>=':
          return numericActual >= numericExpected
        case '>':
          return numericActual > numericExpected
        default:
          return false
      }
    }

    return false
  }

  const handleAnswer = (questionId: string, value: any) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    // Auto-save progress
    saveProgress(newAnswers, false)
  }

  const handleNext = () => {
    if (!form) return

    const currentQuestion = form.questions[currentQuestionIndex]

    if (isQuestionRequired(currentQuestion) && !answers[currentQuestion.id]) {
      alert('Esta pergunta é obrigatória')
      return
    }

    if (currentQuestionIndex < form.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!form) return

    // Check all required questions (base + conditional)
    const unansweredRequired = form.questions.filter(
      (q) => isQuestionRequired(q) && !answers[q.id]
    )

    if (unansweredRequired.length > 0) {
      alert(`Por favor, responda todas as perguntas obrigatórias (${unansweredRequired.length} restantes)`)
      return
    }

    setIsSubmitting(true)
    
    const success = await saveProgress(answers, true)
    
    if (success) {
      setIsCompleted(true)
    } else {
      alert('Erro ao enviar respostas. Tente novamente.')
    }
    
    setIsSubmitting(false)
  }

  const renderQuestion = (question: Question) => {
    const value = answers[question.id]

    switch (question.type) {
      case 'NPS':
        return (
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(question.id, i)}
                className={`aspect-square rounded-lg border-2 text-lg font-bold transition-all ${
                  value === i
                    ? 'border-sintegra-blue bg-sintegra-blue text-white scale-110'
                    : 'border-gray-300 hover:border-sintegra-blue hover:scale-105'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        )

      case 'RATING_1_5':
        return (
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(question.id, i + 1)}
                className={`aspect-square rounded-lg border-2 text-2xl font-bold transition-all ${
                  value === i + 1
                    ? 'border-sintegra-blue bg-sintegra-blue text-white scale-110'
                    : 'border-gray-300 hover:border-sintegra-blue hover:scale-105'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )

      case 'COMPARISON': {
        const comparisonOptions =
          question.options && question.options.length > 0
            ? question.options
            : ['Pior', 'Igual', 'Melhor']
        return (
          <div className="grid grid-cols-1 gap-3">
            {comparisonOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(question.id, option)}
                className={`px-6 py-4 rounded-lg border-2 text-lg font-medium transition-all ${
                  value === option
                    ? 'border-sintegra-blue bg-sintegra-blue text-white'
                    : 'border-gray-300 hover:border-sintegra-blue'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )
      }

      case 'TEXT_SHORT':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-sintegra-blue focus:outline-none text-lg"
            placeholder="Digite sua resposta..."
          />
        )

      case 'TEXT_LONG':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full min-h-[120px] px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-sintegra-blue focus:outline-none text-lg resize-none"
            placeholder="Digite sua resposta..."
          />
        )

      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const selected = Array.isArray(value) && value.includes(option)
              return (
                <button
                  key={option}
                  onClick={() => {
                    const currentValues = Array.isArray(value) ? value : []
                    const newValues = selected
                      ? currentValues.filter((v) => v !== option)
                      : [...currentValues, option]
                    handleAnswer(question.id, newValues)
                  }}
                  className={`w-full px-6 py-4 rounded-lg border-2 text-left transition-all ${
                    selected
                      ? 'border-sintegra-blue bg-sintegra-blue text-white'
                      : 'border-gray-300 hover:border-sintegra-blue'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        )

      case 'SINGLE_CHOICE':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full px-6 py-4 rounded-lg border-2 text-left transition-all ${
                  value === option
                    ? 'border-sintegra-blue bg-sintegra-blue text-white'
                    : 'border-gray-300 hover:border-sintegra-blue'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-sintegra-blue animate-spin mx-auto mb-4" />
          <p className="text-sintegra-gray-medium">Carregando pesquisa...</p>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sintegra-blue to-blue-600 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-sintegra-gray-dark mb-4">
            Obrigado!
          </h1>
          <p className="text-lg text-sintegra-gray-medium mb-2">
            Sua resposta foi enviada com sucesso.
          </p>
          <p className="text-sm text-sintegra-gray-medium">
            Agradecemos sua participação!
          </p>
        </Card>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-sintegra-gray-medium">{error || 'Formulário não encontrado'}</p>
        </Card>
      </div>
    )
  }

  const currentQuestion = form.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / form.questions.length) * 100
  const isLastQuestion = currentQuestionIndex === form.questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-sintegra-blue to-blue-600 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-t-2xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-sintegra-gray-dark mb-2">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-sintegra-gray-medium">{form.description}</p>
          )}
          <p className="text-sm text-sintegra-gray-medium mt-2">
            Olá, {respondentName}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div
            className="bg-sintegra-blue h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 shadow-lg min-h-[400px] flex flex-col">
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-sm text-sintegra-gray-medium mb-2">
                Pergunta {currentQuestionIndex + 1} de {form.questions.length}
              </p>
              <h2 className="text-xl font-semibold text-sintegra-gray-dark mb-2">
                {currentQuestion.text}
                {isQuestionRequired(currentQuestion) && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h2>
              {currentQuestion.description && (
                <p className="text-sm text-sintegra-gray-medium">
                  {currentQuestion.description}
                </p>
              )}
              {currentQuestion.conditionalLogic && isQuestionRequired(currentQuestion) && !currentQuestion.required && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                  Esta pergunta se tornou obrigatória baseada em sua resposta anterior
                </div>
              )}
            </div>

            {renderQuestion(currentQuestion)}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <p className="text-sm text-sintegra-gray-medium">
              {Object.keys(answers).length} / {form.questions.length} respondidas
            </p>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Respostas
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-b-2xl p-4 shadow-lg text-center text-xs text-sintegra-gray-medium">
          Suas respostas são salvas automaticamente
        </div>
      </div>
    </div>
  )
}
