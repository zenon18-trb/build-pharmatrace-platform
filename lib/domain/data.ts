import type {
  Alert,
  AuditLog,
  Batch,
  Invoice,
  Medicine,
  Organization,
  Shipment,
  Transfer,
  VerificationResult,
} from './types'

const CONTRACT = '0x9f2C4b1A7e5D3c8F0a6B2e9D4c7A1f3B8e5C2d0A'

export const organizations: Organization[] = [
  {
    id: 'org-mfr',
    legalName: 'Example Pharmaceuticals Ltd.',
    code: 'MFR-EXP-001',
    type: 'MANUFACTURER',
    status: 'ACTIVE',
    walletAddress: '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f90',
    createdAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'org-dist',
    legalName: 'MedSupply Distribution',
    code: 'DST-MSD-014',
    type: 'DISTRIBUTOR',
    status: 'ACTIVE',
    walletAddress: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    createdAt: '2026-01-18T09:00:00Z',
  },
  {
    id: 'org-ret',
    legalName: 'City Pharmacy',
    code: 'RET-CTY-207',
    type: 'RETAILER',
    status: 'ACTIVE',
    walletAddress: '0xab12cd34ef56ab78cd90ef12ab34cd56ef78ab90',
    createdAt: '2026-02-02T09:00:00Z',
  },
  {
    id: 'org-ret-2',
    legalName: 'Northside Pharmacy',
    code: 'RET-NTH-109',
    type: 'RETAILER',
    status: 'PENDING',
    walletAddress: null,
    createdAt: '2026-09-10T09:00:00Z',
  },
  {
    id: 'org-reg',
    legalName: 'National Medicines Regulator',
    code: 'REG-NMR-001',
    type: 'REGULATOR',
    status: 'ACTIVE',
    walletAddress: '0xdead000000000000000000000000000000beef00',
    createdAt: '2026-01-01T09:00:00Z',
  },
]

export const medicines: Medicine[] = [
  {
    id: 'med-pcm',
    manufacturerOrgId: 'org-mfr',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    dosageForm: 'Tablet',
    strength: '500 mg',
    packaging: 'Blister pack of 10 · 100 packs per carton',
    storageRequirements: 'Store below 25°C, protect from moisture',
    regulatoryReference: 'REG-PCM-500-2025',
    status: 'ACTIVE',
    createdAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'med-amx',
    manufacturerOrgId: 'org-mfr',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin trihydrate',
    dosageForm: 'Capsule',
    strength: '250 mg',
    packaging: 'Bottle of 100 capsules',
    storageRequirements: 'Store below 25°C',
    regulatoryReference: 'REG-AMX-250-2025',
    status: 'ACTIVE',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'med-ins',
    manufacturerOrgId: 'org-mfr',
    name: 'Insulin Glargine',
    genericName: 'Insulin glargine',
    dosageForm: 'Injection',
    strength: '100 IU/mL',
    packaging: '5 pre-filled pens per carton',
    storageRequirements: 'Cold chain 2–8°C, do not freeze',
    regulatoryReference: 'REG-INS-100-2025',
    status: 'ACTIVE',
    createdAt: '2026-03-20T10:00:00Z',
  },
]

export const batches: Batch[] = [
  {
    id: 'batch-1',
    publicVerificationId: 'a1b2c3d4-verify-pcm-001',
    batchNumber: 'PCM-2026-001',
    medicineId: 'med-pcm',
    manufacturerOrgId: 'org-mfr',
    currentOwnerOrgId: 'org-ret',
    manufacturingDate: '2026-09-22',
    expiryDate: '2028-09-21',
    quantity: 10000,
    unit: 'tablets',
    status: 'INVENTORY',
    blockchain: {
      hash: '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f9021d4c7a1f3b8e5c2d0a91dc',
      status: 'CONFIRMED',
      blockNumber: 9821334,
      submittedAt: '2026-09-22T11:02:00Z',
      confirmedAt: '2026-09-22T11:02:18Z',
      event: 'BatchCreated',
      fromWallet: null,
      toWallet: '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f90',
    },
    timeline: [
      {
        id: 'ev-1',
        type: 'MANUFACTURED',
        label: 'Manufactured',
        timestamp: '2026-09-22T09:00:00Z',
        organizationName: 'Example Pharmaceuticals Ltd.',
      },
      {
        id: 'ev-2',
        type: 'CREATED_ON_BLOCKCHAIN',
        label: 'Created on blockchain',
        timestamp: '2026-09-22T11:02:18Z',
        organizationName: 'Example Pharmaceuticals Ltd.',
        detail: 'Provenance record confirmed on Polygon Amoy',
        tx: {
          hash: '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f9021d4c7a1f3b8e5c2d0a91dc',
          status: 'CONFIRMED',
          blockNumber: 9821334,
          submittedAt: '2026-09-22T11:02:00Z',
          confirmedAt: '2026-09-22T11:02:18Z',
          event: 'BatchCreated',
          fromWallet: null,
          toWallet: '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f90',
        },
      },
      {
        id: 'ev-3',
        type: 'TRANSFERRED',
        label: 'Transferred to distributor',
        timestamp: '2026-09-23T08:30:00Z',
        organizationName: 'Example Pharmaceuticals Ltd.',
        detail: 'To: MedSupply Distribution',
        tx: {
          hash: '0x2f5e9d1c8b4a7f0e3d6c9b2a5f8e1d4c7b0a3f6e9d2c5b8a1f4e7d0c3b6a9f2',
          status: 'CONFIRMED',
          blockNumber: 9823110,
          submittedAt: '2026-09-23T08:30:00Z',
          confirmedAt: '2026-09-23T08:30:22Z',
          event: 'BatchTransferred',
          fromWallet: '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f90',
          toWallet: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
        },
      },
      {
        id: 'ev-4',
        type: 'RECEIVED',
        label: 'Received by distributor',
        timestamp: '2026-09-24T10:15:00Z',
        organizationName: 'MedSupply Distribution',
      },
      {
        id: 'ev-5',
        type: 'TRANSFERRED',
        label: 'Transferred to retailer',
        timestamp: '2026-09-25T09:00:00Z',
        organizationName: 'MedSupply Distribution',
        detail: 'To: City Pharmacy',
        tx: {
          hash: '0x7b0a3f6e9d2c5b8a1f4e7d0c3b6a9f2e5d8c1b4a7f0e3d6c9b2a5f8e1d4c7b0',
          status: 'CONFIRMED',
          blockNumber: 9826001,
          submittedAt: '2026-09-25T09:00:00Z',
          confirmedAt: '2026-09-25T09:00:19Z',
          event: 'BatchTransferred',
          fromWallet: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
          toWallet: '0xab12cd34ef56ab78cd90ef12ab34cd56ef78ab90',
        },
      },
      {
        id: 'ev-6',
        type: 'RECEIVED',
        label: 'Received by retailer',
        timestamp: '2026-09-26T11:40:00Z',
        organizationName: 'City Pharmacy',
      },
    ],
    createdAt: '2026-09-22T11:02:18Z',
  },
  {
    id: 'batch-2',
    publicVerificationId: 'b2c3d4e5-verify-amx-004',
    batchNumber: 'AMX-2026-004',
    medicineId: 'med-amx',
    manufacturerOrgId: 'org-mfr',
    currentOwnerOrgId: 'org-dist',
    manufacturingDate: '2026-09-10',
    expiryDate: '2027-03-09',
    quantity: 5000,
    unit: 'capsules',
    status: 'IN_TRANSIT',
    blockchain: {
      hash: '0x4c7b0a3f6e9d2c5b8a1f4e7d0c3b6a9f2e5d8c1b4a7f0e3d6c9b2a5f8e1d4c7',
      status: 'CONFIRMED',
      blockNumber: 9819002,
      submittedAt: '2026-09-10T12:00:00Z',
      confirmedAt: '2026-09-10T12:00:20Z',
      event: 'BatchTransferred',
      fromWallet: '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f90',
      toWallet: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    },
    timeline: [
      {
        id: 'ev2-1',
        type: 'MANUFACTURED',
        label: 'Manufactured',
        timestamp: '2026-09-10T09:00:00Z',
        organizationName: 'Example Pharmaceuticals Ltd.',
      },
      {
        id: 'ev2-2',
        type: 'CREATED_ON_BLOCKCHAIN',
        label: 'Created on blockchain',
        timestamp: '2026-09-10T09:30:00Z',
        organizationName: 'Example Pharmaceuticals Ltd.',
      },
      {
        id: 'ev2-3',
        type: 'TRANSFERRED',
        label: 'Transferred to distributor',
        timestamp: '2026-09-20T08:00:00Z',
        organizationName: 'Example Pharmaceuticals Ltd.',
        detail: 'To: MedSupply Distribution — in transit',
      },
    ],
    createdAt: '2026-09-10T09:30:00Z',
  },
  {
    id: 'batch-3',
    publicVerificationId: 'c3d4e5f6-verify-ins-002',
    batchNumber: 'INS-2026-002',
    medicineId: 'med-ins',
    manufacturerOrgId: 'org-mfr',
    currentOwnerOrgId: 'org-mfr',
    manufacturingDate: '2026-09-18',
    expiryDate: '2027-09-17',
    quantity: 1200,
    unit: 'pens',
    status: 'CREATED',
    blockchain: {
      hash: null,
      status: 'PENDING',
      blockNumber: null,
      submittedAt: '2026-09-22T14:20:00Z',
      confirmedAt: null,
      event: 'BatchCreated',
      fromWallet: null,
      toWallet: '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f90',
    },
    timeline: [
      {
        id: 'ev3-1',
        type: 'MANUFACTURED',
        label: 'Manufactured',
        timestamp: '2026-09-18T09:00:00Z',
        organizationName: 'Example Pharmaceuticals Ltd.',
      },
      {
        id: 'ev3-2',
        type: 'CREATED_ON_BLOCKCHAIN',
        label: 'Blockchain submission pending',
        timestamp: '2026-09-22T14:20:00Z',
        organizationName: 'Example Pharmaceuticals Ltd.',
        detail: 'Awaiting confirmation on Polygon Amoy',
      },
    ],
    createdAt: '2026-09-22T14:20:00Z',
  },
  {
    id: 'batch-4',
    publicVerificationId: 'd4e5f6a7-verify-pcm-009',
    batchNumber: 'PCM-2025-118',
    medicineId: 'med-pcm',
    manufacturerOrgId: 'org-mfr',
    currentOwnerOrgId: 'org-ret',
    manufacturingDate: '2025-01-15',
    expiryDate: '2026-01-14',
    quantity: 8000,
    unit: 'tablets',
    status: 'RECALLED',
    blockchain: {
      hash: '0x1f4e7d0c3b6a9f2e5d8c1b4a7f0e3d6c9b2a5f8e1d4c7b0a3f6e9d2c5b8a1f4',
      status: 'CONFIRMED',
      blockNumber: 9700120,
      submittedAt: '2025-01-15T10:00:00Z',
      confirmedAt: '2025-01-15T10:00:25Z',
      event: 'BatchRecalled',
      fromWallet: '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f90',
      toWallet: null,
    },
    timeline: [
      {
        id: 'ev4-1',
        type: 'MANUFACTURED',
        label: 'Manufactured',
        timestamp: '2025-01-15T09:00:00Z',
        organizationName: 'Example Pharmaceuticals Ltd.',
      },
      {
        id: 'ev4-2',
        type: 'RECALLED',
        label: 'Recalled',
        timestamp: '2026-08-01T09:00:00Z',
        organizationName: 'National Medicines Regulator',
        detail: 'Recall reason: packaging defect — potential contamination',
      },
    ],
    createdAt: '2025-01-15T09:00:00Z',
  },
]

export const shipments: Shipment[] = [
  {
    id: 'ship-1',
    reference: 'SHP-2026-0041',
    batchId: 'batch-2',
    originOrgId: 'org-mfr',
    destinationOrgId: 'org-dist',
    quantity: 5000,
    status: 'IN_TRANSIT',
    dispatchedAt: '2026-09-20T08:00:00Z',
    expectedArrival: '2026-09-27T00:00:00Z',
    receivedAt: null,
  },
  {
    id: 'ship-2',
    reference: 'SHP-2026-0039',
    batchId: 'batch-1',
    originOrgId: 'org-dist',
    destinationOrgId: 'org-ret',
    quantity: 10000,
    status: 'RECEIVED',
    dispatchedAt: '2026-09-25T09:00:00Z',
    expectedArrival: '2026-09-26T00:00:00Z',
    receivedAt: '2026-09-26T11:40:00Z',
  },
]

export const transfers: Transfer[] = [
  {
    id: 'xfer-1',
    batchId: 'batch-1',
    fromOrgId: 'org-mfr',
    toOrgId: 'org-dist',
    quantity: 10000,
    status: 'CONFIRMED',
    createdAt: '2026-09-23T08:30:00Z',
  },
  {
    id: 'xfer-2',
    batchId: 'batch-1',
    fromOrgId: 'org-dist',
    toOrgId: 'org-ret',
    quantity: 10000,
    status: 'CONFIRMED',
    createdAt: '2026-09-25T09:00:00Z',
  },
  {
    id: 'xfer-3',
    batchId: 'batch-2',
    fromOrgId: 'org-mfr',
    toOrgId: 'org-dist',
    quantity: 5000,
    status: 'PENDING',
    createdAt: '2026-09-20T08:00:00Z',
  },
]

export const invoices: Invoice[] = [
  {
    id: 'inv-1',
    number: 'INV-2026-1042',
    sellerOrgId: 'org-mfr',
    buyerOrgId: 'org-dist',
    batchId: 'batch-1',
    quantity: 10000,
    unitPrice: 0.04,
    total: 400,
    status: 'PAID',
    issuedAt: '2026-09-23T08:30:00Z',
    documentHash: '0x9d2c5b8a1f4e7d0c3b6a9f2e5d8c1b4a7f0e3d6c9b2a5f8e1d4c7b0a3f6e9d2c',
  },
  {
    id: 'inv-2',
    number: 'INV-2026-1051',
    sellerOrgId: 'org-dist',
    buyerOrgId: 'org-ret',
    batchId: 'batch-1',
    quantity: 10000,
    unitPrice: 0.06,
    total: 600,
    status: 'ISSUED',
    issuedAt: '2026-09-25T09:00:00Z',
    documentHash: null,
  },
]

export const alerts: Alert[] = [
  {
    id: 'al-1',
    severity: 'danger',
    category: 'RECALLED',
    title: 'Batch PCM-2025-118 recalled',
    description:
      'Regulator issued a recall for a packaging defect. Affected inventory must be quarantined.',
    createdAt: '2026-08-01T09:00:00Z',
    batchId: 'batch-4',
  },
  {
    id: 'al-2',
    severity: 'warning',
    category: 'EXPIRING',
    title: 'Batch AMX-2026-004 expiring in under 6 months',
    description: 'Amoxicillin 250mg expires 09 Mar 2027. Prioritize distribution.',
    createdAt: '2026-09-21T09:00:00Z',
    batchId: 'batch-2',
  },
  {
    id: 'al-3',
    severity: 'info',
    category: 'MISMATCH',
    title: 'Blockchain confirmation pending for INS-2026-002',
    description:
      'Batch created in database; blockchain provenance record is awaiting confirmation.',
    createdAt: '2026-09-22T14:20:00Z',
    batchId: 'batch-3',
  },
]

export const auditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'BATCH_CREATED',
    actor: 'a.rivera@example-pharma.com',
    organizationName: 'Example Pharmaceuticals Ltd.',
    target: 'PCM-2026-001',
    createdAt: '2026-09-22T11:02:18Z',
  },
  {
    id: 'log-2',
    action: 'BATCH_TRANSFERRED',
    actor: 'a.rivera@example-pharma.com',
    organizationName: 'Example Pharmaceuticals Ltd.',
    target: 'PCM-2026-001 → MedSupply Distribution',
    createdAt: '2026-09-23T08:30:22Z',
  },
  {
    id: 'log-3',
    action: 'BATCH_RECEIVED',
    actor: 'k.osei@medsupply.com',
    organizationName: 'MedSupply Distribution',
    target: 'PCM-2026-001',
    createdAt: '2026-09-24T10:15:00Z',
  },
  {
    id: 'log-4',
    action: 'BLOCKCHAIN_TRANSACTION_CONFIRMED',
    actor: 'system',
    organizationName: 'PharmaTrace',
    target: '0x7b0a…9f2e (BatchTransferred)',
    createdAt: '2026-09-25T09:00:19Z',
  },
  {
    id: 'log-5',
    action: 'RECALL_CREATED',
    actor: 'inspector@nmr.gov',
    organizationName: 'National Medicines Regulator',
    target: 'PCM-2025-118',
    createdAt: '2026-08-01T09:00:00Z',
  },
]

export const contractAddress = CONTRACT

// ---- Accessors -------------------------------------------------

export function getOrganization(id: string) {
  return organizations.find((o) => o.id === id)
}

export function getMedicine(id: string) {
  return medicines.find((m) => m.id === id)
}

export function getBatch(id: string) {
  return batches.find((b) => b.id === id)
}

export function getShipment(id: string) {
  return shipments.find((s) => s.id === id)
}

export function getInvoice(id: string) {
  return invoices.find((i) => i.id === id)
}

export function getBatchByPublicId(publicId: string) {
  return batches.find((b) => b.publicVerificationId === publicId)
}

export function resolveVerification(publicId: string): VerificationResult {
  const batch = getBatchByPublicId(publicId)
  if (!batch) {
    return {
      outcome: 'NOT_FOUND',
      supplyChainVerified: false,
      blockchainConfirmed: false,
      reasons: ['No batch matches this verification code.'],
    }
  }

  const medicine = getMedicine(batch.medicineId)
  const manufacturer = getOrganization(batch.manufacturerOrgId)
  const currentCustodian = getOrganization(batch.currentOwnerOrgId)
  const blockchainConfirmed = batch.blockchain.status === 'CONFIRMED'
  const expired = new Date(batch.expiryDate) < new Date('2026-09-22')

  const base = {
    batch,
    medicine,
    manufacturer,
    currentCustodian,
    supplyChainVerified: true,
    blockchainConfirmed,
  }

  if (batch.status === 'RECALLED') {
    return {
      ...base,
      outcome: 'RECALLED',
      supplyChainVerified: false,
      reasons: ['This batch has been marked as recalled by the regulator.'],
    }
  }
  if (batch.status === 'EXPIRED' || expired) {
    return { ...base, outcome: 'EXPIRED', reasons: ['This batch is past its expiry date.'] }
  }
  if (batch.status === 'SUSPICIOUS') {
    return {
      ...base,
      outcome: 'SUSPICIOUS',
      supplyChainVerified: false,
      reasons: ['Unexpected custodian or blockchain/database mismatch detected.'],
    }
  }
  if (!blockchainConfirmed) {
    return {
      ...base,
      outcome: 'LIMITED',
      reasons: ['Blockchain provenance is still being confirmed for this batch.'],
    }
  }
  return { ...base, outcome: 'VERIFIED' }
}
