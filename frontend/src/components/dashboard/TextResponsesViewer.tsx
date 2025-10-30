'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronDown, ChevronUp, Copy, Download, Filter } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TextResponse {
  id: string
  value: string
  respondent: {
    name: string
    type: string
    category?: string
    specialty?: string
    region?: string
  } | null
  completedAt: Date | string
}

interface TextResponsesViewerProps {
  questionText: string
  questionType: 'TEXT_SHORT' | 'TEXT_LONG'
  responses: TextResponse[]
}

export function TextResponsesViewer({
  questionText,
  questionType,
  responses,
}: TextResponsesViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtra respostas
  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      // Filtro de busca
      if (searchTerm && !response.value.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Filtro de sentimento (simplificado - pode melhorar com IA)
      if (sentimentFilter !== 'ALL') {
        const value = response.value.toLowerCase()
        const positiveWords = ['excelente', 'ótimo', 'bom', 'maravilhoso', 'perfeito', 'adorei', 'satisfeito']
        const negativeWords = ['ruim', 'péssimo', 'horrível', 'insatisfeito', 'problema', 'atraso', 'demorado']

        const hasPositive = positiveWords.some(word => value.includes(word))
        const hasNegative = negativeWords.some(word => value.includes(word))

        if (sentimentFilter === 'POSITIVE' && !hasPositive) return false
        if (sentimentFilter === 'NEGATIVE' && !hasNegative) return false
        if (sentimentFilter === 'NEUTRAL' && (hasPositive || hasNegative)) return false
      }

      return true
    })
  }, [responses, searchTerm, sentimentFilter])

  // Paginação
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage)
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Análise de frequência (para TEXT_SHORT)
  const wordFrequency = useMemo(() => {
    if (questionType !== 'TEXT_SHORT') return []

    const words: Record<string, number> = {}
    const stopwords = ['a', 'o', 'e', 'de', 'da', 'do', 'em', 'um', 'uma', 'para', 'com', 'por', 'que', 'não']

    responses.forEach((response) => {
      const cleaned = response.value
        .toLowerCase()
        .replace(/[^\w\sàáâãäåèéêëìíîïòóôõöùúûüç]/gi, '')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopwords.includes(word))

      cleaned.forEach((word) => {
        words[word] = (words[word] || 0) + 1
      })
    })

    return Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [responses, questionType])

  // Agrupa respostas idênticas (para TEXT_SHORT)
  const groupedResponses = useMemo(() => {
    if (questionType !== 'TEXT_SHORT') return []

    const groups: Record<string, number> = {}

    responses.forEach((response) => {
      const normalized = response.value.trim().toLowerCase()
      groups[normalized] = (groups[normalized] || 0) + 1
    })

    return Object.entries(groups)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [responses, questionType])

  // Toggle expand
  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedIds(newSet)
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copiado para área de transferência!')
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Respondente', 'Tipo', 'Categoria', 'Data', 'Resposta']
    const rows = filteredResponses.map((r) => [
      r.respondent?.name || 'Anônimo',
      r.respondent?.type || '',
      r.respondent?.category || r.respondent?.specialty || r.respondent?.region || '',
      typeof r.completedAt === 'string' ? r.completedAt : r.completedAt.toISOString(),
      `"${r.value.replace(/"/g, '""')}"`,
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `respostas-texto-${Date.now()}.csv`
    a.click()
  }

  // Sentimento emoji
  const getSentimentEmoji = (value: string) => {
    const lower = value.toLowerCase()
    const positiveWords = ['excelente', 'ótimo', 'bom', 'maravilhoso', 'perfeito']
    const negativeWords = ['ruim', 'péssimo', 'problema', 'insatisfeito']

    if (positiveWords.some((word) => lower.includes(word))) return '😊'
    if (negativeWords.some((word) => lower.includes(word))) return '😞'
    return '😐'
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
  }

  if (responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>💬 {questionText}</CardTitle>
          <CardDescription>Respostas de texto</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm text-center py-8">
            Nenhuma resposta ainda
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>💬 {questionText}</span>
          <Button size="sm" variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardTitle>
        <CardDescription>
          {responses.length} resposta{responses.length !== 1 ? 's' : ''} • Tipo:{' '}
          {questionType === 'TEXT_SHORT' ? 'Texto Curto' : 'Texto Longo'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar em respostas..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            value={sentimentFilter}
            onChange={(e) => {
              setSentimentFilter(e.target.value as any)
              setCurrentPage(1)
            }}
          >
            <option value="ALL">Todos os sentimentos</option>
            <option value="POSITIVE">😊 Positivo</option>
            <option value="NEUTRAL">😐 Neutro</option>
            <option value="NEGATIVE">😞 Negativo</option>
          </select>
        </div>

        {/* Análises para TEXT_SHORT */}
        {questionType === 'TEXT_SHORT' && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Palavras mais comuns */}
            {wordFrequency.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">
                  🔤 Palavras Mais Mencionadas
                </h4>
                <div className="space-y-2">
                  {wordFrequency.map(([word, count]) => (
                    <div key={word} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 w-32 truncate">
                        {word}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${(count / wordFrequency[0][1]) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">
                        {count}×
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Respostas mais comuns */}
            {groupedResponses.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">
                  📝 Respostas Mais Comuns
                </h4>
                <div className="space-y-2">
                  {groupedResponses.map((group, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-xs text-gray-500 font-mono mt-0.5">
                        {group.count}×
                      </span>
                      <span className="text-sm text-gray-900 flex-1 line-clamp-2">
                        "{group.text}"
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de respostas */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-700">
            💬 Todas as Respostas
            {filteredResponses.length !== responses.length && (
              <span className="ml-2 text-gray-500 font-normal">
                ({filteredResponses.length} de {responses.length})
              </span>
            )}
          </h4>

          {paginatedResponses.map((response) => {
            const isExpanded = expandedIds.has(response.id)
            const shouldTruncate =
              questionType === 'TEXT_LONG' && response.value.length > 150

            return (
              <div
                key={response.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-gray-50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{getSentimentEmoji(response.value)}</span>
                    <span className="font-medium text-gray-900">
                      {response.respondent?.name || 'Anônimo'}
                    </span>
                    {response.respondent?.type && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          {response.respondent.type === 'MEDICO'
                            ? 'Médico'
                            : 'Distribuidor'}
                        </span>
                      </>
                    )}
                    {(response.respondent?.specialty ||
                      response.respondent?.region) && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          {response.respondent.specialty ||
                            response.respondent.region}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatDate(response.completedAt)}
                  </span>
                </div>

                {/* Content */}
                <p
                  className={`text-gray-900 text-sm mb-3 ${
                    !isExpanded && shouldTruncate ? 'line-clamp-3' : ''
                  }`}
                >
                  {searchTerm ? (
                    // Destaca termo buscado
                    response.value.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
                      part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <mark key={i} className="bg-yellow-200">
                          {part}
                        </mark>
                      ) : (
                        part
                      )
                    )
                  ) : (
                    response.value
                  )}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {shouldTruncate && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(response.id)}
                      className="text-xs"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Recolher
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Expandir
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(response.value)}
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-gray-600">
              Mostrando {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredResponses.length)} de{' '}
              {filteredResponses.length}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}

              {totalPages > 5 && <span className="px-2 py-1">...</span>}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
