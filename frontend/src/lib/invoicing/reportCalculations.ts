// src/lib/invoicing/reportCalculations.ts
import {
  PAYMENT_ITEM_STATUS,
  QUOTATION_STATUS,
  INVOICE_DOC_TYPE,
} from '@/lib/constant'
import type { TermItem } from './termCalculation'
import type {
  Granularity,
  ProjectTypeFilter,
  ReportPeriod,
  BarChartEntry,
  StatCardData,
  InvoiceReportRow,
  QuotationReportRow,
  RevenueReportData,
} from './reportTypes'

export type {
  Granularity,
  ProjectTypeFilter,
  ReportPeriod,
  BarChartEntry,
  StatCardData,
  InvoiceReportRow,
  QuotationReportRow,
  RevenueReportData,
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]

function parseItems(raw: unknown): TermItem[] {
  if (Array.isArray(raw)) return raw as TermItem[]
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as TermItem[]
    } catch {
      return []
    }
  }
  return []
}

function isInPeriod(
  dateStr: string | undefined,
  period: ReportPeriod
): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  if (period.granularity === 'monthly') {
    return d.getFullYear() === period.year && d.getMonth() + 1 === period.month
  }
  if (period.granularity === 'quarterly') {
    return (
      d.getFullYear() === period.year &&
      Math.ceil((d.getMonth() + 1) / 3) === period.quarter
    )
  }
  return d.getFullYear() === period.year
}

function matchesProjectType(
  docType: string,
  filter: ProjectTypeFilter
): boolean {
  if (filter === 'all') return true
  if (filter === 'architecture') return docType === INVOICE_DOC_TYPE.DESIGN
  if (filter === 'civil') return docType === INVOICE_DOC_TYPE.CIVIL
  return docType === INVOICE_DOC_TYPE.INTERIOR
}

function calcChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0
  return Math.round(((curr - prev) / prev) * 100)
}

export function getPreviousPeriod(period: ReportPeriod): ReportPeriod {
  if (period.granularity === 'monthly') {
    const prevMonth = period.month === 1 ? 12 : period.month - 1
    const prevYear = period.month === 1 ? period.year - 1 : period.year
    return {
      ...period,
      month: prevMonth,
      year: prevYear,
      quarter: Math.ceil(prevMonth / 3),
    }
  }
  if (period.granularity === 'quarterly') {
    const prevQ = period.quarter === 1 ? 4 : period.quarter - 1
    const prevYear = period.quarter === 1 ? period.year - 1 : period.year
    return {
      ...period,
      quarter: prevQ,
      year: prevYear,
      month: (prevQ - 1) * 3 + 1,
    }
  }
  return { ...period, year: period.year - 1 }
}

export function getInvoiceRevenue(
  invoices: any[],
  period: ReportPeriod,
  projectType: ProjectTypeFilter
): number {
  let total = 0
  for (const inv of invoices) {
    if (!matchesProjectType(inv.type ?? '', projectType)) continue
    for (const item of parseItems(inv.items)) {
      if (
        item.status === PAYMENT_ITEM_STATUS.SUCCESS &&
        isInPeriod(item.paymentDate, period)
      ) {
        total += Number(item.amount) || 0
      }
    }
  }
  return total
}

export function getQuotationRevenue(
  quotations: any[],
  period: ReportPeriod
): number {
  return quotations
    .filter(
      (q) => q.status === QUOTATION_STATUS.PAID && isInPeriod(q.created, period)
    )
    .reduce((sum, q) => sum + (Number(q.total_price) || 0), 0)
}

export function buildBarChartData(
  invoices: any[],
  quotations: any[],
  period: ReportPeriod,
  projectType: ProjectTypeFilter
): BarChartEntry[] {
  if (period.granularity === 'monthly') {
    return MONTH_LABELS.map((label, idx) => {
      const p: ReportPeriod = {
        granularity: 'monthly',
        year: period.year,
        month: idx + 1,
        quarter: Math.ceil((idx + 1) / 3),
      }
      const invoiceValue = getInvoiceRevenue(invoices, p, projectType)
      const quotationValue = getQuotationRevenue(quotations, p)
      return {
        label,
        invoiceValue,
        quotationValue,
        isCurrentPeriod: period.month === idx + 1,
        isEmpty: invoiceValue === 0 && quotationValue === 0,
      }
    })
  }
  if (period.granularity === 'quarterly') {
    return [1, 2, 3, 4].map((q) => {
      const p: ReportPeriod = {
        granularity: 'quarterly',
        year: period.year,
        month: (q - 1) * 3 + 1,
        quarter: q,
      }
      const invoiceValue = getInvoiceRevenue(invoices, p, projectType)
      const quotationValue = getQuotationRevenue(quotations, p)
      return {
        label: `Q${q}`,
        invoiceValue,
        quotationValue,
        isCurrentPeriod: period.quarter === q,
        isEmpty: invoiceValue === 0 && quotationValue === 0,
      }
    })
  }
  // yearly: last 5 years ending at period.year
  return Array.from({ length: 5 }, (_, i) => {
    const y = period.year - 4 + i
    const p: ReportPeriod = {
      granularity: 'yearly',
      year: y,
      month: 1,
      quarter: 1,
    }
    const invoiceValue = getInvoiceRevenue(invoices, p, projectType)
    const quotationValue = getQuotationRevenue(quotations, p)
    return {
      label: String(y),
      invoiceValue,
      quotationValue,
      isCurrentPeriod: period.year === y,
      isEmpty: invoiceValue === 0 && quotationValue === 0,
    }
  })
}

export function buildInvoiceRows(
  invoices: any[],
  period: ReportPeriod,
  projectType: ProjectTypeFilter
): InvoiceReportRow[] {
  const rows: InvoiceReportRow[] = []
  for (const inv of invoices) {
    if (!matchesProjectType(inv.type ?? '', projectType)) continue
    const terminValue = parseItems(inv.items)
      .filter(
        (item) =>
          item.status === PAYMENT_ITEM_STATUS.SUCCESS &&
          isInPeriod(item.paymentDate, period)
      )
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    if (terminValue === 0) continue
    const client = inv.expand?.client_id
    rows.push({
      id: inv.id,
      invoiceNumber: inv.invoice_number ?? '—',
      clientName: client?.company_name ?? client?.contact_person ?? '—',
      projectType: inv.type ?? '—',
      terminValue,
      status: inv.status ?? '—',
    })
  }
  return rows.sort((a, b) => b.terminValue - a.terminValue)
}

export function buildQuotationRows(
  quotations: any[],
  period: ReportPeriod
): QuotationReportRow[] {
  return quotations
    .filter(
      (q) => q.status === QUOTATION_STATUS.PAID && isInPeriod(q.created, period)
    )
    .map((q) => {
      const client = q.expand?.client_id
      return {
        id: q.id,
        quotationNumber: q.quotation_number ?? '—',
        clientName: client?.company_name ?? client?.contact_person ?? '—',
        totalValue: Number(q.total_price) || 0,
        paidAt: q.created ?? '',
      }
    })
    .sort((a, b) => b.totalValue - a.totalValue)
}

export function buildRevenueReportData(
  invoices: any[],
  quotations: any[],
  period: ReportPeriod,
  projectType: ProjectTypeFilter
): RevenueReportData {
  const invoiceRevenue = getInvoiceRevenue(invoices, period, projectType)
  const quotationRevenue = getQuotationRevenue(quotations, period)
  const prev = getPreviousPeriod(period)
  const prevInvoice = getInvoiceRevenue(invoices, prev, projectType)
  const prevQuotation = getQuotationRevenue(quotations, prev)
  return {
    statCards: {
      totalRevenue: invoiceRevenue + quotationRevenue,
      invoiceRevenue,
      quotationRevenue,
      totalChange: calcChange(
        invoiceRevenue + quotationRevenue,
        prevInvoice + prevQuotation
      ),
      invoiceChange: calcChange(invoiceRevenue, prevInvoice),
      quotationChange: calcChange(quotationRevenue, prevQuotation),
    },
    barChartData: buildBarChartData(invoices, quotations, period, projectType),
    invoiceRows: buildInvoiceRows(invoices, period, projectType),
    quotationRows: buildQuotationRows(quotations, period),
  }
}
