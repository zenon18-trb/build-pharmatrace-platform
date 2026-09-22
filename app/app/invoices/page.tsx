'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { FileText, Search } from 'lucide-react'
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
import { getBatch, getOrganization, invoices } from '@/lib/domain/data'
import { formatCurrency, formatDate } from '@/lib/domain/format'
import { roleOrgId } from '@/lib/config/navigation'
import type { Invoice } from '@/lib/domain/types'
import type { StatusMeta } from '@/lib/domain/format'

const invoiceStatusMeta: Record<Invoice['status'], StatusMeta> = {
  DRAFT: { label: 'Draft', tone: 'neutral' },
  ISSUED: { label: 'Issued', tone: 'info' },
  PAID: { label: 'Paid', tone: 'success' },
}

const statusOptions: Array<{ value: Invoice['status'] | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ISSUED', label: 'Issued' },
  { value: 'PAID', label: 'Paid' },
]

export default function InvoicesPage() {
  const { role } = useRole()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Invoice['status'] | 'ALL'>('ALL')

  const orgId = roleOrgId[role]
  const scoped = useMemo(
    () =>
      role === 'ADMIN'
        ? invoices
        : invoices.filter((i) => i.sellerOrgId === orgId || i.buyerOrgId === orgId),
    [role, orgId],
  )

  const filtered = useMemo(() => {
    return scoped.filter((i) => {
      const batch = getBatch(i.batchId)
      const matchesQuery =
        query.trim().length === 0 ||
        i.number.toLowerCase().includes(query.toLowerCase()) ||
        batch?.batchNumber.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'ALL' || i.status === status
      return matchesQuery && matchesStatus
    })
  }, [scoped, query, status])

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Billing records issued between organizations for batch transfers."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoice number or batch..."
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as Invoice['status'] | 'ALL')}>
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
          icon={<FileText className="size-6" />}
          title="No invoices found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>Invoice</TH>
                <TH>Batch</TH>
                <TH>Seller</TH>
                <TH>Buyer</TH>
                <TH>Total</TH>
                <TH>Status</TH>
                <TH>Issued</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((i) => {
                const batch = getBatch(i.batchId)
                const seller = getOrganization(i.sellerOrgId)
                const buyer = getOrganization(i.buyerOrgId)
                const meta = invoiceStatusMeta[i.status]
                return (
                  <TR key={i.id}>
                    <TD className="font-medium text-text-primary">{i.number}</TD>
                    <TD>
                      {batch ? (
                        <Link href={`/app/batches/${batch.id}`} className="hover:underline">
                          {batch.batchNumber}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TD>
                    <TD>{seller?.legalName ?? '—'}</TD>
                    <TD>{buyer?.legalName ?? '—'}</TD>
                    <TD>{formatCurrency(i.total)}</TD>
                    <TD>
                      <StatusBadge tone={meta.tone} label={meta.label} />
                    </TD>
                    <TD>{formatDate(i.issuedAt)}</TD>
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
