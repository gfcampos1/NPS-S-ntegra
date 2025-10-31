"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Database, CheckCircle2, Clock, AlertTriangle, Loader2, Play } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Migration {
  name: string
  description: string
  executed: boolean
}

interface ExecutedMigration {
  migration_name: string
  finished_at: string
  logs: string
}

export default function MigrationsPage() {
  const [availableMigrations, setAvailableMigrations] = useState<Migration[]>([])
  const [executedMigrations, setExecutedMigrations] = useState<ExecutedMigration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [executingMigration, setExecutingMigration] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadMigrations()
  }, [])

  const loadMigrations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/database/migrate')
      if (!response.ok) throw new Error('Erro ao carregar migrations')
      const data = await response.json()
      setAvailableMigrations(data.availableMigrations || [])
      setExecutedMigrations(data.executedMigrations || [])
    } catch (error) {
      console.error('Error loading migrations:', error)
      setError('Erro ao carregar migrations')
    } finally {
      setIsLoading(false)
    }
  }

  const executeMigration = async (migrationName: string) => {
    setExecutingMigration(migrationName)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/database/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migrationName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao executar migration')
      }

      setSuccess(`Migration "${migrationName}" executada com sucesso!`)
      await loadMigrations()
    } catch (error: any) {
      console.error('Error executing migration:', error)
      setError(error.message || 'Erro ao executar migration')
    } finally {
      setExecutingMigration(null)
    }
  }

  const pendingMigrations = availableMigrations.filter(m => !m.executed)
  const completedMigrations = availableMigrations.filter(m => m.executed)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-sintegra-gray-dark">Migrations de Banco de Dados</h2>
        <p className="text-sintegra-gray-medium">
          Execute alterações na estrutura do banco de dados de forma segura
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Status Resumido */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingMigrations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Executadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedMigrations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{availableMigrations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Migrations Pendentes */}
      {pendingMigrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Migrations Pendentes
            </CardTitle>
            <CardDescription>
              Estas alterações ainda não foram aplicadas ao banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingMigrations.map((migration) => (
                <div
                  key={migration.name}
                  className="flex items-start justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sintegra-gray-dark mb-1">
                      {migration.name}
                    </h4>
                    <p className="text-sm text-gray-600">{migration.description}</p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={executingMigration !== null}
                        className="ml-4 border-blue-300 hover:bg-blue-50"
                      >
                        {executingMigration === migration.name ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Executando...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Executar
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Executar Migration</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja executar a migration <strong>{migration.name}</strong>?
                          <br /><br />
                          <strong>Atenção:</strong> Esta ação irá modificar a estrutura do banco de dados.
                          Certifique-se de ter um backup recente antes de continuar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault()
                            executeMigration(migration.name)
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Executar Migration
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migrations Executadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Migrations Executadas
          </CardTitle>
          <CardDescription>
            Histórico de alterações aplicadas ao banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Carregando migrations...</p>
            </div>
          ) : completedMigrations.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              Nenhuma migration foi executada ainda
            </div>
          ) : (
            <div className="space-y-3">
              {completedMigrations.map((migration) => {
                const executedInfo = executedMigrations.find(
                  em => em.migration_name.includes(migration.name)
                )

                return (
                  <div
                    key={migration.name}
                    className="flex items-start justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-sintegra-gray-dark">
                          {migration.name}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{migration.description}</p>
                      {executedInfo && (
                        <p className="text-xs text-gray-500">
                          Executada{' '}
                          {formatDistanceToNow(new Date(executedInfo.finished_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Avisos Importantes */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Sempre faça backup do banco de dados antes de executar migrations</li>
            <li>Migrations não podem ser revertidas automaticamente</li>
            <li>Execute migrations em horários de baixo tráfego</li>
            <li>Apenas Super Admins podem executar esta operação</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
