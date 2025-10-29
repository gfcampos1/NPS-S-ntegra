import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText, Edit, Send, BarChart3, Eye } from 'lucide-react'
import { FormStatusActions } from '@/components/forms/FormStatusActions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getForm(id: string) {
  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          responses: true,
        },
      },
    },
  })

  if (!form) {
    notFound()
  }

  return form
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  PAUSED: 'Pausado',
  CLOSED: 'Encerrado',
  ARCHIVED: 'Arquivado',
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
}

const typeLabels: Record<string, string> = {
  MEDICOS: 'Médicos',
  DISTRIBUIDORES: 'Distribuidores',
  CUSTOM: 'Personalizado',
}

const questionTypeLabels: Record<string, string> = {
  NPS: 'NPS (0-10)',
  RATING_1_5: 'Escala 1-5',
  COMPARISON: 'Comparação',
  TEXT_SHORT: 'Texto Curto',
  TEXT_LONG: 'Texto Longo',
  MULTIPLE_CHOICE: 'Múltipla Escolha',
  SINGLE_CHOICE: 'Escolha Única',
}

export default async function FormDetailPage({ params }: { params: { id: string } }) {
  const form = await getForm(params.id)

  return (
    <div className="p-6 space-y-6">
      {/* Header com ações */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-sintegra-gray-dark">{form.title}</h1>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[form.status]}`}>
              {statusLabels[form.status]}
            </span>
          </div>
          {form.description && (
            <p className="text-sintegra-gray-medium">{form.description}</p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          <FormStatusActions formId={form.id} currentStatus={form.status as any} />
          <Link href={`/admin/forms/${form.id}/responses`}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Respostas
            </Button>
          </Link>
          <Link href={`/admin/forms/${form.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Link href={`/admin/forms/${form.id}/preview`}>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
          {form.status === 'PUBLISHED' && (
            <Link href={`/admin/forms/${form.id}/distribute`}>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Distribuir
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-sintegra-gray-medium">
              Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeLabels[form.type]}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-sintegra-gray-medium">
              Perguntas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{form.questions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-sintegra-gray-medium">
              Respostas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{form._count.responses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-sintegra-gray-medium">
              Criado em
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {format(new Date(form.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Perguntas */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas do Formulário</CardTitle>
          <CardDescription>
            {form.questions.length} {form.questions.length === 1 ? 'pergunta' : 'perguntas'} cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {form.questions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sintegra-gray-medium mb-4">
                Nenhuma pergunta cadastrada ainda
              </p>
              <Link href={`/admin/forms/${form.id}/edit`}>
                <Button>Adicionar Perguntas</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {form.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sintegra-gray-dark">
                          {question.text}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {questionTypeLabels[question.type]}
                        </span>
                      </div>
                      {question.description && (
                        <p className="text-sm text-sintegra-gray-medium mb-2">
                          {question.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-sintegra-gray-medium">
                        <span>
                          {question.required ? '✓ Obrigatória' : '○ Opcional'}
                        </span>
                        <span>Ordem: {question.order}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadados */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Formulário</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-sintegra-gray-medium mb-1">Criado por</dt>
              <dd className="font-medium">{form.creator.name}</dd>
            </div>
            <div>
              <dt className="text-sintegra-gray-medium mb-1">Email</dt>
              <dd className="font-medium">{form.creator.email}</dd>
            </div>
            <div>
              <dt className="text-sintegra-gray-medium mb-1">Criado em</dt>
              <dd className="font-medium">
                {format(new Date(form.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </dd>
            </div>
            <div>
              <dt className="text-sintegra-gray-medium mb-1">Última atualização</dt>
              <dd className="font-medium">
                {format(new Date(form.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
