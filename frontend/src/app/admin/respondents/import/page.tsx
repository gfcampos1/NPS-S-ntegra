'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ImportRespondentsPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Apenas arquivos CSV são aceitos')
        return
      }
      setFile(selectedFile)
      setError('')
      setResult(null)
    }
  }

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim())
    const headers = lines[0].split(',').map((h) => h.trim())
    
    const respondents = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      const respondent: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        respondent[header.toLowerCase()] = value
      })
      
      respondents.push(respondent)
    }
    
    return respondents
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    setError('')

    try {
      const text = await file.text()
      const parsedData = parseCSV(text)

      // Transform to match schema
      const respondents = parsedData.map((item) => ({
        name: item.name || item.nome,
        email: item.email,
        type: item.type || item.tipo || 'MEDICO',
        category: item.category || item.categoria,
        specialty: item.specialty || item.especialidade,
        region: item.region || item.regiao,
        company: item.company || item.empresa,
        phone: item.phone || item.telefone,
      }))

      const response = await fetch('/api/respondents/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ respondents }),
      })

      if (!response.ok) {
        throw new Error('Erro ao importar respondentes')
      }

      const data = await response.json()
      setResult(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const template = `name,email,type,category,specialty,region,company,phone
Dr. João Silva,joao@exemplo.com,MEDICO,Clínico Geral,Cardiologia,São Paulo,,(11) 98765-4321
Maria Oliveira,maria@distribuidora.com,DISTRIBUIDOR,Regional,,Região Sul,Distribuidora ABC,(11) 98765-1234`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-respondentes.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/respondents">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-sintegra-gray-dark">
            Importar Respondentes
          </h1>
          <p className="text-sintegra-gray-medium">
            Importe múltiplos respondentes de um arquivo CSV
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Template CSV</CardTitle>
            <CardDescription>
              Baixe o modelo para preencher com seus dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-sintegra-gray-medium">
                O arquivo CSV deve conter as seguintes colunas:
              </p>
              <ul className="text-sm space-y-1 text-sintegra-gray-medium">
                <li>• <strong>name</strong> (obrigatório)</li>
                <li>• <strong>email</strong> (obrigatório)</li>
                <li>• <strong>type</strong> (MEDICO ou DISTRIBUIDOR)</li>
                <li>• category (opcional)</li>
                <li>• specialty (opcional)</li>
                <li>• region (opcional)</li>
                <li>• company (opcional)</li>
                <li>• phone (opcional)</li>
              </ul>
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Baixar Template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload do Arquivo</CardTitle>
            <CardDescription>
              Selecione o arquivo CSV preenchido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-sintegra-blue transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-sintegra-gray-medium mb-2">
                    {file ? file.name : 'Clique para selecionar um arquivo CSV'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Tamanho máximo: 5MB
                  </p>
                </label>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={!file || isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processando...' : 'Importar Respondentes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Importação</CardTitle>
            <CardDescription>
              Resumo do processamento do arquivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{result.success}</p>
                    <p className="text-sm text-green-700">Criados</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{result.duplicates}</p>
                    <p className="text-sm text-yellow-700">Duplicados</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{result.errors}</p>
                    <p className="text-sm text-red-700">Erros</p>
                  </div>
                </div>
              </div>

              {result.details && result.details.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <h4 className="font-semibold text-sm">Detalhes:</h4>
                  {result.details.map((detail: any, index: number) => (
                    <div
                      key={index}
                      className={`text-sm p-2 rounded ${
                        detail.status === 'success'
                          ? 'bg-green-50 text-green-700'
                          : detail.status === 'duplicate'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <strong>{detail.email}</strong>: {detail.message || detail.status}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setResult(null)}>
                  Importar Outro Arquivo
                </Button>
                <Link href="/admin/respondents">
                  <Button>Ver Respondentes</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
