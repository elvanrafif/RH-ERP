import { describe, expect, it } from 'vitest'
import { calculatePettyCashBalance } from './balance'

describe('calculatePettyCashBalance', () => {
  it('adds topups and subtracts expenses from the initial balance', () => {
    expect(
      calculatePettyCashBalance(5_000_000, [
        { type: 'expense', amount: 250_000 },
        { type: 'topup', amount: 1_000_000 },
      ])
    ).toEqual({ totalTopup: 1_000_000, totalSpent: 250_000, balance: 5_750_000 })
  })
})
