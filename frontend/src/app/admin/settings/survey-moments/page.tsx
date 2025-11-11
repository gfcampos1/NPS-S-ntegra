'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Plus,
  Edit,
  Archive,
  ChevronUp,
  ChevronDown,
  Loader2,
  Calendar,
  FileText,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type SurveyMoment = {
  id: string
  name: string
  description: string | null
  slug: string
  color: string | null
  icon: string | null
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    forms: number
  }
}

export default function SurveyMomentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [moments, setMoments] = useState<SurveyMoment[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMoment, setEditingMoment] = useState<SurveyMoment | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    color: '#3B82F6',
    icon: 'BarChart3',
  })

  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/admin/dashboard')
      return
    }

    loadMoments()
  }, [isSuperAdmin, router])

  const loadMoments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/survey-moments')

      if (!response.ok) {
        throw new Error('Erro ao carregar momentos')
      }

      const data = await response.json()
      setMoments(data)
    } catch (error) {
      toast.error('Erro ao carregar momentos de pesquisa')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const createMoment = async () => {
    try {
      const response = await fetch('/api/survey-moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar momento')
      }

      toast.success('Momento criado com sucesso')
      setShowCreateDialog(false)
      setFormData({
        name: '',
        description: '',
        slug: '',
        color: '#3B82F6',
        icon: 'BarChart3',
      })
      await loadMoments()
    } catch (error: any) {
      toast.error(error.message)
      console.error(error)
    }
  }

  const updateMoment = async () => {
    if (!editingMoment) return

    try {
      const response = await fetch(`/api/survey-moments/${editingMoment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar momento')
      }

      toast.success('Momento atualizado com sucesso')
      setShowEditDialog(false)
      setEditingMoment(null)
      await loadMoments()
    } catch (error) {
      toast.error('Erro ao atualizar momento')
      console.error(error)
    }
  }

  const archiveMoment = async (id: string) => {
    if (!confirm('Tem certeza que deseja arquivar este momento?')) return

    try {
      const response = await fetch(`/api/survey-moments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao arquivar momento')
      }

      toast.success('Momento arquivado com sucesso')
      await loadMoments()
    } catch (error) {
      toast.error('Erro ao arquivar momento')
      console.error(error)
    }
  }

  const reorderMoment = async (momentId: string, direction: 'up' | 'down') => {
    const currentIndex = moments.findIndex(m => m.id === momentId)
    const currentOrder = moments[currentIndex].order

    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1

    if (newOrder < 0 || newOrder >= moments.length) return

    try {
      const response = await fetch('/api/survey-moments/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          momentId,
          newOrder,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao reordenar')
      }

      const updatedMoments = await response.json()
      setMoments(updatedMoments)
    } catch (error) {
      toast.error('Erro ao reordenar momentos')
      console.error(error)
    }
  }

  const openEditDialog = (moment: SurveyMoment) => {
    setEditingMoment(moment)
    setFormData({
      name: moment.name,
      description: moment.description || '',
      slug: moment.slug,
      color: moment.color || '#3B82F6',
      icon: moment.icon || 'BarChart3',
    })
    setShowEditDialog(true)
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Momentos de Pesquisa
          </h1>
          <p className="text-secondary-600">
            Gerencie os momentos de pesquisa para organizar seus formulários
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Momento
        </Button>
      </div>

      {/* Lista de Momentos */}
      <div className="grid gap-4">
        {moments.map((moment, index) => (
          <Card key={moment.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reorderMoment(moment.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reorderMoment(moment.id, 'down')}
                    disabled={index === moments.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Color Badge */}
                <div
                  className="w-4 h-full rounded"
                  style={{ backgroundColor: moment.color || '#3B82F6' }}
                />

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{moment.name}</h3>
                      <p className="text-sm text-secondary-600">{moment.description}</p>
                    </div>
                    <Badge variant="outline">Ordem: {moment.order + 1}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-secondary-500 mb-3">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {moment._count.forms} formulário(s)
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Criado {formatDistanceToNow(new Date(moment.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(moment)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => archiveMoment(moment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Arquivar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Momento</DialogTitle>
            <DialogDescription>
              Crie um novo momento de pesquisa para categorizar seus formulários
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Pesquisa de Eventos"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug (gerado automaticamente)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="pesquisa-de-eventos"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o objetivo deste momento..."
              />
            </div>

            <div>
              <Label htmlFor="color">Cor</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="icon">Ícone (lucide-react)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="BarChart3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createMoment}>
              Criar Momento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Momento</DialogTitle>
            <DialogDescription>
              Atualize as informações do momento de pesquisa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-color">Cor</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-icon">Ícone</Label>
              <Input
                id="edit-icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={updateMoment}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
