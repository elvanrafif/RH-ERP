import { describe, expect, it } from 'vitest'
import { createPettyCashSchema, pettyCashExpenseSchema, pettyCashTopupSchema, updatePettyCashNameSchema } from './pettyCash'

describe('petty cash validation', () => {
  it('requires a non-empty name and a positive initial balance', () => {
    expect(createPettyCashSchema.safeParse({ name: '', initial_balance: 0 }).success).toBe(false)
    expect(createPettyCashSchema.safeParse({ name: 'September', initial_balance: 5_000_000 }).success).toBe(true)
  })

  it('requires a non-empty name when editing a petty cash period', () => {
    expect(updatePettyCashNameSchema.safeParse({ name: '  ' }).success).toBe(false)
    expect(updatePettyCashNameSchema.safeParse({ name: 'September' }).success).toBe(true)
  })

  it('requires person and purpose for expenses', () => {
    expect(pettyCashExpenseSchema.safeParse({ type: 'expense', transaction_date: '2026-09-28', person_name: '', amount: 200, purpose: '' }).success).toBe(false)
    expect(pettyCashExpenseSchema.safeParse({ type: 'expense', transaction_date: '2026-09-28', person_name: 'Ayu', amount: 200, purpose: 'Supplies' }).success).toBe(true)
  })

  it('allows top-ups without expense-only fields', () => {
    expect(pettyCashTopupSchema.safeParse({ type: 'topup', transaction_date: '2026-09-28', amount: 500_000 }).success).toBe(true)
  })
})
