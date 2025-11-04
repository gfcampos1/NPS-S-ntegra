/**
 * Gerador de XLSX (Excel) para relatórios de NPS
 */

import * as XLSX from 'xlsx'

interface ResponseData {
  id: string
  completedAt: Date | null
  form: {
    id: string
    title: string
    type: string
  }
  respondent: {
    name: string
    email: string | null
    type: string
    category: string | null
    specialty: string | null
    region: string | null
    company: string | null
  } | null
  answers: Array<{
    numericValue: number | null
    textValue: string | null
    selectedOption: string | null
    question: {
      text: string
      type: string
    }
  }>
}

/**
 * Gera um arquivo Excel (XLSX) a partir das respostas
 * Retorna um Uint8Array que pode ser enviado como resposta HTTP
 */
export function generateReportXLSX(
  responses: ResponseData[],
  reportTitle: string
): Uint8Array {
  // Prepara os dados para o Excel
  const data: any[] = []

  for (const response of responses) {
    // Se não houver respostas, adiciona linha vazia com info básica
    if (response.answers.length === 0) {
      data.push({
        'ID Resposta': response.id,
        'Data Conclusão': response.completedAt ? formatDate(response.completedAt) : '',
        'Formulário': response.form.title,
        'Tipo Formulário': response.form.type,
        'Respondente': response.respondent?.name || 'Anônimo',
        'Email': response.respondent?.email || '',
        'Tipo Respondente': response.respondent?.type || '',
        'Categoria': response.respondent?.category || '',
        'Especialidade': response.respondent?.specialty || '',
        'Região': response.respondent?.region || '',
        'Empresa': response.respondent?.company || '',
        'Pergunta': '',
        'Tipo Pergunta': '',
        'Resposta': '',
      })
    } else {
      // Para cada resposta, cria uma linha
      for (const answer of response.answers) {
        data.push({
          'ID Resposta': response.id,
          'Data Conclusão': response.completedAt ? formatDate(response.completedAt) : '',
          'Formulário': response.form.title,
          'Tipo Formulário': response.form.type,
          'Respondente': response.respondent?.name || 'Anônimo',
          'Email': response.respondent?.email || '',
          'Tipo Respondente': response.respondent?.type || '',
          'Categoria': response.respondent?.category || '',
          'Especialidade': response.respondent?.specialty || '',
          'Região': response.respondent?.region || '',
          'Empresa': response.respondent?.company || '',
          'Pergunta': answer.question.text,
          'Tipo Pergunta': answer.question.type,
          'Resposta': formatAnswerValue(answer),
        })
      }
    }
  }

  // Cria a planilha
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Define largura das colunas para melhor visualização
  const columnWidths = [
    { wch: 30 }, // ID Resposta
    { wch: 20 }, // Data Conclusão
    { wch: 30 }, // Formulário
    { wch: 15 }, // Tipo Formulário
    { wch: 25 }, // Respondente
    { wch: 30 }, // Email
    { wch: 15 }, // Tipo Respondente
    { wch: 20 }, // Categoria
    { wch: 20 }, // Especialidade
    { wch: 15 }, // Região
    { wch: 25 }, // Empresa
    { wch: 50 }, // Pergunta
    { wch: 15 }, // Tipo Pergunta
    { wch: 50 }, // Resposta
  ]
  worksheet['!cols'] = columnWidths

  // Cria o workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Respostas')

  // Adiciona uma segunda aba com estatísticas (se houver dados)
  if (responses.length > 0) {
    const stats = generateStatistics(responses)
    const statsData = [
      { Métrica: 'Total de Respostas', Valor: stats.totalResponses },
      { Métrica: 'NPS Score', Valor: stats.nps !== null ? stats.nps : 'N/A' },
      { Métrica: 'Respostas NPS', Valor: stats.npsCount },
      {
        Métrica: 'Satisfação Média (1-5)',
        Valor: stats.avgSatisfaction !== null ? stats.avgSatisfaction.toFixed(2) : 'N/A',
      },
      { Métrica: 'Respostas de Satisfação', Valor: stats.satisfactionCount },
    ]

    const statsWorksheet = XLSX.utils.json_to_sheet(statsData)
    statsWorksheet['!cols'] = [{ wch: 30 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estatísticas')
  }

  // Converte para Uint8Array (compatível com NextResponse)
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as Uint8Array

  return buffer
}

/**
 * Formata o valor da resposta de acordo com o tipo
 */
function formatAnswerValue(answer: ResponseData['answers'][0]): string {
  if (answer.numericValue !== null && answer.numericValue !== undefined) {
    return String(answer.numericValue)
  }

  if (answer.selectedOption) {
    return answer.selectedOption
  }

  if (answer.textValue) {
    return answer.textValue
  }

  return ''
}

/**
 * Formata data para o Excel
 */
function formatDate(date: Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

/**
 * Gera estatísticas resumidas para o relatório
 */
function generateStatistics(responses: ResponseData[]) {
  const totalResponses = responses.length

  // Calcula NPS se houver perguntas NPS
  const npsScores: number[] = []
  responses.forEach((response) => {
    response.answers.forEach((answer) => {
      if (
        answer.question.type === 'NPS' &&
        answer.numericValue !== null &&
        answer.numericValue !== undefined
      ) {
        npsScores.push(answer.numericValue)
      }
    })
  })

  let nps = null
  if (npsScores.length > 0) {
    const promoters = npsScores.filter((s) => s >= 9).length
    const detractors = npsScores.filter((s) => s <= 6).length
    nps = Math.round(((promoters - detractors) / npsScores.length) * 100)
  }

  // Calcula satisfação média (RATING_1_5)
  const ratingScores: number[] = []
  responses.forEach((response) => {
    response.answers.forEach((answer) => {
      if (
        answer.question.type === 'RATING_1_5' &&
        answer.numericValue !== null &&
        answer.numericValue !== undefined
      ) {
        ratingScores.push(answer.numericValue)
      }
    })
  })

  let avgSatisfaction = null
  if (ratingScores.length > 0) {
    avgSatisfaction =
      ratingScores.reduce((sum, s) => sum + s, 0) / ratingScores.length
  }

  return {
    totalResponses,
    nps,
    npsCount: npsScores.length,
    avgSatisfaction,
    satisfactionCount: ratingScores.length,
  }
}
