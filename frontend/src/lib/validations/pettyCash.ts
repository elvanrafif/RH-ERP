import { z } from 'zod'

export const createPettyCashSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  initial_balance: z.coerce.number().positive('Balance must be greater than zero'),
})

export const updatePettyCashNameSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
})

export const pettyCashExpenseSchema = z.object({
  type: z.literal('expense'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  person_name: z.string().trim().min(1, 'Person name is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  purpose: z.string().trim().min(1, 'Purpose is required'),
  notes: z.string().optional(),
  receipt: z
    .instanceof(File)
    .refine(
      (file) => file.type.startsWith('image/') || file.type === 'application/pdf',
      'Receipt must be an image or PDF'
    )
    .optional(),
})

export const pettyCashTopupSchema = z.object({
  type: z.literal('topup'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  notes: z.string().optional(),
})

export const pettyCashEntrySchema = z.discriminatedUnion('type', [
  pettyCashExpenseSchema,
  pettyCashTopupSchema,
])

export type CreatePettyCashFormValues = z.infer<typeof createPettyCashSchema>
export type PettyCashExpenseFormValues = z.infer<typeof pettyCashExpenseSchema>
export type PettyCashTopupFormValues = z.infer<typeof pettyCashTopupSchema>
