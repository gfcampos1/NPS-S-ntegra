'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Send, Copy, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type Respondent = {
  id: string
  name: string
  email: string
  type: string
}

type Form = {
  id: string
  title: string
  description: string | null
}

export default function DistributeFormPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [respondents, setRespondents] = useState<Respondent[]>([])
  const [selectedRespondents, setSelectedRespondents] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTokens, setGeneratedTokens] = useState<any[]>([])
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      const [formRes, respondentsRes] = await Promise.all([
        fetch(`/api/forms/${params.id}`),
        fetch('/api/respondents'),
      ])

      if (formRes.ok) {
        const formData = await formRes.json()
        setForm(formData)
      }

      if (respondentsRes.ok) {
        const respondentsData = await respondentsRes.json()
        setRespondents(respondentsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleRespondent = (id: string) => {
    setSelectedRespondents((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedRespondents.length === respondents.length) {
      setSelectedRespondents([])
    } else {
      setSelectedRespondents(respondents.map((r) => r.id))
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch(`/api/forms/${params.id}/distribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          respondentIds: selectedRespondents,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar tokens')
      }

      const data = await response.json()
      setGeneratedTokens(data.results.tokens)
    } catch (error) {
      alert('Erro ao gerar links de pesquisa')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string, tokenId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(tokenId)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  if (isLoading) {
    return <div className="p-8">Carregando...</div>
  }

  if (!form) {
    return <div className="p-8">Formulário não encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/forms/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-sintegra-gray-dark">
            Distribuir Formulário
          </h1>
          <p className="text-sintegra-gray-medium">{form.title}</p>
        </div>
      </div>

      {generatedTokens.length === 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Respondentes</CardTitle>
              <CardDescription>
                Escolha quem receberá o link da pesquisa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  className="w-full"
                  size="sm"
                >
                  {selectedRespondents.length === respondents.length
                    ? 'Desmarcar Todos'
                    : 'Selecionar Todos'}
                </Button>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {respondents.map((respondent) => (
                    <label
                      key={respondent.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRespondents.includes(respondent.id)}
                        onChange={() => handleToggleRespondent(respondent.id)}
                        className="rounded text-sintegra-blue focus:ring-sintegra-blue"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{respondent.name}</p>
                        <p className="text-xs text-sintegra-gray-medium">
                          {respondent.email}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {respondent.type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>Detalhes da distribuição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-sintegra-gray-medium">Formulário</p>
                <p className="font-semibold">{form.title}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-sintegra-gray-medium">Respondentes Selecionados</p>
                <p className="text-3xl font-bold text-sintegra-blue">
                  {selectedRespondents.length}
                </p>
              </div>

              {form.description && (
                <div className="space-y-2">
                  <p className="text-sm text-sintegra-gray-medium">Descrição</p>
                  <p className="text-sm">{form.description}</p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={selectedRespondents.length === 0 || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  'Gerando Links...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gerar Links de Pesquisa
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Links Gerados</CardTitle>
            <CardDescription>
              {generatedTokens.length} links criados com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedTokens.map((token) => {
                const respondent = respondents.find((r) => r.id === token.respondentId)
                return (
                  <div
                    key={token.token}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{respondent?.name}</p>
                      <p className="text-xs text-sintegra-gray-medium font-mono break-all">
                        {token.url}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(token.url, token.token)}
                      >
                        {copiedToken === token.token ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(token.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 justify-end pt-6 mt-6 border-t">
              <Button variant="outline" onClick={() => setGeneratedTokens([])}>
                Gerar Mais Links
              </Button>
              <Link href={`/admin/forms/${params.id}`}>
                <Button>Concluir</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
