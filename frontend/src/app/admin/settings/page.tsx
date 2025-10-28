import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>
            Gerencie as configurações gerais do sistema NPS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-sintegra-gray-dark mb-2">
                Configurações de Empresa
              </h3>
              <p className="text-sm text-sintegra-gray-medium">
                Funcionalidade em desenvolvimento. Em breve você poderá configurar:
              </p>
              <ul className="mt-2 text-sm text-sintegra-gray-medium list-disc list-inside space-y-1">
                <li>Nome e logo da empresa</li>
                <li>Dados de contato</li>
                <li>Preferências de e-mail</li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-sintegra-gray-dark mb-2">
                Notificações
              </h3>
              <p className="text-sm text-sintegra-gray-medium">
                Funcionalidade em desenvolvimento. Em breve você poderá configurar:
              </p>
              <ul className="mt-2 text-sm text-sintegra-gray-medium list-disc list-inside space-y-1">
                <li>Alertas de novas respostas</li>
                <li>Relatórios automáticos</li>
                <li>Lembretes de pesquisas pendentes</li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-sintegra-gray-dark mb-2">
                Integrações
              </h3>
              <p className="text-sm text-sintegra-gray-medium">
                Funcionalidade em desenvolvimento. Em breve você poderá integrar com:
              </p>
              <ul className="mt-2 text-sm text-sintegra-gray-medium list-disc list-inside space-y-1">
                <li>Plataformas de e-mail (SendGrid, Mailgun)</li>
                <li>CRM (Salesforce, HubSpot)</li>
                <li>Análise de dados (Google Analytics)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
