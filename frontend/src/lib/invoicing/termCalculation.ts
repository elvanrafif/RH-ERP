import { DEFAULT_DP_AMOUNT } from '@/lib/constant'

export interface TermItem {
  percent: string
  amount: number
  name?: string
  status?: string
  paymentDate?: string
  [key: string]: unknown
}

export function recalculateTermItems(
  items: TermItem[],
  grandTotal: number,
  type: string
): TermItem[] {
  let runningTotal = 0
  return items.map((item) => {
    let newAmount = 0
    const cleanVal = (item.percent || '').toString().replace('%', '').trim().toLowerCase()

    if (cleanVal === 'dp' && type === 'design') {
      newAmount = DEFAULT_DP_AMOUNT
    } else if (cleanVal === 'pelunasan' || cleanVal === 'settlement') {
      newAmount = Math.max(0, grandTotal - runningTotal)
    } else {
      const numericVal = parseFloat(cleanVal)
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
