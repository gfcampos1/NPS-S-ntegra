"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuestionInsights } from '@/components/dashboard/QuestionInsights'
import {
  FileText,
  Users,
  Calendar,
  TrendingUp,
  Activity,
  Filter,
  RefreshCw,
  Stethoscope,
  Building2,
  Settings2,
} from 'lucide-react'
import { motion } from 'framer-motion'

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

const typeIcons: Record<string, any> = {
  MEDICOS: Stethoscope,
  DISTRIBUIDORES: Building2,
  CUSTOM: Settings2,
}

export function DashboardClientRedesign({ data }: { data: DashboardData }) {
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL')

  // Filtrar dados por tipo e data
  const filteredData = useMemo(() => {
    let filtered = data.formInsights

    if (selectedType !== 'ALL') {
      filtered = filtered.filter(form => form.type === selectedType)
    }

    const totalResponses = filtered.reduce((sum, form) => sum + form.totalResponses, 0)

    return {
      ...data,
      formInsights: filtered,
      totalResponses,
    }
  }, [data, selectedType, selectedMonth])

  // Calcular distribuição por tipo
  const distributionByType = useMemo(() => {
    const medicos = data.responsesByType.MEDICOS || 0
    const distribuidores = data.responsesByType.DISTRIBUIDORES || 0
    const customizado = data.responsesByType.CUSTOM || 0
    const total = medicos + distribuidores + customizado || 1

    return {
      MEDICOS: { count: medicos, percentage: ((medicos / total) * 100).toFixed(1) },
      DISTRIBUIDORES: { count: distribuidores, percentage: ((distribuidores / total) * 100).toFixed(1) },
      CUSTOM: { count: customizado, percentage: ((customizado / total) * 100).toFixed(1) },
    }
  }, [data.responsesByType])

  // Meses disponíveis
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    Object.keys(data.responsesByMonth || {}).forEach(month => months.add(month))
    return Array.from(months).sort().reverse()
  }, [data.responsesByMonth])

  // Animação para cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Barra de Filtros */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filtro por Tipo de Público */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tipo de Público
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedType === 'ALL' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('ALL')}
                    className={selectedType === 'ALL' ? 'bg-sintegra-blue hover:bg-sintegra-blue-medium' : ''}
                  >
                    <Activity className="h-4 w-4 mr-1" />
                    Todos
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/30">
                      {data.totalResponses}
                    </span>
                  </Button>

                  {Object.entries(typeLabels).map(([type, label]) => {
                    const Icon = typeIcons[type]
                    const count = data.responsesByType[type] || 0
                    return (
                      <Button
                        key={type}
                        variant={selectedType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                        className={selectedType === type ? 'bg-sintegra-blue hover:bg-sintegra-blue-medium' : ''}
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {label}
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {count}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Filtro por Período */}
              <div className="lg:w-64">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Período
                  </label>
                </div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="ALL">Todos os períodos</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Botão Atualizar */}
              <div className="lg:w-32 flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="w-full hover:bg-primary-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pesquisas Realizadas */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-4 w-4" />
                      <p className="text-xs font-medium uppercase tracking-wide">
                        Pesquisas Realizadas
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-4xl font-bold text-sintegra-blue">
                        {filteredData.totalResponses}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Total de respostas concluídas
                      </p>
                    </div>
                  </div>
                  <div className="text-sintegra-blue/20">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Formulários Cadastrados */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-4 w-4" />
                      <p className="text-xs font-medium uppercase tracking-wide">
                        Formulários Cadastrados
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-4xl font-bold text-primary-700">
                        {data.totalForms}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Total de formulários ativos
                      </p>
                    </div>
                  </div>
                  <div className="text-primary-700/20">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Respondentes Cadastrados */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <p className="text-xs font-medium uppercase tracking-wide">
                        Respondentes Cadastrados
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-4xl font-bold text-primary-800">
                        {data.totalRespondents}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Total de contatos cadastrados
                      </p>
                    </div>
                  </div>
                  <div className="text-primary-800/20">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Distribuição por Tipo de Público */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Distribuição por Tipo de Público
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Análise de respostas por categoria
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Médicos */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-sintegra-blue">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700">
                        Médicos
                      </h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-sintegra-blue">
                        {distributionByType.MEDICOS.count}
                      </p>
                      <p className="text-xs text-gray-500">
                        {distributionByType.MEDICOS.percentage}% do total
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-sintegra-blue h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${distributionByType.MEDICOS.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Distribuidores */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-primary-700">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700">
                        Distribuidores
                      </h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-primary-700">
                        {distributionByType.DISTRIBUIDORES.count}
                      </p>
                      <p className="text-xs text-gray-500">
                        {distributionByType.DISTRIBUIDORES.percentage}% do total
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-primary-700 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${distributionByType.DISTRIBUIDORES.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customizado */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-primary-800">
                        <Settings2 className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700">
                        Customizado
                      </h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-primary-800">
                        {distributionByType.CUSTOM.count}
                      </p>
                      <p className="text-xs text-gray-500">
                        {distributionByType.CUSTOM.percentage}% do total
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-primary-800 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${distributionByType.CUSTOM.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights das Perguntas */}
        {filteredData.formInsights.length > 0 && (
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <QuestionInsights data={filteredData.formInsights} />
          </motion.div>
        )}

        {/* Mensagem se não houver dados */}
        {filteredData.formInsights.length === 0 && (
          <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  Nenhum dado disponível
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Não há respostas para os filtros selecionados.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
