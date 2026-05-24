import { Banknote, Activity, AlertTriangle } from 'lucide-react'
import { ProjectStatCard } from '@/components/shared/ProjectStatCard'
import { formatRupiah } from '@/lib/helpers'

interface ProjectStats {
  activeCount: number
  overdueCount: number
  nearDeadlineCount: number
}

interface ProjectStatsSectionProps {
  isSuperAdmin: boolean | null
  stats: ProjectStats
  realizationRevenue: number
  potentialRevenue: number
  deadlineWarningDays: number
}

export function ProjectStatsSection({
  isSuperAdmin,
  stats,
  realizationRevenue,
  potentialRevenue,
  deadlineWarningDays,
}: ProjectStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2 md:gap-3 mb-4 shrink-0">
      {isSuperAdmin && (
        <ProjectStatCard
          icon={<Banknote />}
          label="Project Revenue"
          color="emerald"
          value={
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between md:justify-start gap-2">
                <span className="text-xs text-emerald-600 font-medium w-16 shrink-0">
                  Realized
                </span>
                <span className="text-sm md:text-base font-bold text-slate-800">
                  {formatRupiah(realizationRevenue)}
                </span>
              </div>
              <div className="flex items-baseline justify-between md:justify-start gap-2">
                <span className="text-xs text-slate-400 font-medium w-16 shrink-0">
                  Potential
                </span>
                <span className="text-sm md:text-base font-bold text-slate-500">
                  {formatRupiah(potentialRevenue)}
                </span>
              </div>
            </div>
          }
          description="From linked invoices on active projects."
        />
      )}
      <ProjectStatCard
        icon={<Activity />}
        label="Active Projects"
        color="blue"
        value={
          <p className="text-base md:text-2xl font-bold text-slate-800 leading-tight">
            {stats.activeCount}{' '}
            <span className="text-sm md:text-base font-normal text-slate-400">
              projects
            </span>
          </p>
        }
        description="Projects with active status currently in progress."
      />
      <ProjectStatCard
        icon={<AlertTriangle />}
        label="At-Risk Projects"
        color="amber"
        className="sm:col-span-2 md:col-span-1"
        value={
          <div className="flex items-baseline gap-3 md:gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-base md:text-2xl font-bold text-red-500 leading-tight">
                {stats.overdueCount}
              </span>
              <span className="text-xs md:text-sm text-slate-400">overdue</span>
            </div>
            <span className="text-slate-200 font-light select-none">/</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base md:text-2xl font-bold text-amber-500 leading-tight">
                {stats.nearDeadlineCount}
              </span>
              <span className="text-xs md:text-sm text-slate-400">near deadline</span>
            </div>
          </div>
        }
        description={`Overdue or within ${deadlineWarningDays} days of deadline. Needs immediate follow-up.`}
      />
    </div>
  )
}
