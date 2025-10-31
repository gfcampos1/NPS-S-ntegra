"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuestionInsights } from '@/components/dashboard/QuestionInsights'
import { FileText, Users, Calendar } from 'lucide-react'

type QuestionInsight = {
  id: string
  text: string
  type: string
  totalResponses: number
  chartData: { label: string; value: number }[]
}

type FormInsight = {
  id: string
  title: string
  type: string
  totalResponses: number
  questions: QuestionInsight[]
  responsesByDate: Record<string, number>
}

type DashboardData = {
  totalForms: number
  totalRespondents: number
  totalResponses: number
  formInsights: FormInsight[]
  responsesByType: Record<string, number>
  responsesByMonth: Record<string, number>
}

const typeLabels: Record<string, string> = {
  MEDICOS: 'Médicos',
  DISTRIBUIDORES: 'Distribuidores',
  CUSTOM: 'Customizado',
}

const typeColors: Record<string, string> = {
  MEDICOS: 'bg-blue-100 text-blue-800',
  DISTRIBUIDORES: 'bg-green-100 text-green-800',
  CUSTOM: 'bg-purple-100 text-purple-800',
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL')

  // Filtrar dados por tipo e data
  const filteredData = useMemo(() => {
    let filtered = data.formInsights

    // Filtrar por tipo
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(form => form.type === selectedType)
    }

    // Filtrar por mês (não implementado ainda no backend, apenas UI)
    // if (selectedMonth !== 'ALL') {
    //   // Lógica de filtragem por mês
    // }

    const totalResponses = filtered.reduce((sum, form) => sum + form.totalResponses, 0)

    return {
      ...data,
      formInsights: filtered,
      totalResponses,
    }
  }, [data, selectedType, selectedMonth])

  // Meses disponíveis (baseado nos dados)
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    Object.keys(data.responsesByMonth || {}).forEach(month => months.add(month))
    return Array.from(months).sort().reverse()
  }, [data.responsesByMonth])

  return (
    <div className="p-6 space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>Filtre os dados por tipo de público ou período</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtro por Tipo */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Público</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('ALL')}
              >
                Todos
              </Button>
              <Button
                variant={selectedType === 'MEDICOS' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('MEDICOS')}
                className={selectedType === 'MEDICOS' ? '' : 'border-blue-300 hover:bg-blue-50'}
              >
                <Users className="h-4 w-4 mr-2" />
                Médicos ({data.responsesByType.MEDICOS || 0})
              </Button>
              <Button
                variant={selectedType === 'DISTRIBUIDORES' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('DISTRIBUIDORES')}
                className={selectedType === 'DISTRIBUIDORES' ? '' : 'border-green-300 hover:bg-green-50'}
              >
                <Users className="h-4 w-4 mr-2" />
                Distribuidores ({data.responsesByType.DISTRIBUIDORES || 0})
              </Button>
              <Button
                variant={selectedType === 'CUSTOM' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('CUSTOM')}
                className={selectedType === 'CUSTOM' ? '' : 'border-purple-300 hover:bg-purple-50'}
              >
                <FileText className="h-4 w-4 mr-2" />
                Customizado ({data.responsesByType.CUSTOM || 0})
              </Button>
            </div>
          </div>

          {/* Filtro por Período */}
          <div>
            <label className="text-sm font-medium mb-2 block">Período</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMonth === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMonth('ALL')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Todos os períodos
              </Button>
              {availableMonths.slice(0, 6).map(month => (
                <Button
                  key={month}
                  variant={selectedMonth === month ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMonth(month)}
                >
                  {month} ({data.responsesByMonth[month]})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pesquisas realizadas</CardTitle>
            <CardDescription>
              {selectedType === 'ALL' && selectedMonth === 'ALL'
                ? 'Total de respostas concluídas'
                : 'Respostas filtradas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-600">
              {filteredData.totalResponses}
            </div>
            {(selectedType !== 'ALL' || selectedMonth !== 'ALL') && (
              <p className="text-xs text-gray-500 mt-1">
                de {data.totalResponses} total
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Formulários</CardTitle>
            <CardDescription>
              {selectedType === 'ALL' ? 'Total cadastrados' : `Tipo: ${typeLabels[selectedType]}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {selectedType === 'ALL' ? data.totalForms : filteredData.formInsights.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Respondentes cadastrados</CardTitle>
            <CardDescription>Total de contatos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalRespondents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Divisão por Tipo de Público */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas por Tipo de Público</CardTitle>
          <CardDescription>Distribuição das respostas por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(data.responsesByType).map(([type, count]) => (
              <div
                key={type}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedType(type)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[type]}`}>
                    {typeLabels[type]}
                  </span>
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {((count / data.totalResponses) * 100).toFixed(1)}% do total
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights das perguntas */}
      <QuestionInsights data={filteredData.formInsights} />

      {/* Mensagem quando não há dados */}
      {filteredData.formInsights.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">
              Nenhuma resposta encontrada para os filtros selecionados
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedType('ALL')
                setSelectedMonth('ALL')
              }}
            >
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
