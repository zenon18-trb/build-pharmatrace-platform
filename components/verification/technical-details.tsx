'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Row {
  label: string
  value: string
  mono?: boolean
}

export function TechnicalDetails({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-md border border-border-default bg-surface-subtle/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        Technical details
        <ChevronDown
          className={cn('size-4 transition-transform', open && 'rotate-180')}
          strokeWidth={1.75}
        />
      </button>
      {open && (
        <dl className="space-y-2.5 border-t border-border-subtle px-4 py-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5"
            >
              <dt className="text-xs text-text-muted">{row.label}</dt>
              <dd
                className={cn(
                  'text-right text-xs text-text-secondary',
                  row.mono && 'font-mono break-all',
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
