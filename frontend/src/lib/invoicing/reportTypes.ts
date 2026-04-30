// src/lib/invoicing/reportTypes.ts

export type Granularity = 'monthly' | 'quarterly' | 'yearly'
export type ProjectTypeFilter = 'all' | 'architecture' | 'civil' | 'interior'

export interface ReportPeriod {
  granularity: Granularity
  year: number
  month: number    // 1–12; used when granularity = 'monthly'
  quarter: number  // 1–4; used when granularity = 'quarterly'
}

export interface BarChartEntry {
  label: string
  invoiceValue: number
  quotationValue: number
  isCurrentPeriod: boolean
  isEmpty: boolean
}

export interface StatCardData {
  totalRevenue: number
  invoiceRevenue: number
  quotationRevenue: number
  totalChange: number       // % change vs previous period
  invoiceChange: number
  quotationChange: number
}

export interface InvoiceReportRow {
  id: string
  invoiceNumber: string
  clientName: string
  projectType: string       // 'design' | 'sipil' | 'interior'
  terminValue: number       // sum of Success termins in period
  status: string
}

export interface QuotationReportRow {
  id: string
  quotationNumber: string
  clientName: string
  totalValue: number
  paidAt: string
}

export interface RevenueReportData {
  statCards: StatCardData
  barChartData: BarChartEntry[]
  invoiceRows: InvoiceReportRow[]
  quotationRows: QuotationReportRow[]
}
