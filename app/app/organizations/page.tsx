'use client'

import { useMemo, useState } from 'react'
import { Building2, Search } from 'lucide-react'
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
import { organizations } from '@/lib/domain/data'
import { formatDate, truncateHash } from '@/lib/domain/format'
import type { StatusMeta } from '@/lib/domain/format'
import type { OrganizationStatus, OrganizationType } from '@/lib/domain/types'

const statusMeta: Record<OrganizationStatus, StatusMeta> = {
  PENDING: { label: 'Pending', tone: 'warning' },
  ACTIVE: { label: 'Active', tone: 'success' },
  SUSPENDED: { label: 'Suspended', tone: 'danger' },
  INACTIVE: { label: 'Inactive', tone: 'neutral' },
}

const typeLabels: Record<OrganizationType, string> = {
  MANUFACTURER: 'Manufacturer',
  DISTRIBUTOR: 'Distributor',
  RETAILER: 'Retailer',
  REGULATOR: 'Regulator',
}

const typeOptions: Array<{ value: OrganizationType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All types' },
  { value: 'MANUFACTURER', label: 'Manufacturer' },
  { value: 'DISTRIBUTOR', label: 'Distributor' },
  { value: 'RETAILER', label: 'Retailer' },
  { value: 'REGULATOR', label: 'Regulator' },
]

export default function OrganizationsPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<OrganizationType | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    return organizations.filter((o) => {
      const matchesQuery =
        query.trim().length === 0 ||
        o.legalName.toLowerCase().includes(query.toLowerCase()) ||
        o.code.toLowerCase().includes(query.toLowerCase())
      const matchesType = type === 'ALL' || o.type === type
      return matchesQuery && matchesType
    })
  }, [query, type])

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Manufacturers, distributors, retailers, and regulators registered on PharmaTrace."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or code..."
            className="pl-8"
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as OrganizationType | 'ALL')}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {typeOptions.map((opt) => (
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
          icon={<Building2 className="size-6" />}
          title="No organizations found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>Organization</TH>
                <TH>Code</TH>
                <TH>Type</TH>
                <TH>Status</TH>
                <TH>Wallet</TH>
                <TH>Registered</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((o) => {
                const meta = statusMeta[o.status]
                return (
                  <TR key={o.id}>
                    <TD className="font-medium text-text-primary">{o.legalName}</TD>
                    <TD className="font-mono text-xs">{o.code}</TD>
                    <TD>{typeLabels[o.type]}</TD>
                    <TD>
                      <StatusBadge tone={meta.tone} label={meta.label} showDot />
                    </TD>
                    <TD className="font-mono text-xs">{truncateHash(o.walletAddress)}</TD>
                    <TD>{formatDate(o.createdAt)}</TD>
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
