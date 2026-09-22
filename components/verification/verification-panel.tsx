import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Link2,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import type { VerificationResult } from '@/lib/domain/types'
import { formatDate, truncateHash, verificationMeta } from '@/lib/domain/format'
import { contractAddress } from '@/lib/domain/data'
import { StatusBadge } from '@/components/ui/status-badge'
import { SupplyChainTimeline } from './supply-chain-timeline'
import { TechnicalDetails } from './technical-details'
import { cn } from '@/lib/utils'

const outcomeIcon = {
  VERIFIED: CheckCircle2,
  RECALLED: ShieldAlert,
  EXPIRED: XCircle,
  SUSPICIOUS: AlertTriangle,
  NOT_FOUND: HelpCircle,
  LIMITED: Link2,
} as const

const heroTone = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  neutral: 'bg-surface-subtle text-text-secondary',
} as const

export function VerificationPanel({ result }: { result: VerificationResult }) {
  const meta = verificationMeta[result.outcome]
  const Icon = outcomeIcon[result.outcome]
  const { batch, medicine, manufacturer } = result

  return (
    <div className="space-y-6">
      {/* Result hero */}
      <div className="flex flex-col items-center text-center">
        <span
          className={cn(
            'flex size-16 items-center justify-center rounded-full',
            heroTone[meta.tone],
          )}
        >
          <Icon className="size-8" strokeWidth={1.75} />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
          {meta.headline}
        </h1>
        {medicine && (
          <p className="mt-1 text-lg text-text-secondary">
            {medicine.name} {medicine.strength}
          </p>
        )}
        {batch && (
          <p className="mt-1 font-mono text-sm text-text-muted">
            Batch {batch.batchNumber}
          </p>
        )}
        {result.reasons && result.reasons.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-text-secondary">
            {result.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
      </div>

      {batch && medicine && manufacturer && (
        <>
          {/* Identity grid */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-default bg-border-subtle">
            {[
              ['Manufacturer', manufacturer.legalName],
              ['Custodian', result.currentCustodian?.legalName ?? '—'],
              ['Manufactured', formatDate(batch.manufacturingDate)],
              ['Expiry', formatDate(batch.expiryDate)],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface-card p-4">
                <dt className="text-xs text-text-muted">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Verification signals */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <StatusBadge
              tone={result.supplyChainVerified ? 'success' : 'warning'}
              label={
                result.supplyChainVerified
                  ? 'Supply chain verified'
                  : 'Supply chain unverified'
              }
              icon={<CheckCircle2 className="size-3.5" strokeWidth={1.75} />}
            />
            <StatusBadge
              tone={result.blockchainConfirmed ? 'info' : 'warning'}
              label={
                result.blockchainConfirmed
                  ? 'Blockchain record confirmed'
                  : 'Blockchain confirmation pending'
              }
              icon={<Link2 className="size-3.5" strokeWidth={1.75} />}
            />
          </div>

          {/* Supply chain */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-text-primary">Supply chain</h2>
            <div className="rounded-lg border border-border-default bg-surface-card p-5">
              <SupplyChainTimeline events={batch.timeline} />
            </div>
          </section>

          <TechnicalDetails
            rows={[
              { label: 'Public verification ID', value: batch.publicVerificationId, mono: true },
              { label: 'Network', value: 'Polygon Amoy (chain 80002)' },
              { label: 'Contract', value: truncateHash(contractAddress, 10, 8), mono: true },
              {
                label: 'Latest transaction',
                value: truncateHash(batch.blockchain.hash, 12, 10),
                mono: true,
              },
              {
                label: 'Block',
                value: batch.blockchain.blockNumber?.toString() ?? '—',
                mono: true,
              },
              { label: 'Provenance status', value: batch.blockchain.status },
            ]}
          />
        </>
      )}
    </div>
  )
}
