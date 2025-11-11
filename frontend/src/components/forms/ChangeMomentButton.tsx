'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Calendar, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type SurveyMoment = {
  id: string
  name: string
  description: string | null
  color: string | null
}

type ChangeMomentButtonProps = {
  formId: string
  currentMomentId: string | null
  currentMomentName: string | null
}

export function ChangeMomentButton({
  formId,
  currentMomentId,
  currentMomentName,
}: ChangeMomentButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [moments, setMoments] = useState<SurveyMoment[]>([])
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(currentMomentId)

  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (showDialog) {
      loadMoments()
    }
  }, [showDialog])

  const loadMoments = async () => {
    try {
      const response = await fetch('/api/survey-moments')
      if (response.ok) {
        const data = await response.json()
        setMoments(data)
      }
    } catch (error) {
      console.error('Erro ao carregar momentos:', error)
    }
  }

  const handleChangeMoment = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/forms/${formId}/change-moment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyMomentId: selectedMomentId || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao mudar momento')
      }

      toast.success('Momento do formulário atualizado com sucesso')
      setShowDialog(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao mudar momento')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!isSuperAdmin) {
    return currentMomentName ? (
      <Badge variant="outline" className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {currentMomentName}
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Sem momento
      </Badge>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        {currentMomentName || 'Sem momento'}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mudar Momento de Pesquisa</DialogTitle>
            <DialogDescription>
              Selecione o momento de pesquisa para este formulário
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Momento Atual</Label>
              <div className="mt-1">
                {currentMomentName ? (
                  <Badge variant="outline">{currentMomentName}</Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50">
                    Sem momento
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="moment">Novo Momento</Label>
              <select
                id="moment"
                value={selectedMomentId || ''}
                onChange={(e) => setSelectedMomentId(e.target.value || null)}
                className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sem momento</option>
                {moments.map((moment) => (
                  <option key={moment.id} value={moment.id}>
                    {moment.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMomentId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Novo momento:</strong>{' '}
                  {moments.find((m) => m.id === selectedMomentId)?.name}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangeMoment}
              disabled={loading || selectedMomentId === currentMomentId}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Confirmar Mudança'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
