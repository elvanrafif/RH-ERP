export type PettyCashStatus = 'open' | 'closed'
export type PettyCashEntryType = 'expense' | 'topup'

export interface PettyCash {
  id: string
  name: string
  initial_balance: number
  status: PettyCashStatus
  created: string
  updated: string
}

export interface PettyCashEntry {
  id: string
  petty_cash_id: string
  type: PettyCashEntryType
  transaction_date: string
  person_name?: string
  amount: number
  purpose?: string
  notes?: string
  receipt?: string
  created: string
  updated: string
}

export interface CreatePettyCashInput {
  name: string
  initial_balance: number
}

export interface PettyCashEntryInput {
  petty_cash_id: string
  type: PettyCashEntryType
  transaction_date: string
  person_name?: string
  amount: number
  purpose?: string
  notes?: string
  receipt?: File
}
