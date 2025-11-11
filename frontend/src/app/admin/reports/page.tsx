'use client'

import { useEffect, useState } from 'react'
import { ReportGenerator } from '@/components/reports/ReportGenerator'
import { ReportsList } from '@/components/reports/ReportsList'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, TrendingUp } from 'lucide-react'

interface SurveyMoment {
  id: string
  name: string
  color: string | null
  icon: string | null
}

interface Form {
  id: string
  title: string
  type: string
  status: string
  surveyMoment?: SurveyMoment | null
}

interface Report {
  id: string
  title: string
  description: string | null
  formId: string | null
  filters: any
  csvUrl: string | null
  pdfUrl: string | null
  generatedBy: string
  generator: {
    name: string
    email: string
  }
  createdAt: string
}

export default function ReportsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carrega dados iniciais
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Carrega formulários e relatórios em paralelo
      const [formsRes, reportsRes] = await Promise.all([
        fetch('/api/forms'),
        fetch('/api/reports'),
      ])

      if (!formsRes.ok || !reportsRes.ok) {
        throw new Error('Erro ao carregar dados')
      }

      const formsData = await formsRes.json()
      const reportsData = await reportsRes.json()

      setForms(formsData.filter((f: Form) => f.status === 'PUBLISHED'))
      setReports(reportsData)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportGenerated = () => {
    // Recarrega a lista de relatórios
    loadData()
  }

  const handleReportDeleted = (id: string) => {
    // Remove da lista local
    setReports(reports.filter((r) => r.id !== id))
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-gray-600">Carregando relatórios...</p>
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

  return (
    <div className="p-6 space-y-6">
      {/* Estatísticas Resumidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Formulários Publicados
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {forms.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Relatórios Gerados
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Exports Disponíveis
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  CSV e Excel
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gerador de Relatórios */}
      <ReportGenerator forms={forms} onReportGenerated={handleReportGenerated} />

      {/* Lista de Relatórios */}
      <ReportsList reports={reports} onDelete={handleReportDeleted} />
    </div>
  )
}
