import {
  CheckCircle2,
  Factory,
  Link2,
  PackageCheck,
  ShieldAlert,
  Truck,
} from 'lucide-react'
import type { TimelineEvent } from '@/lib/domain/types'
import { formatDateTime, truncateHash } from '@/lib/domain/format'
import { cn } from '@/lib/utils'

const iconFor: Record<TimelineEvent['type'], typeof Factory> = {
  MANUFACTURED: Factory,
  CREATED_ON_BLOCKCHAIN: Link2,
  TRANSFERRED: Truck,
  RECEIVED: PackageCheck,
  FLAGGED: ShieldAlert,
  RECALLED: ShieldAlert,
  VERIFIED: CheckCircle2,
}

export function SupplyChainTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-0">
      {events.map((event, i) => {
        const Icon = iconFor[event.type]
        const isLast = i === events.length - 1
        const danger = event.type === 'RECALLED' || event.type === 'FLAGGED'
        return (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className="absolute top-8 left-[15px] h-[calc(100%-1rem)] w-px bg-border-default"
              />
            )}
            <span
              className={cn(
                'z-10 flex size-8 shrink-0 items-center justify-center rounded-full border',
                danger
                  ? 'border-danger/30 bg-danger-bg text-danger'
                  : 'border-border-default bg-surface-card text-brand-secondary',
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-medium text-text-primary">{event.label}</p>
                <time className="text-xs text-text-muted">
                  {formatDateTime(event.timestamp)}
                </time>
              </div>
              <p className="mt-0.5 text-sm text-text-secondary">
                {event.organizationName}
              </p>
              {event.detail && (
                <p className="mt-0.5 text-sm text-text-muted">{event.detail}</p>
              )}
              {event.tx?.hash && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-info-bg px-2 py-1 font-mono text-xs text-info">
                  <Link2 className="size-3" strokeWidth={1.75} />
                  {truncateHash(event.tx.hash, 10, 8)}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
