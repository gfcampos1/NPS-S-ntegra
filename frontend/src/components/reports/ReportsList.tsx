'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Trash2, Calendar, User, Filter } from 'lucide-react'

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
  createdAt: Date | string
}

interface ReportsListProps {
  reports: Report[]
  onDelete?: (id: string) => void
}

export function ReportsList({ reports, onDelete }: ReportsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) {
      return
    }

    setDeletingId(id)

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar relatório')
      }

      if (onDelete) {
        onDelete(id)
      }
    } catch (error) {
      alert('Erro ao deletar relatório')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: ptBR,
    })
  }

  const formatFilters = (filters: any) => {
    if (!filters) return 'Sem filtros'

    const parts: string[] = []

    if (filters.dateRange) {
      if (filters.dateRange.start || filters.dateRange.end) {
        parts.push(
          `📅 ${filters.dateRange.start || '...'} até ${filters.dateRange.end || '...'}`
        )
      }
    }

    if (filters.respondentType) {
      parts.push(`👥 ${filters.respondentType}`)
    }

    if (filters.categories && filters.categories.length > 0) {
      parts.push(`🏷️ ${filters.categories.join(', ')}`)
    }

    return parts.length > 0 ? parts.join(' • ') : 'Todos os dados'
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum relatório gerado ainda
            </h3>
            <p className="text-gray-600 text-sm">
              Use o formulário acima para gerar seu primeiro relatório
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios Gerados</CardTitle>
        <CardDescription>
          Histórico de relatórios gerados e prontos para download
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 truncate">
                      {report.title}
                    </h3>
                  </div>

                  {report.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {report.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {report.generator.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(report.createdAt)}
                    </span>
                  </div>

                  {/* Filtros */}
                  <div className="mt-2">
                    <div className="flex items-start gap-1.5 text-xs text-gray-600 bg-gray-100 px-2 py-1.5 rounded">
                      <Filter className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {formatFilters(report.filters)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {report.csvUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(report.csvUrl!, '_blank')}
                      className="w-full"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      CSV
                    </Button>
                  )}

                  {report.pdfUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(report.pdfUrl!, '_blank')}
                      className="w-full"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      PDF
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(report.id)}
                    disabled={deletingId === report.id}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
