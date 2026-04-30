// src/pages/reports/ReportsPage.tsx
import { useRef } from 'react'
import { BarChart2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { useReportFilters } from '@/hooks/useReportFilters'
import { useRevenueReport } from '@/hooks/useRevenueReport'
import { RevenueStatCards } from './components/RevenueStatCards'
import { RevenueBarChart } from './components/RevenueBarChart'
import { RevenueDetailTable } from './components/RevenueDetailTable'
import { ReportExportButton } from './components/ReportExportButton'
import type { ReportPeriod } from '@/lib/invoicing/reportCalculations'

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
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

export default function ReportsPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const {
    granularity,
    setGranularity,
    year,
    setYear,
    month,
    setMonth,
    quarter,
    setQuarter,
    projectType,
    setProjectType,
  } = useReportFilters()

  const period: ReportPeriod = { granularity, year, month, quarter }
  const { reportData, isLoading } = useRevenueReport(period, projectType)

  function periodLabel() {
    if (granularity === 'monthly') return `${MONTH_LABELS[month - 1]} ${year}`
    if (granularity === 'quarterly') return `Q${quarter} ${year}`
    return String(year)
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col gap-6 overflow-y-auto bg-background/50">
      <PageHeader
        icon={<BarChart2 className="w-6 h-6" />}
        title="Laporan Keuangan"
        description="Rekap revenue dari invoice aktif dan quotation paid berdasarkan periode."
        action={<ReportExportButton contentRef={contentRef} />}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-lg border border-border shadow-sm px-4 py-3">
        <Select value={granularity} onValueChange={setGranularity}>
          <SelectTrigger className="h-9 w-[140px] bg-white shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Bulanan</SelectItem>
            <SelectItem value="quarterly">Kuartalan</SelectItem>
            <SelectItem value="yearly">Tahunan</SelectItem>
          </SelectContent>
        </Select>

        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="h-9 w-[100px] bg-white shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {granularity === 'monthly' && (
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className="h-9 w-[110px] bg-white shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_LABELS.map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {granularity === 'quarterly' && (
          <Select
            value={String(quarter)}
            onValueChange={(v) => setQuarter(Number(v))}
          >
            <SelectTrigger className="h-9 w-[100px] bg-white shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((q) => (
                <SelectItem key={q} value={String(q)}>
                  Q{q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={projectType} onValueChange={setProjectType}>
          <SelectTrigger className="h-9 w-[150px] bg-white shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="architecture">Arsitektur</SelectItem>
            <SelectItem value="civil">Sipil</SelectItem>
            <SelectItem value="interior">Interior</SelectItem>
          </SelectContent>
        </Select>

        {projectType !== 'all' && (
          <span className="text-xs text-muted-foreground">
            Filter tipe hanya berlaku untuk data invoice
          </span>
        )}

        <span className="text-sm text-muted-foreground ml-auto hidden sm:block">
          Periode: <strong>{periodLabel()}</strong>
        </span>
      </div>

      {/* Content (captured for PDF export) */}
      {isLoading ? (
        <ChartSkeleton />
      ) : reportData ? (
        <div className="flex flex-col gap-6" ref={contentRef}>
          <RevenueStatCards data={reportData.statCards} />
          <RevenueBarChart data={reportData.barChartData} />
          <RevenueDetailTable
            invoiceRows={reportData.invoiceRows}
            quotationRows={reportData.quotationRows}
          />
        </div>
      ) : null}
    </div>
  )
}
