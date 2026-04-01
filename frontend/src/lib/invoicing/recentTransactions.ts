import { formatRupiah, getInitials } from '@/lib/helpers'
import { PAYMENT_ITEM_STATUS, QUOTATION_STATUS } from '@/lib/constant'

export interface RecentTransaction {
  id: string
  type: 'invoice' | 'quotation'
  clientName: string
  amount: number
  formattedAmount: string
  date: string
  initials: string
}

function getInvoicePaymentDate(inv: any): string | null {
  let items = inv.items ?? []
  if (typeof items === 'string') {
    try { items = JSON.parse(items) } catch { items = [] }
  }
  if (!Array.isArray(items)) return null
  const lastSuccessItem = [...items]
    .reverse()
    .find((item: any) => item.status === PAYMENT_ITEM_STATUS.SUCCESS)
  return lastSuccessItem?.paymentDate ?? inv.updated ?? null
}

export function buildRecentTransactions(
  invoices: any[],
  quotations: any[]
): RecentTransaction[] {
  const txs: RecentTransaction[] = []

  for (const inv of invoices) {
    let items = inv.items ?? []
    if (typeof items === 'string') {
      try { items = JSON.parse(items) } catch { items = [] }
    }
    if (!Array.isArray(items)) continue
    const hasSuccess = items.some(
      (item: any) => item.status === PAYMENT_ITEM_STATUS.SUCCESS
    )
    if (!hasSuccess) continue

    const clientName = inv.expand?.client_id?.company_name ?? 'Unknown'
    const amount = inv.total_amount ?? inv.amount ?? 0

    txs.push({
      id: inv.id,
      type: 'invoice',
      clientName,
      amount,
      formattedAmount: formatRupiah(amount),
      date: getInvoicePaymentDate(inv) ?? inv.updated,
      initials: getInitials(clientName),
    })
  }

  for (const q of quotations) {
    if (q.status !== QUOTATION_STATUS.PAID) continue
    const clientName = q.expand?.client_id?.company_name ?? 'Unknown'
    const amount = q.total_price ?? 0

    txs.push({
      id: q.id,
      type: 'quotation',
      clientName,
      amount,
      formattedAmount: formatRupiah(amount),
      date: q.updated ?? q.created,
      initials: getInitials(clientName),
    })
  }

  return txs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
}
