# CLAUDE.md — RH-ERP Codebase Guide

> Panduan ini wajib dibaca sebelum membuat atau memodifikasi kode.
> Dihasilkan dari analisis menyeluruh repo pada 2026-03-01.

---

## Ringkasan Proyek

**Stack:** React 19 + TypeScript + Vite | PocketBase | TanStack Query | Radix UI + Tailwind CSS 4 | React Hook Form + Zod | Recharts

**Entry point:** `frontend/src/main.tsx`
**Auth:** `AuthContext` di `frontend/src/contexts/AuthContext.tsx` — berisi RBAC penuh
**DB Client:** `frontend/src/lib/pocketbase.ts`

---

## Temuan Analisis

### File Terpanjang & Paling Kompleks

| File | Baris | Masalah Utama |
|------|-------|---------------|
| `pages/invoices/InvoiceDetailPage.tsx` | **707** | 9+ useState, logic perhitungan mixed UI, duplikat dengan QuotationEditor |
| `pages/projects/ProjectForm.tsx` | **564** | Conditional field rendering 3 tipe proyek, schema Zod inline |
| `pages/quotations/QuotationEditor.tsx` | **500** | ~60% mirip InvoiceDetailPage |
| `pages/projects/ProjectPageTemplate.tsx` | **480** | Filter logic + stats calculation mixed dengan UI |
| `pages/projects/ProjectKanban.tsx` | **479** | Drag-drop + permission check mixed |
| `pages/settings/users/components/UserForm.tsx` | **468** | Password logic mixed, schema inline |
| `components/dashboard/tabs/ResourceMonitoringTab.tsx` | **445** | Data aggregation + chart rendering mixed |
| `components/dashboard/tabs/InvoiceRevenue.tsx` | **397** | Chart + filter logic mixed |
| `components/layout/Sidebar.tsx` | **349** | Role-based nav terlalu panjang |

### Pola Duplikasi Kritis

**1. Document Editor (Invoice vs Quotation) — ~60% duplikat**
- ResizeObserver untuk A4 preview scaling
- `handleShareWA` — logika format nomor HP identik
- `toJpeg` export logic
- Header bar (save / download / share buttons)
- Unsaved changes detection

**2. Create Dialog — ~70% duplikat**
- `InvoiceCreateDialog.tsx` vs `QuotationCreateDialog.tsx`

**3. Filter & Search Bar**
- Berulang di `ProjectPageTemplate`, `InvoicesPage`, `QuotationsPage`

**4. Form Field Patterns**
- Repeated boilerplate di semua form pages

**5. Magic Numbers Tersebar**
- `800` (base width A4), `4` (overload threshold), `200000` / `180000` (harga default)

---

## Style Guide & Aturan Refactor

Semua kode baru dan perubahan wajib mengikuti aturan ini.

---

### 1. Single Responsibility Principle (SRP)

**Setiap file hanya boleh punya satu tanggung jawab.**

```
✅ BENAR
components/editors/DocumentEditorLayout.tsx  → hanya render layout editor
hooks/useDocumentExport.ts                   → hanya handle export ke gambar
lib/documents/sharing.ts                     → hanya logika share WhatsApp

❌ SALAH
pages/invoices/InvoiceDetailPage.tsx → render UI + kalkulasi + export + share + resize
```

**Ukuran file:**
- Komponen UI: maksimal **200 baris**
- Custom hook: maksimal **150 baris**
- Utility/helper: maksimal **100 baris**
- Jika melebihi batas → wajib dipecah

---

### 2. Reusable Components

**Komponen wajib dibuat reusable jika pola sama muncul 2+ kali.**

Struktur yang disepakati:

```
frontend/src/
├── components/
│   ├── ui/                    # shadcn/ui — jangan diubah
│   ├── layout/                # AppLayout, Sidebar
│   ├── editors/               # ← BARU: DocumentEditorLayout
│   ├── dialogs/               # ← BARU: CreateDocumentDialog, ConfirmDialog
│   ├── filters/               # ← BARU: DocumentFiltersBar, SearchInput
│   ├── charts/                # ← BARU: RevenueChart, WorkloadChart
│   ├── forms/                 # ← BARU: FormFieldWrapper, FormSelect
│   └── dashboard/
│       └── tabs/
```

**Cara mendefinisikan reusable component:**

```typescript
// ✅ Props eksplisit, tidak pakai any
interface DocumentFiltersBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters: FilterOption[]
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
  resultCount: number
}

// ✅ Komposisi over kondisional besar
// Gunakan children / render props untuk variasi, bukan if-else panjang
```

---

### 3. Custom Hooks untuk Logic

**Semua logic non-rendering harus dipindah ke custom hook.**

Lokasi: `frontend/src/hooks/`

Hooks yang sudah ada:
- `useDashboard.ts` — data dashboard
- `useRole.ts` — RBAC helper
- `useDebounce.ts` — debounce input
- `useSessionTimeout.ts` — session management

Hooks baru yang WAJIB dibuat saat refactor:

```typescript
// hooks/useDocumentExport.ts
// Tanggung jawab: konversi DOM ke JPEG, trigger download
export function useDocumentExport(ref: RefObject<HTMLDivElement>) {
  const exportToJpeg = async (filename: string) => { ... }
  return { exportToJpeg }
}

// hooks/useDocumentScaling.ts
// Tanggung jawab: A4 preview ResizeObserver
export function useDocumentScaling(containerRef: RefObject<HTMLDivElement>) {
  const [scale, setScale] = useState(1)
  // ResizeObserver logic
  return { scale }
}

// hooks/useUnsavedChanges.ts
// Tanggung jawab: detect perubahan form, prompt sebelum navigasi
export function useUnsavedChanges(isDirty: boolean) {
  // beforeunload listener, router blocker
}

// hooks/useWhatsAppShare.ts
// Tanggung jawab: format phone + buka WA link
export function useWhatsAppShare() {
  const shareViaWhatsApp = (phone: string, message: string) => { ... }
  return { shareViaWhatsApp }
}
```

**Aturan hooks:**
- Nama selalu `useXxx`
- Satu hook = satu tanggung jawab
- Tidak boleh ada API call + UI logic dalam satu hook
- Return object (bukan array) kecuali untuk state sederhana

---

### 4. Pemisahan UI dan Business Logic

**Business logic TIDAK boleh ada di dalam komponen React.**

```
frontend/src/
└── lib/
    ├── helpers.ts              # utilities umum (format tanggal, rupiah)
    ├── pocketbase.ts           # DB client
    ├── masking.ts              # input masking
    ├── constant.ts             # konstanta global
    ├── validations/            # semua Zod schema
    │   ├── client.ts           # ✅ sudah ada
    │   ├── user.ts             # ← BUAT: pindah dari UserForm.tsx
    │   ├── project.ts          # ← BUAT: pindah dari ProjectForm.tsx
    │   ├── invoice.ts          # ← BUAT
    │   └── quotation.ts        # ← BUAT
    ├── documents/              # ← BUAT
    │   ├── export.ts           # toJpeg logic
    │   └── sharing.ts          # WhatsApp share logic
    ├── projects/               # ← BUAT
    │   ├── filtering.ts        # filter PIC, search, status
    │   ├── statistics.ts       # hitung revenue, workload
    │   └── fieldConfig.ts      # konfigurasi field per tipe proyek
    ├── invoicing/              # ← BUAT
    │   └── termCalculation.ts  # kalkulasi terms, grand total
    └── formatting/             # ← BUAT
        ├── phone.ts            # format nomor HP
        └── currency.ts         # compact Rupiah formatting
```

**Aturan lib:**
```typescript
// ✅ Pure functions — tidak import React, tidak ada side effect
// lib/formatting/phone.ts
export function formatPhoneForWhatsApp(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.startsWith('0')) return '62' + clean.slice(1)
  if (clean.startsWith('8')) return '62' + clean
  return clean
}

// ✅ Konstanta dengan nama deskriptif
// lib/constant.ts
export const A4_BASE_WIDTH = 800
export const WORKLOAD_OVERLOAD_THRESHOLD = 4
export const DEFAULT_DOCUMENT_SCALE = 1
```

---

### 5. Validasi Schema

**Semua Zod schema harus di `lib/validations/`**

```typescript
// ❌ SALAH — inline di komponen
const schema = z.object({ name: z.string() })
function MyForm() { ... }

// ✅ BENAR — di file terpisah
// lib/validations/user.ts
export const userFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  // ...
})
export type UserFormValues = z.infer<typeof userFormSchema>
```

---

### 6. Konstanta & Magic Numbers

**Tidak boleh ada magic number atau string literal status tersebar.**

```typescript
// ✅ lib/constant.ts — tambahkan di sini
export const PROJECT_STATUS = {
  DESIGN: 'design',
  PROGRESS: 'progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const

export const PROJECT_TYPE = {
  ARSITEKTUR: 'arsitektur',
  SIPIL: 'sipil',
  INTERIOR: 'interior',
} as const

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  UNPAID: 'unpaid',
  PAID: 'paid',
} as const

export const A4_BASE_WIDTH = 800
export const WORKLOAD_OVERLOAD_THRESHOLD = 4
```

---

### 7. Struktur Komponen yang Disepakati

```typescript
// Urutan dalam file komponen:
// 1. Imports
// 2. Types/interfaces (lokal, jika tidak bisa dipindah ke types.ts)
// 3. Konstanta lokal (jika sangat spesifik komponen ini)
// 4. Komponen utama (dengan hooks di atas, render di bawah)
// 5. Sub-komponen kecil (jika dipakai hanya di file ini)

// Contoh:
interface InvoiceHeaderProps {
  invoiceNumber: string
  onSave: () => void
  onExport: () => void
  isSaving: boolean
}

export function InvoiceHeader({ invoiceNumber, onSave, onExport, isSaving }: InvoiceHeaderProps) {
  // hooks
  // handlers (minimal logic — panggil fungsi dari lib/)
  // return JSX
}
```

---

### 8. Error Handling & Toast

**Gunakan pattern konsisten untuk error handling:**

```typescript
// ✅ Selalu tangkap error dengan pesan yang informatif
try {
  await mutation.mutateAsync(data)
  toast.success('Data berhasil disimpan')
} catch (error) {
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
  toast.error(message)
}

// ❌ Jangan abaikan error
mutation.mutate(data) // tanpa error handling
```

---

### 9. TypeScript

```typescript
// ❌ Jangan pakai any
const data: any = response.data

// ✅ Gunakan tipe eksplisit atau unknown + type guard
const data: ApiResponse<Invoice> = response.data

// ✅ Tipe di types.ts untuk shared interfaces
// ✅ Tipe lokal di file komponen jika hanya dipakai di sana
// ✅ Selalu export type dari lib/validations/ menggunakan z.infer<>
```

### 10. Import Type

**Gunakan `import type` untuk import yang hanya dipakai sebagai tipe, bukan nilai.**

```typescript
// ❌ SALAH — import biasa untuk sesuatu yang hanya dipakai sebagai tipe
import { RefObject } from 'react'
import { Invoice } from '@/types'

// ✅ BENAR — pakai import type
import type { RefObject } from 'react'
import type { Invoice } from '@/types'

// ✅ Bisa mix dalam satu baris jika ada yang nilai dan ada yang tipe
import { useState } from 'react'
import type { FC, ReactNode } from 'react'
```

**Kapan pakai `import type`:**
- Interface dan type alias
- Generic type params (`RefObject<T>`, `ReactNode`, dll)
- Return type / parameter type dari fungsi
- Tipe dari Zod (`z.infer<typeof schema>`)

**Kapan TIDAK pakai `import type`:**
- Class yang di-instantiate (`new Foo()`)
- Enum yang dipakai sebagai nilai
- Fungsi atau konstanta yang benar-benar dipanggil

---

### 10. Prioritas Refactor

Lakukan refactor secara bertahap, mulai dari yang paling high-impact:

| Prioritas | Target | Action |
|-----------|--------|--------|
| 🔴 **1** | `InvoiceDetailPage.tsx` + `QuotationEditor.tsx` | Extract ke `useDocumentScaling`, `useDocumentExport`, `useWhatsAppShare`, buat `DocumentEditorLayout` |
| 🔴 **2** | Business logic di semua page | Pindah ke `lib/` folder yang sesuai |
| 🟡 **3** | `InvoiceCreateDialog` + `QuotationCreateDialog` | Buat `CreateDocumentDialog` reusable |
| 🟡 **4** | Schema Zod inline | Pindah ke `lib/validations/` |
| 🟢 **5** | Filter & search bars | Buat `DocumentFiltersBar` component |
| 🟢 **6** | Magic numbers & string literals | Konsolidasi ke `lib/constant.ts` |

---

## Checklist Sebelum Commit

- [ ] File tidak melebihi batas baris (komponen 200, hook 150, util 100)
- [ ] Tidak ada business logic di dalam komponen React
- [ ] Zod schema ada di `lib/validations/`
- [ ] Custom hook dipakai untuk logic yang berulang
- [ ] Tidak ada magic number — semua ada di `lib/constant.ts`
- [ ] Props interface eksplisit, tidak ada `any`
- [ ] Error handling dengan toast dan pesan informatif
- [ ] Status/type menggunakan konstanta, bukan string literal

---

*Dokumen ini wajib diperbarui jika ada perubahan arsitektur besar.*
