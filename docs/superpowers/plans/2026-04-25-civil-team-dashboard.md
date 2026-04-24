# Civil Team Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menampilkan Civil Team Gantt Dashboard untuk semua user dengan `division === 'sipil'`, menggantikan My Projects dashboard.

**Architecture:** Hook `useCivilTeamProjects` fetch semua civil project aktif dan group by vendor. `CivilGanttChart` render Gantt 3-bulan dengan vendor sections yang collapsible. Routing di `Dashboard.tsx` cek division sebelum render component.

**Tech Stack:** React 19, TypeScript, TanStack Query, PocketBase, Tailwind CSS 4, shadcn/ui, Lucide icons

---

## File Map

| Action | Path | Tanggung Jawab |
|---|---|---|
| Create | `frontend/src/hooks/useCivilTeamProjects.ts` | Fetch + group by vendor, return `CivilTeamData` |
| Create | `frontend/src/components/dashboard/CivilGanttBar.tsx` | Render satu project bar dengan posisi & warna urgency |
| Create | `frontend/src/components/dashboard/CivilVendorSection.tsx` | Vendor header (collapsible) + baris project |
| Create | `frontend/src/components/dashboard/CivilGanttChart.tsx` | Month nav, today line, render semua vendor sections |
| Create | `frontend/src/components/dashboard/CivilTeamDashboard.tsx` | Stat cards + CivilGanttChart + ProjectDetailsModal |
| Modify | `frontend/src/pages/Dashboard.tsx` | Tambah kondisi `division === DIVISION.CIVIL` |

---

## Task 1: Hook `useCivilTeamProjects`

**Files:**
- Create: `frontend/src/hooks/useCivilTeamProjects.ts`

- [ ] **Step 1: Buat file hook**

```typescript
// frontend/src/hooks/useCivilTeamProjects.ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project, Vendor } from '@/types'
import { DONE_STATUSES, DEADLINE_WARNING_DAYS } from '@/lib/constant'
import { getProjectDeadlineDate, getDaysRemaining } from '@/lib/projects/deadline'

export interface VendorGroup {
  vendor: Vendor
  projects: Project[]
  hasOverdue: boolean
  hasNearDeadline: boolean
}

export interface CivilTeamData {
  vendorGroups: VendorGroup[]
  totalProjects: number
  nearDeadlineCount: number
}

export function useCivilTeamProjects() {
  return useQuery<CivilTeamData>({
    queryKey: ['civil-team-projects'],
    queryFn: async () => {
      const excludeFilter = DONE_STATUSES.map((s) => `status != '${s}'`).join(' && ')
      const filter = `type = 'civil' && ${excludeFilter}`

      const projects = await pb.collection('projects').getFullList<Project>({
        filter,
        expand: 'client,vendor',
        sort: 'end_date',
      })

      const threshold = DEADLINE_WARNING_DAYS.civil
      const vendorMap = new Map<string, { vendor: Vendor; projects: Project[] }>()

      for (const project of projects) {
        const vendor = project.expand?.vendor
        if (!vendor) continue
        if (!vendorMap.has(vendor.id)) {
          vendorMap.set(vendor.id, { vendor, projects: [] })
        }
        vendorMap.get(vendor.id)!.projects.push(project)
      }

      let nearDeadlineCount = 0
      const vendorGroups: VendorGroup[] = Array.from(vendorMap.values()).map(
        ({ vendor, projects }) => {
          let hasOverdue = false
          let hasNearDeadline = false
          for (const p of projects) {
            const date = getProjectDeadlineDate(p)
            if (!date) continue
            const days = getDaysRemaining(date)
            if (days < 0) {
              hasOverdue = true
              nearDeadlineCount++
            } else if (days <= threshold) {
              hasNearDeadline = true
              nearDeadlineCount++
            }
          }
          return { vendor, projects, hasOverdue, hasNearDeadline }
        }
      )

      vendorGroups.sort((a, b) => {
        if (a.hasOverdue !== b.hasOverdue) return a.hasOverdue ? -1 : 1
        if (a.hasNearDeadline !== b.hasNearDeadline) return a.hasNearDeadline ? -1 : 1
        return 0
      })

      return { vendorGroups, totalProjects: projects.length, nearDeadlineCount }
    },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useCivilTeamProjects.ts
git commit -m "feat: add useCivilTeamProjects hook"
```

---

## Task 2: Update Dashboard routing

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Tambah kondisi division di Dashboard.tsx**

Ganti seluruh isi file:

```typescript
// frontend/src/pages/Dashboard.tsx
import { useAuth } from '@/contexts/AuthContext'
import { DIVISION } from '@/lib/constant'
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard'
import { MyProjectsDashboard } from '@/components/dashboard/MyProjectsDashboard'
import { CivilTeamDashboard } from '@/components/dashboard/CivilTeamDashboard'

export default function Dashboard() {
  const { isSuperAdmin, user } = useAuth()
  if (isSuperAdmin) return <ExecutiveDashboard />
  if (user?.division === DIVISION.CIVIL) return <CivilTeamDashboard />
  return <MyProjectsDashboard />
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: route civil division users to CivilTeamDashboard"
```

---

## Task 3: Komponen `CivilGanttBar`

**Files:**
- Create: `frontend/src/components/dashboard/CivilGanttBar.tsx`

- [ ] **Step 1: Buat file komponen**

```typescript
// frontend/src/components/dashboard/CivilGanttBar.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/dashboard/CivilGanttBar.tsx
git commit -m "feat: add CivilGanttBar with urgency color coding"
```

---

## Task 4: Komponen `CivilVendorSection`

**Files:**
- Create: `frontend/src/components/dashboard/CivilVendorSection.tsx`

- [ ] **Step 1: Buat file komponen**

```typescript
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
  todayPct: number
  isCollapsed: boolean
  onToggle: () => void
  onProjectClick: (project: Project) => void
}

export function CivilVendorSection({
  group,
  windowStart,
  windowEnd,
  totalMs,
  todayPct,
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
        className="flex items-center border-b border-slate-100 bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition-colors select-none"
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
        <div className="flex-1 px-3 py-2">
          <span className="text-[10px] text-slate-400">
            {group.projects.length} project{group.projects.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {!isCollapsed &&
        group.projects.map((project) => (
          <div
            key={project.id}
            className="flex border-b border-slate-50 h-9 items-center hover:bg-slate-50/50"
          >
            <div className="w-40 min-w-40 px-3 text-[11px] text-slate-500 border-r border-slate-100 truncate">
              {project.expand?.client?.company_name ?? '—'}
            </div>
            <div className="flex-1 relative h-9">
              {todayPct >= 0 && todayPct <= 100 && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-400 opacity-60 z-10 pointer-events-none"
                  style={{ left: `${todayPct}%` }}
                />
              )}
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/dashboard/CivilVendorSection.tsx
git commit -m "feat: add CivilVendorSection with collapsible vendor rows"
```

---

## Task 5: Komponen `CivilGanttChart`

**Files:**
- Create: `frontend/src/components/dashboard/CivilGanttChart.tsx`

- [ ] **Step 1: Buat helper `getWindow`**

```typescript
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
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 1 + offset, 1)
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
    const mEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999)
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

export function CivilGanttChart({ vendorGroups, onProjectClick }: CivilGanttChartProps) {
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
        <Button variant="ghost" size="sm" onClick={() => setOffset((o) => o - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-slate-700">
          {months.map((m) => m.label).join(' · ')}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setOffset((o) => o + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Column header */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <div className="w-40 min-w-40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 border-r border-slate-200">
          Vendor / Client
        </div>
        <div className="flex-1 relative h-8">
          {months.map((m) => (
            <div
              key={m.label}
              className="absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-medium text-slate-400 border-r border-slate-200 last:border-r-0"
              style={{ left: `${m.leftPct}%`, width: `${m.widthPct}%` }}
            >
              {m.label.split(' ')[0]}
            </div>
          ))}
          {todayPct >= 0 && todayPct <= 100 && (
            <div
              className="absolute top-0 bottom-0 w-px bg-red-400 opacity-70 pointer-events-none"
              style={{ left: `${todayPct}%` }}
            >
              <div className="absolute -top-0.5 -left-[3px] w-2 h-2 rounded-full bg-red-400" />
            </div>
          )}
        </div>
      </div>

      {/* Vendor rows */}
      <div className="overflow-x-auto">
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/dashboard/CivilGanttChart.tsx
git commit -m "feat: add CivilGanttChart with 3-month view and today line"
```

---

## Task 6: Komponen `CivilTeamDashboard`

**Files:**
- Create: `frontend/src/components/dashboard/CivilTeamDashboard.tsx`

- [ ] **Step 1: Buat komponen utama**

```typescript
// frontend/src/components/dashboard/CivilTeamDashboard.tsx
import { useState } from 'react'
import { Briefcase, AlertTriangle, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useCivilTeamProjects } from '@/hooks/useCivilTeamProjects'
import { ProjectDetailsModal } from '@/pages/projects/ProjectDetailsModal'
import { CivilGanttChart } from './CivilGanttChart'
import type { Project } from '@/types'

export function CivilTeamDashboard() {
  const { data, isLoading } = useCivilTeamProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  if (isLoading) return <LoadingSpinner className="min-h-screen" />

  const { vendorGroups, totalProjects, nearDeadlineCount } = data ?? {
    vendorGroups: [],
    totalProjects: 0,
    nearDeadlineCount: 0,
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Civil Team
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {totalProjects} active project{totalProjects !== 1 ? 's' : ''} across{' '}
          {vendorGroups.length} vendor{vendorGroups.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<Briefcase className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
              label="Total Active"
              value={totalProjects}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-100"
              label="Near Deadline"
              value={nearDeadlineCount}
              urgent={nearDeadlineCount > 0}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<Users className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
              label="Active Vendors"
              value={vendorGroups.length}
            />
          </CardContent>
        </Card>
      </div>

      {vendorGroups.length === 0 ? (
        <EmptyState
          title="No active civil projects"
          description="There are no active civil projects at the moment."
        />
      ) : (
        <CivilGanttChart
          vendorGroups={vendorGroups}
          onProjectClick={setSelectedProject}
        />
      )}

      <ProjectDetailsModal
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null)
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/dashboard/CivilTeamDashboard.tsx
git commit -m "feat: add CivilTeamDashboard with stat cards and gantt chart"
```

---

## Task 7: Verifikasi Manual

- [ ] **Step 1: Start dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Login sebagai ardin** (`division = 'sipil'`)

Buka `/dashboard` — harusnya tampil **Civil Team** bukan **My Projects**.

- [ ] **Step 3: Cek Gantt**

- Vendor sections tampil dengan nama vendor
- Project bars muncul dengan warna urgency yang benar
- Today line merah terlihat
- Navigasi bulan ← → berfungsi
- Collapse/expand vendor section berfungsi
- Klik bar → ProjectDetailsModal terbuka dengan data benar

- [ ] **Step 4: Login sebagai non-sipil user**

Buka `/dashboard` — harusnya tampil **My Projects** seperti biasa.

- [ ] **Step 5: Final commit jika ada fix**

```bash
git add -p
git commit -m "fix: civil team dashboard adjustments"
```
