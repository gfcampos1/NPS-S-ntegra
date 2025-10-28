'use client'

import { useState } from 'react'
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

export default function NewRespondentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateRespondentInput>({
    resolver: zodResolver(createRespondentSchema),
    defaultValues: {
      type: 'MEDICO',
    },
  })

  const selectedType = watch('type')

  const onSubmit = async (data: CreateRespondentInput) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/respondents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar respondente')
      }

      router.push('/admin/respondents')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar respondente')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/respondents">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-sintegra-gray-dark">
            Novo Respondente
          </h1>
          <p className="text-sintegra-gray-medium">
            Cadastre um novo médico ou distribuidor
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Respondente</CardTitle>
          <CardDescription>
            Preencha os dados para cadastrar no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ex: Dr. João Silva"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo <span className="text-red-500">*</span>
                </Label>
                <select
                  id="type"
                  {...register('type')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sintegra-blue"
                >
                  <option value="MEDICO">Médico</option>
                  <option value="DISTRIBUIDOR">Distribuidor</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder={
                    selectedType === 'MEDICO' ? 'Ex: Clínico Geral' : 'Ex: Regional'
                  }
                />
              </div>

              {selectedType === 'MEDICO' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                      id="specialty"
                      {...register('specialty')}
                      placeholder="Ex: Cardiologia"
                    />
                  </div>
                </>
              )}

              {selectedType === 'DISTRIBUIDOR' && (
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="Ex: Distribuidora ABC"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Região</Label>
                <Input
                  id="region"
                  {...register('region')}
                  placeholder="Ex: Região Sul, São Paulo, etc."
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Link href="/admin/respondents">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Cadastrar Respondente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
