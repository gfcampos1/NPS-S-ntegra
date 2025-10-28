import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, Calendar, Filter } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatórios</CardTitle>
          <CardDescription>
            Gere e visualize relatórios detalhados de NPS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Relatório Geral */}
            <div className="rounded-lg border border-gray-200 p-4 hover:border-primary-500 transition-colors cursor-not-allowed opacity-60">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sintegra-gray-dark mb-1">
                    Relatório Geral de NPS
                  </h3>
                  <p className="text-sm text-sintegra-gray-medium mb-3">
                    Visão completa de todas as métricas
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Em breve
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Relatório por Período */}
            <div className="rounded-lg border border-gray-200 p-4 hover:border-primary-500 transition-colors cursor-not-allowed opacity-60">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sintegra-gray-dark mb-1">
                    Análise por Período
                  </h3>
                  <p className="text-sm text-sintegra-gray-medium mb-3">
                    Compare diferentes períodos
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Em breve
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Relatório por Segmento */}
            <div className="rounded-lg border border-gray-200 p-4 hover:border-primary-500 transition-colors cursor-not-allowed opacity-60">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sintegra-gray-dark mb-1">
                    Análise por Segmento
                  </h3>
                  <p className="text-sm text-sintegra-gray-medium mb-3">
                    Filtre por categoria ou região
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Em breve
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Excel */}
            <div className="rounded-lg border border-gray-200 p-4 hover:border-primary-500 transition-colors cursor-not-allowed opacity-60">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sintegra-gray-dark mb-1">
                    Export Excel
                  </h3>
                  <p className="text-sm text-sintegra-gray-medium mb-3">
                    Baixe dados em planilha
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Em breve
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Export PDF */}
            <div className="rounded-lg border border-gray-200 p-4 hover:border-primary-500 transition-colors cursor-not-allowed opacity-60">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sintegra-gray-dark mb-1">
                    Export PDF
                  </h3>
                  <p className="text-sm text-sintegra-gray-medium mb-3">
                    Relatório em PDF profissional
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Em breve
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agendamento */}
            <div className="rounded-lg border border-gray-200 p-4 hover:border-primary-500 transition-colors cursor-not-allowed opacity-60">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sintegra-gray-dark mb-1">
                    Relatórios Agendados
                  </h3>
                  <p className="text-sm text-sintegra-gray-medium mb-3">
                    Configure envio automático
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Em breve
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sintegra-gray-dark mb-2">
                Sistema de Relatórios em Desenvolvimento
              </h3>
              <p className="text-sm text-sintegra-gray-medium">
                As funcionalidades de relatórios estão sendo desenvolvidas e estarão disponíveis em breve. 
                Você poderá gerar relatórios detalhados, exportar dados e agendar envios automáticos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
