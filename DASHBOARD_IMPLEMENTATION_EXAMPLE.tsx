// EXEMPLO DE IMPLEMENTAÇÃO - Dashboard NPS Inteligente
// Este arquivo mostra a estrutura conceitual, não é código final

import { prisma } from '@/lib/prisma'
import { calculateNPS, interpretNPS } from '@/lib/nps'

// ============================================
// 1. TIPOS E INTERFACES
// ============================================

type DashboardFilters = {
  dateRange: 'last7days' | 'last30days' | 'last90days' | 'custom'
  startDate?: Date
  endDate?: Date
  formIds?: string[]  // Formulários específicos
  respondentType?: 'MEDICO' | 'DISTRIBUIDOR' | null
  categories?: string[]  // Especialidades, regiões, etc
}

type NPSMetrics = {
  nps: number           // -100 a +100
  promoters: number
  neutrals: number
  detractors: number
  totalResponses: number
  trend: number         // Comparação com período anterior
  breakdown: {
    promotersPercentage: number
    neutralsPercentage: number
    detractorsPercentage: number
  }
}

type PublicComparison = {
  medicos: NPSMetrics
  distribuidores: NPSMetrics
  difference: number
}

type FormPerformance = {
  formId: string
  formTitle: string
  nps: number
  totalResponses: number
  interpretation: ReturnType<typeof interpretNPS>
}

type CategoryPerformance = {
  category: string
  categoryType: 'specialty' | 'region' | 'company'
  nps: number
  totalResponses: number
}

type TimeSeriesData = {
  period: string  // "2024-01", "2024-02"
  nps: number
  totalResponses: number
  medicos?: number
  distribuidores?: number
}

type DashboardData = {
  global: NPSMetrics
  publicComparison: PublicComparison
  formPerformance: FormPerformance[]
  topCategories: CategoryPerformance[]
  bottomCategories: CategoryPerformance[]
  timeSeries: TimeSeriesData[]
  satisfactionAverage: number  // Média de RATING_1_5
  alerts: Alert[]
}

type Alert = {
  type: 'warning' | 'success' | 'info'
  message: string
  severity: 'high' | 'medium' | 'low'
}

// ============================================
// 2. FUNÇÕES DE AGREGAÇÃO (Server-Side)
// ============================================

async function getGlobalNPSMetrics(filters: DashboardFilters): Promise<NPSMetrics> {
  // Constrói o WHERE clause baseado nos filtros
  const whereClause = buildWhereClause(filters)

  // Busca APENAS respostas de perguntas tipo NPS
  const npsAnswers = await prisma.answer.findMany({
    where: {
      question: { type: 'NPS' },
      response: {
        status: 'COMPLETED',
        ...whereClause
      }
    },
    select: {
      numericValue: true,
      response: {
        select: {
          completedAt: true
        }
      }
    }
  })

  // Extrai apenas os valores numéricos
  const scores = npsAnswers
    .map(a => a.numericValue)
    .filter((v): v is number => v !== null)

  // Calcula NPS usando a função existente
  const npsData = calculateNPS(scores)

  // Calcula NPS do período anterior para comparação
  const previousPeriodNPS = await calculatePreviousPeriodNPS(filters)
  const trend = npsData.nps - previousPeriodNPS

  return {
    ...npsData,
    totalResponses: scores.length,
    trend,
    breakdown: {
      promotersPercentage: (npsData.promoters / scores.length) * 100,
      neutralsPercentage: (npsData.neutrals / scores.length) * 100,
      detractorsPercentage: (npsData.detractors / scores.length) * 100
    }
  }
}

async function getPublicComparison(filters: DashboardFilters): Promise<PublicComparison> {
  // NPS para Médicos
  const medicosNPS = await getGlobalNPSMetrics({
    ...filters,
    respondentType: 'MEDICO'
  })

  // NPS para Distribuidores
  const distribuidoresNPS = await getGlobalNPSMetrics({
    ...filters,
    respondentType: 'DISTRIBUIDOR'
  })

  return {
    medicos: medicosNPS,
    distribuidores: distribuidoresNPS,
    difference: medicosNPS.nps - distribuidoresNPS.nps
  }
}

async function getFormPerformance(filters: DashboardFilters): Promise<FormPerformance[]> {
  // Busca todos os formulários
  const forms = await prisma.form.findMany({
    where: {
      status: 'PUBLISHED',
      // Filtro opcional por formIds
      ...(filters.formIds?.length ? { id: { in: filters.formIds } } : {})
    },
    select: {
      id: true,
      title: true,
      type: true
    }
  })

  // Para cada formulário, calcula o NPS
  const performance: FormPerformance[] = []

  for (const form of forms) {
    const formFilters = { ...filters, formIds: [form.id] }
    const metrics = await getGlobalNPSMetrics(formFilters)

    // Só inclui se tiver pelo menos 10 respostas
    if (metrics.totalResponses >= 10) {
      performance.push({
        formId: form.id,
        formTitle: form.title,
        nps: metrics.nps,
        totalResponses: metrics.totalResponses,
        interpretation: interpretNPS(metrics.nps)
      })
    }
  }

  // Ordena por NPS (melhor primeiro)
  return performance.sort((a, b) => b.nps - a.nps)
}

async function getCategoryPerformance(
  filters: DashboardFilters,
  categoryType: 'specialty' | 'region' | 'company'
): Promise<CategoryPerformance[]> {
  // Busca todas as categorias únicas
  const fieldMap = {
    specialty: 'specialty',
    region: 'region',
    company: 'company'
  }
  const field = fieldMap[categoryType]

  // Raw SQL para performance
  const categories = await prisma.$queryRaw<Array<{ category: string }>>`
    SELECT DISTINCT ${field} as category
    FROM "Respondent"
    WHERE ${field} IS NOT NULL
  `

  const performance: CategoryPerformance[] = []

  for (const { category } of categories) {
    // Filtra respostas dessa categoria
    const npsAnswers = await prisma.answer.findMany({
      where: {
        question: { type: 'NPS' },
        response: {
          status: 'COMPLETED',
          respondent: {
            [field]: category
          },
          ...buildWhereClause(filters)
        }
      },
      select: {
        numericValue: true
      }
    })

    const scores = npsAnswers
      .map(a => a.numericValue)
      .filter((v): v is number => v !== null)

    if (scores.length >= 5) {  // Mínimo 5 respostas
      const { nps } = calculateNPS(scores)
      performance.push({
        category,
        categoryType,
        nps,
        totalResponses: scores.length
      })
    }
  }

  return performance.sort((a, b) => b.nps - a.nps)
}

async function getTimeSeries(filters: DashboardFilters): Promise<TimeSeriesData[]> {
  const whereClause = buildWhereClause(filters)

  // Busca respostas NPS agrupadas por mês
  const npsAnswers = await prisma.answer.findMany({
    where: {
      question: { type: 'NPS' },
      response: {
        status: 'COMPLETED',
        ...whereClause
      }
    },
    select: {
      numericValue: true,
      response: {
        select: {
          completedAt: true,
          respondent: {
            select: {
              type: true
            }
          }
        }
      }
    },
    orderBy: {
      response: {
        completedAt: 'asc'
      }
    }
  })

  // Agrupa por mês
  const monthlyData = new Map<string, {
    scores: number[],
    medicosScores: number[],
    distribuidoresScores: number[]
  }>()

  for (const answer of npsAnswers) {
    if (!answer.numericValue || !answer.response.completedAt) continue

    const month = answer.response.completedAt.toISOString().slice(0, 7) // "2024-01"

    if (!monthlyData.has(month)) {
      monthlyData.set(month, {
        scores: [],
        medicosScores: [],
        distribuidoresScores: []
      })
    }

    const data = monthlyData.get(month)!
    data.scores.push(answer.numericValue)

    if (answer.response.respondent?.type === 'MEDICO') {
      data.medicosScores.push(answer.numericValue)
    } else if (answer.response.respondent?.type === 'DISTRIBUIDOR') {
      data.distribuidoresScores.push(answer.numericValue)
    }
  }

  // Converte para array
  const timeSeries: TimeSeriesData[] = []

  for (const [period, data] of monthlyData.entries()) {
    const { nps } = calculateNPS(data.scores)
    const medicosNPS = data.medicosScores.length > 0
      ? calculateNPS(data.medicosScores).nps
      : undefined
    const distribuidoresNPS = data.distribuidoresScores.length > 0
      ? calculateNPS(data.distribuidoresScores).nps
      : undefined

    timeSeries.push({
      period,
      nps,
      totalResponses: data.scores.length,
      medicos: medicosNPS,
      distribuidores: distribuidoresNPS
    })
  }

  return timeSeries.sort((a, b) => a.period.localeCompare(b.period))
}

async function getSatisfactionAverage(filters: DashboardFilters): Promise<number> {
  const whereClause = buildWhereClause(filters)

  // Busca APENAS respostas de perguntas tipo RATING_1_5
  const ratingAnswers = await prisma.answer.findMany({
    where: {
      question: { type: 'RATING_1_5' },
      response: {
        status: 'COMPLETED',
        ...whereClause
      },
      numericValue: { not: null }
    },
    select: {
      numericValue: true
    }
  })

  if (ratingAnswers.length === 0) return 0

  const sum = ratingAnswers.reduce((acc, a) => acc + (a.numericValue || 0), 0)
  return sum / ratingAnswers.length
}

async function generateAlerts(data: DashboardData): Promise<Alert[]> {
  const alerts: Alert[] = []

  // Alerta: NPS crítico
  if (data.global.nps < 0) {
    alerts.push({
      type: 'warning',
      message: `NPS Global está negativo (${data.global.nps}). Ação imediata necessária!`,
      severity: 'high'
    })
  }

  // Alerta: Queda acentuada
  if (data.global.trend < -10) {
    alerts.push({
      type: 'warning',
      message: `NPS caiu ${Math.abs(data.global.trend)} pontos vs período anterior`,
      severity: 'high'
    })
  }

  // Alerta: Performance excelente
  if (data.global.nps > 70) {
    alerts.push({
      type: 'success',
      message: `NPS excelente! Você está no top 10% do setor.`,
      severity: 'low'
    })
  }

  // Alerta: Diferença grande entre públicos
  if (Math.abs(data.publicComparison.difference) > 20) {
    const better = data.publicComparison.difference > 0 ? 'médicos' : 'distribuidores'
    alerts.push({
      type: 'info',
      message: `Grande diferença entre públicos: ${better} têm NPS ${Math.abs(data.publicComparison.difference)} pontos superior`,
      severity: 'medium'
    })
  }

  // Alerta: Categoria com problema
  if (data.bottomCategories.length > 0 && data.bottomCategories[0].nps < 20) {
    alerts.push({
      type: 'warning',
      message: `Categoria "${data.bottomCategories[0].category}" com NPS crítico (${data.bottomCategories[0].nps})`,
      severity: 'high'
    })
  }

  return alerts
}

// ============================================
// 3. FUNÇÃO PRINCIPAL - AGREGADOR
// ============================================

async function getDashboardData(filters: DashboardFilters): Promise<DashboardData> {
  // Executa queries em paralelo para performance
  const [
    global,
    publicComparison,
    formPerformance,
    specialtyPerformance,
    regionPerformance,
    timeSeries,
    satisfactionAverage
  ] = await Promise.all([
    getGlobalNPSMetrics(filters),
    getPublicComparison(filters),
    getFormPerformance(filters),
    getCategoryPerformance(filters, 'specialty'),
    getCategoryPerformance(filters, 'region'),
    getTimeSeries(filters),
    getSatisfactionAverage(filters)
  ])

  // Combina categorias e pega top/bottom
  const allCategories = [...specialtyPerformance, ...regionPerformance]
  const topCategories = allCategories.slice(0, 5)
  const bottomCategories = allCategories.slice(-5).reverse()

  const dashboardData: DashboardData = {
    global,
    publicComparison,
    formPerformance,
    topCategories,
    bottomCategories,
    timeSeries,
    satisfactionAverage,
    alerts: []  // Será preenchido depois
  }

  // Gera alertas baseado nos dados
  dashboardData.alerts = await generateAlerts(dashboardData)

  return dashboardData
}

// ============================================
// 4. HELPER FUNCTIONS
// ============================================

function buildWhereClause(filters: DashboardFilters) {
  const where: any = {}

  // Filtro de data
  if (filters.dateRange !== 'custom') {
    const daysMap = {
      last7days: 7,
      last30days: 30,
      last90days: 90
    }
    const days = daysMap[filters.dateRange]
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    where.completedAt = {
      gte: startDate
    }
  } else if (filters.startDate && filters.endDate) {
    where.completedAt = {
      gte: filters.startDate,
      lte: filters.endDate
    }
  }

  // Filtro de formulário
  if (filters.formIds && filters.formIds.length > 0) {
    where.formId = {
      in: filters.formIds
    }
  }

  // Filtro de tipo de respondente
  if (filters.respondentType) {
    where.respondent = {
      type: filters.respondentType
    }
  }

  // Filtro de categorias
  if (filters.categories && filters.categories.length > 0) {
    where.respondent = {
      ...where.respondent,
      OR: [
        { specialty: { in: filters.categories } },
        { region: { in: filters.categories } },
        { category: { in: filters.categories } }
      ]
    }
  }

  return where
}

async function calculatePreviousPeriodNPS(filters: DashboardFilters): Promise<number> {
  // Calcula o mesmo período, mas deslocado para trás
  const previousFilters = { ...filters }

  if (filters.dateRange === 'last30days') {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - 30)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 60)

    previousFilters.dateRange = 'custom'
    previousFilters.startDate = startDate
    previousFilters.endDate = endDate
  }
  // ... outras lógicas

  const previousMetrics = await getGlobalNPSMetrics(previousFilters)
  return previousMetrics.nps
}

// ============================================
// 5. COMPONENTE REACT (Client-Side)
// ============================================

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardNPS() {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: 'last30days'
  })

  // Fetch data com React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => fetch('/api/dashboard', {
      method: 'POST',
      body: JSON.stringify(filters)
    }).then(r => r.json()),
    staleTime: 5 * 60 * 1000  // Cache por 5 minutos
  })

  if (isLoading) return <DashboardSkeleton />
  if (error) return <DashboardError />
  if (!data || data.global.totalResponses === 0) return <DashboardEmpty />

  const interpretation = interpretNPS(data.global.nps)

  return (
    <div className="p-6 space-y-6">
      {/* Filtros */}
      <DashboardFilters filters={filters} onChange={setFilters} />

      {/* Alertas */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert, i) => (
            <Alert key={i} variant={alert.type}>
              {alert.message}
            </Alert>
          ))}
        </div>
      )}

      {/* Cards Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* NPS Global */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">NPS Score Geral</CardTitle>
            <CardDescription>Últimos {filters.dateRange}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="text-4xl font-bold mb-2"
              style={{ color: interpretation.color }}
            >
              {data.global.nps > 0 ? '+' : ''}{data.global.nps}
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              {interpretation.label} — {interpretation.description}
            </p>
            {data.global.trend !== 0 && (
              <p className={`text-xs flex items-center gap-1 ${
                data.global.trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.global.trend > 0 ? '↗' : '↘'}
                {Math.abs(data.global.trend)} vs período anterior
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Baseado em {data.global.totalResponses} respostas
            </p>
          </CardContent>
        </Card>

        {/* Satisfação Média */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
            <CardDescription>Perguntas de avaliação (1-5)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-600">
              {data.satisfactionAverage.toFixed(1)}
              <span className="text-2xl text-muted-foreground">/5.0</span>
            </div>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={i < Math.round(data.satisfactionAverage) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outras métricas... */}
      </div>

      {/* Breakdown NPS */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Respostas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Promotores (9-10)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${data.global.breakdown.promotersPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-16 text-right">
                  {data.global.breakdown.promotersPercentage.toFixed(0)}%
                </span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  ({data.global.promoters})
                </span>
              </div>
            </div>
            {/* Repetir para neutrals e detractors */}
          </div>
        </CardContent>
      </Card>

      {/* Comparação por Público */}
      <Card>
        <CardHeader>
          <CardTitle>NPS por Público</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              {
                name: 'Médicos',
                nps: data.publicComparison.medicos.nps,
                responses: data.publicComparison.medicos.totalResponses
              },
              {
                name: 'Distribuidores',
                nps: data.publicComparison.distribuidores.nps,
                responses: data.publicComparison.distribuidores.totalResponses
              }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[-100, 100]} />
              <Tooltip />
              <Bar dataKey="nps" fill="#4169B1" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-center text-muted-foreground mt-2">
            Diferença: {Math.abs(data.publicComparison.difference)} pontos
          </p>
        </CardContent>
      </Card>

      {/* Tendência Temporal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do NPS ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[-100, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="nps" stroke="#4169B1" strokeWidth={2} name="NPS Geral" />
              {data.timeSeries.some(d => d.medicos) && (
                <Line type="monotone" dataKey="medicos" stroke="#10b981" strokeWidth={2} name="Médicos" />
              )}
              {data.timeSeries.some(d => d.distribuidores) && (
                <Line type="monotone" dataKey="distribuidores" stroke="#f59e0b" strokeWidth={2} name="Distribuidores" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance por Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>NPS por Formulário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.formPerformance.map(form => (
              <div key={form.formId} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{form.formTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {form.totalResponses} respostas
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${((form.nps + 100) / 200) * 100}%`,
                        backgroundColor: form.interpretation.color
                      }}
                    />
                  </div>
                  <span
                    className="text-lg font-bold w-12 text-right"
                    style={{ color: form.interpretation.color }}
                  >
                    {form.nps > 0 ? '+' : ''}{form.nps}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top/Bottom Categories */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏆 Top 5 Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topCategories.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{i + 1}. {cat.category}</span>
                  <span className="text-sm font-semibold text-green-600">
                    +{cat.nps}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚠️ Bottom 5 Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.bottomCategories.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{i + 1}. {cat.category}</span>
                  <span className="text-sm font-semibold text-red-600">
                    {cat.nps > 0 ? '+' : ''}{cat.nps}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// 6. API ROUTE
// ============================================

// app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const filters: DashboardFilters = await request.json()

  try {
    const data = await getDashboardData(filters)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
