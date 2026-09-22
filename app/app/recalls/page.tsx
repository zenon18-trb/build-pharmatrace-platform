'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ShieldAlert, Search } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/app-shell/page-header'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableShell, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { alerts, batches, getMedicine, getOrganization } from '@/lib/domain/data'
import { formatDate, formatQuantity } from '@/lib/domain/format'

export default function RecallsPage() {
  const [query, setQuery] = useState('')

  const recalled = useMemo(() => {
    return batches
      .filter((b) => b.status === 'RECALLED')
      .map((batch) => ({
        batch,
        medicine: getMedicine(batch.medicineId),
        owner: getOrganization(batch.currentOwnerOrgId),
        alert: alerts.find((a) => a.batchId === batch.id && a.category === 'RECALLED'),
      }))
      .filter(
        ({ batch, medicine }) =>
          query.trim().length === 0 ||
          batch.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
          medicine?.name.toLowerCase().includes(query.toLowerCase()),
      )
  }, [query])

  return (
    <div>
      <PageHeader
        title="Recalls"
        description="Batches recalled by the regulator due to safety or quality concerns."
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search batch number or medicine..."
          className="pl-8"
        />
      </div>

      {recalled.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="size-6" />}
          title="No recalls found"
          description="Recalled batches will appear here."
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>Batch</TH>
                <TH>Medicine</TH>
                <TH>Quantity</TH>
                <TH>Current holder</TH>
                <TH>Reason</TH>
                <TH>Recalled</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {recalled.map(({ batch, medicine, owner, alert }) => (
                <TR key={batch.id}>
                  <TD>
                    <Link
                      href={`/app/batches/${batch.id}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {batch.batchNumber}
                    </Link>
                  </TD>
                  <TD>
                    {medicine?.name}
                    <div className="text-xs text-text-muted">{medicine?.strength}</div>
                  </TD>
                  <TD>{formatQuantity(batch.quantity, batch.unit)}</TD>
                  <TD>{owner?.legalName ?? '—'}</TD>
                  <TD className="max-w-xs text-sm text-text-secondary">
                    {alert?.description ?? '—'}
                  </TD>
                  <TD>{alert ? formatDate(alert.createdAt) : '—'}</TD>
                  <TD>
                    <StatusBadge tone="danger" label="Recalled" showDot />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableShell>
      )}
    </div>
  )
}
