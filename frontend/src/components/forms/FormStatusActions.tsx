'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type FormStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'ARCHIVED'

type StatusAction = {
  label: string
  targetStatus: FormStatus
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link'
}

const statusActions: Record<FormStatus, StatusAction[]> = {
  DRAFT: [
    { label: 'Ativar', targetStatus: 'PUBLISHED' },
    { label: 'Finalizar', targetStatus: 'CLOSED', variant: 'outline' },
  ],
  PUBLISHED: [
    { label: 'Finalizar', targetStatus: 'CLOSED', variant: 'destructive' },
    { label: 'Inativar', targetStatus: 'PAUSED', variant: 'outline' },
  ],
  PAUSED: [
    { label: 'Ativar', targetStatus: 'PUBLISHED' },
    { label: 'Finalizar', targetStatus: 'CLOSED', variant: 'outline' },
  ],
  CLOSED: [
    { label: 'Reativar', targetStatus: 'PUBLISHED' },
    { label: 'Inativar', targetStatus: 'PAUSED', variant: 'outline' },
  ],
  ARCHIVED: [
    { label: 'Reativar', targetStatus: 'PUBLISHED' },
  ],
}

type FormStatusActionsProps = {
  formId: string
  currentStatus: FormStatus
}

export function FormStatusActions({ formId, currentStatus }: FormStatusActionsProps) {
  const router = useRouter()
  const [loadingTarget, setLoadingTarget] = useState<FormStatus | null>(null)

  const availableActions = statusActions[currentStatus] ?? []

  if (availableActions.length === 0) {
    return null
  }

  const handleStatusChange = async (targetStatus: FormStatus) => {
    try {
      setLoadingTarget(targetStatus)

      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: targetStatus }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'Erro ao atualizar status do formulario')
      }

      toast.success('Status atualizado com sucesso')
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar status do formulario'
      )
    } finally {
      setLoadingTarget(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableActions.map((action) => (
        <Button
          key={action.targetStatus}
          variant={action.variant}
          size="sm"
          disabled={loadingTarget !== null}
          onClick={() => handleStatusChange(action.targetStatus)}
        >
          {loadingTarget === action.targetStatus ? 'Processando...' : action.label}
        </Button>
      ))}
    </div>
  )
}
