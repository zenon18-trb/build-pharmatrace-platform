'use client'

import Link from 'next/link'
import {
  Package,
  Truck,
  Boxes,
  ShieldCheck,
  Link2,
  Bell,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { useRole } from '@/components/app-shell/role-context'
import { PageHeader } from '@/components/app-shell/page-header'
import { StatCard } from '@/components/app-shell/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import {
  batches,
  shipments,
  alerts,
  medicines,
  getMedicine,
} from '@/lib/domain/data'
import {
  batchStatusMeta,
  blockchainStatusMeta,
  formatDate,
  formatQuantity,
} from '@/lib/domain/format'
import { roleLabels } from '@/lib/config/navigation'

export default function DashboardPage() {
  const { role, user } = useRole()

  const confirmed = batches.filter((b) => b.blockchain.status === 'CONFIRMED').length
  const inTransit = batches.filter((b) => b.status === 'IN_TRANSIT').length
  const recalled = batches.filter((b) => b.status === 'RECALLED').length

  const stats = {
    MANUFACTURER: [
      { label: 'Medicines', value: medicines.length, icon: <Package className="size-5" />, tone: 'info' as const },
      { label: 'Batches created', value: batches.length, icon: <Boxes className="size-5" />, tone: 'neutral' as const },
      { label: 'On blockchain', value: confirmed, icon: <Link2 className="size-5" />, tone: 'success' as const, hint: 'Confirmed on Polygon Amoy' },
      { label: 'Active recalls', value: recalled, icon: <ShieldAlert className="size-5" />, tone: 'danger' as const },
    ],
    DISTRIBUTOR: [
      { label: 'In inventory', value: batches.filter((b) => b.currentOwnerOrgId === 'org-dist').length, icon: <Boxes className="size-5" />, tone: 'success' as const },
      { label: 'Incoming shipments', value: inTransit, icon: <Truck className="size-5" />, tone: 'info' as const },
      { label: 'Pending transfers', value: 1, icon: <ArrowRight className="size-5" />, tone: 'warning' as const },
      { label: 'Open alerts', value: alerts.length, icon: <Bell className="size-5" />, tone: 'warning' as const },
    ],
    RETAILER: [
      { label: 'In inventory', value: batches.filter((b) => b.currentOwnerOrgId === 'org-ret').length, icon: <Boxes className="size-5" />, tone: 'success' as const },
      { label: 'Incoming shipments', value: shipments.filter((s) => s.destinationOrgId === 'org-ret' && s.status !== 'RECEIVED').length, icon: <Truck className="size-5" />, tone: 'info' as const },
      { label: 'Verifications today', value: 24, icon: <ShieldCheck className="size-5" />, tone: 'success' as const },
      { label: 'Open alerts', value: alerts.length, icon: <Bell className="size-5" />, tone: 'warning' as const },
    ],
    ADMIN: [
      { label: 'Total batches', value: batches.length, icon: <Boxes className="size-5" />, tone: 'neutral' as const },
      { label: 'On blockchain', value: confirmed, icon: <Link2 className="size-5" />, tone: 'success' as const },
      { label: 'Active recalls', value: recalled, icon: <ShieldAlert className="size-5" />, tone: 'danger' as const },
      { label: 'Open alerts', value: alerts.length, icon: <Bell className="size-5" />, tone: 'warning' as const },
    ],
  }[role]

  const recentBatches = batches.slice(0, 4)

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        description={`${roleLabels[role]} · ${user.organizationName}`}
        action={
  role === 'MANUFACTURER' ? (
              <Button render={<Link href="/app/batches/new" />}>Create batch</Button>
            ) : (
              <Button render={<Link href="/app/verification" />} variant="outline">
                Verify a batch
              </Button>
            )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent batches</CardTitle>
            <Link
              href="/app/batches"
              className="text-sm font-medium text-brand-secondary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border-subtle">
              {recentBatches.map((b) => {
                const med = getMedicine(b.medicineId)
                const meta = batchStatusMeta[b.status]
                const chain = blockchainStatusMeta[b.blockchain.status]
                return (
                  <li key={b.id}>
                    <Link
                      href={`/app/batches/${b.id}`}
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface-subtle/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-text-primary">
                          {b.batchNumber}
                        </p>
                        <p className="truncate text-sm text-text-muted">
                          {med?.name} {med?.strength} · {formatQuantity(b.quantity, b.unit)}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-text-muted">Expires</p>
                        <p className="text-sm text-text-secondary">
                          {formatDate(b.expiryDate)}
                        </p>
                      </div>
                      <StatusBadge tone={meta.tone} label={meta.label} showDot />
                      <StatusBadge tone={chain.tone} label={chain.label} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Alerts</CardTitle>
            <Link
              href="/app/alerts"
              className="text-sm font-medium text-brand-secondary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="rounded-md border border-border-subtle p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge
                    tone={a.severity === 'danger' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}
                    label={a.category.replace(/_/g, ' ').toLowerCase()}
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-text-primary">{a.title}</p>
                <p className="mt-1 text-xs text-text-muted">{a.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
