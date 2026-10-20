import { DEFAULT_DP_AMOUNT, PAYMENT_ITEM_STATUS } from '@/lib/constant'

export type TermType = 'percentage' | 'fixed_dp' | 'settlement' | 'custom_amount' | 'extra_works'

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
  if (termType === 'extra_works') return { type: 'extra_works', value: '' }

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
  return termType === 'custom_amount' || termType === 'extra_works' ? '-' : percent
}

export function serializeTermType(
  type: TermType,
  value = ''
): Pick<TermItem, 'percent' | 'termType'> {
  if (type === 'custom_amount') return { percent: '', termType: type }
  if (type === 'extra_works') return { percent: '', termType: type }
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
  if (
    (previousType === 'custom_amount' || previousType === 'extra_works') &&
    type === 'percentage'
  ) {
    updatedItem.amount = 0
  }
  if (type === 'extra_works') {
    updatedItem.name = 'Pek Tambah'
  }
  return updatedItem
}

export function calculatePaidSummary(
  items: TermItem[],
  grandTotal: number
): { paidAmount: number; remainingPayment: number } {
  // Extra works amounts are outside the contract value but still
  // contribute to the total obligation (and thus remaining payment).
  const extraWorksTotal = items
    .filter((i) => parseTermType(i.percent, i.termType).type === 'extra_works')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

  const effectiveTotal = grandTotal + extraWorksTotal

  const paidAmount = items
    .filter((i) => i.status === PAYMENT_ITEM_STATUS.SUCCESS)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  return { paidAmount, remainingPayment: effectiveTotal - paidAmount }
}

/**
 * Invoice baru boleh dianggap lunas kalau SEMUA termin sudah dibayar DAN nominal
 * yang terbayar sudah menutup grand total.
 *
 * Cek status saja tidak cukup: termin bisa berstatus Success tapi nominalnya
 * lebih kecil dari kewajiban (mis. custom amount), sehingga remaining payment
 * masih lebih dari 0. Selama remaining belum 0, invoice tidak boleh lunas.
 *
 * Sumber kebenaran "sisa" diambil dari calculatePaidSummary agar tidak ada dua
 * definisi remaining payment yang bisa berbeda.
 */
export function isInvoiceFullyPaid(items: TermItem[], grandTotal = 0): boolean {
  if (items.length === 0) return false
  if (!items.every((i) => i.status === PAYMENT_ITEM_STATUS.SUCCESS)) return false

  // Tanpa grand total yang valid tidak ada kewajiban yang bisa dibandingkan,
  // jadi keputusan jatuh ke status termin (perilaku lama).
  if (!(grandTotal > 0)) return true

  const { remainingPayment } = calculatePaidSummary(items, grandTotal)
  return remainingPayment <= 0.5
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

    if (type === 'custom_amount' || type === 'extra_works') {
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
