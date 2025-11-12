import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteFormButton } from '@/components/forms/DeleteFormButton'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getForms() {
  const forms = await prisma.form.findMany({
    include: {
      creator: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          questions: true,
          responses: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return forms
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

export default async function FormsPage() {
  const forms = await getForms()

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link href="/admin/forms/new">
          <Button className="w-full sm:w-auto">+ Novo Formulário</Button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-sintegra-gray-medium mb-4">
              Nenhum formulário criado ainda
            </p>
            <Link href="/admin/forms/new">
              <Button>Criar Primeiro Formulário</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{form.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {form.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      statusColors[form.status]
                    }`}
                  >
                    {statusLabels[form.status]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-mobile">
                  <span className="text-sintegra-gray-medium">Tipo:</span>
                  <span className="font-medium">{typeLabels[form.type]}</span>
                </div>
                <div className="flex items-center justify-between text-mobile">
                  <span className="text-sintegra-gray-medium">Perguntas:</span>
                  <span className="font-medium">{form._count.questions}</span>
                </div>
                <div className="flex items-center justify-between text-mobile">
                  <span className="text-sintegra-gray-medium">Respostas:</span>
                  <span className="font-medium">{form._count.responses}</span>
                </div>
                <div className="flex items-center justify-between text-caption-mobile">
                  <span className="text-sintegra-gray-medium">Criado:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(form.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <div className="pt-4 button-group-mobile">
                  <Link href={`/admin/forms/${form.id}`} className="flex-1 sm:flex-initial">
                    <Button variant="outline" className="w-full" size="sm">
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/admin/forms/${form.id}/edit`} className="flex-1 sm:flex-initial">
                    <Button className="w-full" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <div className="flex-1 sm:flex-initial">
                    <DeleteFormButton
                      formId={form.id}
                      formTitle={form.title}
                      hasResponses={form._count.responses > 0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
