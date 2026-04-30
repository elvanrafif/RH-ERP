// src/hooks/useRevenueReport.ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { buildRevenueReportData } from '@/lib/invoicing/reportCalculations'
import type { ReportPeriod, ProjectTypeFilter } from '@/lib/invoicing/reportCalculations'

export function useRevenueReport(period: ReportPeriod, projectType: ProjectTypeFilter) {
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['report-invoices'],
    queryFn: () => pb.collection('invoices').getFullList({ sort: '-created', expand: 'client_id' }),
    staleTime: 1000 * 60 * 5,
  })

  const { data: quotations = [], isLoading: loadingQuotations } = useQuery({
    queryKey: ['report-quotations'],
    queryFn: () => pb.collection('quotations').getFullList({ sort: '-created', expand: 'client_id' }),
    staleTime: 1000 * 60 * 5,
  })

  const isLoading = loadingInvoices || loadingQuotations
  const reportData = isLoading ? null : buildRevenueReportData(invoices, quotations, period, projectType)

  return { reportData, isLoading }
}
