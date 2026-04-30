# Dashboard Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambahkan section kalender besar di tab Overview Executive Dashboard (di atas revenue chart) yang menampilkan deadline project, jadwal meeting prospect, dan jadwal survey seluruh tim.

**Architecture:** Hook `useDashboardCalendarEvents` mengagregasi data dari 5 sumber (3x useProjects + useProspects + useSurveys) dan mentransformnya ke format FullCalendar. Komponen `DashboardCalendar` render kalender dan mengelola state popover. `DashboardCalendarPopover` adalah komponen presentasional murni.

**Tech Stack:** `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/interaction`, Radix UI (existing), Tailwind CSS 4

---

## File Map

| File | Action | Tanggung Jawab |
|---|---|---|
| `frontend/src/lib/constant.ts` | Modify | Tambah `PROJECT_TYPE_COLORS` + `CALENDAR_EVENT_COLORS` |
| `frontend/src/hooks/useDashboardCalendarEvents.ts` | Create | Agregasi + transform events dari semua data source |
| `frontend/src/components/dashboard/DashboardCalendarPopover.tsx` | Create | Popover detail per hari (presentational) |
| `frontend/src/components/dashboard/DashboardCalendar.tsx` | Create | Komponen kalender utama, kelola popover state |
| `frontend/src/components/dashboard/tabs/OverviewTab.tsx` | Modify | Mount DashboardCalendar di atas revenue chart |
| `frontend/src/index.css` | Modify | Override FullCalendar base styles agar cocok dengan tema |

---

## Task 1: Install FullCalendar + Tambah Constants

**Files:**
- Modify: `frontend/package.json` (via npm install)
- Modify: `frontend/src/lib/constant.ts`

- [ ] **Step 1: Install FullCalendar packages**

Jalankan di `frontend/`:
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
```

Expected: `package.json` bertambah 3 dependencies, tidak ada error.

- [ ] **Step 2: Tambah color constants ke `constant.ts`**

Tambahkan dua blok ini di bagian bawah `frontend/src/lib/constant.ts`, setelah `QUOTATION_OPTIONS`:

```ts
/** Tailwind badge classes untuk event type — dipakai di badge/chip komponen */
export const PROJECT_TYPE_COLORS: Record<string, string> = {
  architecture: 'bg-blue-100 text-blue-800 border-blue-200',
  civil: 'bg-amber-100 text-amber-800 border-amber-200',
  interior: 'bg-violet-100 text-violet-800 border-violet-200',
  survey: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  meeting: 'bg-rose-100 text-rose-800 border-rose-200',
}

/** Hex colors untuk FullCalendar event backgroundColor */
export const CALENDAR_EVENT_COLORS: Record<string, string> = {
  architecture: '#2563eb',
  civil: '#d97706',
  interior: '#7c3aed',
  survey: '#059669',
  meeting: '#e11d48',
}
```

- [ ] **Step 3: Verifikasi TypeScript tidak error**

```bash
npx tsc --noEmit
```

Expected: exit 0, tidak ada error baru.

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/lib/constant.ts
git commit -m "feat: install fullcalendar and add centralized event type colors"
```

---

## Task 2: Hook `useDashboardCalendarEvents`

**Files:**
- Create: `frontend/src/hooks/useDashboardCalendarEvents.ts`

- [ ] **Step 1: Buat file hook**

Buat `frontend/src/hooks/useDashboardCalendarEvents.ts` dengan konten berikut:

```ts
import { useMemo } from 'react'
import { format } from 'date-fns'
import { useProjects } from './useProjects'
import { useProspects } from './useProspects'
import { useSurveys } from './useSurveys'
import { CALENDAR_EVENT_COLORS, DONE_STATUSES } from '@/lib/constant'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    eventType: 'architecture' | 'civil' | 'interior' | 'survey' | 'meeting'
    clientName: string
    assignee?: string
    time?: string
  }
}

/** Ambil YYYY-MM-DD dari date string (ISO date atau ISO datetime), dalam timezone lokal */
function toDateStr(dateStr: string): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  return format(new Date(dateStr), 'yyyy-MM-dd')
}

/** Ambil HH:mm dari ISO datetime string. Undefined jika hanya date. */
function toTimeStr(dateStr: string): string | undefined {
  if (!dateStr || /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return undefined
  return format(new Date(dateStr), 'HH:mm')
}

export function useDashboardCalendarEvents() {
  const { projects: archProjects, isLoading: archLoading } = useProjects({
    projectType: 'architecture',
    statusFilter: 'all',
  })
  const { projects: civilProjects, isLoading: civilLoading } = useProjects({
    projectType: 'civil',
    statusFilter: 'all',
  })
  const { projects: interiorProjects, isLoading: interiorLoading } = useProjects({
    projectType: 'interior',
    statusFilter: 'all',
  })
  const { prospects, isLoading: prospectsLoading } = useProspects()
  const { surveys, isLoading: surveysLoading } = useSurveys()

  const isLoading =
    archLoading || civilLoading || interiorLoading || prospectsLoading || surveysLoading

  const events = useMemo<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = []
    const color = CALENDAR_EVENT_COLORS

    for (const p of archProjects) {
      if ((DONE_STATUSES as readonly string[]).includes(p.status) || !p.deadline) continue
      result.push({
        id: `arch-${p.id}`,
        title: p.expand?.client?.company_name ?? 'Architecture',
        date: toDateStr(p.deadline),
        backgroundColor: color.architecture,
        borderColor: color.architecture,
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'architecture',
          clientName: p.expand?.client?.company_name ?? '—',
          assignee: p.expand?.assignee?.name,
        },
      })
    }

    for (const p of civilProjects) {
      if ((DONE_STATUSES as readonly string[]).includes(p.status) || !p.end_date) continue
      result.push({
        id: `civil-${p.id}`,
        title: p.expand?.client?.company_name ?? 'Civil',
        date: toDateStr(p.end_date),
        backgroundColor: color.civil,
        borderColor: color.civil,
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'civil',
          clientName: p.expand?.client?.company_name ?? '—',
          assignee: p.expand?.assignee?.name,
        },
      })
    }

    for (const p of interiorProjects) {
      if ((DONE_STATUSES as readonly string[]).includes(p.status) || !p.deadline) continue
      result.push({
        id: `int-${p.id}`,
        title: p.expand?.client?.company_name ?? 'Interior',
        date: toDateStr(p.deadline),
        backgroundColor: color.interior,
        borderColor: color.interior,
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'interior',
          clientName: p.expand?.client?.company_name ?? '—',
          assignee: p.expand?.assignee?.name,
        },
      })
    }

    for (const s of surveys) {
      if (!s.schedule) continue
      result.push({
        id: `survey-${s.id}`,
        title: s.expand?.client?.company_name ?? 'Survey',
        date: toDateStr(s.schedule),
        backgroundColor: color.survey,
        borderColor: color.survey,
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'survey',
          clientName: s.expand?.client?.company_name ?? '—',
          assignee: s.expand?.surveyor?.name,
          time: toTimeStr(s.schedule),
        },
      })
    }

    for (const p of prospects) {
      if (!p.meeting_schedule) continue
      result.push({
        id: `meeting-${p.id}`,
        title: p.client_name,
        date: toDateStr(p.meeting_schedule),
        backgroundColor: color.meeting,
        borderColor: color.meeting,
        textColor: '#ffffff',
        extendedProps: {
          eventType: 'meeting',
          clientName: p.client_name,
          time: toTimeStr(p.meeting_schedule),
        },
      })
    }

    return result
  }, [archProjects, civilProjects, interiorProjects, surveys, prospects])

  return { events, isLoading }
}
```

- [ ] **Step 2: Verifikasi TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0. Jika ada error `DONE_STATUSES` type, cast sudah ada di kode (`as readonly string[]`).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useDashboardCalendarEvents.ts
git commit -m "feat: add useDashboardCalendarEvents hook"
```

---

## Task 3: Komponen `DashboardCalendarPopover`

**Files:**
- Create: `frontend/src/components/dashboard/DashboardCalendarPopover.tsx`

- [ ] **Step 1: Buat komponen popover**

Buat `frontend/src/components/dashboard/DashboardCalendarPopover.tsx`:

```tsx
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateLong } from '@/lib/helpers'
import { PROJECT_TYPE_COLORS } from '@/lib/constant'
import type { CalendarEvent } from '@/hooks/useDashboardCalendarEvents'

const EVENT_TYPE_LABEL: Record<CalendarEvent['extendedProps']['eventType'], string> = {
  architecture: 'Architecture Deadline',
  civil: 'Civil Deadline',
  interior: 'Interior Deadline',
  survey: 'Survey',
  meeting: 'Prospect Meeting',
}

interface DashboardCalendarPopoverProps {
  date: string
  events: CalendarEvent[]
  onClose: () => void
}

export function DashboardCalendarPopover({
  date,
  events,
  onClose,
}: DashboardCalendarPopoverProps) {
  return (
    <div className="w-72 rounded-lg border bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {formatDateLong(date)}
          </p>
          <p className="text-xs text-muted-foreground">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Event list */}
      <div className="divide-y max-h-72 overflow-y-auto">
        {events.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">
            Tidak ada event
          </p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="px-4 py-3 flex items-start gap-3">
              <div
                className="mt-0.5 w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: event.backgroundColor }}
              />
              <div className="min-w-0">
                <span
                  className={cn(
                    'inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md border mb-1',
                    PROJECT_TYPE_COLORS[event.extendedProps.eventType]
                  )}
                >
                  {EVENT_TYPE_LABEL[event.extendedProps.eventType]}
                </span>
                <p className="text-sm font-medium text-slate-800 truncate">
                  {event.extendedProps.clientName}
                </p>
                {event.extendedProps.assignee && (
                  <p className="text-xs text-muted-foreground truncate">
                    {event.extendedProps.assignee}
                    {event.extendedProps.time && ` · ${event.extendedProps.time}`}
                  </p>
                )}
                {!event.extendedProps.assignee && event.extendedProps.time && (
                  <p className="text-xs text-muted-foreground">
                    {event.extendedProps.time}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/DashboardCalendarPopover.tsx
git commit -m "feat: add DashboardCalendarPopover component"
```

---

## Task 4: Komponen `DashboardCalendar`

**Files:**
- Create: `frontend/src/components/dashboard/DashboardCalendar.tsx`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Tambah FullCalendar CSS overrides ke `index.css`**

Tambahkan di bagian paling bawah `frontend/src/index.css`:

```css
/* FullCalendar overrides — cocokkan dengan tema Charcoal */
.fc {
  font-family: var(--font-sans, Inter, sans-serif);
}
.fc .fc-toolbar-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}
.fc .fc-button {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
}
.fc .fc-button:hover {
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  color: #1e293b;
}
.fc .fc-button-primary:not(:disabled).fc-button-active,
.fc .fc-button-primary:not(:disabled):active {
  background-color: #1e293b;
  border-color: #1e293b;
  color: #ffffff;
}
.fc .fc-button-primary:focus {
  box-shadow: none;
}
.fc .fc-col-header-cell-cushion {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.fc .fc-daygrid-day-number {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #475569;
  padding: 4px 6px;
}
.fc .fc-day-today {
  background-color: #eff6ff !important;
}
.fc .fc-day-today .fc-daygrid-day-number {
  color: #2563eb;
  font-weight: 700;
}
.fc .fc-daygrid-event {
  border-radius: 4px;
  font-size: 0.6875rem;
  padding: 1px 4px;
  font-weight: 500;
}
.fc .fc-more-link {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #6366f1;
}
.fc .fc-daygrid-day-frame {
  min-height: 80px;
}
```

- [ ] **Step 2: Buat komponen `DashboardCalendar`**

Buat `frontend/src/components/dashboard/DashboardCalendar.tsx`:

```tsx
import { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateClickArg, EventClickArg } from '@fullcalendar/interaction'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardCalendarEvents } from '@/hooks/useDashboardCalendarEvents'
import { DashboardCalendarPopover } from './DashboardCalendarPopover'
import { CALENDAR_EVENT_COLORS } from '@/lib/constant'

interface PopoverState {
  date: string
  x: number
  y: number
}

const LEGEND_ITEMS = [
  { label: 'Architecture', color: CALENDAR_EVENT_COLORS.architecture },
  { label: 'Civil', color: CALENDAR_EVENT_COLORS.civil },
  { label: 'Interior', color: CALENDAR_EVENT_COLORS.interior },
  { label: 'Survey', color: CALENDAR_EVENT_COLORS.survey },
  { label: 'Meeting', color: CALENDAR_EVENT_COLORS.meeting },
] as const

export function DashboardCalendar() {
  const { events, isLoading } = useDashboardCalendarEvents()
  const [popoverState, setPopoverState] = useState<PopoverState | null>(null)

  const popoverEvents = useMemo(() => {
    if (!popoverState) return []
    return events.filter((e) => e.date === popoverState.date)
  }, [events, popoverState])

  const openPopover = (date: string, jsEvent: MouseEvent) => {
    setPopoverState({ date, x: jsEvent.clientX, y: jsEvent.clientY })
  }

  const handleDateClick = (info: DateClickArg) => {
    openPopover(info.dateStr, info.jsEvent as MouseEvent)
  }

  const handleEventClick = (info: EventClickArg) => {
    const date = info.event.startStr.split('T')[0]
    openPopover(date, info.jsEvent as MouseEvent)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMoreLinkClick = (info: any) => {
    const date = info.date.toLocaleDateString('en-CA')
    openPopover(date, info.jsEvent as MouseEvent)
  }

  return (
    <Card className="border-slate-200/60 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            Team Calendar
          </CardTitle>
          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {LEGEND_ITEMS.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {isLoading ? (
          <div className="h-[500px] animate-pulse rounded-md bg-slate-100" />
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek',
            }}
            buttonText={{ today: 'Today', month: 'Month', week: 'Week' }}
            events={events}
            dayMaxEvents={2}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            moreLinkClick={handleMoreLinkClick}
            height="auto"
            eventDisplay="block"
          />
        )}

        {/* Custom popover */}
        {popoverState && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setPopoverState(null)}
            />
            <div
              className="fixed z-50"
              style={{
                left: Math.min(popoverState.x, window.innerWidth - 300),
                top: popoverState.y + 10,
              }}
            >
              <DashboardCalendarPopover
                date={popoverState.date}
                events={popoverEvents}
                onClose={() => setPopoverState(null)}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Verifikasi TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0. Jika ada error pada `MoreLinkArg` import, pastikan sudah menggunakan `any` untuk `handleMoreLinkClick` seperti di kode di atas.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/dashboard/DashboardCalendar.tsx frontend/src/index.css
git commit -m "feat: add DashboardCalendar component with FullCalendar and custom popover"
```

---

## Task 5: Integrasikan ke `OverviewTab`

**Files:**
- Modify: `frontend/src/components/dashboard/tabs/OverviewTab.tsx`

- [ ] **Step 1: Mount `DashboardCalendar` di atas revenue chart**

Ganti seluruh isi `frontend/src/components/dashboard/tabs/OverviewTab.tsx` dengan:

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Users, HardHat, UserSearch, ClipboardList } from 'lucide-react'
import { Overview } from '@/components/dashboard/Overview'
import { RecentSales } from '@/components/dashboard/RecentSales'
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar'

interface OverviewTabProps {
  data: any
  isLoading: boolean
}

export function OverviewTab({ data, isLoading }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* KPI CARDS GRID */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Prospects */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Prospects
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-md">
              <UserSearch className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : (data?.totalProspects ?? 0)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Potential clients in pipeline
            </p>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Projects
            </CardTitle>
            <div className="p-2 bg-amber-50 rounded-md">
              <HardHat className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : data?.totalProjects || 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Ongoing Design, Civil & Interior
            </p>
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Clients
            </CardTitle>
            <div className="p-2 bg-emerald-50 rounded-md">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : data?.totalClients || 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Registered partner entities
            </p>
          </CardContent>
        </Card>

        {/* Pending Surveys */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending Surveys
            </CardTitle>
            <div className="p-2 bg-purple-50 rounded-md">
              <ClipboardList className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : (data?.pendingSurveys ?? 0)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Surveys awaiting completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TEAM CALENDAR */}
      <DashboardCalendar />

      {/* CHARTS SECTION */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 border-slate-200/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Revenue Analytics
            </CardTitle>
            <CardDescription>
              Visual growth of your company's income over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] md:h-[350px]">
              <Overview />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3 border-slate-200/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Latest invoice payments and quotation updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Jalankan dev server dan test manual**

```bash
npm run dev
```

Buka browser, login sebagai superadmin, buka Dashboard → tab Overview. Verifikasi:
- [ ] Kalender muncul di antara KPI cards dan revenue chart
- [ ] Event-event berwarna tampil di tanggal yang benar
- [ ] Legend (Architecture / Civil / Interior / Survey / Meeting) tampil di header card
- [ ] Klik tanggal kosong → popover muncul dengan "0 events" atau event yang ada
- [ ] Klik event chip → popover muncul dengan detail event
- [ ] Klik "+X more" → popover muncul dengan semua event hari itu
- [ ] Klik di luar popover → popover tutup
- [ ] Toggle Month ↔ Week berfungsi
- [ ] Tombol "Today" kembali ke bulan/minggu hari ini

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/dashboard/tabs/OverviewTab.tsx
git commit -m "feat: integrate DashboardCalendar into OverviewTab"
```

---

## Task 6: Update Docs

**Files:**
- Modify: `docs/modules.md`
- Modify: `docs/claude/architecture.md`

- [ ] **Step 1: Update `docs/modules.md`**

Di section Dashboard (baris yang ada `Dashboard | ✅`), update catatan:

```markdown
| Dashboard | ✅ | Role-based: superadmin → Executive Overview (workload, revenue, client tracking, **Team Calendar** di atas revenue chart — deadline project, jadwal meeting prospect & survey per bulan/minggu dengan color-coded events dan day-detail popover); employee → My Projects; civil role → Civil Team Dashboard |
```

- [ ] **Step 2: Update `docs/claude/architecture.md`**

Di tabel Custom Hooks, tambahkan baris baru setelah baris `useClientTracking`:

```markdown
| `useDashboardCalendarEvents` | Agregasi deadline project (arch/civil/interior), jadwal survey, dan meeting_schedule prospect ke format CalendarEvent[] untuk FullCalendar |
```

Di bagian direktori `components/dashboard/`, tambahkan:
```
# sebelum:
│                              # CivilGanttChart, CivilGanttBar, CivilVendorSection
# sesudah:
│                              # CivilGanttChart, CivilGanttBar, CivilVendorSection,
│                              # DashboardCalendar, DashboardCalendarPopover
```

- [ ] **Step 3: Commit**

```bash
git add docs/modules.md docs/claude/architecture.md
git commit -m "docs: update modules and architecture docs for dashboard calendar"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Placement ✓ · Monthly view default ✓ · Toggle week ✓ · Max 2 events + "+X more" ✓ · Popover on click ✓ · 5 event types + warna ✓ · Centralisasi constant ✓ · Data sources ✓ · DONE_STATUSES filter ✓ · Komponen arsitektur ✓ · Batas baris SOLID ✓
- [x] **Placeholder scan:** Tidak ada TBD/TODO/placeholder di semua task
- [x] **Type consistency:** `CalendarEvent` didefinisikan di Task 2, dipakai di Task 3 dan 4 — konsisten. `PopoverState` lokal di Task 4. `CALENDAR_EVENT_COLORS`/`PROJECT_TYPE_COLORS` dari Task 1 dipakai di Task 2, 3, 4 — konsisten.
