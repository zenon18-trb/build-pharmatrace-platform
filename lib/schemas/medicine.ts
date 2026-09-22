import { z } from 'zod'

export const CreateMedicineSchema = z.object({
  name: z.string().trim().min(2).max(120),
  genericName: z.string().trim().min(2).max(120),
  dosageForm: z.string().trim().min(2).max(80),
  strength: z.string().trim().min(1).max(80),
  packaging: z.string().trim().min(2).max(240),
  storageRequirements: z.string().trim().min(2).max(240),
  regulatoryReference: z.string().trim().min(2).max(80),
})

export type CreateMedicineInput = z.infer<typeof CreateMedicineSchema>
