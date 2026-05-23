# Design Spec: Project–Invoice Link & Revenue Widget

**Date:** 2026-05-23
**Status:** Approved

---

## Overview

Link setiap project ke satu invoice secara opsional, lalu tampilkan dua angka revenue di stats bar halaman project: **Realized Revenue** (termin yang sudah dibayar) dan **Potential Revenue** (total kontrak invoice). Linking dilakukan dari project form; invoice detail hanya menampilkan informasi project yang ter-link (read-only).

---

## Goals

- 1 project dapat dihubungkan ke 1 invoice (opsional, bisa diisi belakangan oleh admin)
- Stats bar halaman project menampilkan Realized + Potential Revenue (superadmin only)
- Invoice detail menampilkan project mana yang menggunakan invoice tersebut (informasi saja)

---

## Non-Goals

- Linking dari sisi invoice (satu arah: dari project form saja)
- Wajib mengisi invoice saat buat project
- Support >1 invoice per project

---

## Schema Change

**Collection: `projects`**

Tambah satu field baru:

| Field | Type | Required | Max Select |
|---|---|---|---|
| `invoice_id` | Relation → `invoices` | No | 1 |

Tidak ada migration data — field ini null untuk semua project existing. Admin mengisi manual secara bertahap.

**Yang harus dilakukan di PocketBase admin panel:**
1. Buka collection `projects`
2. Klik "New field" → pilih type **Relation**
3. Field name: `invoice_id`
4. Target collection: `invoices`
5. Max select: `1`
6. Required: No
7. Save

---

## Data Layer

### Hook: `useProjectInvoiceStats`

**Lokasi:** `frontend/src/hooks/useProjectInvoiceStats.ts`

**Input:** `projectType: 'architecture' | 'civil' | 'interior'`

**Cara kerja:**
- Fetch semua project aktif bertipe tersebut yang memiliki `invoice_id` terisi, dengan `expand: 'invoice_id'`
- Dari data expand, hitung dua angka:
  - **Potential Revenue** = sum `expand.invoice_id.total_amount` dari semua project yang ter-link
  - **Realization Revenue** = dari `expand.invoice_id.items[]`, sum `amount` per termin yang memenuhi **kedua** kondisi: `status === 'Success'` AND `paymentDate !== ''`

**Output:** `{ potentialRevenue: number, realizationRevenue: number, isLoading: boolean }`

**Mapping `projectType` → invoice `type`:**
| projectType | invoice type |
|---|---|
| `architecture` | `design` |
| `civil` | `sipil` |
| `interior` | `interior` |

---

## UI Changes

### 1. Stats Bar — `ProjectPageTemplate.tsx`

Card "Potential Revenue" yang ada sekarang diganti dengan card "Project Revenue" yang menampilkan dua baris:

```
┌─────────────────────────────────────────────┐
│ 💰 PROJECT REVENUE                          │
│                                             │
│ Realized        Rp 45.000.000               │
│ Potential       Rp 230.000.000              │
│                                             │
│ From linked invoices on active projects.    │
└─────────────────────────────────────────────┘
```

- "Realized" ditampilkan dengan warna emerald
- "Potential" ditampilkan dengan warna slate
- Jika tidak ada invoice ter-link, kedua nilai tampil `Rp 0`
- Tetap hanya visible untuk `isSuperAdmin`
- Data dari hook `useProjectInvoiceStats`

### 2. Project Form — `ProjectForm.tsx`

Tambah field **"Linked Invoice"** di bagian bawah form (sebelum tombol submit):

- Komponen: combobox / select
- Fetch: semua invoices yang `type` sesuai dengan `projectType` form ini
- Display label per option: `{invoice_number} — {client_name}`
- Ada pilihan "None" untuk tidak menghubungkan invoice
- Saat edit project yang sudah punya `invoice_id`, field ini pre-filled
- Value yang disimpan: `invoice_id` (string ID) atau `null`

### 3. Invoice Detail Page — `InvoiceDetailPage.tsx`

Tambah satu baris info read-only di area header/info invoice:

- Label: **"Linked Project"**
- Value: nama client dari project yang ter-link (dari reverse query: cari project dengan `invoice_id = {current invoice id}`)
- Jika tidak ada project yang ter-link: tampilkan `—`
- Tidak ada aksi (bukan input, bukan tombol)

---

## Error Handling

- Jika fetch invoices di project form gagal: combobox disable dengan placeholder "Failed to load invoices"
- Jika reverse query di invoice detail gagal: tampilkan `—` (silent fallback, tidak perlu toast)
- Jika `useProjectInvoiceStats` gagal: widget tampilkan `Rp 0` untuk kedua nilai

---

## Constraints

- Realization dihitung **strict**: termin harus `status === 'Success'` DAN `paymentDate` tidak kosong — salah satu saja tidak cukup
- Invoice yang ter-link ke project yang sedang "hold" atau non-aktif tetap dihitung dalam widget (widget hanya filter project aktif saat fetch)
- Linking opsional sepenuhnya — tidak ada validasi yang memblokir save project tanpa invoice
