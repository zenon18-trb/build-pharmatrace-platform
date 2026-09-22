'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Bell, Info, ShieldAlert } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/app-shell/page-header'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { alerts, getBatch } from '@/lib/domain/data'
import { formatDateTime } from '@/lib/domain/format'
import type { Alert } from '@/lib/domain/types'

type Severity = Alert['severity']

const severityMeta: Record<Severity, { tone: 'danger' | 'warning' | 'info'; icon: typeof ShieldAlert }> = {
  danger: { tone: 'danger', icon: ShieldAlert },
  warning: { tone: 'warning', icon: AlertTriangle },
  info: { tone: 'info', icon: Info },
}

const severityOptions: Array<{ value: Severity | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All severities' },
  { value: 'danger', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
]

export default function AlertsPage() {
  const [severity, setSeverity] = useState<Severity | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    return alerts
      .filter((a) => severity === 'ALL' || a.severity === severity)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [severity])

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Notifications about recalls, expiring stock, and provenance mismatches."
      />

      <div className="mb-4 max-w-48">
        <Select value={severity} onValueChange={(v) => setSeverity(v as Severity | 'ALL')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {severityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-6" />}
          title="No alerts"
          description="You're all caught up."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((alert) => {
            const meta = severityMeta[alert.severity]
            const Icon = meta.icon
            const batch = alert.batchId ? getBatch(alert.batchId) : undefined
            return (
              <div
                key={alert.id}
                className="flex gap-3 rounded-lg border border-border-default bg-surface-card p-4"
              >
                <span
                  className={
                    meta.tone === 'danger'
                      ? 'flex size-9 shrink-0 items-center justify-center rounded-full bg-danger-bg text-danger'
                      : meta.tone === 'warning'
                        ? 'flex size-9 shrink-0 items-center justify-center rounded-full bg-warning-bg text-warning'
                        : 'flex size-9 shrink-0 items-center justify-center rounded-full bg-info-bg text-info'
                  }
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-text-primary">{alert.title}</p>
                    <StatusBadge
                      tone={meta.tone}
                      label={alert.category.replace(/_/g, ' ')}
                    />
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{alert.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <span>{formatDateTime(alert.createdAt)}</span>
                    {batch && (
                      <Link
                        href={`/app/batches/${batch.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        View {batch.batchNumber}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
