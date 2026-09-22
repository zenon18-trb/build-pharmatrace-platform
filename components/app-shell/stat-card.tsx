import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const iconTone: Record<string, string> = {
    neutral: 'bg-surface-subtle text-text-secondary',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    danger: 'bg-danger-bg text-danger',
    info: 'bg-info-bg text-info',
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
        </div>
        {icon && (
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              iconTone[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </Card>
  )
}
