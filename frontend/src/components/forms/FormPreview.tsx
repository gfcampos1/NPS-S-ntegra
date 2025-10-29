'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Smartphone } from 'lucide-react'

type Form = {
  id: string
  title: string
  description: string | null
  questions: Question[]
}

type Question = {
  id: string
  type: string
  text: string
  description: string | null
  required: boolean
  order: number
  options: string[] | null
}

type FormPreviewProps = {
  form: Form
}

export function FormPreview({ form }: FormPreviewProps) {
  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'NPS':
        return (
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                className="aspect-square rounded-md border-2 border-gray-300 hover:border-sintegra-blue hover:bg-sintegra-blue hover:text-white transition-colors text-sm font-medium"
                disabled
              >
                {i}
              </button>
            ))}
          </div>
        )

      case 'RATING_1_5':
        return (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                className="aspect-square rounded-md border-2 border-gray-300 hover:border-sintegra-blue hover:bg-sintegra-blue hover:text-white transition-colors text-lg font-medium"
                disabled
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
          <div className="grid grid-cols-3 gap-2">
            {comparisonOptions.map((option) => (
              <button
                key={option}
                className="px-4 py-3 rounded-md border-2 border-gray-300 hover:border-sintegra-blue hover:bg-sintegra-blue hover:text-white transition-colors font-medium"
                disabled
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
            placeholder="Digite sua resposta..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
            disabled
          />
        )

      case 'TEXT_LONG':
        return (
          <textarea
            placeholder="Digite sua resposta..."
            className="w-full min-h-[100px] px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
            disabled
          />
        )

      case 'MULTIPLE_CHOICE':
      case 'SINGLE_CHOICE':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center gap-3 px-4 py-3 rounded-md border border-gray-300 hover:border-sintegra-blue cursor-pointer transition-colors"
              >
                <input
                  type={question.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                  className="text-sintegra-blue focus:ring-sintegra-blue"
                  disabled
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-sintegra-blue" />
          <div>
            <CardTitle>Preview Mobile</CardTitle>
            <CardDescription>
              Como o formulário aparecerá no celular
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 rounded-lg p-6 max-w-sm mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-sintegra-blue text-white p-6">
              <h2 className="text-xl font-bold mb-2">{form.title}</h2>
              {form.description && (
                <p className="text-sm opacity-90">{form.description}</p>
              )}
            </div>

            {/* Questions */}
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              {form.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Adicione perguntas para visualizar</p>
                </div>
              ) : (
                form.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {index + 1}. {question.text}
                        {question.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </p>
                      {question.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {question.description}
                        </p>
                      )}
                    </div>
                    {renderQuestion(question)}
                  </div>
                ))
              )}

              {form.questions.length > 0 && (
                <Button className="w-full" disabled>
                  Enviar Respostas
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
