# Client Tracking Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah tab "Client Tracking" di Dashboard yang menampilkan daftar project per client, dikelompokkan ke Semester 1 dan Semester 2 berdasarkan tahun yang dipilih.

**Architecture:** Hook `useClientTracking` mengambil semua project dari PocketBase (dengan expand client) lalu memgroup ke S1/S2 menggunakan mapping date field per tipe project. Tab merender dua `SemesterCard` bersebelahan yang masing-masing berisi tabel project lengkap.

**Tech Stack:** React 19, TypeScript, TanStack Query, Tailwind CSS 4, shadcn/ui (Card, Select, Badge, Skeleton, Table via `<table>` native), lucide-react

---

## File Map

| Status | File | Tanggung Jawab |
|---|---|---|
| Create | `frontend/src/hooks/useClientTracking.ts` | Fetch projects, mapping date field, grouping S1/S2, availableYears |
| Create | `frontend/src/components/dashboard/tabs/SemesterCard.tsx` | Card reusable: header + tabel project |
| Create | `frontend/src/components/dashboard/tabs/ClientTrackingTab.tsx` | State tahun, layout header + dua card |
| Modify | `frontend/src/pages/Dashboard.tsx` | Tambah TabsTrigger + TabsContent |

---

## Task 1: Hook `useClientTracking`

**Files:**
- Create: `frontend/src/hooks/useClientTracking.ts`

- [ ] **Step 1: Buat file hook**

```typescript
// frontend/src/hooks/useClientTracking.ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'

// Ubah mapping ini untuk mengubah logika date field per tipe project
const DATE_FIELD_BY_TYPE: Record<Project['type'], keyof Project> = {
  civil: 'end_date',
  architecture: 'deadline',
  interior: 'deadline',
}

function getDateValue(project: Project): string | undefined {
  const field = DATE_FIELD_BY_TYPE[project.type]
  return project[field] as string | undefined
}

function getProjectYear(project: Project): number | null {
  const dateStr = getDateValue(project)
  if (!dateStr) return null
  return new Date(dateStr).getFullYear()
}

function getProjectSemester(project: Project): 1 | 2 | null {
  const dateStr = getDateValue(project)
  if (!dateStr) return null
  const month = new Date(dateStr).getMonth() + 1
  return month <= 6 ? 1 : 2
}

async function fetchAllProjects(): Promise<Project[]> {
  return pb.collection('projects').getFullList<Project>({
    expand: 'client',
    sort: '-created',
  })
}

export function useClientTracking(year: number) {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['client-tracking'],
    queryFn: fetchAllProjects,
    staleTime: 1000 * 60 * 5,
  })

  const availableYears = Array.from(
    new Set(
      projects
        .map(getProjectYear)
        .filter((y): y is number => y !== null)
    )
  ).sort((a, b) => b - a)

  const yearProjects = projects.filter((p) => getProjectYear(p) === year)
  const s1 = yearProjects.filter((p) => getProjectSemester(p) === 1)
  const s2 = yearProjects.filter((p) => getProjectSemester(p) === 2)

  return { s1, s2, availableYears, isLoading }
}
```

- [ ] **Step 2: Verifikasi TypeScript tidak error**

```bash
cd /Users/fadhel/Documents/RH-ERP/frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: tidak ada error baru yang berhubungan dengan file ini.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useClientTracking.ts
git commit -m "feat: add useClientTracking hook for semester grouping"
```

---

## Task 2: Komponen `SemesterCard`

**Files:**
- Create: `frontend/src/components/dashboard/tabs/SemesterCard.tsx`

- [ ] **Step 1: Buat file komponen**

```typescript
// frontend/src/components/dashboard/tabs/SemesterCard.tsx
import type { Project } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { formatDate } from '@/lib/helpers'

const TYPE_LABELS: Record<Project['type'], string> = {
  architecture: 'Architecture',
  civil: 'Civil',
  interior: 'Interior',
}

const DATE_FIELD_BY_TYPE: Record<Project['type'], keyof Project> = {
  civil: 'end_date',
  architecture: 'deadline',
  interior: 'deadline',
}

interface SemesterCardProps {
  title: string
  dateRange: string
  projects: Project[]
  isLoading: boolean
}

export function SemesterCard({
  title,
  dateRange,
  projects,
  isLoading,
}: SemesterCardProps) {
  return (
    <Card className="border-slate-200/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              {title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{dateRange}</p>
          </div>
          <span className="text-sm font-semibold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            {isLoading ? '...' : `${projects.length} clients`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Tidak ada project di semester ini
          </div>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">
                    Client
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">
                    Tipe
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">
                    Status
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-slate-600">
                    Kontrak
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const dateField = DATE_FIELD_BY_TYPE[project.type]
                  const dateValue = project[dateField] as string | undefined
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-slate-800 font-medium max-w-[160px] truncate">
                        {project.expand?.client?.company_name ?? '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-xs capitalize">
                          {TYPE_LABELS[project.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 capitalize">
                        {project.status}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700 tabular-nums">
                        {formatCompactCurrency(project.contract_value)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {formatDate(dateValue)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript tidak error**

```bash
cd /Users/fadhel/Documents/RH-ERP/frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: tidak ada error baru.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/tabs/SemesterCard.tsx
git commit -m "feat: add SemesterCard component for client tracking"
```

---

## Task 3: Komponen `ClientTrackingTab`

**Files:**
- Create: `frontend/src/components/dashboard/tabs/ClientTrackingTab.tsx`

- [ ] **Step 1: Buat file komponen**

```typescript
// frontend/src/components/dashboard/tabs/ClientTrackingTab.tsx
import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useClientTracking } from '@/hooks/useClientTracking'
import { SemesterCard } from './SemesterCard'

export function ClientTrackingTab() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const { s1, s2, availableYears, isLoading } = useClientTracking(year)

  const yearOptions = availableYears.length > 0 ? availableYears : [currentYear]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Client Tracking</h3>
          <p className="text-xs text-slate-500 mt-1">
            Daftar project per client, dikelompokkan per semester.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(year)}
            onValueChange={(val) => setYear(Number(val))}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Two-column semester cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SemesterCard
          title="Semester 1"
          dateRange={`Jan – Jun ${year}`}
          projects={s1}
          isLoading={isLoading}
        />
        <SemesterCard
          title="Semester 2"
          dateRange={`Jul – Des ${year}`}
          projects={s2}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript tidak error**

```bash
cd /Users/fadhel/Documents/RH-ERP/frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: tidak ada error baru.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/tabs/ClientTrackingTab.tsx
git commit -m "feat: add ClientTrackingTab component"
```

---

## Task 4: Daftarkan Tab di Dashboard

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Tambah import**

Di `Dashboard.tsx`, tambahkan dua import berikut di bawah baris import `DocumentRevenueTab`:

```typescript
import { ClientTrackingTab } from '@/components/dashboard/tabs/ClientTrackingTab'
```

Dan tambahkan `CalendarDays` ke import lucide-react yang sudah ada:

```typescript
import {
  LayoutDashboard,
  UsersRound,
  Briefcase,
  Wallet,
  Compass,
  FileText,
  AlertCircle,
  CalendarDays,   // ← tambah ini
} from 'lucide-react'
```

- [ ] **Step 2: Tambah TabsTrigger**

Di dalam `<TabsList>`, setelah TabsTrigger untuk "Document Revenue", tambahkan:

```tsx
<TabsTrigger
  value="client-tracking"
  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground"
>
  <CalendarDays className="w-4 h-4" />
  <span className="font-medium text-sm">Client Tracking</span>
</TabsTrigger>
```

- [ ] **Step 3: Tambah TabsContent**

Setelah TabsContent "revenue", tambahkan:

```tsx
<TabsContent
  value="client-tracking"
  className="space-y-6 animate-in fade-in-50"
>
  <ClientTrackingTab />
</TabsContent>
```

- [ ] **Step 4: Verifikasi TypeScript tidak error**

```bash
cd /Users/fadhel/Documents/RH-ERP/frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: tidak ada error baru.

- [ ] **Step 5: Jalankan dev server dan verifikasi secara manual**

```bash
cd /Users/fadhel/Documents/RH-ERP/frontend && npm run dev
```

Cek di browser:
- Tab "Client Tracking" muncul di navigation
- Dropdown tahun menampilkan tahun yang ada datanya
- S1 dan S2 tampil bersebelahan dengan tabel yang benar
- Tidak ada error di console

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: add Client Tracking tab to dashboard"
```
