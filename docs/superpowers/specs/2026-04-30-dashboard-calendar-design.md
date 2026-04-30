# Dashboard Calendar — Design Spec

**Date:** 2026-04-30
**Status:** Approved
**Scope:** Superadmin Executive Dashboard

---

## Overview

Tambahkan section kalender besar di tab **Overview** Executive Dashboard, di atas revenue chart. Kalender menampilkan gambaran lengkap seluruh aktivitas tim: deadline project (civil, architecture, interior), jadwal meeting prospect, dan jadwal survey.

---

## Placement

- **Tab:** Overview (`OverviewTab.tsx`)
- **Posisi:** Di antara KPI cards dan revenue chart (kalender masuk di atas revenue chart)
- **Hanya tampil untuk:** Superadmin (sudah terbatas via `ExecutiveDashboard`)

---

## Calendar Behavior

| Aspek | Keputusan |
|---|---|
| Library | `@fullcalendar/react` + `@fullcalendar/daygrid` + `@fullcalendar/interaction` |
| Default view | Monthly |
| Toggle view | Month ↔ Week (tombol di header kalender) |
| Max event per hari (month view) | 2 — sisanya jadi `+X more` |
| Klik tanggal / `+X more` | Buka **Popover** kecil di dekat tanggal |
| Isi Popover | List semua event hari itu: tipe, nama project/klien, assignee/surveyor |

---

## Event Types & Warna

Warna mengikuti pola yang sudah ada di codebase (blue/amber/violet untuk project types). Survey dan meeting adalah tambahan baru.

| Tipe Event | Warna (hex) | Tailwind badge | Status |
|---|---|---|---|
| Architecture deadline | `#3b82f6` (blue-500) | `bg-blue-100 text-blue-800` | Existing |
| Civil deadline | `#f59e0b` (amber-500) | `bg-amber-100 text-amber-800` | Existing |
| Interior deadline | `#8b5cf6` (violet-500) | `bg-violet-100 text-violet-800` | Existing |
| Survey | `#10b981` (emerald-500) | `bg-emerald-100 text-emerald-800` | **New** |
| Prospect meeting | `#f43f5e` (rose-500) | `bg-rose-100 text-rose-800` | **New** |

### Centralisasi di `constant.ts`

Tambah dua konstanta baru:

```ts
// Tailwind badge classes — dipakai di badge/chip komponen
export const PROJECT_TYPE_COLORS: Record<string, string> = {
  architecture: 'bg-blue-100 text-blue-800 border-blue-200',
  civil:        'bg-amber-100 text-amber-800 border-amber-200',
  interior:     'bg-violet-100 text-violet-800 border-violet-200',
}

// Hex colors — dipakai untuk FullCalendar event backgroundColor
export const CALENDAR_EVENT_COLORS: Record<string, string> = {
  architecture: '#3b82f6',
  civil:        '#f59e0b',
  interior:     '#8b5cf6',
  survey:       '#10b981',
  meeting:      '#f43f5e',
}
```

---

## Data Sources

Kalender fetch data dari hooks yang sudah ada — tidak perlu hook baru.

| Tipe Event | Hook | Field tanggal | Field nama |
|---|---|---|---|
| Architecture deadline | `useProjects({ type: 'architecture' })` | `deadline` | `expand.client.company_name` |
| Civil deadline | `useProjects({ type: 'civil' })` | `end_date` | `expand.client.company_name` |
| Interior deadline | `useProjects({ type: 'interior' })` | `deadline` | `expand.client.company_name` |
| Survey | `useSurveys()` | `schedule` | `expand.client.company_name`, `expand.surveyor.name` |
| Prospect meeting | `useProspects()` | `meeting_schedule` | `client_name` |

Filter:
- Projects: hanya yang tidak berstatus `finish` / `done` / `cancelled` (via `DONE_STATUSES`)
- Prospects: hanya yang punya `meeting_schedule` tidak null/kosong
- Surveys: semua status (pending & done)

---

## Arsitektur Komponen

```
OverviewTab.tsx
└── DashboardCalendar.tsx          # Komponen utama kalender
    ├── useDashboardCalendarEvents  # Hook: aggregate semua events
    └── DashboardCalendarPopover.tsx # Popover detail per hari
```

### `useDashboardCalendarEvents` (hook baru, `hooks/useDashboardCalendarEvents.ts`)

- Panggil 5 data source secara paralel
- Transform ke format `EventInput[]` FullCalendar:
  ```ts
  interface CalendarEvent {
    id: string
    title: string        // nama client / prospect
    date: string         // ISO date string (YYYY-MM-DD)
    backgroundColor: string
    borderColor: string
    extendedProps: {
      type: 'architecture' | 'civil' | 'interior' | 'survey' | 'meeting'
      clientName: string
      assignee?: string  // PIC / surveyor name
      time?: string      // untuk survey & meeting yang ada jam-nya
    }
  }
  ```
- Return: `{ events: CalendarEvent[], isLoading: boolean }`

### `DashboardCalendar.tsx`

- Render `<FullCalendar>` dengan:
  - `plugins`: `dayGridPlugin`, `interactionPlugin`
  - `initialView`: `'dayGridMonth'`
  - `headerToolbar`: prev/next, title, toggle month/week
  - `dayMaxEvents`: `2` (overflow jadi "+X more")
  - `moreLinkClick`: buka popover
  - `dateClick`: buka popover
- State: `popoverDate`, `popoverAnchor` untuk posisi popover
- Batas ukuran: ≤ 200 baris

### `DashboardCalendarPopover.tsx`

- Terima: `date`, `events: CalendarEvent[]`, `anchor`, `onClose`
- Render list event dengan colored left border (sesuai tipe)
- Tiap item tampilkan: label tipe, nama client, assignee (jika ada), jam (jika ada)
- Batas ukuran: ≤ 100 baris

---

## Batas Ukuran & SOLID

- `DashboardCalendar.tsx` ≤ 200 baris (S)
- `DashboardCalendarPopover.tsx` ≤ 100 baris (S)
- `useDashboardCalendarEvents.ts` ≤ 150 baris (S)
- Hook tidak panggil `pb.collection()` langsung — lewat hooks yang ada (D)
- Kalender tidak punya business logic — semua di hook (D)

---

## Hal yang Tidak Termasuk Scope

- Klik event individual untuk buka detail project/survey (bukan prioritas)
- Create/edit event dari kalender
- Filter per divisi di kalender
