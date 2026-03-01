import { isWithinDateFilter } from './dateFilter'
import { PAYMENT_ITEM_STATUS } from '@/lib/constant'

interface ChartEntry {
  name: string
  value: number
  color: string
}

export interface InvoiceRevenueData {
  totalActual: number
  chartData: ChartEntry[]
  topInvoices: any[]
}

export function buildInvoiceRevenueData(
  invoices: any[],
  filter: string,
  appliedStart: string,
  appliedEnd: string
): InvoiceRevenueData {
  const distribution = {
    architecture: 0,
    civil: 0,
    interior: 0,
    uncategorized: 0,
  }
  let totalActual = 0

  const validInvoices = invoices.filter((inv) => {
    let items = inv.items || []
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items)
      } catch {
        items = []
      }
    }
    if (!Array.isArray(items) || items.length === 0) return false

    const lastSuccessItem = [...items]
      .reverse()
      .find(
        (item: any) =>
          item.status && item.status === PAYMENT_ITEM_STATUS.SUCCESS
      )
    if (!lastSuccessItem) return false

    const paymentDate = lastSuccessItem.paymentDate || inv.updated
    return isWithinDateFilter(paymentDate, filter, appliedStart, appliedEnd)
  })

  validInvoices.forEach((inv) => {
    const amount = inv.total_amount || inv.amount || 0
    totalActual += amount
    const category = String(inv.type || inv.category || inv.division || '')
      .toLowerCase()
      .trim()
    if (category === 'design') distribution.architecture += amount
    else if (category === 'civil' || category === 'sipil')
      distribution.civil += amount
    else if (category === 'interior') distribution.interior += amount
    else distribution.uncategorized += amount
  })

  const chartData: ChartEntry[] = [
    { name: 'Design', value: distribution.architecture, color: '#2b6cb0' },
    { name: 'Civil', value: distribution.civil, color: '#B45309' },
    { name: 'Interior', value: distribution.interior, color: '#047857' },
    { name: 'Other', value: distribution.uncategorized, color: '#94a3b8' },
  ].filter((item) => item.value > 0)

  const topInvoices = [...validInvoices]
    .sort(
      (a, b) =>
        (b.total_amount || b.amount || 0) - (a.total_amount || a.amount || 0)
    )
    .slice(0, 5)

  return { totalActual, chartData, topInvoices }
}
