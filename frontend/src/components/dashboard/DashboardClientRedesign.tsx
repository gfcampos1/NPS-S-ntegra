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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Visão Geral de Pesquisas
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Acompanhe respostas, formulários e tipos de público por período
          </p>
        </div>

        {/* Barra de Filtros */}
        <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
                    className={selectedType === 'ALL' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
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
                        className={selectedType === type ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
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
                  className="w-full hover:bg-blue-50 dark:hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pesquisas Realizadas */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 opacity-90">
                      <FileText className="h-5 w-5" />
                      <p className="text-sm font-medium uppercase tracking-wide">
                        Pesquisas Realizadas
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-5xl font-bold">
                        {filteredData.totalResponses}
                      </h3>
                      <p className="text-sm opacity-80">
                        Total de respostas concluídas
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <TrendingUp className="h-8 w-8" />
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
            <Card className="border-none shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 opacity-90">
                      <FileText className="h-5 w-5" />
                      <p className="text-sm font-medium uppercase tracking-wide">
                        Formulários Cadastrados
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-5xl font-bold">
                        {data.totalForms}
                      </h3>
                      <p className="text-sm opacity-80">
                        Total de formulários ativos
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <FileText className="h-8 w-8" />
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
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 opacity-90">
                      <Users className="h-5 w-5" />
                      <p className="text-sm font-medium uppercase tracking-wide">
                        Respondentes Cadastrados
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-5xl font-bold">
                        {data.totalRespondents}
                      </h3>
                      <p className="text-sm opacity-80">
                        Total de contatos cadastrados
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <Users className="h-8 w-8" />
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
          <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Médicos */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-500 rounded-lg">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        Médicos
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {distributionByType.MEDICOS.count}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {distributionByType.MEDICOS.percentage}% do total
                      </p>
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${distributionByType.MEDICOS.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Distribuidores */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-500 rounded-lg">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-green-900 dark:text-green-100">
                        Distribuidores
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                        {distributionByType.DISTRIBUIDORES.count}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {distributionByType.DISTRIBUIDORES.percentage}% do total
                      </p>
                      <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${distributionByType.DISTRIBUIDORES.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customizado */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-800/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-500 rounded-lg">
                        <Settings2 className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                        Customizado
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                        {distributionByType.CUSTOM.count}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {distributionByType.CUSTOM.percentage}% do total
                      </p>
                      <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
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
          <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
