'use client'

import { useMemo, useState } from 'react'
import { Pill, Search } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/app-shell/page-header'
import { useRole } from '@/components/app-shell/role-context'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableShell, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { medicines } from '@/lib/domain/data'
import { formatDate } from '@/lib/domain/format'
import { roleOrgId } from '@/lib/config/navigation'

export default function MedicinesPage() {
  const { role } = useRole()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const orgId = roleOrgId[role]
    return medicines
      .filter((m) => m.manufacturerOrgId === orgId)
      .filter(
        (m) =>
          query.trim().length === 0 ||
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.genericName.toLowerCase().includes(query.toLowerCase()),
      )
  }, [role, query])

  return (
    <div>
      <PageHeader
        title="Medicines"
        description="Registered medicine products used when creating new batches."
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or generic name..."
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Pill className="size-6" />}
          title="No medicines found"
          description="Try adjusting your search."
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>Medicine</TH>
                <TH>Dosage form</TH>
                <TH>Strength</TH>
                <TH>Packaging</TH>
                <TH>Regulatory ref.</TH>
                <TH>Status</TH>
                <TH>Registered</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((m) => (
                <TR key={m.id}>
                  <TD className="font-medium text-text-primary">
                    {m.name}
                    <div className="text-xs text-text-muted">{m.genericName}</div>
                  </TD>
                  <TD>{m.dosageForm}</TD>
                  <TD>{m.strength}</TD>
                  <TD className="max-w-xs">{m.packaging}</TD>
                  <TD className="font-mono text-xs">{m.regulatoryReference}</TD>
                  <TD>
                    <StatusBadge
                      tone={m.status === 'ACTIVE' ? 'success' : 'neutral'}
                      label={m.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      showDot
                    />
                  </TD>
                  <TD>{formatDate(m.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableShell>
      )}
    </div>
  )
}
