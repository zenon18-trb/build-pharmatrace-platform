'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Link2, Search } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/app-shell/page-header'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableShell, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { batches, contractAddress } from '@/lib/domain/data'
import { blockchainStatusMeta, formatDateTime, truncateHash } from '@/lib/domain/format'
import type { BlockchainStatus } from '@/lib/domain/types'

const eventLabels: Record<string, string> = {
  BatchCreated: 'Batch created',
  BatchTransferred: 'Batch transferred',
  BatchReceived: 'Batch received',
  BatchRecalled: 'Batch recalled',
}

const statusOptions: Array<{ value: BlockchainStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMING', label: 'Confirming' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REVERTED', label: 'Reverted' },
]

export default function BlockchainPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<BlockchainStatus | 'ALL'>('ALL')

  const transactions = useMemo(() => {
    return batches
      .flatMap((batch) =>
        batch.timeline
          .filter((event) => event.tx)
          .map((event) => ({
            batch,
            event,
            tx: event.tx!,
          })),
      )
      .sort((a, b) => {
        const aTime = a.tx.submittedAt ?? a.event.timestamp
        const bTime = b.tx.submittedAt ?? b.event.timestamp
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })
  }, [])

  const filtered = useMemo(() => {
    return transactions.filter(({ batch, tx }) => {
      const matchesQuery =
        query.trim().length === 0 ||
        batch.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
        (tx.hash ?? '').toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'ALL' || tx.status === status
      return matchesQuery && matchesStatus
    })
  }, [transactions, query, status])

  return (
    <div>
      <PageHeader
        title="Blockchain"
        description="On-chain transactions anchoring batch provenance for tamper-evident tracking."
      />

      <div className="mb-4 rounded-lg border border-border-default bg-surface-card p-4">
        <p className="text-xs text-text-muted">Smart contract</p>
        <p className="mt-1 font-mono text-sm text-text-primary">{contractAddress}</p>
        <p className="mt-1 text-xs text-text-muted">Polygon Amoy (chain 80002)</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search batch number or tx hash..."
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as BlockchainStatus | 'ALL')}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {statusOptions.map((opt) => (
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
          icon={<Link2 className="size-6" />}
          title="No transactions found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>Event</TH>
                <TH>Batch</TH>
                <TH>Tx hash</TH>
                <TH>Block</TH>
                <TH>Status</TH>
                <TH>Submitted</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map(({ batch, event, tx }) => {
                const meta = blockchainStatusMeta[tx.status]
                return (
                  <TR key={event.id}>
                    <TD className="font-medium text-text-primary">
                      {eventLabels[tx.event] ?? tx.event}
                    </TD>
                    <TD>
                      <Link
                        href={`/app/batches/${batch.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {batch.batchNumber}
                      </Link>
                    </TD>
                    <TD className="font-mono text-xs">{truncateHash(tx.hash, 8, 6)}</TD>
                    <TD className="font-mono text-xs">{tx.blockNumber ?? '—'}</TD>
                    <TD>
                      <StatusBadge tone={meta.tone} label={meta.label} showDot />
                    </TD>
                    <TD>{tx.submittedAt ? formatDateTime(tx.submittedAt) : '—'}</TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </TableShell>
      )}
    </div>
  )
}
