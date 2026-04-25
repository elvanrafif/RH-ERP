// frontend/src/components/dashboard/CivilVendorSection.tsx
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Project } from '@/types'
import type { VendorGroup } from '@/hooks/useCivilTeamProjects'
import { CivilGanttBar } from './CivilGanttBar'

interface CivilVendorSectionProps {
  group: VendorGroup
  windowStart: Date
  windowEnd: Date
  totalMs: number
  isCollapsed: boolean
  onToggle: () => void
  onProjectClick: (project: Project) => void
}

export function CivilVendorSection({
  group,
  windowStart,
  windowEnd,
  totalMs,
  isCollapsed,
  onToggle,
  onProjectClick,
}: CivilVendorSectionProps) {
  const nameColor = group.hasOverdue
    ? 'text-red-600'
    : group.hasNearDeadline
      ? 'text-amber-600'
      : 'text-slate-700'

  return (
    <>
      <div
        className="flex items-center border-b border-slate-200 bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition-colors select-none"
        onClick={onToggle}
      >
        <div className="w-40 min-w-40 flex items-center gap-1.5 px-3 py-2 border-r border-slate-200">
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
          ) : (
            <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
          )}
          <span className={`text-xs font-semibold truncate ${nameColor}`}>
            {group.vendor.name}
          </span>
        </div>
        <div className="flex-1 py-2 px-3">
          <span className="text-[10px] text-slate-400">
            {group.projects.length} project
            {group.projects.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {!isCollapsed &&
        group.projects.map((project) => (
          <div
            key={project.id}
            className="flex border-b border-slate-200 h-9 items-center hover:bg-slate-50/50"
          >
            <div className="w-40 min-w-40 px-3 text-[11px] text-slate-500 border-r border-slate-200 truncate">
              {project.expand?.client?.company_name ?? '—'}
            </div>
            <div className="flex-1 relative h-9">
              <CivilGanttBar
                project={project}
                windowStart={windowStart}
                windowEnd={windowEnd}
                totalMs={totalMs}
                onClick={onProjectClick}
              />
            </div>
          </div>
        ))}
    </>
  )
}
