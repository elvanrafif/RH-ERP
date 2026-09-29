import { DEFAULT_DP_AMOUNT, PAYMENT_ITEM_STATUS } from '@/lib/constant'

export type TermType = 'percentage' | 'fixed_dp' | 'settlement' | 'custom_amount'

export interface TermItem {
  percent: string
  amount: number
  termType?: TermType
  name?: string
  status?: string
  paymentDate?: string
  [key: string]: unknown
}

export function parseTermType(percent: string, termType?: TermType): {
  type: TermType
  value: string
} {
  if (termType === 'custom_amount') return { type: 'custom_amount', value: '' }

  const clean = (percent || '').trim().toLowerCase()
  if (clean === 'dp') return { type: 'fixed_dp', value: '' }
  if (clean === 'pelunasan' || clean === 'settlement')
    return { type: 'settlement', value: '' }
  if (clean === 'custom amount') return { type: 'custom_amount', value: '' }

  const numeric = clean.replace('%', '').trim()
  if (numeric !== '' && !isNaN(Number(numeric)))
    return { type: 'percentage', value: numeric }
  return { type: 'percentage', value: '' }
}

export function formatTermPercent(percent: string, termType?: TermType): string {
  return termType === 'custom_amount' ? '-' : percent
}

export function serializeTermType(
  type: TermType,
  value = ''
): Pick<TermItem, 'percent' | 'termType'> {
  if (type === 'custom_amount') return { percent: '', termType: type }
  if (type === 'fixed_dp') return { percent: 'DP' }
  if (type === 'settlement') return { percent: 'Settlement' }
  return { percent: value ? `${value}%` : '' }
}

export function updateTermItemType(
  item: TermItem,
  type: TermType,
  percentValue = ''
): TermItem {
  const previousType = parseTermType(item.percent, item.termType).type
  const serialized = serializeTermType(type, percentValue)
  const updatedItem: TermItem = {
    ...item,
    ...serialized,
  }

  if (!serialized.termType) delete updatedItem.termType
  if (previousType === 'custom_amount' && type === 'percentage') {
    updatedItem.amount = 0
  }
  return updatedItem
}

export function calculatePaidSummary(
  items: TermItem[],
  grandTotal: number
): { paidAmount: number; remainingPayment: number } {
  const paidAmount = items
    .filter((i) => i.status === PAYMENT_ITEM_STATUS.SUCCESS)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  return { paidAmount, remainingPayment: grandTotal - paidAmount }
}

export function isInvoiceFullyPaid(items: TermItem[]): boolean {
  return items.length > 0 && items.every((i) => i.status === PAYMENT_ITEM_STATUS.SUCCESS)
}

export function recalculateTermItems(
  items: TermItem[],
  grandTotal: number,
  invoiceType: string
): TermItem[] {
  let runningTotal = 0
  return items.map((item) => {
    let newAmount = 0
    const { type, value } = parseTermType(item.percent, item.termType)

    if (type === 'custom_amount') {
      newAmount = Number(item.amount) || 0
    } else if (type === 'fixed_dp' && invoiceType === 'design') {
      newAmount = Math.min(DEFAULT_DP_AMOUNT, grandTotal)
    } else if (type === 'settlement') {
      newAmount = Math.max(0, grandTotal - runningTotal)
    } else {
      const numericVal = parseFloat(value)
      if (!isNaN(numericVal) && grandTotal > 0) {
        newAmount = (grandTotal * numericVal) / 100
      } else {
        newAmount = Number(item.amount) || 0
      }
    }
    runningTotal += newAmount
    return { ...item, amount: newAmount }
  })
}
