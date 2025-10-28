/**
 * Calcula o NPS (Net Promoter Score) baseado nas respostas
 * NPS = (% Promotores) - (% Detratores)
 * 
 * Promotores: 9-10
 * Neutros: 7-8
 * Detratores: 0-6
 */
export function calculateNPS(scores: number[]): {
  nps: number
  promoters: number
  neutrals: number
  detractors: number
  promotersPercentage: number
  neutralsPercentage: number
  detractorsPercentage: number
} {
  if (scores.length === 0) {
    return {
      nps: 0,
      promoters: 0,
      neutrals: 0,
      detractors: 0,
      promotersPercentage: 0,
      neutralsPercentage: 0,
      detractorsPercentage: 0,
    }
  }

  const promoters = scores.filter(score => score >= 9).length
  const neutrals = scores.filter(score => score >= 7 && score <= 8).length
  const detractors = scores.filter(score => score <= 6).length

  const total = scores.length

  const promotersPercentage = (promoters / total) * 100
  const neutralsPercentage = (neutrals / total) * 100
  const detractorsPercentage = (detractors / total) * 100

  const nps = promotersPercentage - detractorsPercentage

  return {
    nps: Math.round(nps),
    promoters,
    neutrals,
    detractors,
    promotersPercentage: Math.round(promotersPercentage * 10) / 10,
    neutralsPercentage: Math.round(neutralsPercentage * 10) / 10,
    detractorsPercentage: Math.round(detractorsPercentage * 10) / 10,
  }
}

/**
 * Interpreta o valor do NPS
 */
export function interpretNPS(nps: number): {
  label: string
  color: string
  description: string
} {
  if (nps >= 75) {
    return {
      label: 'Excelente',
      color: '#10B981',
      description: 'Zona de excelência',
    }
  } else if (nps >= 50) {
    return {
      label: 'Muito Bom',
      color: '#10B981',
      description: 'Zona de qualidade',
    }
  } else if (nps >= 0) {
    return {
      label: 'Razoável',
      color: '#F59E0B',
      description: 'Zona de aperfeiçoamento',
    }
  } else {
    return {
      label: 'Crítico',
      color: '#EF4444',
      description: 'Zona crítica',
    }
  }
}

/**
 * Formata número com casas decimais
 */
export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals)
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number): string {
  return `${formatNumber(value, 1)}%`
}
