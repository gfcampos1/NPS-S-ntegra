'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2 } from 'lucide-react'

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER'

type User = {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

type FormState = {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: Role
}

const defaultFormState: FormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'ADMIN',
}

const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  VIEWER: 'Visualizador',
}

export function UserManagement() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>(defaultFormState)

  const currentUserId = session?.user?.id

  const canManageUsers = session?.user?.role === 'SUPER_ADMIN'

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Falha ao carregar usuários')
      }
      const data = await response.json()
      setUsers(
        data.map((user: User) => ({
          ...user,
          createdAt: user.createdAt,
        }))
      )
    } catch (error) {
      toast.error('Não foi possível carregar a lista de usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers()
    } else {
      setLoading(false)
    }
  }, [canManageUsers])

  const handleChange = (field: keyof FormState, value: string | Role) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canManageUsers) return

    if (form.password !== form.confirmPassword) {
      toast.error('As senhas precisam coincidir')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro ao criar usuário' }))
        throw new Error(error.error || 'Erro ao criar usuário')
      }

      toast.success('Usuário criado com sucesso')
      setForm(defaultFormState)
      await fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar usuário')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!canManageUsers) return
    if (id === currentUserId) {
      toast.warning('Você não pode remover o próprio usuário enquanto estiver conectado')
      return
    }

    const confirmed = confirm('Tem certeza de que deseja remover este usuário?')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro ao remover usuário' }))
        throw new Error(error.error || 'Erro ao remover usuário')
      }
      toast.success('Usuário removido com sucesso')
      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover usuário')
    }
  }

  const sortedUsers = useMemo(
    () => users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [users]
  )

  if (!canManageUsers) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        Apenas usuários com permissão de super administrador podem gerenciar contas.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sintegra-blue focus:outline-none focus:ring-2 focus:ring-sintegra-blue/20"
            placeholder="Nome do usuário"
            required
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sintegra-blue focus:outline-none focus:ring-2 focus:ring-sintegra-blue/20"
            placeholder="usuario@empresa.com"
            required
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sintegra-blue focus:outline-none focus:ring-2 focus:ring-sintegra-blue/20"
            placeholder="********"
            required
            minLength={8}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sintegra-blue focus:outline-none focus:ring-2 focus:ring-sintegra-blue/20"
            placeholder="Repita a senha"
            required
            minLength={8}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-slate-700">
            Permissão
          </label>
          <select
            id="role"
            value={form.role}
            onChange={(e) => handleChange('role', e.target.value as Role)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sintegra-blue focus:outline-none focus:ring-2 focus:ring-sintegra-blue/20"
            disabled={submitting}
          >
            <option value="ADMIN">Administrador</option>
            <option value="VIEWER">Visualizador</option>
            <option value="SUPER_ADMIN">Super administrador</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-sintegra-blue text-sm font-semibold text-white transition hover:bg-sintegra-blue-dark disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Criar usuário
              </>
            )}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          Usuários ativos
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando usuários...
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">
            Nenhum usuário cadastrado até o momento.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {sortedUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-2 px-4 py-3 text-sm text-slate-700 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {roleLabels[user.role]}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    disabled={user.id === currentUserId || submitting}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
