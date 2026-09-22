import type {
  BatchStatus,
  BlockchainStatus,
  ShipmentStatus,
  VerificationOutcome,
} from './types'

export function truncateHash(hash: string | null, lead = 6, tail = 4): string {
  if (!hash) return '—'
  if (hash.length <= lead + tail + 2) return hash
  return `${hash.slice(0, lead)}…${hash.slice(-tail)}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatQuantity(value: number, unit?: string): string {
  const formatted = new Intl.NumberFormat('en-US').format(value)
  return unit ? `${formatted} ${unit}` : formatted
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface StatusMeta {
  label: string
  tone: Tone
}

export const batchStatusMeta: Record<BatchStatus, StatusMeta> = {
  CREATED: { label: 'Created', tone: 'info' },
  IN_TRANSIT: { label: 'In transit', tone: 'info' },
  RECEIVED: { label: 'Received', tone: 'success' },
  INVENTORY: { label: 'In inventory', tone: 'success' },
  SOLD: { label: 'Sold', tone: 'neutral' },
  SUSPICIOUS: { label: 'Suspicious', tone: 'warning' },
  RECALLED: { label: 'Recalled', tone: 'danger' },
  EXPIRED: { label: 'Expired', tone: 'danger' },
}

export const blockchainStatusMeta: Record<BlockchainStatus, StatusMeta> = {
  NOT_SUBMITTED: { label: 'Not submitted', tone: 'neutral' },
  SUBMITTING: { label: 'Submitting', tone: 'info' },
  PENDING: { label: 'Pending', tone: 'warning' },
  CONFIRMING: { label: 'Confirming', tone: 'warning' },
  CONFIRMED: { label: 'Confirmed', tone: 'info' },
  REVERTED: { label: 'Reverted', tone: 'danger' },
  TIMEOUT: { label: 'Timed out', tone: 'warning' },
  RECONCILING: { label: 'Reconciling', tone: 'warning' },
  FAILED: { label: 'Failed', tone: 'danger' },
}

export const shipmentStatusMeta: Record<ShipmentStatus, StatusMeta> = {
  CREATED: { label: 'Created', tone: 'neutral' },
  DISPATCHED: { label: 'Dispatched', tone: 'info' },
  IN_TRANSIT: { label: 'In transit', tone: 'info' },
  DELIVERED: { label: 'Delivered', tone: 'success' },
  RECEIVED: { label: 'Received', tone: 'success' },
  FLAGGED: { label: 'Flagged', tone: 'warning' },
}

export const verificationMeta: Record<
  VerificationOutcome,
  { label: string; tone: Tone; headline: string }
> = {
  VERIFIED: { label: 'Verified', tone: 'success', headline: 'Medicine verified' },
  RECALLED: { label: 'Recalled', tone: 'danger', headline: 'Recall notice' },
  EXPIRED: { label: 'Expired', tone: 'danger', headline: 'Batch expired' },
  SUSPICIOUS: { label: 'Suspicious', tone: 'warning', headline: 'Verification warning' },
  NOT_FOUND: { label: 'Not found', tone: 'warning', headline: 'Batch not found' },
  LIMITED: { label: 'Limited', tone: 'info', headline: 'Limited verification' },
}
