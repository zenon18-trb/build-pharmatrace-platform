import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Link2, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/app-shell/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { SupplyChainTimeline } from '@/components/verification/supply-chain-timeline'
import { getBatch, getMedicine, getOrganization, contractAddress } from '@/lib/domain/data'
import {
  batchStatusMeta,
  blockchainStatusMeta,
  formatDate,
  formatDateTime,
  formatQuantity,
  truncateHash,
} from '@/lib/domain/format'

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const batch = getBatch(id)
  if (!batch) notFound()

  const medicine = getMedicine(batch.medicineId)
  const manufacturer = getOrganization(batch.manufacturerOrgId)
  const owner = getOrganization(batch.currentOwnerOrgId)
  const meta = batchStatusMeta[batch.status]
  const chain = blockchainStatusMeta[batch.blockchain.status]

  return (
    <div>
      <Link
        href="/app/batches"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to batches
      </Link>

      <PageHeader
        title={batch.batchNumber}
        description={`${medicine?.name} ${medicine?.strength} · ${formatQuantity(batch.quantity, batch.unit)}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge tone={meta.tone} label={meta.label} showDot />
            <StatusBadge tone={chain.tone} label={chain.label} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Batch details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Medicine</dt>
                  <dd className="mt-0.5 text-sm text-text-primary">
                    {medicine?.name} ({medicine?.genericName})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Dosage form</dt>
                  <dd className="mt-0.5 text-sm text-text-primary">
                    {medicine?.dosageForm} · {medicine?.strength}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Manufacturing date</dt>
                  <dd className="mt-0.5 text-sm text-text-primary">
                    {formatDate(batch.manufacturingDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Expiry date</dt>
                  <dd className="mt-0.5 text-sm text-text-primary">
                    {formatDate(batch.expiryDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Manufacturer</dt>
                  <dd className="mt-0.5 text-sm text-text-primary">{manufacturer?.legalName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Current custodian</dt>
                  <dd className="mt-0.5 text-sm text-text-primary">{owner?.legalName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Quantity</dt>
                  <dd className="mt-0.5 text-sm text-text-primary">
                    {formatQuantity(batch.quantity, batch.unit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Public verification ID</dt>
                  <dd className="mt-0.5 truncate font-mono text-sm text-text-primary">
                    {batch.publicVerificationId}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Blockchain record</CardTitle>
              <StatusBadge tone={chain.tone} label={chain.label} />
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-muted">Transaction hash</dt>
                  <dd className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-sm text-text-primary">
                    <Link2 className="size-3.5 text-brand-secondary" />
                    {truncateHash(batch.blockchain.hash, 10, 8)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Block number</dt>
                  <dd className="mt-0.5 text-sm text-text-primary">
                    {batch.blockchain.blockNumber ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Submitted</dt>
                  <dd className="mt-0.5 text-sm text-text-primary">
                    {batch.blockchain.submittedAt ? formatDateTime(batch.blockchain.submittedAt) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Confirmed</dt>
                  <dd className="mt-0.5 text-sm text-text-primary">
                    {batch.blockchain.confirmedAt ? formatDateTime(batch.blockchain.confirmedAt) : '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-text-muted">Smart contract</dt>
                  <dd className="mt-0.5 font-mono text-sm text-text-primary">{contractAddress}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-start-3">
          <CardHeader>
            <CardTitle>Supply chain timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <SupplyChainTimeline events={batch.timeline} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-col items-start gap-2 rounded-lg border border-border-default bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <ShieldCheck className="size-4 text-success" />
          Anyone can verify this batch with its public verification page.
        </div>
        <Button
          render={<Link href={`/verify/${batch.publicVerificationId}`} />}
          variant="outline"
        >
          Open public verification page
        </Button>
      </div>
    </div>
  )
}
