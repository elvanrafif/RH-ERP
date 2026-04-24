import type { Project } from '@/types'
import { getProjectDeadlineDate, getDaysRemaining } from '@/lib/projects/deadline'
import { DEADLINE_WARNING_DAYS } from '@/lib/constant'

interface CivilGanttBarProps {
  project: Project
  windowStart: Date
  windowEnd: Date
  totalMs: number
  onClick: (project: Project) => void
}

interface BarStyle {
  left: string
  width: string
  overflowLeft: boolean
  overflowRight: boolean
}

function getBarStyle(
  project: Project,
  windowStart: Date,
  windowEnd: Date,
  totalMs: number
): BarStyle | null {
  const endDate = getProjectDeadlineDate(project)
  if (!endDate) return null

  const rawStart = project.start_date ? new Date(project.start_date) : endDate
  const clampedLeft = Math.max(rawStart.getTime(), windowStart.getTime())
  const clampedRight = Math.min(endDate.getTime(), windowEnd.getTime())
  if (clampedLeft > clampedRight) return null

  const leftPct = ((clampedLeft - windowStart.getTime()) / totalMs) * 100
  const widthPct = Math.max(
    ((clampedRight - clampedLeft) / totalMs) * 100,
    2
  )

  return {
    left: `${leftPct}%`,
    width: `${widthPct}%`,
    overflowLeft: rawStart.getTime() < windowStart.getTime(),
    overflowRight: endDate.getTime() > windowEnd.getTime(),
  }
}

function getBarClass(project: Project): string {
  const date = getProjectDeadlineDate(project)
  if (!date) return 'bg-slate-100 text-slate-600 border-slate-200'
  const days = getDaysRemaining(date)
  if (days < 0) return 'bg-red-50 text-red-700 border-red-200'
  if (days <= DEADLINE_WARNING_DAYS.civil)
    return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

function buildLabel(
  project: Project,
  overflowLeft: boolean,
  overflowRight: boolean
): string {
  const client = project.expand?.client?.company_name ?? '—'
  const date = getProjectDeadlineDate(project)
  const days = date ? getDaysRemaining(date) : null
  const suffix =
    days === null
      ? ''
      : days < 0
        ? ` · ${Math.abs(days)}d overdue`
        : ` · ${days}d left`
  return `${overflowLeft ? '‹ ' : ''}${client}${suffix}${overflowRight ? ' ›' : ''}`
}

export function CivilGanttBar({
  project,
  windowStart,
  windowEnd,
  totalMs,
  onClick,
}: CivilGanttBarProps) {
  const style = getBarStyle(project, windowStart, windowEnd, totalMs)
  if (!style) return null

  const barClass = getBarClass(project)
  const label = buildLabel(project, style.overflowLeft, style.overflowRight)

  return (
    <div
      className={`absolute h-5 top-[7px] rounded border flex items-center px-2 text-[10px] font-medium whitespace-nowrap overflow-hidden cursor-pointer hover:brightness-95 transition-[filter] ${barClass}`}
      style={{ left: style.left, width: style.width }}
      title={label}
      onClick={() => onClick(project)}
    >
      {label}
    </div>
  )
}
