import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserManagement } from '@/components/settings/UserManagement'
import { ChangePasswordSection } from '@/components/settings/ChangePasswordSection'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Seção de Alterar Senha */}
      <ChangePasswordSection />

      <Card>
        <CardHeader>
          <CardTitle>Gestão de usuários</CardTitle>
          <CardDescription>
            Crie, remova e defina o nível de acesso dos usuários do NPS Manager.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagement />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do sistema</CardTitle>
          <CardDescription>
            Defina informações institucionais e integrações quando estiverem disponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p className="text-slate-500">
            Novas opções de personalização serão adicionadas em breve. Entre elas:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Cadastro da identidade visual da empresa</li>
            <li>Preferências de e-mail de notificação</li>
            <li>Integrações com CRM e plataformas de analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
