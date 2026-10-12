import { z } from 'zod'
import { PETTY_CASH_RECEIPT_MAX_COUNT } from '@/lib/constant'
import { isAllowedReceiptType, isReceiptWithinSize, RECEIPT_ALLOWED_LABEL, RECEIPT_MAX_SIZE_LABEL } from '@/lib/pettyCash/receipt'

export const createPettyCashSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  initial_balance: z.coerce.number().positive('Balance must be greater than zero'),
})

export const updatePettyCashNameSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
})

const receiptFileSchema = z
  .instanceof(File)
  .refine(isAllowedReceiptType, `Receipt must be a ${RECEIPT_ALLOWED_LABEL} file`)
  .refine(isReceiptWithinSize, `Receipt must be ${RECEIPT_MAX_SIZE_LABEL} or smaller`)

export const pettyCashExpenseSchema = z.object({
  type: z.literal('expense'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  person_name: z.string().trim().min(1, 'Person name is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  purpose: z.string().trim().min(1, 'Purpose is required'),
  notes: z.string().optional(),
  receipt: z
    .array(receiptFileSchema)
    .max(PETTY_CASH_RECEIPT_MAX_COUNT, `Maximum ${PETTY_CASH_RECEIPT_MAX_COUNT} receipts`)
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
