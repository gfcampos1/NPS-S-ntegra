'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createQuestionSchema, type CreateQuestionInput } from '@/lib/validations/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'

type Question = {
  id: string
  type: string
  text: string
  description: string | null
  required: boolean
  order: number
  options: string[] | null
  conditionalLogic: any
}

type QuestionBuilderProps = {
  formId: string
  question?: Question | null
  allQuestions?: Question[]
  onClose: () => void
  onSave: () => void
}

const questionTypes = [
  { value: 'NPS', label: 'NPS (0-10)' },
  { value: 'RATING_1_5', label: 'Rating 1-5' },
  { value: 'COMPARISON', label: 'Comparacao (Melhor/Igual/Pior)' },
  { value: 'TEXT_SHORT', label: 'Texto Curto' },
  { value: 'TEXT_LONG', label: 'Texto Longo' },
  { value: 'MULTIPLE_CHOICE', label: 'Multipla Escolha' },
  { value: 'SINGLE_CHOICE', label: 'Escolha Unica' },
]
export function QuestionBuilder({ formId, question, allQuestions = [], onClose, onSave }: QuestionBuilderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [options, setOptions] = useState<string[]>(question?.options || [])
  const [newOption, setNewOption] = useState('')

  // Estado para lógica condicional
  const [hasConditionalLogic, setHasConditionalLogic] = useState(!!question?.conditionalLogic)
  const [conditionalDependsOn, setConditionalDependsOn] = useState(
    question?.conditionalLogic?.dependsOn || ''
  )
  const [conditionalCondition, setConditionalCondition] = useState(
    question?.conditionalLogic?.condition || '<='
  )
  const [conditionalValue, setConditionalValue] = useState(
    question?.conditionalLogic?.value?.toString() || ''
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateQuestionInput>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: question
      ? {
          type: question.type as any,
          text: question.text,
          description: question.description || '',
          required: question.required,
          order: question.order,
          options: question.options || undefined,
        }
      : {
          required: false,
          order: 1,
        },
  })

  const selectedType = watch('type')
  const needsOptions = ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(selectedType)
  const defaultComparisonOptions = ['Pior', 'Igual', 'Melhor']

  useEffect(() => {
    if (!needsOptions) {
      setOptions([])
    }
  }, [needsOptions])

  const onSubmit = async (data: CreateQuestionInput) => {
    setIsSubmitting(true)
    setError('')

    try {
      // Build payload - only include fields that have values
      const payload: any = {
        type: data.type,
        text: data.text,
        required: data.required,
        order: data.order,
      }

      // Add optional fields only if they have values
      if (data.description) {
        payload.description = data.description
      }

      // Adiciona lógica condicional se configurada
      if (hasConditionalLogic && conditionalDependsOn && conditionalValue) {
        payload.conditionalLogic = {
          dependsOn: conditionalDependsOn,
          condition: conditionalCondition,
          value: isNaN(Number(conditionalValue)) ? conditionalValue : Number(conditionalValue),
        }
      } else {
        payload.conditionalLogic = null
      }

      switch (data.type) {
        case 'NPS': {
          payload.scaleMin = 0
          payload.scaleMax = 10
          payload.scaleLabels = {
            0: 'Nada provavel',
            5: 'Neutro',
            10: 'Extremamente provavel',
          }
          break
        }
        case 'RATING_1_5': {
          payload.scaleMin = 1
          payload.scaleMax = 5
          payload.scaleLabels = {
            1: 'Muito ruim',
            2: 'Ruim',
            3: 'Regular',
            4: 'Bom',
            5: 'Excelente',
          }
          break
        }
        case 'COMPARISON': {
          payload.options = defaultComparisonOptions
          break
        }
        case 'MULTIPLE_CHOICE':
        case 'SINGLE_CHOICE': {
          if (options.length > 0) {
            payload.options = options
          }
          break
        }
      }

      const url = question
        ? `/api/questions/${question.id}`
        : `/api/forms/${formId}/questions`
      
      const method = question ? 'PATCH' : 'POST'

      console.log('Sending payload:', payload) // Debug

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Erro ao salvar pergunta')
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar pergunta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()])
      setNewOption('')
    }
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {question ? 'Editar Pergunta' : 'Nova Pergunta'}
              </CardTitle>
              <CardDescription>
                Configure os detalhes da pergunta
              </CardDescription>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Tipo de Pergunta <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                {...register('type')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
              >
                <option value="">Selecione um tipo</option>
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">
                Pergunta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="text"
                {...register('text')}
                placeholder="Ex: Em uma escala de 0 a 10, qual a probabilidade de voce recomendar nosso produto?"
              />
              {errors.text && (
                <p className="text-sm text-red-500">{errors.text.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao (opcional)</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Texto de ajuda adicional..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">
                Ordem <span className="text-red-500">*</span>
              </Label>
              <Input
                id="order"
                type="number"
                {...register('order', { valueAsNumber: true })}
                min="1"
              />
              {errors.order && (
                <p className="text-sm text-red-500">{errors.order.message}</p>
              )}
            </div>

            {needsOptions && (
              <div className="space-y-2">
                <Label>Opcoes de Resposta</Label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={option} disabled className="flex-1" />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Nova opcao..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                    />
                    <Button type="button" onClick={addOption}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Seção de Lógica Condicional */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasConditionalLogic"
                  checked={hasConditionalLogic}
                  onChange={(e) => setHasConditionalLogic(e.target.checked)}
                  className="rounded border-gray-300 text-sintegra-blue focus:ring-sintegra-blue"
                />
                <Label htmlFor="hasConditionalLogic" className="cursor-pointer font-semibold">
                  Tornar obrigatória condicionalmente
                </Label>
              </div>

              {hasConditionalLogic && (
                <div className="ml-6 p-4 bg-blue-50 rounded-lg space-y-3">
                  <p className="text-sm text-gray-700 mb-3">
                    Esta pergunta se tornará obrigatória quando a condição abaixo for atendida:
                  </p>

                  <div className="space-y-2">
                    <Label>Depende da pergunta:</Label>
                    <select
                      value={conditionalDependsOn}
                      onChange={(e) => setConditionalDependsOn(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sintegra-blue overflow-hidden text-ellipsis"
                    >
                      <option value="">Selecione uma pergunta...</option>
                      {allQuestions
                        .filter((q) => q.id !== question?.id) // Não pode depender de si mesma
                        .sort((a, b) => a.order - b.order)
                        .map((q) => {
                          // Limita o texto a 60 caracteres
                          const truncatedText = q.text.length > 60
                            ? q.text.substring(0, 60) + '...'
                            : q.text
                          return (
                            <option key={q.id} value={q.id}>
                              #{q.order} - {truncatedText}
                            </option>
                          )
                        })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Condição:</Label>
                      <select
                        value={conditionalCondition}
                        onChange={(e) => setConditionalCondition(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
                      >
                        <option value="<">Menor que (&lt;)</option>
                        <option value="<=">Menor ou igual (≤)</option>
                        <option value="==">Igual (=)</option>
                        <option value=">=">Maior ou igual (≥)</option>
                        <option value=">">Maior que (&gt;)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Valor:</Label>
                      <Input
                        value={conditionalValue}
                        onChange={(e) => setConditionalValue(e.target.value)}
                        placeholder="Ex: 3"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-xs text-gray-600">
                      <strong>Exemplo:</strong> Se você configurar para "NPS ≤ 3", esta pergunta
                      se tornará obrigatória apenas quando o respondente der uma nota de 0 a 3
                      na pergunta NPS selecionada.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                {...register('required')}
                className="rounded border-gray-300 text-sintegra-blue focus:ring-sintegra-blue"
              />
              <Label htmlFor="required" className="cursor-pointer">
                Sempre obrigatória (independente de condições)
              </Label>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : question ? 'Atualizar' : 'Criar Pergunta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

