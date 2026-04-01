import { useProjectStats } from '@/hooks/useProjectStats'
import { PROJECT_TYPE } from '@/lib/constant'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  design: { label: 'Design', color: '#3b82f6' },
  progress: { label: 'Progress', color: '#f59e0b' },
  on_contract: { label: 'On Contract', color: '#8b5cf6' },
  detail_drawing: { label: 'Detail Drawing', color: '#06b6d4' },
  done: { label: 'Done', color: '#10b981' },
  finish: { label: 'Finished', color: '#059669' },
  cancelled: { label: 'Cancelled', color: '#94a3b8' },
}

const FALLBACK_COLORS = ['#f43f5e', '#84cc16', '#14b8a6', '#f97316', '#a855f7']

const TYPE_GROUPS = [
  { key: PROJECT_TYPE.ARCHITECTURE, label: 'Architecture', color: '#334155', bg: 'bg-slate-100', text: 'text-slate-700' },
  { key: PROJECT_TYPE.CIVIL,        label: 'Civil',        color: '#d97706', bg: 'bg-amber-100', text: 'text-amber-700' },
  { key: PROJECT_TYPE.INTERIOR,     label: 'Interior',     color: '#059669', bg: 'bg-emerald-100', text: 'text-emerald-700' },
]

function toTitleCase(str: string) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function StatusBadges({ statusMap }: { statusMap: Record<string, number> }) {
  const items = Object.entries(statusMap)
    .filter(([, n]) => n > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([status, count], i) => ({
      label: STATUS_CONFIG[status]?.label ?? toTitleCase(status),
      color: STATUS_CONFIG[status]?.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      count,
    }))

  if (items.length === 0) {
    return <p className="text-xs text-slate-400 mt-2">No active projects</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold leading-none"
          style={{ backgroundColor: `${item.color}18`, color: item.color }}
        >
          {item.label}
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: `${item.color}30` }}
          >
            {item.count}
          </span>
        </span>
      ))}
    </div>
  )
}

export function ProjectStatusChart() {
  const { data: stats, isLoading } = useProjectStats()

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="px-4 md:px-5 pt-4 pb-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-900">Project Status</p>
        <p className="text-xs text-slate-400 mt-0.5">
          By division — {stats?.totalCount ?? 0} total projects
        </p>
      </div>

      <div className="px-4 md:px-5 py-2">
        {isLoading ? (
          <div className="space-y-4 py-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-5 w-28 rounded-full bg-slate-100" />
                <div className="flex gap-1.5">
                  <div className="h-6 w-16 rounded-full bg-slate-100" />
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {TYPE_GROUPS.map((group) => {
              const statusMap = stats?.statusByType[group.key] ?? {}
              const total = Object.values(statusMap).reduce((a, b) => a + b, 0)
              return (
                <div key={group.key} className="py-3 first:pt-3 last:pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-xs font-semibold text-slate-800">{group.label}</span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${group.bg} ${group.text}`}
                    >
                      {total}
                    </span>
                  </div>
                  <StatusBadges statusMap={statusMap} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
