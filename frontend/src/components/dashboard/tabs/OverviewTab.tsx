import { DollarSign, HardHat, Users, FileText, TrendingUp } from 'lucide-react'
import { Overview } from '@/components/dashboard/Overview'
import { RecentSales } from '@/components/dashboard/RecentSales'
import { DeadlineWidget } from '@/components/dashboard/tabs/DeadlineWidget'
import { ProjectStatusChart } from '@/components/dashboard/tabs/ProjectStatusChart'
import { formatRupiah } from '@/lib/helpers'

interface KpiCardProps {
  label: string
  value: string | number
  sub: string
  icon: React.ReactNode
  accent: string
}

function KpiCard({ label, value, sub, icon, accent }: KpiCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-3 md:p-4 flex items-start gap-3 border-l-4 ${accent}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider leading-tight">
          {label}
        </p>
        <p className="text-lg md:text-2xl font-bold text-slate-900 mt-1 truncate">
          {value}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
          {sub}
        </p>
      </div>
      <div className="text-slate-300 mt-0.5 shrink-0 hidden sm:block">
        {icon}
      </div>
    </div>
  )
}

interface OverviewTabProps {
  data: any
  isLoading: boolean
}

export function OverviewTab({ data, isLoading }: OverviewTabProps) {
  const loading = '—'

  return (
    <div className="space-y-5">
      {/* KPI ROW */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Actual Revenue"
          value={isLoading ? loading : formatRupiah(data?.totalOmzet || 0)}
          sub="Settled invoices (Term 4 + Paid)"
          icon={<DollarSign className="h-5 w-5" />}
          accent="border-l-blue-500"
        />
        <KpiCard
          label="Active Projects"
          value={isLoading ? loading : (data?.totalProjects ?? 0)}
          sub="Design, Civil & Interior ongoing"
          icon={<HardHat className="h-5 w-5" />}
          accent="border-l-amber-500"
        />
        <KpiCard
          label="Total Clients"
          value={isLoading ? loading : (data?.totalClients ?? 0)}
          sub="Registered partner entities"
          icon={<Users className="h-5 w-5" />}
          accent="border-l-emerald-500"
        />
        <KpiCard
          label="Quotations Sent"
          value={isLoading ? loading : (data?.totalQuotations ?? 0)}
          sub="Ready for conversion"
          icon={<FileText className="h-5 w-5" />}
          accent="border-l-purple-500"
        />
      </div>

      {/* REVENUE CHART + RECENT TRANSACTIONS */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 md:px-5 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Revenue Analytics
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly income from settled invoices this year
              </p>
            </div>
            <TrendingUp className="h-4 w-4 text-slate-300 shrink-0" />
          </div>
          <div className="p-3 md:p-4">
            <div className="h-[220px] md:h-[280px]">
              <Overview />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-4 md:px-5 pt-4 pb-2 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">
              Recent Transactions
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest paid invoices & quotations
            </p>
          </div>
          <div className="p-4 md:p-5 flex-1">
            <RecentSales />
          </div>
        </div>
      </div>

      {/* DEADLINE + STATUS ROW */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DeadlineWidget />
        </div>
        <div className="lg:col-span-2">
          <ProjectStatusChart />
        </div>
      </div>
    </div>
  )
}
