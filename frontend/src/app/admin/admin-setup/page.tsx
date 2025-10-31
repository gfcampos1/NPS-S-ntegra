"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'

interface Migration {
  id: string
  timestamp: string
  name: string
  applied: boolean
}

interface MigrationResult {
  success: boolean
  message: string
  output?: string
  errors?: string
  hasPendingMigrations?: boolean
}

export default function AdminSetupPage() {
  const [migrations, setMigrations] = useState<Migration[]>([])
  const [status, setStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)

  useEffect(() => {
    loadMigrations()
    checkStatus()
  }, [])

  const loadMigrations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/migrations')
      if (response.ok) {
        const data = await response.json()
        setMigrations(data.migrations || [])
      }
    } catch (error) {
      console.error('Error loading migrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/admin/migrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' })
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data.output || '')
        if (data.hasPendingMigrations) {
          setResult({
            success: false,
            message: 'Existem migrações pendentes que precisam ser aplicadas',
            output: data.output
          })
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  const applyMigrations = async () => {
    if (!confirm('Tem certeza que deseja aplicar as migrações pendentes? Esta ação modificará o banco de dados.')) {
      return
    }

    setIsApplying(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/migrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deploy' })
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Recarregar status e migrações
        await checkStatus()
        await loadMigrations()
      }
    } catch (error) {
      console.error('Error applying migrations:', error)
      setResult({
        success: false,
        message: 'Erro ao conectar com o servidor'
      })
    } finally {
      setIsApplying(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    // Format: YYYYMMDDHHmmss -> YYYY-MM-DD HH:mm:ss
    const year = timestamp.substring(0, 4)
    const month = timestamp.substring(4, 6)
    const day = timestamp.substring(6, 8)
    const hour = timestamp.substring(8, 10)
    const minute = timestamp.substring(10, 12)
    const second = timestamp.substring(12, 14)
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-sintegra-gray-dark">Configuração de Administrador</h2>
        <p className="text-sintegra-gray-medium">
          Gerenciamento avançado do sistema - Apenas Super Administradores
        </p>
      </div>

      {/* Status Alert */}
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5" />
            )}
            <div className="flex-1 space-y-2">
              <AlertDescription className="font-medium">
                {result.message}
              </AlertDescription>
              {result.output && (
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto max-h-40">
                  {result.output}
                </pre>
              )}
              {result.errors && (
                <pre className="text-xs bg-red-50 text-red-800 p-3 rounded overflow-x-auto max-h-40">
                  {result.errors}
                </pre>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Database Migrations Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-sintegra-blue" />
              <div>
                <CardTitle>Migrações do Banco de Dados</CardTitle>
                <CardDescription>
                  Gerencie as alterações de schema do banco de dados
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => {
                loadMigrations()
                checkStatus()
              }}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={applyMigrations}
              disabled={isApplying || isLoading}
              className="bg-sintegra-blue hover:bg-sintegra-blue/90"
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aplicando Migrações...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Aplicar Migrações Pendentes
                </>
              )}
            </Button>
          </div>

          {/* Migrations List */}
          <div className="border rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">
                Migrações Disponíveis ({migrations.length})
              </h3>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Carregando migrações...
                </div>
              ) : migrations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma migração encontrada
                </div>
              ) : (
                migrations.map((migration) => (
                  <div
                    key={migration.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm capitalize">
                            {migration.name}
                          </h4>
                          {migration.applied && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                              Aplicada
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-mono">
                          {migration.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(migration.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status Output */}
          {status && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Status do Banco de Dados</h3>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto max-h-60 font-mono">
                {status}
              </pre>
            </div>
          )}

          {/* Info Box */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Importante:</strong> As migrações modificam a estrutura do banco de dados.
              Certifique-se de ter um backup antes de aplicar alterações em produção.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Pending Migrations Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Migrações Pendentes</CardTitle>
          <CardDescription>
            Estas migrações precisam ser aplicadas para corrigir problemas de exclusão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">add cascade delete form responses</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Permite deletar formulários que possuem respostas associadas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">add cascade delete answer question</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Permite deletar perguntas que possuem respostas associadas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">add set null response respondent</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Permite deletar respondentes mantendo as respostas como anônimas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
