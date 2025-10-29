import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Edit, Mail, Phone, Building2, MapPin, UserCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getRespondent(id: string) {
  const respondent = await prisma.respondent.findUnique({
    where: { id },
    include: {
      responses: {
        include: {
          form: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          startedAt: 'desc',
        },
      },
    },
  })

  if (!respondent) {
    notFound()
  }

  return respondent
}

const typeLabels: Record<string, string> = {
  MEDICO: 'Médico',
  DISTRIBUIDOR: 'Distribuidor',
}

const statusLabels: Record<string, string> = {
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluída',
  ABANDONED: 'Abandonada',
}

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ABANDONED: 'bg-gray-100 text-gray-800',
}

export default async function RespondentDetailPage({ params }: { params: { id: string } }) {
  const respondent = await getRespondent(params.id)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-sintegra-gray-dark">{respondent.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-medium">
              {typeLabels[respondent.type]}
            </span>
            {respondent.consent && (
              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                ✓ Consentimento LGPD
              </span>
            )}
          </div>
        </div>

        <Link href={`/admin/respondents/${respondent.id}/edit`}>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-sintegra-gray-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a href={`mailto:${respondent.email}`} className="text-lg font-medium text-primary-600 hover:underline">
              {respondent.email}
            </a>
          </CardContent>
        </Card>

        {respondent.phone && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-sintegra-gray-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href={`tel:${respondent.phone}`} className="text-lg font-medium text-primary-600 hover:underline">
                {respondent.phone}
              </a>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-sintegra-gray-medium">
              Respostas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{respondent.responses.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {respondent.category && (
              <div>
                <dt className="text-sintegra-gray-medium mb-1 flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Categoria
                </dt>
                <dd className="font-medium">{respondent.category}</dd>
              </div>
            )}
            
            {respondent.specialty && (
              <div>
                <dt className="text-sintegra-gray-medium mb-1">Especialidade</dt>
                <dd className="font-medium">{respondent.specialty}</dd>
              </div>
            )}

            {respondent.region && (
              <div>
                <dt className="text-sintegra-gray-medium mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Região
                </dt>
                <dd className="font-medium">{respondent.region}</dd>
              </div>
            )}

            {respondent.company && (
              <div>
                <dt className="text-sintegra-gray-medium mb-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Empresa
                </dt>
                <dd className="font-medium">{respondent.company}</dd>
              </div>
            )}

            <div>
              <dt className="text-sintegra-gray-medium mb-1">Cadastrado em</dt>
              <dd className="font-medium">
                {format(new Date(respondent.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </dd>
            </div>

            {respondent.consentDate && (
              <div>
                <dt className="text-sintegra-gray-medium mb-1">Consentimento em</dt>
                <dd className="font-medium">
                  {format(new Date(respondent.consentDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Respostas</CardTitle>
          <CardDescription>
            {respondent.responses.length} {respondent.responses.length === 1 ? 'resposta' : 'respostas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {respondent.responses.length === 0 ? (
            <div className="text-center py-8 text-sintegra-gray-medium">
              Nenhuma resposta registrada ainda
            </div>
          ) : (
            <div className="space-y-3">
              {respondent.responses.map((response) => (
                <div
                  key={response.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sintegra-gray-dark mb-1">
                        {response.form.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-sintegra-gray-medium">
                        <span>
                          Iniciada: {format(new Date(response.startedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {response.completedAt && (
                          <span>
                            Concluída: {format(new Date(response.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[response.status]}`}>
                      {statusLabels[response.status]}
                    </span>
                  </div>
                  {response.progress > 0 && response.progress < 100 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-sintegra-gray-medium mb-1">
                        <span>Progresso</span>
                        <span>{response.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500"
                          style={{ width: `${response.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
