# Design Spec: Client Tracking Tab

**Date:** 2026-04-24
**Status:** Approved

---

## Overview

Tambah tab baru "Client Tracking" di Dashboard untuk tracking jumlah dan daftar client per semester, dikelompokkan berdasarkan tahun yang dipilih user.

---

## Layout & UI

- Tab baru bernama **Client Tracking** ditambahkan di `Dashboard.tsx` setelah tab "Document Revenue"
- Header tab berisi: dropdown filter tahun + tombol Export Excel (dummy, belum fungsional)
- Dua card bersebelahan: **Semester 1 (Jan–Jun)** di kiri, **Semester 2 (Jul–Des)** di kanan
- Di mobile, dua card otomatis stack vertikal
- Setiap card menampilkan: judul semester, rentang bulan, jumlah client, dan tabel project

### Kolom Tabel

| Kolom | Sumber |
|---|---|
| Nama Client | `project.expand.client.company_name` |
| Tipe Project | `project.type` (architecture / civil / interior) |
| Status | `project.status` |
| Nilai Kontrak | `project.contract_value` |
| Tanggal Acuan | lihat logika date field di bawah |

---

## Logika Date Field (Flexible)

Pengelompokan semester ditentukan berdasarkan mapping per tipe project:

```ts
const DATE_FIELD_BY_TYPE = {
  civil: 'end_date',
  architecture: 'deadline',
  interior: 'deadline',
} as const
```

Untuk mengubah logika di masa depan (misal civil pakai `start_date`), cukup ubah object ini — tidak perlu menyentuh logika grouping.

Project yang tidak memiliki date field yang dimaksud (nilai null/undefined) **dilewati** dan tidak masuk ke semester manapun.

---

## Filter Tahun

- Default: tahun saat ini
- Dropdown hanya menampilkan tahun yang memang memiliki data project
- `availableYears` dihitung dari semua project yang ada di database

---

## Data & Hook

**File:** `frontend/src/hooks/useClientTracking.ts`

```
useClientTracking(year: number)
  → { s1: Project[], s2: Project[], availableYears: number[], isLoading: boolean }
```

- Fetch semua projects dari PocketBase dengan `expand: 'client'`
- Query key: `['client-tracking']`
- Group ke S1 (bulan 1–6) atau S2 (bulan 7–12) berdasarkan date field per type
- `availableYears` dihitung dari union semua tahun yang muncul di date field masing-masing project

---

## Komponen

| File | Tanggung Jawab |
|---|---|
| `hooks/useClientTracking.ts` | Fetch, grouping, return s1/s2/availableYears |
| `components/dashboard/tabs/ClientTrackingTab.tsx` | Filter tahun state, layout dua card, tombol export dummy |
| `components/dashboard/tabs/SemesterCard.tsx` | Card reusable: terima `title`, `dateRange`, `projects`, `isLoading` — render tabel |

**Perubahan file existing:**
- `pages/Dashboard.tsx` — tambah satu `TabsTrigger` dan satu `TabsContent` saja

---

## Export Excel

Tombol "Export Excel" ditampilkan di header tab tapi **non-fungsional** (dummy) untuk saat ini. Implementasi export akan dibahas di iterasi berikutnya.

---

## Batasan & Asumsi

- Project tanpa date field yang relevan (null) tidak masuk ke semester manapun
- Satu project hanya masuk ke satu semester (berdasarkan satu date field saja)
- Tidak ada filter tipe project — semua tipe (architecture, civil, interior) digabung dalam satu tabel dengan kolom "Tipe"
