import { z } from 'zod'

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date.')

export const CreateBatchSchema = z
  .object({
    medicineId: z.string().uuid('Select a medicine.'),
    batchNumber: z
      .string()
      .trim()
      .min(3, 'Batch number is required.')
      .max(64, 'Batch number is too long.')
      .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, 'Use letters, numbers, dots, dashes, or underscores.'),
    manufacturingDate: isoDate,
    expiryDate: isoDate,
    quantity: z.coerce.number().int().positive('Quantity must be a positive whole number.'),
    unit: z.string().trim().min(1, 'Unit is required.').max(32),
  })
  .refine((value) => value.expiryDate > value.manufacturingDate, {
    message: 'Expiry date must be after manufacturing date.',
    path: ['expiryDate'],
  })

export type CreateBatchInput = z.infer<typeof CreateBatchSchema>

export const TransferBatchSchema = z.object({
  batchId: z.string().uuid(),
  toOrganizationId: z.string().uuid('Select a destination organization.'),
  quantity: z.coerce.number().int().positive(),
})

export type TransferBatchInput = z.infer<typeof TransferBatchSchema>

export const ReceiveShipmentSchema = z.object({
  shipmentId: z.string().uuid(),
})

export const RecallBatchSchema = z.object({
  batchId: z.string().uuid(),
  reason: z.string().trim().min(8, 'Provide a recall reason.').max(500),
})
