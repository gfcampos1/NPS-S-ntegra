import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { User, Mail, Phone, MapPin, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getRespondents() {
  const respondents = await prisma.respondent.findMany({
    include: {
      _count: {
        select: {
          responses: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return respondents
}

const typeLabels: Record<string, string> = {
  MEDICO: 'Médico',
  DISTRIBUIDOR: 'Distribuidor',
}

const typeBadgeColors: Record<string, string> = {
  MEDICO: 'bg-blue-100 text-blue-800',
  DISTRIBUIDOR: 'bg-green-100 text-green-800',
}

export default async function RespondentsPage() {
  const respondents = await getRespondents()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-sintegra-gray-dark">Respondentes</h2>
          <p className="text-sintegra-gray-medium">
            Gerencie médicos, distribuidores e outros respondentes
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/respondents/import">
            <Button variant="outline">Importar CSV</Button>
          </Link>
          <Link href="/admin/respondents/new">
            <Button>+ Novo Respondente</Button>
          </Link>
        </div>
      </div>

      {respondents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-sintegra-gray-medium mb-4">
              Nenhum respondente cadastrado ainda
            </p>
            <div className="flex gap-3">
              <Link href="/admin/respondents/import">
                <Button variant="outline">Importar CSV</Button>
              </Link>
              <Link href="/admin/respondents/new">
                <Button>Adicionar Primeiro Respondente</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resumo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-sintegra-gray-medium">Total</p>
                  <p className="text-2xl font-bold">{respondents.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-sintegra-gray-medium">Médicos</p>
                  <p className="text-2xl font-bold">
                    {respondents.filter((r) => r.type === 'MEDICO').length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-sintegra-gray-medium">Distribuidores</p>
                  <p className="text-2xl font-bold">
                    {respondents.filter((r) => r.type === 'DISTRIBUIDOR').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Todos os Respondentes</CardTitle>
              <CardDescription>
                {respondents.length} {respondents.length === 1 ? 'pessoa' : 'pessoas'} cadastradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {respondents.map((respondent) => (
                  <div
                    key={respondent.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-sintegra-gray-dark">
                          {respondent.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            typeBadgeColors[respondent.type]
                          }`}
                        >
                          {typeLabels[respondent.type]}
                        </span>
                        {respondent.category && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                            {respondent.category}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid gap-2 md:grid-cols-3 text-sm text-sintegra-gray-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{respondent.email}</span>
                        </div>
                        {respondent.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{respondent.phone}</span>
                          </div>
                        )}
                        {(respondent.city || respondent.state) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {[respondent.city, respondent.state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {respondent.specialty && (
                        <div className="text-sm text-sintegra-gray-medium">
                          Especialidade: {respondent.specialty}
                          {respondent.crm && ` • CRM: ${respondent.crm}`}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-sintegra-gray-medium">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{respondent._count.responses} respostas</span>
                        </div>
                        <span>
                          Cadastrado{' '}
                          {formatDistanceToNow(new Date(respondent.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/admin/respondents/${respondent.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                      <Link href={`/admin/respondents/${respondent.id}/edit`}>
                        <Button size="sm">Editar</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
