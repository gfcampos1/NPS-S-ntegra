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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Users, Shield, Crown, Eye, ArrowUp, ArrowDown, Trash2, Loader2, KeyRound, Copy, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER'
  createdAt: string
  requirePasswordChange?: boolean
  _count?: {
    forms: number
  }
}

const roleLabels = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  VIEWER: 'Visualizador',
}

const roleColors = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  VIEWER: 'bg-gray-100 text-gray-800',
}

const roleIcons = {
  SUPER_ADMIN: Crown,
  ADMIN: Shield,
  VIEWER: Eye,
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tempPasswordDialog, setTempPasswordDialog] = useState<{
    open: boolean
    userName: string
    tempPassword: string
  }>({
    open: false,
    userName: '',
    tempPassword: ''
  })
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [transferDialog, setTransferDialog] = useState<{
    open: boolean
    userId: string
    userName: string
    formsCount: number
    transferToUserId: string
  }>({
    open: false,
    userId: '',
    userName: '',
    formsCount: 0,
    transferToUserId: '',
  })

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Erro ao carregar usuários')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Erro ao carregar usuários')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER') => {
    setUpdatingUserId(userId)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao atualizar usuário')
      }

      await loadUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      setError(error.message || 'Erro ao atualizar usuário')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const deleteUser = async (userId: string, transferFormsToUserId?: string) => {
    setDeletingUserId(userId)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transferFormsToUserId: transferFormsToUserId || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao deletar usuário')
      }

      const result = await response.json()

      // Close transfer dialog if open
      setTransferDialog({
        open: false,
        userId: '',
        userName: '',
        formsCount: 0,
        transferToUserId: '',
      })

      await loadUsers()

      // Show success message if available
      if (result.message) {
        console.log(result.message)
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      setError(error.message || 'Erro ao deletar usuário')
    } finally {
      setDeletingUserId(null)
    }
  }

  const resetUserPassword = async (userId: string, userName: string) => {
    setResettingUserId(userId)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao resetar senha')
      }

      const data = await response.json()
      
      // Exibe a senha temporária no modal
      setTempPasswordDialog({
        open: true,
        userName,
        tempPassword: data.tempPassword
      })

      await loadUsers()
    } catch (error: any) {
      console.error('Error resetting password:', error)
      setError(error.message || 'Erro ao resetar senha')
    } finally {
      setResettingUserId(null)
    }
  }

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(tempPasswordDialog.tempPassword)
    setCopiedPassword(true)
    setTimeout(() => setCopiedPassword(false), 2000)
  }

  const getNextRole = (currentRole: string): 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER' | null => {
    if (currentRole === 'VIEWER') return 'ADMIN'
    if (currentRole === 'ADMIN') return 'SUPER_ADMIN'
    return null
  }

  const getPreviousRole = (currentRole: string): 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER' | null => {
    if (currentRole === 'SUPER_ADMIN') return 'ADMIN'
    if (currentRole === 'ADMIN') return 'VIEWER'
    return null
  }

  const groupedUsers = {
    SUPER_ADMIN: users.filter(u => u.role === 'SUPER_ADMIN'),
    ADMIN: users.filter(u => u.role === 'ADMIN'),
    VIEWER: users.filter(u => u.role === 'VIEWER'),
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-sintegra-gray-dark">Gerenciamento de Usuários</h2>
        <p className="text-sintegra-gray-medium">
          Gerencie permissões e roles dos usuários do sistema
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-600" />
              Super Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{groupedUsers.SUPER_ADMIN.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{groupedUsers.ADMIN.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-600" />
              Visualizadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{groupedUsers.VIEWER.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>{users.length} usuários cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Carregando usuários...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedUsers).map(([role, roleUsers]) => {
                if (roleUsers.length === 0) return null

                const RoleIcon = roleIcons[role as keyof typeof roleIcons]

                return (
                  <div key={role}>
                    <div className="flex items-center gap-2 mb-3">
                      <RoleIcon className="h-5 w-5" />
                      <h3 className="font-semibold">{roleLabels[role as keyof typeof roleLabels]}</h3>
                      <span className="text-sm text-gray-500">({roleUsers.length})</span>
                    </div>

                    <div className="space-y-2 ml-7">
                      {roleUsers.map((user) => {
                        const nextRole = getNextRole(user.role)
                        const previousRole = getPreviousRole(user.role)
                        const isUpdating = updatingUserId === user.id
                        const isDeleting = deletingUserId === user.id

                        return (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-medium text-sintegra-gray-dark">{user.name}</h4>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    roleColors[user.role]
                                  }`}
                                >
                                  {roleLabels[user.role]}
                                </span>
                                {user.requirePasswordChange && (
                                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-800">
                                    Precisa alterar senha
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Cadastrado{' '}
                                {formatDistanceToNow(new Date(user.createdAt), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              {/* Reset de Senha - Apenas Super Admin */}
                              {isSuperAdmin && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={isUpdating || isDeleting || resettingUserId === user.id}
                                      className="border-blue-300 hover:bg-blue-50"
                                    >
                                      {resettingUserId === user.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <KeyRound className="h-4 w-4 mr-1" />
                                          Resetar Senha
                                        </>
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Resetar senha do usuário</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Uma senha temporária será gerada para <strong>{user.name}</strong>.
                                        O usuário será obrigado a alterar a senha no próximo login.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={(e) => {
                                          e.preventDefault()
                                          resetUserPassword(user.id, user.name)
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        Resetar Senha
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {/* Promover */}
                              {nextRole && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={isUpdating || isDeleting}
                                      className="border-green-300 hover:bg-green-50"
                                    >
                                      <ArrowUp className="h-4 w-4 mr-1" />
                                      Promover
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Promover usuário</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja promover <strong>{user.name}</strong> de{' '}
                                        <strong>{roleLabels[user.role]}</strong> para{' '}
                                        <strong>{roleLabels[nextRole]}</strong>?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={(e) => {
                                          e.preventDefault()
                                          updateUserRole(user.id, nextRole)
                                        }}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        Promover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {/* Rebaixar */}
                              {previousRole && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={isUpdating || isDeleting}
                                      className="border-amber-300 hover:bg-amber-50"
                                    >
                                      <ArrowDown className="h-4 w-4 mr-1" />
                                      Rebaixar
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Rebaixar usuário</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja rebaixar <strong>{user.name}</strong> de{' '}
                                        <strong>{roleLabels[user.role]}</strong> para{' '}
                                        <strong>{roleLabels[previousRole]}</strong>?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={(e) => {
                                          e.preventDefault()
                                          updateUserRole(user.id, previousRole)
                                        }}
                                        className="bg-amber-600 hover:bg-amber-700"
                                      >
                                        Rebaixar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {/* Deletar - Apenas Super Admin */}
                              {user._count && user._count.forms > 0 ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isUpdating || isDeleting}
                                  className="border-red-300 hover:bg-red-50"
                                  onClick={() => {
                                    setTransferDialog({
                                      open: true,
                                      userId: user.id,
                                      userName: user.name,
                                      formsCount: user._count?.forms || 0,
                                      transferToUserId: '',
                                    })
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Excluir
                                </Button>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={isUpdating || isDeleting}
                                      className="border-red-300 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Excluir
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir <strong>{user.name}</strong>?
                                        Esta ação é irreversível e todos os dados associados a este usuário serão removidos.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={(e) => {
                                          e.preventDefault()
                                          deleteUser(user.id)
                                        }}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {(isUpdating || isDeleting) && (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sobre as Permissões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Super Admin</h4>
              <p className="text-sm text-gray-600">
                Acesso total ao sistema, incluindo gerenciamento de usuários, migrações e configurações avançadas
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Administrador</h4>
              <p className="text-sm text-gray-600">
                Pode criar e gerenciar formulários, respondentes, visualizar relatórios e feedbacks
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Visualizador</h4>
              <p className="text-sm text-gray-600">
                Acesso somente leitura ao dashboard e relatórios
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Senha Temporária */}
      <Dialog open={tempPasswordDialog.open} onOpenChange={(open: boolean) => {
        setTempPasswordDialog(prev => ({ ...prev, open }))
        if (!open) setCopiedPassword(false)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Senha Temporária Gerada</DialogTitle>
            <DialogDescription>
              A senha temporária para <strong>{tempPasswordDialog.userName}</strong> foi gerada com sucesso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-sm">
                <strong>Importante:</strong> Esta senha só será exibida uma vez. Certifique-se de enviá-la ao usuário antes de fechar esta janela.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha Temporária:</label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-lg break-all">
                  {tempPasswordDialog.tempPassword}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPasswordToClipboard}
                  className="flex-shrink-0"
                >
                  {copiedPassword ? (
                    <>
                      <Check className="h-4 w-4 mr-1 text-green-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                O usuário será obrigado a alterar esta senha no próximo login.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setTempPasswordDialog({ open: false, userName: '', tempPassword: '' })}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Transferência de Formulários */}
      <Dialog open={transferDialog.open} onOpenChange={(open: boolean) => {
        setTransferDialog(prev => ({ ...prev, open }))
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Excluir Usuário com Formulários</DialogTitle>
            <DialogDescription>
              O usuário <strong>{transferDialog.userName}</strong> possui <strong>{transferDialog.formsCount}</strong> formulário(s).
              <br />
              Selecione um novo proprietário para os formulários antes de excluir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-sm">
                <strong>Atenção:</strong> Esta ação é irreversível. Os formulários serão transferidos para o novo proprietário selecionado.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="transfer-user">Novo Proprietário dos Formulários</Label>
              <Select
                value={transferDialog.transferToUserId}
                onValueChange={(value) => setTransferDialog(prev => ({ ...prev, transferToUserId: value }))}
              >
                <SelectTrigger id="transfer-user">
                  <SelectValue placeholder="Selecione um usuário..." />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(u => u.id !== transferDialog.userId)
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {roleLabels[user.role]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setTransferDialog({
                open: false,
                userId: '',
                userName: '',
                formsCount: 0,
                transferToUserId: '',
              })}
              disabled={deletingUserId === transferDialog.userId}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (transferDialog.transferToUserId) {
                  deleteUser(transferDialog.userId, transferDialog.transferToUserId)
                }
              }}
              disabled={!transferDialog.transferToUserId || deletingUserId === transferDialog.userId}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingUserId === transferDialog.userId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Transferir e Excluir'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
