# Prospect Client Page — Design Spec

**Date:** 2026-04-13
**Branch:** feat/vendors-page
**Status:** Approved

---

## Overview

Memindahkan data prospect client dari Instagram (sebelumnya Google Sheets) ke dalam database sebagai halaman baru di RH-ERP. Halaman ini hanya bisa diakses oleh admin sosmed dan superadmin.

---

## Database Schema

Collection: `prospects` (sudah dibuat di PocketBase)

| Field | PocketBase Type | Notes |
|---|---|---|
| `instagram` | Plain text | Instagram handle prospect |
| `client_name` | Plain text | |
| `phone` | Plain text | |
| `address` | Plain text | |
| `land_size` | Number | m² |
| `needs` | JSON | Array: `["Design", "Build"]` |
| `floor` | Select | `1`, `1.5`, `2`, `2.5`, `3`, `3.5`, `4`, `4.5`, `5` |
| `renovation_type` | Select | `new build`, `total renovation` |
| `status` | Select | `waiting for online schedule` |
| `notes` | Plain text | |
| `meeting_schedule` | Datetime | Superadmin only (field shown but disabled for non-superadmin) |
| `confirmation` | Plain text | |
| `quotation` | Select | `design`, `civil` |
| `survey_schedule` | Datetime | |
| `result` | Plain text | |
| `created` | Autodate | Create |
| `updated` | Autodate | Create/Update |

---

## Access Control

- **Route guard:** visible untuk `isSuperAdmin || can("manage_prospects")`
- **Permission:** `manage_prospects` — di-assign ke role admin sosmed via Role Management
- **Field `meeting_schedule`:** selalu ditampilkan di form, tapi **disabled** jika bukan superadmin
- Semua field lain: bisa diisi oleh admin sosmed maupun superadmin

---

## Page Structure

**Route:** `/prospects`
**Sidebar:** Section "Management", di bawah Clients

### Table Columns

`#` | `Instagram` | `Client Name` | `Phone` | `Status` | `Needs` | `Meeting Schedule` | `Survey Schedule` | `Result` | Actions (view, edit)

### Toolbar
- Search bar: search by `client_name`, `instagram`, `phone`
- Button "Add Prospect" (hanya jika punya permission)

### Detail Dialog
- Buka saat klik row / tombol view
- Tampilkan semua field lengkap dalam read-only layout

### Form Dialog (Create / Edit)
- Semua field kecuali `meeting_schedule` bisa diisi admin sosmed
- Field `meeting_schedule` selalu tampil tapi disabled untuk non-superadmin
- Pagination: 15 rows per page (ikut pola VendorsPage)

---

## File Structure

```
frontend/src/
├── types.ts                              + interface Prospect
├── lib/
│   ├── constant.ts                       + PROSPECT_STATUS, FLOOR_OPTIONS, NEEDS_OPTIONS,
│   │                                       RENOVATION_TYPE_OPTIONS, QUOTATION_OPTIONS
│   └── validations/
│       └── prospect.ts                   + Zod schema (baru)
├── hooks/
│   └── useProspects.ts                   + fetch, create, update, delete
└── pages/
    └── prospects/
        ├── ProspectsPage.tsx             + page utama
        ├── ProspectTable.tsx             + table component
        ├── ProspectForm.tsx              + form create/edit
        └── ProspectDetailDialog.tsx      + detail view dialog
```

**Files yang diupdate:**
- `App.tsx` — tambah route `/prospects`
- `SidebarNav.tsx` — tambah nav item di section Management
- `types.ts` — tambah `Prospect` interface

---

## Constants (lib/constant.ts)

```ts
export const PROSPECT_STATUS = {
  WAITING: 'waiting for online schedule',
} as const

export const FLOOR_OPTIONS = ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5']
export const NEEDS_OPTIONS = ['Design', 'Build']
export const RENOVATION_TYPE_OPTIONS = ['new build', 'total renovation']
export const QUOTATION_OPTIONS = ['design', 'civil']
```

---

## Decisions

- **No convert-to-client feature** — manual saja untuk saat ini
- **No filter** — cukup search bar untuk saat ini
- **UI pattern:** mengikuti VendorsPage (table + form dialog + detail dialog)
- **Pagination:** 15 rows per page
