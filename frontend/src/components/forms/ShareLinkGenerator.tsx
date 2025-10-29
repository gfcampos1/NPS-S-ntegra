'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Copy, RefreshCw } from 'lucide-react'

type ShareLinkGeneratorProps = {
  formId: string
  formTitle?: string
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  )
}

export function ShareLinkGenerator({ formId, formTitle }: ShareLinkGeneratorProps) {
  const [shareUrl, setShareUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const baseUrl = getBaseUrl()

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch(`/api/forms/${formId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'Erro ao gerar link de envio')
      }

      const data = await response.json()
      const fullUrl = data?.url || `${baseUrl}/r/${data?.token}`

      setShareUrl(fullUrl)
      toast.success('Link gerado com sucesso')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar link')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      if (!shareUrl) return

      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copiado para a area de transferencia')
    } catch (error) {
      toast.error('Nao foi possivel copiar o link')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gerar link de envio</h3>
          <p className="text-sm text-slate-500">
            Crie um link publico para compartilhar o formulario{' '}
            {formTitle ? `"${formTitle}"` : ''}
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Gerar link
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          value={shareUrl}
          readOnly
          placeholder="Clique em gerar link para criar uma URL unica"
          className="text-sm"
        />
        <Button
          type="button"
          onClick={handleCopy}
          disabled={!shareUrl}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copiar
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        Cada clique em &quot;Gerar link&quot; cria um novo token unico. Links
        anteriores continuam validos e podem ser revogados alterando o status do formulario.
      </p>
    </div>
  )
}
