type ResponseStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'

const statusStyles: Record<ResponseStatus, { label: string; classes: string }> = {
  IN_PROGRESS: {
    label: 'Em andamento',
    classes: 'bg-blue-100 text-blue-700',
  },
  COMPLETED: {
    label: 'Concluida',
    classes: 'bg-green-100 text-green-700',
  },
  ABANDONED: {
    label: 'Abandonada',
    classes: 'bg-yellow-100 text-yellow-700',
  },
}

type ResponseStatusBadgeProps = {
  status: ResponseStatus
}

export function ResponseStatusBadge({ status }: ResponseStatusBadgeProps) {
  const data = statusStyles[status] ?? statusStyles.IN_PROGRESS

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${data.classes}`}
    >
      {data.label}
    </span>
  )
}
