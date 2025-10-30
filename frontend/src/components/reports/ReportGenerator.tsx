'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, FileText, Download } from 'lucide-react'

const reportSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  formId: z.string().optional(),
  dateStart: z.string().optional(),
  dateEnd: z.string().optional(),
  respondentType: z.enum(['ALL', 'MEDICO', 'DISTRIBUIDOR']).default('ALL'),
  categories: z.string().optional(),
  format: z.enum(['CSV', 'BOTH']).default('CSV'),
})

type ReportFormData = z.infer<typeof reportSchema>

interface Form {
  id: string
  title: string
  type: string
}

interface ReportGeneratorProps {
  forms: Form[]
  onReportGenerated?: () => void
}

export function ReportGenerator({ forms, onReportGenerated }: ReportGeneratorProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      respondentType: 'ALL',
      format: 'CSV',
    },
  })

  const onSubmit = async (data: ReportFormData) => {
    setIsGenerating(true)
    setError(null)

    try {
      // Constrói filtros
      const filters: any = {}

      if (data.dateStart || data.dateEnd) {
        filters.dateRange = {
          start: data.dateStart || undefined,
          end: data.dateEnd || undefined,
        }
      }

      if (data.respondentType && data.respondentType !== 'ALL') {
        filters.respondentType = data.respondentType
      }

      if (data.categories) {
        filters.categories = data.categories.split(',').map((c) => c.trim())
      }

      // Faz a requisição
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          formId: data.formId || null,
          filters: Object.keys(filters).length > 0 ? filters : null,
          format: data.format,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar relatório')
      }

      const report = await response.json()

      // Sucesso - limpa formulário e atualiza lista
      reset()
      if (onReportGenerated) {
        onReportGenerated()
      }

      // Se foi gerado CSV, faz download automático
      if (report.csvUrl) {
        window.open(report.csvUrl, '_blank')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatório')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Gerar Novo Relatório
        </CardTitle>
        <CardDescription>
          Configure os filtros e gere um relatório personalizado de NPS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Relatório *</Label>
            <Input
              id="title"
              placeholder="Ex: Relatório NPS Q4 2024"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Descrição breve do relatório"
              {...register('description')}
            />
          </div>

          {/* Filtros */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Formulário */}
            <div className="space-y-2">
              <Label htmlFor="formId">Formulário</Label>
              <select
                id="formId"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                {...register('formId')}
              >
                <option value="">Todos os formulários</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Respondente */}
            <div className="space-y-2">
              <Label htmlFor="respondentType">Público</Label>
              <select
                id="respondentType"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                {...register('respondentType')}
              >
                <option value="ALL">Todos</option>
                <option value="MEDICO">Médicos</option>
                <option value="DISTRIBUIDOR">Distribuidores</option>
              </select>
            </div>

            {/* Data Início */}
            <div className="space-y-2">
              <Label htmlFor="dateStart">Data Início</Label>
              <Input
                id="dateStart"
                type="date"
                {...register('dateStart')}
              />
            </div>

            {/* Data Fim */}
            <div className="space-y-2">
              <Label htmlFor="dateEnd">Data Fim</Label>
              <Input
                id="dateEnd"
                type="date"
                {...register('dateEnd')}
              />
            </div>
          </div>

          {/* Categorias */}
          <div className="space-y-2">
            <Label htmlFor="categories">
              Categorias (opcional)
            </Label>
            <Input
              id="categories"
              placeholder="Ex: Cardiologia, Sul, Região Sudeste (separados por vírgula)"
              {...register('categories')}
            />
            <p className="text-xs text-gray-500">
              Filtra por especialidade, região ou categoria. Separe múltiplos valores com vírgula.
            </p>
          </div>

          {/* Formato */}
          <div className="space-y-2">
            <Label htmlFor="format">Formato de Exportação</Label>
            <select
              id="format"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              {...register('format')}
            >
              <option value="CSV">CSV (Excel)</option>
              <option value="BOTH">CSV + PDF (futuro)</option>
            </select>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Botão */}
          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando relatório...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Gerar Relatório
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
