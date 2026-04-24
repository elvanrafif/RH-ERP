# Design Spec: Employee Project Dashboard

**Date:** 2026-04-24
**Status:** Approved

---

## Overview

Saat ini semua user (termasuk employee biasa) melihat "Executive Overview" saat buka halaman Dashboard. Fitur ini mengubah Dashboard menjadi role-based: superadmin tetap melihat Executive Overview, sementara employee biasa langsung melihat daftar project aktif yang sedang mereka kerjakan ("Proyek Saya").

---

## Goals

- Employee hanya melihat project milik mereka sendiri (berdasarkan `assignee == currentUser.id`)
- Tidak ada perubahan pengalaman untuk superadmin
- Klik project membuka detail via modal yang sudah ada

---

## Non-Goals

- Tidak ada fitur edit project dari halaman ini
- Tidak ada filter/search (bisa ditambah di iterasi berikutnya)
- Civil project yang pakai `vendor` (bukan `assignee`) tidak ditampilkan di sini

---

## Architecture

### File Changes

| File | Status | Keterangan |
|---|---|---|
| `pages/Dashboard.tsx` | Modified | Jadi thin router: render `ExecutiveDashboard` atau `MyProjectsDashboard` berdasarkan role |
| `components/dashboard/ExecutiveDashboard.tsx` | New | Isi Dashboard.tsx saat ini dipindah ke sini |
| `components/dashboard/MyProjectsDashboard.tsx` | New | Tampilan "Proyek Saya" untuk employee |
| `hooks/useMyProjects.ts` | New | Fetch project aktif milik current user |

### Routing Logic

```tsx
// pages/Dashboard.tsx
export default function Dashboard() {
  const { isSuperAdmin } = useAuth()
  return isSuperAdmin ? <ExecutiveDashboard /> : <MyProjectsDashboard />
}
```

---

## Data Layer

### `useMyProjects` hook

- **Query key:** `['my-projects', userId]`
- **Filter:** `assignee = '{userId}' && status != 'done' && status != 'finish' && status != 'cancelled'`
- **Expand:** `client`
- **Sort:** `deadline` ascending (deadline terdekat di atas)
- **Returns:** `{ projects: Project[], isLoading: boolean }`

---

## UI: MyProjectsDashboard

### Header
- Judul: **"Proyek Saya"**
- Subtitle: `"N project aktif sedang berjalan"` (N = jumlah project)

### Stat Cards (3 kartu)
| Label | Value |
|---|---|
| Total Aktif | Jumlah total project yang di-fetch |
| Mendekati Deadline | Project dengan sisa deadline ≤ 7 hari |
| Dalam Proses | Project dengan status `progress` |

### Project List

Tabel dengan kolom:

| Kolom | Isi |
|---|---|
| Tipe | Badge berwarna: `Arsitektur` (biru), `Interior` (ungu) |
| Client | `project.expand.client.company_name` |
| Status | Badge: `Design` (kuning), `Progress` (hijau) |
| Deadline | "X hari lagi" — merah jika ≤ 7 hari, merah highlight row jika ≤ 7 hari |

- Diurutkan: deadline terdekat di atas
- Klik baris → buka `ProjectDetailsModal`
- Empty state jika tidak ada project aktif

### Deadline Display Rules
- `> 7 hari` → teks abu-abu normal: `"14 hari lagi"`
- `≤ 7 hari` → teks merah + background row merah muda: `"⚠ 3 hari lagi"`
- Sudah lewat → `"Terlambat X hari"` merah

---

## Component Breakdown

```
MyProjectsDashboard.tsx        (max ~150 baris)
├── useMyProjects()            hook data
├── useState(selectedProject)  local state untuk modal
├── StatCards                  sub-komponen atau inline (<50 baris)
├── ProjectListTable           sub-komponen list
│   └── ProjectListRow         per baris, clickable, onClick → setSelectedProject
└── ProjectDetailsModal        reuse dari existing
        props: project={selectedProject} open={!!selectedProject} onOpenChange
```

---

## Constraints

- Mengikuti SOLID: tidak ada `pb.collection()` langsung di komponen, semua via hook
- Tidak ada `any` di TypeScript
- Komponen tidak boleh melebihi 200 baris, hook tidak boleh melebihi 150 baris
- Reuse `ProjectDetailsModal` yang sudah ada — tidak buat modal baru
