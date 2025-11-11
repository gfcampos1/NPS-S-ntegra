'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  TrendingUp,
} from 'lucide-react'

type MigrationData = {
  summary: {
    total: number
    pendingMigration: number
    alreadyMigrated: number
  }
  formsWithoutMoment: Array<{
    id: string
    title: string
    type: string
    status: string
    createdAt: string
    _count: {
      responses: number
    }
    suggestedMoment?: {
      id: string
      name: string
      slug: string
      color: string
      icon: string
    }
  }>
  formsWithMoment: Array<{
    id: string
    title: string
    surveyMoment: {
      id: string
      name: string
      slug: string
    }
  }>
  availableMoments: Array<{
    id: string
    name: string
    slug: string
    color: string
    icon: string
  }>
}

export default function DataMigrationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [migrationData, setMigrationData] = useState<MigrationData | null>(null)

  // Verificar se é super admin
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/admin/dashboard')
      return
    }

    loadMigrationData()
  }, [isSuperAdmin, router])

  const loadMigrationData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/survey-moments/migrate')

      if (!response.ok) {
        throw new Error('Erro ao carregar dados')
      }

      const data = await response.json()
      setMigrationData(data)
    } catch (error) {
      toast.error('Erro ao carregar dados de migração')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const executeMigration = async () => {
    try {
      setMigrating(true)

      const response = await fetch('/api/survey-moments/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategy: 'auto',
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao executar migração')
      }

      const result = await response.json()

      toast.success(result.message)
      setShowConfirmDialog(false)

      // Recarregar dados
      await loadMigrationData()
    } catch (error) {
      toast.error('Erro ao executar migração')
      console.error(error)
    } finally {
      setMigrating(false)
    }
  }

  if (!isSuperAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const summary = migrationData?.summary

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Migração de Dados - Momentos de Pesquisa
        </h1>
        <p className="text-secondary-600">
          Migre formulários existentes para os novos Momentos de Pesquisa
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-secondary-600">
              Total de Formulários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="text-3xl font-bold">{summary?.total || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-secondary-600">
              Pendentes de Migração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div className="text-3xl font-bold">{summary?.pendingMigration || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-secondary-600">
              Já Migrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div className="text-3xl font-bold">{summary?.alreadyMigrated || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Migração Automática */}
      {summary && summary.pendingMigration > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Migração Automática</CardTitle>
            <CardDescription>
              Migre automaticamente os formulários pendentes baseado em palavras-chave no título
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>Como funciona:</strong> Formulários com palavras-chave como "treinamento", "lab", "cadáver"
                serão classificados como "Treinamento Cadáver Lab". Os demais irão para "Satisfação e Pós-Mercado".
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Preview da Migração:</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {migrationData?.formsWithoutMoment.map(form => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{form.title}</div>
                      <div className="text-xs text-secondary-500">
                        {form._count.responses} respostas
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-secondary-400" />
                      {form.suggestedMoment && (
                        <Badge
                          style={{
                            backgroundColor: form.suggestedMoment.color || '#3B82F6',
                            color: 'white'
                          }}
                        >
                          {form.suggestedMoment.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={migrating}
                size="lg"
                className="flex-1"
              >
                {migrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Executar Migração Automática
                  </>
                )}
              </Button>
              <Button
                onClick={loadMigrationData}
                variant="outline"
                size="lg"
              >
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulários Já Migrados */}
      {summary && summary.alreadyMigrated > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Formulários Migrados</CardTitle>
            <CardDescription>
              {summary.alreadyMigrated} formulário(s) já categorizado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {migrationData?.formsWithMoment.map(form => (
                <div
                  key={form.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{form.title}</div>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {form.surveyMoment.name}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sucesso */}
      {summary && summary.pendingMigration === 0 && summary.total > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Migração Completa!</strong> Todos os formulários foram categorizados em momentos de pesquisa.
          </AlertDescription>
        </Alert>
      )}

      {/* Dialog de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Migração Automática</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá migrar <strong>{summary?.pendingMigration}</strong> formulário(s)
              para os momentos de pesquisa baseado em palavras-chave no título.
              <br /><br />
              Esta operação pode ser revertida manualmente se necessário.
              <br /><br />
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={migrating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeMigration}
              disabled={migrating}
            >
              {migrating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrando...
                </>
              ) : (
                'Confirmar Migração'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
