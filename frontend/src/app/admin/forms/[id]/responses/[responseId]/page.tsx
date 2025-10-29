import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponseStatusBadge } from '@/components/forms/ResponseStatusBadge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function parseAnswer(answer: any) {
  if (!answer) return '---'

  const { numericValue, textValue, selectedOption, question } = answer

  switch (question?.type) {
    case 'NPS':
    case 'RATING_1_5':
      return numericValue ?? '---'
    case 'TEXT_SHORT':
    case 'TEXT_LONG':
      return textValue && textValue.trim() !== '' ? textValue : '---'
    case 'MULTIPLE_CHOICE': {
      if (!textValue) return '---'
      try {
        const parsed = JSON.parse(textValue)
        return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : '---'
      } catch {
        return '---'
      }
    }
    case 'SINGLE_CHOICE':
    case 'COMPARISON':
      return selectedOption ?? '---'
    default:
      return textValue ?? numericValue ?? selectedOption ?? '---'
  }
}

function formatDate(value: Date | null) {
  if (!value) return '---'
  return format(value, "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })
}

async function getResponseDetail(ids: { formId: string; responseId: string }) {
  const response = await prisma.response.findUnique({
    where: { id: ids.responseId, formId: ids.formId },
    select: {
      id: true,
      formId: true,
      status: true,
      progress: true,
      startedAt: true,
      completedAt: true,
      form: {
        select: {
          id: true,
          title: true,
        },
      },
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
              description: true,
              type: true,
              order: true,
            },
          },
        },
        orderBy: {
          question: {
            order: 'asc',
          },
        },
      },
    },
  })

  return response
}

export default async function ResponseDetailPage({
  params,
}: {
  params: { id: string; responseId: string }
}) {
  const response = await getResponseDetail({
    formId: params.id,
    responseId: params.responseId,
  })

  if (!response) {
    notFound()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sintegra-gray-dark">
            Detalhes da resposta
          </h1>
          <p className="text-sintegra-gray-medium">
            Formulario: {response.form.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/forms/${response.formId}/responses`}>
            <Button variant="outline">Voltar</Button>
          </Link>
          <Link href={`/admin/forms/${response.formId}`}>
            <Button>Ver formulario</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Respondente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-600">
            <p className="font-medium text-slate-900">
              {response.respondent?.name || 'Nao identificado'}
            </p>
            <p>{response.respondent?.email || 'Email nao informado'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-slate-600">
            <ResponseStatusBadge status={response.status as any} />
            <span>{response.progress ?? 0}% completo</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-900">Iniciada:</span>{' '}
              {formatDate(response.startedAt)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Concluida:</span>{' '}
              {formatDate(response.completedAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Respostas enviadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {response.answers.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma resposta registrada para este respondente.
            </p>
          ) : (
            response.answers.map((answer) => (
              <div
                key={answer.id}
                className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-slate-900">
                    {answer.question?.text}
                  </p>
                  {answer.question?.description && (
                    <p className="text-xs text-slate-500">
                      {answer.question.description}
                    </p>
                  )}
                </div>
                <div className="mt-3 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Resposta: </span>
                  {parseAnswer(answer)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
