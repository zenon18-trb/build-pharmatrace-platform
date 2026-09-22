'use client'

import { useMemo, useState } from 'react'
import { ScrollText, Search } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/app-shell/page-header'
import { Input } from '@/components/ui/input'
import { Table, TableShell, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { auditLogs } from '@/lib/domain/data'
import { formatDateTime } from '@/lib/domain/format'

function actionLabel(action: string): string {
  return action
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

export default function AuditLogsPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return auditLogs
      .filter(
        (log) =>
          query.trim().length === 0 ||
          log.actor.toLowerCase().includes(query.toLowerCase()) ||
          log.target.toLowerCase().includes(query.toLowerCase()) ||
          log.action.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [query])

  return (
    <div>
      <PageHeader
        title="Audit logs"
        description="System-wide record of actions taken across PharmaTrace."
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actor, action, or target..."
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="size-6" />}
          title="No audit logs found"
          description="Try adjusting your search."
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TR>
                <TH>Action</TH>
                <TH>Actor</TH>
                <TH>Organization</TH>
                <TH>Target</TH>
                <TH>Timestamp</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((log) => (
                <TR key={log.id}>
                  <TD className="font-medium text-text-primary">{actionLabel(log.action)}</TD>
                  <TD className="font-mono text-xs">{log.actor}</TD>
                  <TD>{log.organizationName}</TD>
                  <TD className="font-mono text-xs">{log.target}</TD>
                  <TD>{formatDateTime(log.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableShell>
      )}
    </div>
  )
}
