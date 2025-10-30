/**
 * Gerador de CSV para relatórios de NPS
 */

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
 * Gera um arquivo CSV a partir das respostas
 * Retorna uma URL data: que pode ser usada para download
 */
export async function generateReportCSV(
  responses: ResponseData[],
  reportTitle: string
): Promise<string> {
  // Cabeçalhos do CSV
  const headers = [
    'ID Resposta',
    'Data Conclusão',
    'Formulário',
    'Tipo Formulário',
    'Respondente',
    'Email',
    'Tipo Respondente',
    'Categoria',
    'Especialidade',
    'Região',
    'Empresa',
    'Pergunta',
    'Tipo Pergunta',
    'Resposta',
  ]

  // Linhas do CSV
  const rows: string[][] = []

  for (const response of responses) {
    // Se não houver respostas, adiciona linha vazia com info básica
    if (response.answers.length === 0) {
      rows.push([
        response.id,
        response.completedAt ? formatDate(response.completedAt) : '',
        response.form.title,
        response.form.type,
        response.respondent?.name || 'Anônimo',
        response.respondent?.email || '',
        response.respondent?.type || '',
        response.respondent?.category || '',
        response.respondent?.specialty || '',
        response.respondent?.region || '',
        response.respondent?.company || '',
        '',
        '',
        '',
      ])
    } else {
      // Para cada resposta, cria uma linha
      for (const answer of response.answers) {
        rows.push([
          response.id,
          response.completedAt ? formatDate(response.completedAt) : '',
          response.form.title,
          response.form.type,
          response.respondent?.name || 'Anônimo',
          response.respondent?.email || '',
          response.respondent?.type || '',
          response.respondent?.category || '',
          response.respondent?.specialty || '',
          response.respondent?.region || '',
          response.respondent?.company || '',
          answer.question.text,
          answer.question.type,
          formatAnswerValue(answer),
        ])
      }
    }
  }

  // Converte para CSV
  const csv = convertToCSV(headers, rows)

  // Cria data URL
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const dataUrl = await blobToDataURL(blob)

  return dataUrl
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
    // Remove quebras de linha e aspas duplas para não quebrar o CSV
    return answer.textValue.replace(/\r?\n/g, ' ').replace(/"/g, '""')
  }

  return ''
}

/**
 * Formata data para o CSV
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
 * Converte array de dados para formato CSV
 */
function convertToCSV(headers: string[], rows: string[][]): string {
  const escapeCsvValue = (value: string): string => {
    // Se contém vírgula, quebra de linha ou aspas, envolve em aspas
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const headerLine = headers.map(escapeCsvValue).join(',')
  const dataLines = rows.map((row) => row.map(escapeCsvValue).join(','))

  return [headerLine, ...dataLines].join('\n')
}

/**
 * Converte Blob para Data URL
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Gera estatísticas resumidas para o relatório
 */
export function generateReportStatistics(responses: ResponseData[]) {
  const totalResponses = responses.length

  // Conta por tipo de formulário
  const byFormType = responses.reduce((acc, r) => {
    acc[r.form.type] = (acc[r.form.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Conta por tipo de respondente
  const byRespondentType = responses.reduce((acc, r) => {
    const type = r.respondent?.type || 'Anônimo'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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
    byFormType,
    byRespondentType,
    nps,
    npsCount: npsScores.length,
    avgSatisfaction,
    satisfactionCount: ratingScores.length,
  }
}
