'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Truck } from 'lucide-react'
import { useRole } from '@/components/app-shell/role-context'
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
import { getBatch, getMedicine, getOrganization, shipments } from '@/lib/domain/data'
import { formatDate, formatQuantity, shipmentStatusMeta } from '@/lib/domain/format'
import { roleOrgId } from '@/lib/config/navigation'
import type { ShipmentStatus } from '@/lib/domain/types'

const statusOptions: Array<{ value: ShipmentStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'CREATED', label: 'Created' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'IN_TRANSIT', label: 'In transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'FLAGGED', label: 'Flagged' },
]

export default function ShipmentsPage() {
  const { role } = useRole()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ShipmentStatus | 'ALL'>('ALL')

  const orgId = roleOrgId[role]
  const scoped = useMemo(
    () =>
      role === 'ADMIN'
        ? shipments
        : shipments.filter((s) => s.originOrgId === orgId || s.destinationOrgId === orgId),
    [role, orgId],
  )

  const filtered = useMemo(() => {
    return scoped.filter((s) => {
      const batch = getBatch(s.batchId)
      const med = batch ? getMedicine(batch.medicineId) : undefined
      const matchesQuery =
        query.trim().length === 0 ||
        s.reference.toLowerCase().includes(query.toLowerCase()) ||
        batch?.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
        med?.name.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'ALL' || s.status === status
      return matchesQuery && matchesStatus
    })
  }, [scoped, query, status])

  return (
    <div>
      <PageHeader
        title="Shipments"
        description="Track dispatches and deliveries of medicine batches between organizations."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference or batch number..."
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as ShipmentStatus | 'ALL')}>
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
          icon={<Truck className="size-6" />}
          title="No shipments found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>Reference</TH>
                <TH>Batch</TH>
                <TH>Quantity</TH>
                <TH>Status</TH>
                <TH>From</TH>
                <TH>To</TH>
                <TH>Expected arrival</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((s) => {
                const batch = getBatch(s.batchId)
                const origin = getOrganization(s.originOrgId)
                const destination = getOrganization(s.destinationOrgId)
                const meta = shipmentStatusMeta[s.status]
                return (
                  <TR key={s.id}>
                    <TD className="font-medium text-text-primary">{s.reference}</TD>
                    <TD>
                      {batch ? (
                        <Link href={`/app/batches/${batch.id}`} className="hover:underline">
                          {batch.batchNumber}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TD>
                    <TD>{formatQuantity(s.quantity, batch?.unit)}</TD>
                    <TD>
                      <StatusBadge tone={meta.tone} label={meta.label} showDot />
                    </TD>
                    <TD>{origin?.legalName ?? '—'}</TD>
                    <TD>{destination?.legalName ?? '—'}</TD>
                    <TD>{s.expectedArrival ? formatDate(s.expectedArrival) : '—'}</TD>
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
