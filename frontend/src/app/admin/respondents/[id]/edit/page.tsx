'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createRespondentSchema, type CreateRespondentInput } from '@/lib/validations/respondent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditRespondentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateRespondentInput>({
    resolver: zodResolver(createRespondentSchema),
  })

  const selectedType = watch('type')

  useEffect(() => {
    fetchRespondent()
  }, [params.id])

  const fetchRespondent = async () => {
    try {
      const response = await fetch(`/api/respondents/${params.id}`)
      if (!response.ok) throw new Error('Erro ao carregar respondente')
      
      const data = await response.json()
      reset(data)
    } catch (err) {
      setError('Erro ao carregar dados do respondente')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: CreateRespondentInput) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/respondents/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar respondente')
      }

      router.push(`/admin/respondents/${params.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar respondente')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/respondents/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-sintegra-gray-dark">
            Editar Respondente
          </h1>
          <p className="text-sintegra-gray-medium">
            Atualize as informações do respondente
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Respondente</CardTitle>
          <CardDescription>
            Campos marcados com * são obrigatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Dr. João Silva"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="joao@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="MEDICO">Médico</option>
                  <option value="DISTRIBUIDOR">Distribuidor</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(11) 98765-4321"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="Clínico Geral, Regional, etc"
                />
              </div>

              {selectedType === 'MEDICO' && (
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    {...register('specialty')}
                    placeholder="Cardiologia, Neurologia, etc"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="region">Região</Label>
                <Input
                  id="region"
                  {...register('region')}
                  placeholder="São Paulo, Região Sul, etc"
                />
              </div>

              {selectedType === 'DISTRIBUIDOR' && (
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="Nome da distribuidora"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Link href={`/admin/respondents/${params.id}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
