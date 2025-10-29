import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponseStatusBadge } from '@/components/forms/ResponseStatusBadge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getFormResponses(formId: string) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      questions: {
        select: {
          id: true,
          text: true,
        },
      },
      responses: {
        orderBy: { startedAt: 'desc' },
        include: {
          respondent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          answers: {
            include: {
              question: {
                select: {
                  id: true,
                  text: true,
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!form) {
    return null
  }

  const totals = form.responses.reduce<Record<'total' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED', number>>(
    (acc, response) => {
      const status = response.status as 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
      acc.total += 1
      acc[status] += 1
      return acc
    },
    { total: 0, IN_PROGRESS: 0, COMPLETED: 0, ABANDONED: 0 }
  )

  const averageProgress =
    form.responses.length === 0
      ? 0
      : Math.round(
          form.responses.reduce((sum, response) => sum + (response.progress ?? 0), 0) /
            form.responses.length
        )

  return { form, totals, averageProgress }
}

function formatDate(value: Date | null | undefined) {
  if (!value) return '---'
  return formatDistanceToNow(value, { addSuffix: true, locale: ptBR })
}

export default async function FormResponsesPage({
  params,
}: {
  params: { id: string }
}) {
  const data = await getFormResponses(params.id)

  if (!data) {
    notFound()
  }

  const { form, totals, averageProgress } = data

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-sintegra-gray-dark">
            Respostas do formulario
          </h1>
          <p className="text-sintegra-gray-medium">
            Acompanhe o andamento das respostas, veja detalhes e exporte os dados.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/forms/${form.id}`}>
            <Button variant="outline">Voltar</Button>
          </Link>
          <Link href={`/admin/forms/${form.id}/distribute`}>
            <Button>Distribuir</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.total}</div>
            <p className="text-sm text-slate-500">
              Inclui em andamento, concluidas e abandonadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Concluidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totals.COMPLETED}</div>
            <p className="text-sm text-slate-500">
              {totals.total > 0
                ? `${Math.round((totals.COMPLETED / totals.total) * 100)}%`
                : '0%'}{' '}
              dos convites
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Em andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totals.IN_PROGRESS}</div>
            <p className="text-sm text-slate-500">
              Ainda no processo de preenchimento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progresso medio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageProgress}%</div>
            <p className="text-sm text-slate-500">
              Baseado em todas as respostas registradas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle>Resumo do formulario</CardTitle>
            <p className="text-sm text-slate-500">
              {form.title} &bull; {form.questions.length} perguntas
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="py-2 pr-4 font-semibold text-slate-600">Respondente</th>
                  <th className="py-2 pr-4 font-semibold text-slate-600">Status</th>
                  <th className="py-2 pr-4 font-semibold text-slate-600">Progresso</th>
                  <th className="py-2 pr-4 font-semibold text-slate-600">
                    Ultima atualizacao
                  </th>
                  <th className="py-2 pr-4 font-semibold text-slate-600">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {form.responses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      Nenhuma resposta registrada ainda.
                    </td>
                  </tr>
                ) : (
                  form.responses.map((response) => (
                    <tr
                      key={response.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {response.respondent?.name || 'Nao identificado'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {response.respondent?.email || 'Sem email'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <ResponseStatusBadge status={response.status as any} />
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-medium text-slate-800">
                          {response.progress ?? 0}%
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {formatDate(response.completedAt ?? response.startedAt)}
                      </td>
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/forms/${form.id}/responses/${response.id}`}
                          className="text-sintegra-blue hover:underline text-sm font-medium"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
