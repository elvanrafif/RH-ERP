# Employee Project Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ubah Dashboard menjadi role-based — superadmin tetap melihat Executive Overview, employee biasa langsung melihat daftar project aktif milik mereka sendiri ("Proyek Saya").

**Architecture:** `Dashboard.tsx` jadi thin router yang render `ExecutiveDashboard` atau `MyProjectsDashboard` berdasarkan `isSuperAdmin`. Isi Dashboard saat ini dipindah ke `ExecutiveDashboard.tsx`. Data fetching dilakukan oleh hook `useMyProjects` yang query PocketBase dengan filter assignee + status aktif.

**Tech Stack:** React 19, TypeScript, TanStack Query, PocketBase, Tailwind CSS 4, shadcn/ui (Badge, Card), Lucide React

---

## File Map

| File | Aksi | Tanggung Jawab |
|---|---|---|
| `frontend/src/hooks/useMyProjects.ts` | Create | Fetch project aktif milik current user, hitung stat counts |
| `frontend/src/components/dashboard/ExecutiveDashboard.tsx` | Create | Isi Dashboard.tsx saat ini (copy + rename) |
| `frontend/src/components/dashboard/MyProjectsDashboard.tsx` | Create | Tampilan "Proyek Saya" — header, stat cards, project list, modal |
| `frontend/src/pages/Dashboard.tsx` | Modify | Thin router: `isSuperAdmin ? <ExecutiveDashboard /> : <MyProjectsDashboard />` |

---

## Task 1: Hook `useMyProjects`

**Files:**
- Create: `frontend/src/hooks/useMyProjects.ts`

- [ ] **Step 1: Buat file hook**

```typescript
// frontend/src/hooks/useMyProjects.ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { useAuth } from '@/contexts/AuthContext'
import type { Project } from '@/types'

export interface MyProjectsData {
  projects: Project[]
  nearDeadlineCount: number
  inProgressCount: number
}

export function useMyProjects() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<MyProjectsData>({
    queryKey: ['my-projects', userId],
    enabled: !!userId,
    queryFn: async () => {
      const projects = await pb.collection('projects').getFullList<Project>({
        filter: `assignee = '${userId}' && status != 'done' && status != 'finish' && status != 'cancelled'`,
        expand: 'client',
        sort: 'deadline',
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const nearDeadlineCount = projects.filter((p) => {
        if (!p.deadline) return false
        const d = new Date(p.deadline)
        d.setHours(0, 0, 0, 0)
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diff >= 0 && diff <= 7
      }).length

      const inProgressCount = projects.filter(
        (p) => p.status === 'progress'
      ).length

      return { projects, nearDeadlineCount, inProgressCount }
    },
  })
}
```

- [ ] **Step 2: Verifikasi TypeScript tidak error**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep "useMyProjects"
```

Expected: tidak ada output (tidak ada error)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useMyProjects.ts
git commit -m "feat: add useMyProjects hook for employee project dashboard"
```

---

## Task 2: Ekstrak `ExecutiveDashboard`

**Files:**
- Create: `frontend/src/components/dashboard/ExecutiveDashboard.tsx`
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Buat `ExecutiveDashboard.tsx` — copy isi Dashboard.tsx saat ini**

```tsx
// frontend/src/components/dashboard/ExecutiveDashboard.tsx
import { useDashboardStats } from '@/hooks/useDashboard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Plus } from 'lucide-react'
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab'
import { ResourceMonitoringTab } from '@/components/dashboard/tabs/ResourceMonitoringTab'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  LayoutDashboard,
  UsersRound,
  Briefcase,
  Wallet,
  Compass,
  CalendarDays,
} from 'lucide-react'
import { DocumentRevenueTab } from '@/components/dashboard/tabs/DocumentRevenueTab'
import { ClientTrackingTab } from '@/components/dashboard/tabs/ClientTrackingTab'

export function ExecutiveDashboard() {
  const { data, isLoading, error } = useDashboardStats()

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading dashboard data.
      </div>
    )

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Executive Overview
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time data summary across all construction and design sectors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm" className="shadow-sm flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <TabsList className="bg-muted/60 px-1 py-6 border border-border shadow-inner rounded-lg w-max flex items-center gap-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-medium text-sm">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground"
            >
              <UsersRound className="w-4 h-4" />
              <span className="font-medium text-sm">Resource Monitoring</span>
            </TabsTrigger>
            <TabsTrigger
              value="project-value"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground"
            >
              <Briefcase className="w-4 h-4" />
              <span className="font-medium text-sm">Project Value</span>
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground"
            >
              <Wallet className="w-4 h-4" />
              <span className="font-medium text-sm">Document Revenue</span>
            </TabsTrigger>
            <TabsTrigger
              value="client-tracking"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="font-medium text-sm">Client Tracking</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in-50">
          <OverviewTab data={data} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="resources" className="space-y-6 animate-in fade-in-50">
          <ResourceMonitoringTab />
        </TabsContent>
        <TabsContent value="project-value">
          <Card className="border-dashed border-2 bg-slate-50">
            <CardHeader>
              <CardTitle>Project Value Analytics</CardTitle>
              <CardDescription>Breakdown: Interior / Sipil / Arsitektur</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Compass className="h-10 w-10 opacity-20" />
              <p>Under Development</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="revenue" className="space-y-6 animate-in fade-in-50">
          <DocumentRevenueTab />
        </TabsContent>
        <TabsContent value="client-tracking" className="space-y-6 animate-in fade-in-50">
          <ClientTrackingTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript tidak error**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep "ExecutiveDashboard"
```

Expected: tidak ada output

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/ExecutiveDashboard.tsx
git commit -m "feat: extract ExecutiveDashboard component from Dashboard page"
```

---

## Task 3: Buat `MyProjectsDashboard`

**Files:**
- Create: `frontend/src/components/dashboard/MyProjectsDashboard.tsx`

- [ ] **Step 1: Buat file komponen**

```tsx
// frontend/src/components/dashboard/MyProjectsDashboard.tsx
import { useState } from 'react'
import { Briefcase, AlertTriangle, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatCard } from '@/components/shared/StatCard'
import { useMyProjects } from '@/hooks/useMyProjects'
import { ProjectDetailsModal } from '@/pages/projects/ProjectDetailsModal'
import type { Project } from '@/types'

const TYPE_LABEL: Record<Project['type'], string> = {
  architecture: 'Arsitektur',
  civil: 'Sipil',
  interior: 'Interior',
}

const TYPE_CLASS: Record<Project['type'], string> = {
  architecture: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  civil: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  interior: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
}

const STATUS_LABEL: Record<string, string> = {
  design: 'Design',
  progress: 'Progress',
}

const STATUS_CLASS: Record<string, string> = {
  design: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  progress: 'bg-green-100 text-green-700 hover:bg-green-100',
}

function getDaysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const today = new Date()
  target.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDeadlineLabel(days: number | null): string {
  if (days === null) return '—'
  if (days < 0) return `Terlambat ${Math.abs(days)} hari`
  if (days === 0) return 'Hari ini'
  return `${days} hari lagi`
}

interface ProjectRowProps {
  project: Project
  onClick: (project: Project) => void
}

function ProjectRow({ project, onClick }: ProjectRowProps) {
  const days = getDaysUntil(project.deadline)
  const isUrgent = days !== null && days <= 7
  const clientName = project.expand?.client?.company_name ?? '—'

  return (
    <div
      onClick={() => onClick(project)}
      className={`grid grid-cols-[110px_1fr_100px_120px] gap-3 px-4 py-3.5 items-center cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors ${isUrgent ? 'bg-red-50/50' : ''}`}
    >
      <div>
        <Badge className={TYPE_CLASS[project.type]}>
          {TYPE_LABEL[project.type]}
        </Badge>
      </div>
      <div className="text-sm font-medium text-foreground truncate">{clientName}</div>
      <div>
        <Badge className={STATUS_CLASS[project.status] ?? 'bg-slate-100 text-slate-600'}>
          {STATUS_LABEL[project.status] ?? project.status}
        </Badge>
      </div>
      <div className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`}>
        {isUrgent && days !== null && days >= 0 && <span className="mr-1">⚠</span>}
        {formatDeadlineLabel(days)}
      </div>
    </div>
  )
}

export function MyProjectsDashboard() {
  const { data, isLoading } = useMyProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  if (isLoading) return <LoadingSpinner className="min-h-screen" />

  const { projects, nearDeadlineCount, inProgressCount } = data ?? {
    projects: [],
    nearDeadlineCount: 0,
    inProgressCount: 0,
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Proyek Saya
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {projects.length} project aktif sedang berjalan
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<Briefcase className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
              label="Total Aktif"
              value={projects.length}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-100"
              label="Mendekati Deadline"
              value={nearDeadlineCount}
              urgent={nearDeadlineCount > 0}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<Activity className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
              label="Dalam Proses"
              value={inProgressCount}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="grid grid-cols-[110px_1fr_100px_120px] gap-3 px-4 py-2.5 border-b border-border bg-muted/30 rounded-t-lg">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipe</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deadline</div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Briefcase className="h-10 w-10 opacity-20" />
            <p className="text-sm">Tidak ada project aktif</p>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onClick={setSelectedProject}
            />
          ))
        )}
      </Card>

      <ProjectDetailsModal
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => { if (!open) setSelectedProject(null) }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript tidak error**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep -E "MyProjectsDashboard|ProjectRow"
```

Expected: tidak ada output

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/MyProjectsDashboard.tsx
git commit -m "feat: add MyProjectsDashboard component for employee view"
```

---

## Task 4: Update `Dashboard.tsx` jadi thin router

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Replace seluruh isi `Dashboard.tsx`**

```tsx
// frontend/src/pages/Dashboard.tsx
import { useAuth } from '@/contexts/AuthContext'
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard'
import { MyProjectsDashboard } from '@/components/dashboard/MyProjectsDashboard'

export default function Dashboard() {
  const { isSuperAdmin } = useAuth()
  return isSuperAdmin ? <ExecutiveDashboard /> : <MyProjectsDashboard />
}
```

- [ ] **Step 2: Verifikasi TypeScript tidak error di seluruh project**

```bash
cd frontend && npx tsc --noEmit
```

Expected: tidak ada error (exit code 0)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: make Dashboard a role-based router (executive vs employee view)"
```

---

## Task 5: Manual Verification

- [ ] **Step 1: Jalankan dev server**

```bash
cd frontend && npm run dev
```

Expected: server jalan di `http://localhost:5173` (atau port lain)

- [ ] **Step 2: Test sebagai superadmin**

Login dengan akun superadmin → buka Dashboard.
Expected: tampil "Executive Overview" dengan semua tab (Overview, Resource Monitoring, dll) — persis sama seperti sebelumnya.

- [ ] **Step 3: Test sebagai employee biasa**

Login dengan akun non-superadmin → buka Dashboard.
Expected: tampil "Proyek Saya" dengan 3 stat cards dan list project aktif milik user tersebut (berdasarkan `assignee`).

- [ ] **Step 4: Test klik project**

Klik salah satu baris project.
Expected: `ProjectDetailsModal` terbuka dengan info project yang benar.

- [ ] **Step 5: Test empty state**

Login dengan akun user yang tidak punya project aktif.
Expected: tampil icon Briefcase + "Tidak ada project aktif".

- [ ] **Step 6: Test deadline urgent**

Jika ada project dengan deadline ≤ 7 hari: row berwarna merah muda, teks deadline merah + ikon ⚠.
