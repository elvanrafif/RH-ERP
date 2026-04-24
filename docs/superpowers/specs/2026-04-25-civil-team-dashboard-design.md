# Civil Team Dashboard — Design Spec

**Date:** 2026-04-25
**Status:** Approved

---

## Overview

Dashboard khusus untuk user dengan `division === 'sipil'` (DIVISION.CIVIL). Menggantikan tampilan "My Projects" standar dengan Gantt timeline yang menampilkan semua civil project aktif, dikelompokkan per vendor (PIC).

Ardin dan siapapun yang masuk divisi sipil di masa depan otomatis mendapatkan view ini. Tidak ada permission baru yang dibutuhkan.

---

## Routing

Di `Dashboard.tsx`, routing diperluas dari 2 menjadi 3 kondisi:

```
isSuperAdmin         → ExecutiveDashboard (tidak berubah)
division === 'sipil' → CivilTeamDashboard (baru)
else                 → MyProjectsDashboard (tidak berubah)
```

Cek: `user?.division === DIVISION.CIVIL`

---

## Data Layer

### Hook: `useCivilTeamProjects`

- **Query**: semua civil projects dengan status bukan `DONE_STATUSES`
- **Filter PocketBase**: `type = 'civil' && status != 'done' && status != 'finish' && status != 'cancelled'` (menggunakan `DONE_STATUSES` dari constant)
- **Expand**: `client, vendor`
- **Grouping**: dilakukan client-side, group by `vendor` ID
- **Return type**:

```typescript
interface VendorGroup {
  vendor: Vendor
  projects: Project[]
  hasOverdue: boolean
  hasNearDeadline: boolean
}

interface CivilTeamData {
  vendorGroups: VendorGroup[]
  totalProjects: number
  nearDeadlineCount: number
  overdueCount: number
}
```

- **Ordering**: vendor groups diurutkan — overdue dahulu, near deadline kedua, aman terakhir
- **Threshold deadline**: `DEADLINE_WARNING_DAYS.civil` (30 hari)

### Project date logic

- Tanggal yang dipakai: `end_date` (sama dengan `getProjectDeadlineDate` untuk civil)
- `start_date`: dipakai sebagai kiri bar; jika kosong, bar dimulai dari `end_date` (tampil sebagai milestone di ujung kanan)

---

## UI: `CivilTeamDashboard`

### Header Stats (3 kartu)

| Kartu | Icon | Value |
|---|---|---|
| Total Active | Briefcase | `totalProjects` |
| Near Deadline | AlertTriangle (merah) | `nearDeadlineCount` |
| Active Vendors | Users | `vendorGroups.length` |

### Gantt Chart

#### Rentang Waktu

- Default: **3 bulan** (bulan sebelumnya, bulan ini, bulan depan)
- Navigasi: tombol ‹ dan › menggeser 1 bulan per klik
- State navigasi: `offset` bulan dari hari ini (default 0)
- Garis pembatas bulan tampil di dalam timeline

#### Struktur baris

```
[Vendor Header — collapsible ▼]
  └ [Client row] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  └ [Client row]    ━━━━━━━━━━━━━━━━━━
```

- Vendor section: collapsible, default expanded
- Collapse state: local React state per vendor ID (`Record<string, boolean>`)
- Tiap project = 1 baris

#### Gantt Bar

- Warna berdasarkan urgency:
  - **Merah** (`bar-red`): overdue (end_date sudah lewat)
  - **Amber** (`bar-amber`): near deadline (≤ 30 hari)
  - **Hijau** (`bar-green`): aman (> 30 hari)
- Label di dalam bar: nama client + "· Xd left" atau "· Xd overdue"
- Bar yang melewati batas kiri rentang: dimulai dari tepi kiri dengan tanda `‹`
- Bar yang melewati batas kanan rentang: berakhir di tepi kanan dengan tanda `›`
- Project tanpa `start_date`: bar dimulai dari ujung kiri `end_date` saja (lebar minimal)
- Klik bar → buka `ProjectDetailsModal`

#### Today Line

- Garis vertikal merah tipis melintas semua baris
- Dot merah di atas garis (seperti di mockup)
- Posisi dihitung sebagai persentase dalam 3-bulan window

---

## Komponen

| Komponen | Path | Tanggung Jawab |
|---|---|---|
| `CivilTeamDashboard` | `components/dashboard/CivilTeamDashboard.tsx` | Komponen utama, stat cards, layout |
| `CivilGanttChart` | `components/dashboard/CivilGanttChart.tsx` | Gantt chart + navigasi bulan |
| `CivilVendorSection` | `components/dashboard/CivilVendorSection.tsx` | Satu vendor group (header + baris proyek) |
| `CivilGanttBar` | `components/dashboard/CivilGanttBar.tsx` | Satu bar proyek dalam timeline |
| `useCivilTeamProjects` | `hooks/useCivilTeamProjects.ts` | Data fetching + grouping |

Semua komponen baru, tidak memodifikasi komponen yang sudah ada kecuali `Dashboard.tsx` (tambah kondisi routing).

---

## Constraints

- Tidak ada `assignee` filter — civil projects tidak pakai field assignee
- Vendor tanpa nama ditampilkan sebagai "Unknown Vendor"
- Project tanpa vendor di-skip dari Gantt (edge case, tidak seharusnya terjadi)
- Mobile: horizontal scroll pada Gantt chart (overflow-x: auto)
