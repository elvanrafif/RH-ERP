import { isWithinDateFilter } from './dateFilter'

export interface QuotationRevenueData {
  totalRealized: number
  topQuotations: any[]
}

export function buildQuotationRevenueData(
  quotations: any[],
  filter: string,
  appliedStart: string,
  appliedEnd: string
): QuotationRevenueData {
  const validQuotations = quotations.filter((q) => {
    if (q.status !== 'paid') return false
    return isWithinDateFilter(q.created, filter, appliedStart, appliedEnd)
  })

  let totalRealized = 0
  validQuotations.forEach((q) => {
    totalRealized += q.total_price || 0
  })

  const topQuotations = [...validQuotations]
    .sort((a, b) => (b.total_price || 0) - (a.total_price || 0))
    .slice(0, 5)

  return { totalRealized, topQuotations }
}
