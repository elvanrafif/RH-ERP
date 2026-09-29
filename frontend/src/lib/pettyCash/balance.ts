export interface BalanceEntry {
  type: 'expense' | 'topup'
  amount: number
}

export interface PettyCashBalance {
  totalTopup: number
  totalSpent: number
  balance: number
}

export function calculatePettyCashBalance(
  initialBalance: number,
  entries: BalanceEntry[]
): PettyCashBalance {
  const totalTopup = entries.reduce(
    (total, entry) => total + (entry.type === 'topup' ? entry.amount : 0),
    0
  )
  const totalSpent = entries.reduce(
    (total, entry) => total + (entry.type === 'expense' ? entry.amount : 0),
    0
  )

  return {
    totalTopup,
    totalSpent,
    balance: initialBalance + totalTopup - totalSpent,
  }
}
