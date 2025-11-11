'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFormSchema, type CreateFormInput } from '@/lib/validations/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type SurveyMoment = {
  id: string
  name: string
  description: string | null
  color: string | null
}

export default function NewFormPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [moments, setMoments] = useState<SurveyMoment[]>([])
  const [loadingMoments, setLoadingMoments] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormInput>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      status: 'DRAFT',
      type: 'CUSTOM',
    },
  })

  useEffect(() => {
    loadMoments()
  }, [])

  const loadMoments = async () => {
    try {
      const response = await fetch('/api/survey-moments')
      if (response.ok) {
        const data = await response.json()
        setMoments(data)
      }
    } catch (error) {
      console.error('Erro ao carregar momentos:', error)
    } finally {
      setLoadingMoments(false)
    }
  }

  const onSubmit = async (data: CreateFormInput) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar formulário')
      }

      const form = await response.json()
      router.push(`/admin/forms/${form.id}/edit`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar formulário')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/forms">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-sintegra-gray-dark">
            Novo Formulário
          </h1>
          <p className="text-sintegra-gray-medium">
            Crie um novo formulário de pesquisa NPS
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Preencha as informações iniciais do formulário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ex: Pesquisa NPS Médicos Q1 2025"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
                placeholder="Descreva o objetivo desta pesquisa..."
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Tipo de Formulário <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                {...register('type')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
              >
                <option value="MEDICOS">Médicos</option>
                <option value="DISTRIBUIDORES">Distribuidores</option>
                <option value="CUSTOM">Personalizado</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surveyMomentId">
                Momento de Pesquisa
              </Label>
              <select
                id="surveyMomentId"
                {...register('surveyMomentId')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
                disabled={loadingMoments}
              >
                <option value="">Sem categoria (selecione depois)</option>
                {moments.map((moment) => (
                  <option key={moment.id} value={moment.id}>
                    {moment.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-secondary-500">
                Organize seu formulário por momento/contexto de pesquisa
              </p>
              {errors.surveyMomentId && (
                <p className="text-sm text-red-500">{errors.surveyMomentId.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Link href="/admin/forms">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar e Adicionar Perguntas'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
