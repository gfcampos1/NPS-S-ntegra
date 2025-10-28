import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { calculateNPS, interpretNPS } from '@/lib/nps'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDashboardData() {
  // Buscar todas as respostas com score NPS
  const responses = await prisma.response.findMany({
    where: {
      status: 'COMPLETED',
    },
    include: {
      answers: {
        where: {
          question: {
            type: 'NPS',
          },
        },
      },
      respondent: true,
      form: true,
    },
  })

  // Extrair scores
  const scores = responses
    .map(r => r.answers[0]?.numericValue)
    .filter((score): score is number => score !== null && score !== undefined)

  const npsData = calculateNPS(scores)
  const interpretation = interpretNPS(npsData.nps)

  // Estatísticas gerais
  const totalForms = await prisma.form.count()
  const totalRespondents = await prisma.respondent.count()
  const totalResponses = responses.length

  // Respostas por tipo
  const responsesByType = await prisma.response.groupBy({
    by: ['formId'],
    where: {
      status: 'COMPLETED',
    },
    _count: true,
  })

  return {
    npsData,
    interpretation,
    totalForms,
    totalRespondents,
    totalResponses,
    responsesByType,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-sintegra-gray-dark">Dashboard</h2>
        <p className="text-sintegra-gray-medium">
          Visão geral do sistema de NPS
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: data.interpretation.color }}>
              {data.npsData.nps}
            </div>
            <p className="text-xs text-sintegra-gray-medium">
              {data.interpretation.label} - {data.interpretation.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalResponses}</div>
            <p className="text-xs text-sintegra-gray-medium">
              Respostas completas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formulários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalForms}</div>
            <p className="text-xs text-sintegra-gray-medium">
              Formulários ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respondentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRespondents}</div>
            <p className="text-xs text-sintegra-gray-medium">
              Cadastrados no sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição NPS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Promotores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-nps-promotor">
                {data.npsData.promoters}
              </div>
              <div className="text-sm text-sintegra-gray-medium">
                {data.npsData.promotersPercentage.toFixed(1)}% do total
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-nps-promotor"
                  style={{ width: `${data.npsData.promotersPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Neutros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-nps-neutro">
                {data.npsData.neutrals}
              </div>
              <div className="text-sm text-sintegra-gray-medium">
                {data.npsData.neutralsPercentage.toFixed(1)}% do total
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-nps-neutro"
                  style={{ width: `${data.npsData.neutralsPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detratores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-nps-detrator">
                {data.npsData.detractors}
              </div>
              <div className="text-sm text-sintegra-gray-medium">
                {data.npsData.detractorsPercentage.toFixed(1)}% do total
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-nps-detrator"
                  style={{ width: `${data.npsData.detractorsPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link para formulários */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-sintegra-gray-medium">
            Em breve: links para criar formulários, visualizar respostas e gerar relatórios
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
