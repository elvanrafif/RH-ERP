import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { useDeadlineProjects } from '@/hooks/useDeadlineProjects'
import type { DeadlineProject } from '@/lib/projects/deadline'

const MAX_VISIBLE = 6

const TYPE_LABEL: Record<string, string> = {
  architecture: 'Architecture',
  civil: 'Civil',
  interior: 'Interior',
}

function DeadlineRow({ project }: { project: DeadlineProject }) {
  const isOverdue = project.deadlineStatus === 'overdue'
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className={`p-1.5 rounded-lg shrink-0 ${isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}
      >
        {isOverdue ? (
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
        ) : (
          <Clock className="h-3.5 w-3.5 text-amber-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 leading-none truncate">
          {project.clientName}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {TYPE_LABEL[project.type] ?? project.type} · {project.picName}
        </p>
      </div>
      {isOverdue ? (
        <Badge
          variant="destructive"
          className="text-[10px] shrink-0 text-white font-medium"
        >
          {Math.abs(project.daysRemaining)}d overdue
        </Badge>
      ) : (
        <span className="text-[11px] font-medium text-amber-600 shrink-0">
          {project.daysRemaining}d left
        </span>
      )}
    </div>
  )
}

export function DeadlineWidget() {
  const { deadlineProjects, overdueCount, warningCount } = useDeadlineProjects()

  const visible = deadlineProjects.slice(0, MAX_VISIBLE)
  const hiddenCount = deadlineProjects.length - MAX_VISIBLE

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="px-4 md:px-5 pt-4 pb-3 border-b border-slate-100 flex items-start gap-2 justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Deadline Alert</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Projects needing attention
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end shrink-0">
          {overdueCount > 0 && (
            <Badge
              variant="destructive"
              className="text-[11px] text-white font-medium"
            >
              {overdueCount} overdue
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge
              variant="outline"
              className="text-[11px] text-amber-600 border-amber-200 bg-amber-50"
            >
              {warningCount} warning
            </Badge>
          )}
        </div>
      </div>

      <div className="px-4 md:px-5">
        {deadlineProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <CheckCircle className="h-7 w-7 text-emerald-400" />
            <p className="text-sm text-slate-400">All projects on track</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((p) => (
              <DeadlineRow key={p.id} project={p} />
            ))}
            {hiddenCount > 0 && (
              <p className="py-2.5 text-xs text-slate-400 text-center">
                +{hiddenCount} more project{hiddenCount > 1 ? 's' : ''} need
                attention
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
