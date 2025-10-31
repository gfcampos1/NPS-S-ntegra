'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateFormSchema, type UpdateFormInput } from '@/lib/validations/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, GripVertical, Edit, ChevronUp, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { QuestionBuilder } from '@/components/forms/QuestionBuilder'
import { FormPreview } from '@/components/forms/FormPreview'

type Form = {
  id: string
  title: string
  description: string | null
  type: string
  status: string
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
  conditionalLogic: any
}

export default function EditFormPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFormInput>({
    resolver: zodResolver(updateFormSchema),
  })

  useEffect(() => {
    fetchForm()
  }, [params.id])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}`)
      if (!response.ok) throw new Error('Formulário não encontrado')
      
      const data = await response.json()
      setForm(data)
      reset({
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar formulário')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: UpdateFormInput) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/forms/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar formulário')
      }

      router.refresh()
      await fetchForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar formulário')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Deseja realmente excluir esta pergunta?')) return

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao excluir pergunta')

      router.refresh()
      await fetchForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir pergunta')
    }
  }

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    if (!form) return

    const questionIndex = form.questions.findIndex(q => q.id === questionId)
    if (questionIndex === -1) return

    const targetIndex = direction === 'up' ? questionIndex - 1 : questionIndex + 1
    if (targetIndex < 0 || targetIndex >= form.questions.length) return

    const currentQuestion = form.questions[questionIndex]
    const targetQuestion = form.questions[targetIndex]

    try {
      // Atualiza a ordem das duas perguntas
      await Promise.all([
        fetch(`/api/questions/${currentQuestion.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: targetQuestion.order }),
        }),
        fetch(`/api/questions/${targetQuestion.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: currentQuestion.order }),
        }),
      ])

      await fetchForm()
    } catch (err) {
      setError('Erro ao reordenar perguntas')
    }
  }

  const handleQuestionSaved = () => {
    setShowQuestionBuilder(false)
    setEditingQuestion(null)
    fetchForm()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-sintegra-gray-medium">Carregando...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-lg text-red-500">Formulário não encontrado</p>
        <Link href="/admin/forms">
          <Button>Voltar para Formulários</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/forms">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-sintegra-gray-dark">
            Editar Formulário
          </h1>
          <p className="text-sintegra-gray-medium">
            {form.title}
          </p>
        </div>
        <Link href={`/admin/forms/${form.id}`}>
          <Button variant="outline">Ver Detalhes</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form Settings and Questions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Informações básicas do formulário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" {...register('title')} />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    {...register('description')}
                    className="w-full min-h-[80px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <select
                      id="type"
                      {...register('type')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
                    >
                      <option value="MEDICOS">Médicos</option>
                      <option value="DISTRIBUIDORES">Distribuidores</option>
                      <option value="CUSTOM">Personalizado</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      {...register('status')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
                    >
                      <option value="DRAFT">Rascunho</option>
                      <option value="ACTIVE">Ativo</option>
                      <option value="INACTIVE">Inativo</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Perguntas</CardTitle>
                  <CardDescription>
                    {form.questions.length} {form.questions.length === 1 ? 'pergunta' : 'perguntas'}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowQuestionBuilder(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {form.questions.length === 0 ? (
                <div className="text-center py-8 text-sintegra-gray-medium">
                  <p>Nenhuma pergunta adicionada</p>
                  <Button
                    className="mt-4"
                    size="sm"
                    onClick={() => setShowQuestionBuilder(true)}
                  >
                    Adicionar Primeira Pergunta
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {form.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {index + 1}. {question.text}
                        </p>
                        <p className="text-xs text-gray-500">
                          {question.type.replace('_', ' ')}
                          {question.required && ' • Obrigatória'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {/* Botões de reordenação */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleMoveQuestion(question.id, 'up')}
                          disabled={index === 0}
                          title="Mover para cima"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleMoveQuestion(question.id, 'down')}
                          disabled={index === form.questions.length - 1}
                          title="Mover para baixo"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>

                        {/* Botão de editar */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingQuestion(question)
                            setShowQuestionBuilder(true)
                          }}
                          title="Editar pergunta"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Botão de deletar */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Excluir pergunta"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <FormPreview form={form} />
        </div>
      </div>

      {showQuestionBuilder && (
        <QuestionBuilder
          formId={form.id}
          question={editingQuestion}
          allQuestions={form.questions}
          onClose={() => {
            setShowQuestionBuilder(false)
            setEditingQuestion(null)
          }}
          onSave={handleQuestionSaved}
        />
      )}
    </div>
  )
}
