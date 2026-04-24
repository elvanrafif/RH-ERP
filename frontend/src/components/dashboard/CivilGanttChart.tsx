// frontend/src/components/dashboard/CivilGanttChart.tsx
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Project } from '@/types'
import type { VendorGroup } from '@/hooks/useCivilTeamProjects'
import { CivilVendorSection } from './CivilVendorSection'

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

function getWindow(offset: number): WindowData {
  const now = new Date()
  const windowStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1 + offset,
    1
  )
  const windowEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 2 + offset,
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

  const { windowStart, windowEnd, totalMs, months } = getWindow(offset)
  const todayPct =
    totalMs > 0
      ? ((new Date().getTime() - windowStart.getTime()) / totalMs) * 100
      : -1

  const toggleCollapse = (vendorId: string) =>
    setCollapsed((prev) => ({ ...prev, [vendorId]: !prev[vendorId] }))

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

      {/* Scrollable gantt area */}
      <div className="overflow-x-auto">
        {/* Column header */}
        <div className="flex border-b border-slate-200 bg-slate-50 min-w-0">
          <div className="w-40 min-w-40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 border-r border-slate-200">
            Vendor / Client
          </div>
          <div className="flex-1 relative h-8">
            {months.map((m) => (
              <div
                key={m.label}
                className="absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-medium text-slate-500 border-r border-slate-300 last:border-r-0"
                style={{ left: `${m.leftPct}%`, width: `${m.widthPct}%` }}
              >
                {m.label.split(' ')[0]}
              </div>
            ))}
            {todayPct >= 0 && todayPct <= 100 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
                style={{ left: `${todayPct}%` }}
              >
                <div className="absolute -top-0.5 -left-[3px] w-2 h-2 rounded-full bg-red-400" />
              </div>
            )}
          </div>
        </div>

        {/* Vendor rows */}
        {vendorGroups.map((group) => (
          <CivilVendorSection
            key={group.vendor.id}
            group={group}
            windowStart={windowStart}
            windowEnd={windowEnd}
            totalMs={totalMs}
            todayPct={todayPct}
            isCollapsed={!!collapsed[group.vendor.id]}
            onToggle={() => toggleCollapse(group.vendor.id)}
            onProjectClick={onProjectClick}
          />
        ))}
      </div>
    </Card>
  )
}
