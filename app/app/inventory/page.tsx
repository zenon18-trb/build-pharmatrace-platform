'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Boxes, Search } from 'lucide-react'
import { useRole } from '@/components/app-shell/role-context'
import { PageHeader, EmptyState } from '@/components/app-shell/page-header'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableShell, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { batches, getMedicine, getOrganization } from '@/lib/domain/data'
import { batchStatusMeta, formatDate, formatQuantity } from '@/lib/domain/format'
import { roleOrgId } from '@/lib/config/navigation'

export default function InventoryPage() {
  const { role } = useRole()
  const [query, setQuery] = useState('')

  const orgId = roleOrgId[role]
  const owned = useMemo(
    () =>
      batches.filter(
        (b) => b.currentOwnerOrgId === orgId && !['CREATED', 'RECALLED', 'EXPIRED'].includes(b.status),
      ),
    [orgId],
  )

  const filtered = useMemo(() => {
    return owned.filter((b) => {
      const med = getMedicine(b.medicineId)
      return (
        query.trim().length === 0 ||
        b.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
        med?.name.toLowerCase().includes(query.toLowerCase())
      )
    })
  }, [owned, query])

  const totalUnits = owned.reduce((sum, b) => sum + b.quantity, 0)

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={`${owned.length} batches on hand · ${new Intl.NumberFormat('en-US').format(totalUnits)} units total`}
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
          icon={<Boxes className="size-6" />}
          title="No inventory found"
          description="Received batches will appear here once they've been accepted into stock."
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
                <TH>Manufacturer</TH>
                <TH>Expiry</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((b) => {
                const med = getMedicine(b.medicineId)
                const manufacturer = getOrganization(b.manufacturerOrgId)
                const meta = batchStatusMeta[b.status]
                return (
                  <TR key={b.id}>
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
                    <TD>{manufacturer?.legalName ?? '—'}</TD>
                    <TD>{formatDate(b.expiryDate)}</TD>
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
