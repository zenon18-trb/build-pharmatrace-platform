import { z } from 'zod'

export const PublicIdSchema = z
  .string()
  .trim()
  .min(3)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/, 'Invalid verification identifier.')
