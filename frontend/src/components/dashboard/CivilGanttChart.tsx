// frontend/src/components/dashboard/CivilGanttChart.tsx
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Project } from '@/types'
import type { VendorGroup } from '@/hooks/useCivilTeamProjects'
import { CivilGanttBar } from './CivilGanttBar'

interface MonthBlock {
  label: string
  leftPct: number
  widthPct: number
}

interface WindowData {
  windowStart: Date
  windowEnd: Date
  totalMs: number
  months: MonthBlock[]
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

function getWindow(offset: number, monthCount: number): WindowData {
  const now = new Date()
  const windowStart = new Date(
    now.getFullYear(),
    now.getMonth() - Math.floor(monthCount / 2) + offset,
    1
  )
  const windowEnd = new Date(
    now.getFullYear(),
    now.getMonth() - Math.floor(monthCount / 2) + monthCount + offset,
    0,
    23,
    59,
    59,
    999
  )
  const totalMs = windowEnd.getTime() - windowStart.getTime()

  const months: MonthBlock[] = []
  const cursor = new Date(windowStart.getFullYear(), windowStart.getMonth(), 1)
  while (cursor <= windowEnd) {
    const mStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const mEnd = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )
    const clampedStart = Math.max(mStart.getTime(), windowStart.getTime())
    const clampedEnd = Math.min(mEnd.getTime(), windowEnd.getTime())
    months.push({
      label: cursor.toLocaleString('en-GB', { month: 'long', year: 'numeric' }),
      leftPct: ((clampedStart - windowStart.getTime()) / totalMs) * 100,
      widthPct: ((clampedEnd - clampedStart) / totalMs) * 100,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return { windowStart, windowEnd, totalMs, months }
}

interface CivilGanttChartProps {
  vendorGroups: VendorGroup[]
  onProjectClick: (project: Project) => void
}

export function CivilGanttChart({
  vendorGroups,
  onProjectClick,
}: CivilGanttChartProps) {
  const [offset, setOffset] = useState(0)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const isMobile = useIsMobile()
  const monthCount = isMobile ? 1 : 3

  const { windowStart, windowEnd, totalMs, months } = getWindow(
    offset,
    monthCount
  )
  const todayPct =
    totalMs > 0 ? ((Date.now() - windowStart.getTime()) / totalMs) * 100 : -1
  const showToday = todayPct >= 0 && todayPct <= 100

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <Card className="overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOffset((o) => o - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-slate-700">
          {months.map((m) => m.label).join(' · ')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOffset((o) => o + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Chart: sidebar column + gantt column side by side */}
      <div className="overflow-x-auto">
        <div className="flex">
          {/* ── Sidebar column ── */}
          <div className="w-40 min-w-40 shrink-0 border-r border-slate-200">
            <div className="h-12 px-3 flex items-end pb-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Vendor / Client
            </div>
            {vendorGroups.map((group) => {
              const nameColor = group.hasOverdue
                ? 'text-red-600'
                : group.hasNearDeadline
                  ? 'text-amber-600'
                  : 'text-slate-700'
              const isCollapsed = !!collapsed[group.vendor.id]
              return (
                <div key={group.vendor.id}>
                  <div
                    className="h-9 px-3 flex items-center gap-1.5 bg-slate-50/80 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => toggleCollapse(group.vendor.id)}
                  >
                    <ChevronDown
                      className={`h-3 w-3 shrink-0 text-slate-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                    />
                    <span
                      className={`text-xs font-semibold truncate ${nameColor}`}
                    >
                      {group.vendor.name}
                    </span>
                  </div>
                  {!isCollapsed &&
                    group.projects.map((project, idx) => (
                      <div
                        key={project.id}
                        className="h-9 px-3 flex items-center gap-2 border-b border-slate-200 text-xs text-slate-500 hover:bg-slate-50/50"
                      >
                        <span className="shrink-0 text-slate-400 font-medium w-4 text-right">
                          {idx + 1}.
                        </span>
                        <span className="truncate">
                          {project.expand?.client?.company_name ?? '—'}
                        </span>
                      </div>
                    ))}
                </div>
              )
            })}
          </div>

          {/* ── Gantt column (today line lives here) ── */}
          <div
            className="flex-1 relative min-w-0"
            style={{ overflowY: 'clip' }}
          >
            {/* Month header */}
            <div className="h-12 relative border-b border-slate-200 bg-slate-50">
              {/* Month name labels — pinned to bottom */}
              {months.map((m) => (
                <div
                  key={m.label}
                  className="absolute bottom-0 h-6 flex items-center justify-center text-xs font-medium text-slate-500 border-r border-slate-300 last:border-r-0"
                  style={{ left: `${m.leftPct}%`, width: `${m.widthPct}%` }}
                >
                  {m.label.split(' ')[0]}
                </div>
              ))}
              {/* Today badge — debug: pure inline style, no Tailwind */}
              {showToday && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${todayPct}%`,
                    transform: 'translateX(-50%)',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 11,
                  }}
                >
                  Today
                </div>
              )}
            </div>

            {/* Vendor + project bar rows */}
            {vendorGroups.map((group) => {
              const isCollapsed = !!collapsed[group.vendor.id]
              return (
                <div key={group.vendor.id}>
                  <div className="h-9 px-3 flex items-center bg-slate-50/80 border-b border-slate-200">
                    <span className="text-xs text-slate-400">
                      {group.projects.length} project
                      {group.projects.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {!isCollapsed &&
                    group.projects.map((project) => (
                      <div
                        key={project.id}
                        className="h-9 relative border-b border-slate-200 hover:bg-slate-50/50"
                      >
                        <CivilGanttBar
                          project={project}
                          windowStart={windowStart}
                          windowEnd={windowEnd}
                          totalMs={totalMs}
                          onClick={onProjectClick}
                        />
                      </div>
                    ))}
                </div>
              )
            })}

            {/* Today line — spans full chart height, clipped by overflowY:clip on parent */}
            {showToday && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${todayPct}%`,
                  width: 2,
                  height: 9999,
                  backgroundColor: '#3b82f6',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
