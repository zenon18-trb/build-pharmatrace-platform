'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeftRight, Search } from 'lucide-react'
import { useRole } from '@/components/app-shell/role-context'
import { PageHeader, EmptyState } from '@/components/app-shell/page-header'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableShell, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { getBatch, getMedicine, getOrganization, transfers } from '@/lib/domain/data'
import { blockchainStatusMeta, formatDateTime, formatQuantity, truncateHash } from '@/lib/domain/format'
import { roleOrgId } from '@/lib/config/navigation'

export default function TransfersPage() {
  const { role } = useRole()
  const [query, setQuery] = useState('')

  const orgId = roleOrgId[role]
  const scoped = useMemo(
    () =>
      role === 'ADMIN'
        ? transfers
        : transfers.filter((t) => t.fromOrgId === orgId || t.toOrgId === orgId),
    [role, orgId],
  )

  const filtered = useMemo(() => {
    return scoped.filter((t) => {
      const batch = getBatch(t.batchId)
      const med = batch ? getMedicine(batch.medicineId) : undefined
      return (
        query.trim().length === 0 ||
        batch?.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
        med?.name.toLowerCase().includes(query.toLowerCase())
      )
    })
  }, [scoped, query])

  return (
    <div>
      <PageHeader
        title="Transfers"
        description="Custody transfers of batches between organizations, recorded on the blockchain."
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight className="size-6" />}
          title="No transfers found"
          description="Custody transfers you send or receive will appear here."
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>Batch</TH>
                <TH>Quantity</TH>
                <TH>From</TH>
                <TH>To</TH>
                <TH>Blockchain</TH>
                <TH>Date</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((t) => {
                const batch = getBatch(t.batchId)
                const from = getOrganization(t.fromOrgId)
                const to = getOrganization(t.toOrgId)
                const meta = blockchainStatusMeta[t.status]
                return (
                  <TR key={t.id}>
                    <TD className="font-medium text-text-primary">
                      {batch ? (
                        <Link href={`/app/batches/${batch.id}`} className="hover:underline">
                          {batch.batchNumber}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TD>
                    <TD>{formatQuantity(t.quantity, batch?.unit)}</TD>
                    <TD>{from?.legalName ?? '—'}</TD>
                    <TD>{to?.legalName ?? '—'}</TD>
                    <TD>
                      <StatusBadge tone={meta.tone} label={meta.label} />
                    </TD>
                    <TD>{formatDateTime(t.createdAt)}</TD>
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
