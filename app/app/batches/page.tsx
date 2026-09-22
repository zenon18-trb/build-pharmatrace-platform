'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Package, Plus, Search } from 'lucide-react'
import { useRole } from '@/components/app-shell/role-context'
import { PageHeader, EmptyState } from '@/components/app-shell/page-header'
import { Button } from '@/components/ui/button'
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
import { batches, getMedicine, getOrganization } from '@/lib/domain/data'
import { batchStatusMeta, blockchainStatusMeta, formatDate, formatQuantity } from '@/lib/domain/format'
import { roleOrgId } from '@/lib/config/navigation'
import type { BatchStatus } from '@/lib/domain/types'

const statusOptions: Array<{ value: BatchStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'CREATED', label: 'Created' },
  { value: 'IN_TRANSIT', label: 'In transit' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'INVENTORY', label: 'In inventory' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'SUSPICIOUS', label: 'Suspicious' },
  { value: 'RECALLED', label: 'Recalled' },
  { value: 'EXPIRED', label: 'Expired' },
]

export default function BatchesPage() {
  const { role } = useRole()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<BatchStatus | 'ALL'>('ALL')

  const orgId = roleOrgId[role]
  const scoped = useMemo(
    () => (role === 'ADMIN' ? batches : batches.filter((b) => b.manufacturerOrgId === orgId)),
    [role, orgId],
  )

  const filtered = useMemo(() => {
    return scoped.filter((b) => {
      const med = getMedicine(b.medicineId)
      const matchesQuery =
        query.trim().length === 0 ||
        b.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
        med?.name.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'ALL' || b.status === status
      return matchesQuery && matchesStatus
    })
  }, [scoped, query, status])

  return (
    <div>
      <PageHeader
        title="Batches"
        description="Medicine batches created and tracked on the blockchain."
        action={
          role === 'MANUFACTURER' ? (
            <Link href="/app/batches/new">
              <Button>
                <Plus data-icon="inline-start" />
                Create batch
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search batch number or medicine..."
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as BatchStatus | 'ALL')}>
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
          icon={<Package className="size-6" />}
          title="No batches found"
          description="Try adjusting your search or filters, or create a new batch."
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>Batch number</TH>
                <TH>Medicine</TH>
                <TH>Quantity</TH>
                <TH>Status</TH>
                <TH>Blockchain</TH>
                <TH>Expiry</TH>
                <TH>Owner</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((b) => {
                const med = getMedicine(b.medicineId)
                const owner = getOrganization(b.currentOwnerOrgId)
                const meta = batchStatusMeta[b.status]
                const chain = blockchainStatusMeta[b.blockchain.status]
                return (
                  <TR key={b.id} className="cursor-pointer">
                    <TD className="font-medium text-text-primary">
                      <Link href={`/app/batches/${b.id}`} className="hover:underline">
                        {b.batchNumber}
                      </Link>
                    </TD>
                    <TD>
                      {med?.name} {med?.strength}
                    </TD>
                    <TD>{formatQuantity(b.quantity, b.unit)}</TD>
                    <TD>
                      <StatusBadge tone={meta.tone} label={meta.label} showDot />
                    </TD>
                    <TD>
                      <StatusBadge tone={chain.tone} label={chain.label} />
                    </TD>
                    <TD>{formatDate(b.expiryDate)}</TD>
                    <TD>{owner?.legalName ?? '—'}</TD>
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
