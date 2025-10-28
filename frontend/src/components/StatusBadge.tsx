import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'green' | 'yellow' | 'red';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = {
    green: 'bg-status-green',
    yellow: 'bg-status-yellow',
    red: 'bg-status-red',
  };

  const textColors = {
    green: 'text-green-800',
    yellow: 'text-yellow-800',
    red: 'text-red-800',
  };

  const bgColors = {
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
  };

  if (label) {
    return (
      <span className={cn('px-3 py-1 rounded-full text-sm font-medium', bgColors[status], textColors[status])}>
        {label}
      </span>
    );
  }

  return <span className={cn('w-3 h-3 rounded-full inline-block', colors[status])} />;
}
