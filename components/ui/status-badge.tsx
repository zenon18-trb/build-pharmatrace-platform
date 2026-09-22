import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const toneClasses: Record<Tone, string> = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  neutral: 'bg-surface-subtle text-text-secondary',
}

const dotClasses: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-text-muted',
}

export function StatusBadge({
  tone,
  label,
  icon,
  showDot = false,
  className,
}: {
  tone: Tone
  label: string
  icon?: ReactNode
  showDot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {showDot && (
        <span
          aria-hidden="true"
          className={cn('size-1.5 rounded-full', dotClasses[tone])}
        />
      )}
      {icon}
      <span>{label}</span>
    </span>
  )
}
