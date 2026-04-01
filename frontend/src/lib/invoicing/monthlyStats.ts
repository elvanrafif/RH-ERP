import { PAYMENT_ITEM_STATUS } from '@/lib/constant'

const MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

export interface MonthlyRevenueData {
  month: string
  total: number
}

export function buildMonthlyRevenueData(
  invoices: any[],
  year: number
): MonthlyRevenueData[] {
  const monthlyTotals = Array<number>(12).fill(0)

  for (const inv of invoices) {
    let items = inv.items ?? []
    if (typeof items === 'string') {
      try { items = JSON.parse(items) } catch { items = [] }
    }
    if (!Array.isArray(items) || items.length === 0) continue

    const lastSuccessItem = [...items]
      .reverse()
      .find((item: any) => item.status === PAYMENT_ITEM_STATUS.SUCCESS)
    if (!lastSuccessItem) continue

    const rawDate = lastSuccessItem.paymentDate ?? inv.updated
    const date = new Date(rawDate)
    if (isNaN(date.getTime())) continue
    if (date.getFullYear() !== year) continue

    monthlyTotals[date.getMonth()] += inv.total_amount ?? inv.amount ?? 0
  }

  return MONTHS_ID.map((month, i) => ({ month, total: monthlyTotals[i] }))
}
