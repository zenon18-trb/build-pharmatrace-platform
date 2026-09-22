// PharmaTrace domain model — mirrors the PRD/TRD entities.
// This layer is intentionally backend-agnostic so a real
// PostgreSQL/Drizzle + blockchain adapter can be swapped in later.

export type OrganizationType =
  | 'MANUFACTURER'
  | 'DISTRIBUTOR'
  | 'RETAILER'
  | 'REGULATOR'

export type Role =
  | 'MANUFACTURER'
  | 'DISTRIBUTOR'
  | 'RETAILER'
  | 'ADMIN'

export type OrganizationStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'

export type BatchStatus =
  | 'CREATED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'INVENTORY'
  | 'SOLD'
  | 'SUSPICIOUS'
  | 'RECALLED'
  | 'EXPIRED'

export type BlockchainStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTING'
  | 'PENDING'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'REVERTED'
  | 'TIMEOUT'
  | 'RECONCILING'
  | 'FAILED'

export type ShipmentStatus =
  | 'CREATED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RECEIVED'
  | 'FLAGGED'

export type VerificationOutcome =
  | 'VERIFIED'
  | 'RECALLED'
  | 'EXPIRED'
  | 'SUSPICIOUS'
  | 'NOT_FOUND'
  | 'LIMITED'

export interface Organization {
  id: string
  legalName: string
  code: string
  type: OrganizationType
  status: OrganizationStatus
  walletAddress: string | null
  createdAt: string
}

export interface Medicine {
  id: string
  manufacturerOrgId: string
  name: string
  genericName: string
  dosageForm: string
  strength: string
  packaging: string
  storageRequirements: string
  regulatoryReference: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

export interface BlockchainTransaction {
  hash: string | null
  status: BlockchainStatus
  blockNumber: number | null
  submittedAt: string | null
  confirmedAt: string | null
  event: 'BatchCreated' | 'BatchTransferred' | 'BatchReceived' | 'BatchRecalled'
  fromWallet: string | null
  toWallet: string | null
}

export interface TimelineEvent {
  id: string
  type:
    | 'MANUFACTURED'
    | 'CREATED_ON_BLOCKCHAIN'
    | 'TRANSFERRED'
    | 'RECEIVED'
    | 'FLAGGED'
    | 'RECALLED'
    | 'VERIFIED'
  label: string
  timestamp: string
  organizationName: string
  detail?: string
  tx?: BlockchainTransaction
}

export interface Batch {
  id: string
  publicVerificationId: string
  batchNumber: string
  medicineId: string
  manufacturerOrgId: string
  currentOwnerOrgId: string
  manufacturingDate: string
  expiryDate: string
  quantity: number
  unit: string
  status: BatchStatus
  blockchain: BlockchainTransaction
  timeline: TimelineEvent[]
  createdAt: string
}

export interface Shipment {
  id: string
  reference: string
  batchId: string
  originOrgId: string
  destinationOrgId: string
  quantity: number
  status: ShipmentStatus
  dispatchedAt: string | null
  expectedArrival: string | null
  receivedAt: string | null
}

export interface Transfer {
  id: string
  batchId: string
  fromOrgId: string
  toOrgId: string
  quantity: number
  status: BlockchainStatus
  createdAt: string
}

export interface Invoice {
  id: string
  number: string
  sellerOrgId: string
  buyerOrgId: string
  batchId: string
  quantity: number
  unitPrice: number
  total: number
  status: 'DRAFT' | 'ISSUED' | 'PAID'
  issuedAt: string
  documentHash: string | null
}

export interface Alert {
  id: string
  severity: 'info' | 'warning' | 'danger'
  category:
    | 'EXPIRING'
    | 'RECALLED'
    | 'SUSPICIOUS_TRANSFER'
    | 'TEMPERATURE'
    | 'INVALID_VERIFICATION'
    | 'MISMATCH'
  title: string
  description: string
  createdAt: string
  batchId?: string
}

export interface AuditLog {
  id: string
  action: string
  actor: string
  organizationName: string
  target: string
  createdAt: string
}

export interface VerificationResult {
  outcome: VerificationOutcome
  batch?: Batch
  medicine?: Medicine
  manufacturer?: Organization
  currentCustodian?: Organization
  supplyChainVerified: boolean
  blockchainConfirmed: boolean
  reasons?: string[]
}
