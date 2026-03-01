# CLAUDE.md — RH-ERP Codebase Guide

> Panduan ini wajib dibaca sebelum membuat atau memodifikasi kode.
> Terakhir diperbarui: 2026-03-02

---

## Ringkasan Proyek

**Stack:** React 19 + TypeScript + Vite | PocketBase | TanStack Query | Radix UI + Tailwind CSS 4 | React Hook Form + Zod | Recharts

**Entry point:** `frontend/src/main.tsx`
**Auth:** `AuthContext` di `frontend/src/contexts/AuthContext.tsx` — berisi RBAC penuh
**DB Client:** `frontend/src/lib/pocketbase.ts`

---

## Arsitektur Saat Ini

```
frontend/src/
├── components/
│   ├── ui/                    # shadcn/ui — jangan diubah
│   ├── layout/                # AppLayout, Sidebar
│   ├── editors/               # DocumentEditorLayout
│   ├── dialogs/               # CreateDocumentDialog, DeleteConfirmDialog
│   ├── filters/               # DocumentToolbar
│   ├── forms/                 # ClientComboboxField
│   ├── shared/                # EmptyState, FormDialog, LoadingSpinner, PageHeader, StatCard, TablePagination
│   └── dashboard/tabs/        # WorkloadChart, RevenuePieChart, TopInvoicesList, TopQuotationsList
├── hooks/                     # Custom hooks — satu hook satu tanggung jawab
├── lib/
│   ├── helpers.ts             # Format tanggal, rupiah, avatar
│   ├── constant.ts            # Semua konstanta global
│   ├── validations/           # Zod schemas (client, user, project, role)
│   ├── invoicing/             # dateFilter, termCalculation, revenueStats, quotationStats
│   ├── projects/              # statistics, permissions
│   └── formatting/            # currency
└── pages/                     # Halaman — hanya render, tidak ada business logic
```

---

## Prinsip SOLID

Referensi: [DigitalOcean — SOLID Principles](https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)

Semua kode baru dan perubahan wajib mengikuti kelima prinsip ini.

---

### 1. S — Single Responsibility Principle

> *"A class should have only one reason to change."*

**Setiap file hanya boleh punya satu tanggung jawab.**

```
✅ BENAR
components/editors/DocumentEditorLayout.tsx  → hanya render layout editor
hooks/useDocumentExport.ts                   → hanya handle export ke gambar
lib/invoicing/termCalculation.ts             → hanya kalkulasi termin pembayaran

❌ SALAH
pages/invoices/InvoiceDetailPage.tsx → render UI + kalkulasi + export + share + resize
```

**Ukuran file sebagai indikator SRP:**
- Komponen UI: maksimal **200 baris**
- Custom hook: maksimal **150 baris**
- Utility/helper: maksimal **100 baris**
- Jika melebihi batas → pasti ada lebih dari satu tanggung jawab → wajib dipecah

---

### 2. O — Open/Closed Principle

> *"Software entities should be open for extension, but closed for modification."*

**Tambah fitur baru dengan props/komposisi — jangan ubah komponen yang sudah jalan.**

```typescript
// ❌ SALAH — memodifikasi komponen lama setiap ada tipe baru
export function DocumentToolbar({ isInvoice }: { isInvoice: boolean }) {
  if (isInvoice) {
    return <> ... type filter ... client filter ... </>
  }
  return <> ... client filter saja ... </>
}

// ✅ BENAR — extend lewat props opsional, komponen asal tidak berubah
// components/filters/DocumentToolbar.tsx
interface DocumentToolbarProps {
  typeFilter?: TypeFilterConfig  // opsional — QuotationToolbar tidak kirim ini
  filterClient: string
  clients: Client[]
  // ...
}
export function DocumentToolbar({ typeFilter, ...rest }: DocumentToolbarProps) {
  return (
    <>
      {typeFilter && <TypeSelect config={typeFilter} />}
      <ClientSelect {...rest} />
    </>
  )
}

// InvoiceToolbar — extend dengan typeFilter
<DocumentToolbar typeFilter={{ value, onChange, options }} ... />

// QuotationToolbar — pakai tanpa typeFilter
<DocumentToolbar ... />
```

**Aturan:**
- Gunakan **props opsional** untuk variasi perilaku, bukan `if (isXxx)`
- Gunakan **komposisi** (`children`, render props) untuk variasi layout
- Jangan ubah komponen shared hanya karena satu consumer perlu sesuatu yang spesifik — buat wrapper

---

### 3. L — Liskov Substitution Principle

> *"Subtypes must be substitutable for their base types without altering program correctness."*

**Dalam konteks React + TypeScript: komponen/tipe turunan harus memenuhi kontrak yang sama dengan yang digantikannya.**

```typescript
// ❌ SALAH — props interface yang lebih spesifik merusak substitusi
interface BaseClient { id: string; company_name: string }
interface DetailedClient extends BaseClient { phone: string; address: string }

// Komponen ini menerima BaseClient tapi ternyata mengakses phone → runtime error
function ClientBadge({ client }: { client: BaseClient }) {
  return <span>{(client as any).phone}</span> // ← melanggar LSP
}

// ✅ BENAR — tipe harus jujur dengan apa yang dipakai
function ClientBadge({ client }: { client: Pick<Client, 'id' | 'company_name'> }) {
  return <span>{client.company_name}</span>
}

// ✅ BENAR — gunakan tipe yang tepat jika butuh field lebih
function ClientCard({ client }: { client: DetailedClient }) {
  return <span>{client.phone}</span>
}
```

**Aturan:**
- Props interface harus jujur — jangan declare `BaseType` tapi akses field yang tidak ada di sana
- Gunakan `Pick<T, 'field1' | 'field2'>` untuk props yang hanya butuh sebagian field
- Jangan cast `as any` untuk mengakses property — perbaiki tipenya

---

### 4. I — Interface Segregation Principle

> *"Clients should not be forced to depend on interfaces they do not use."*

**Jangan kirim objek besar jika komponen hanya butuh sebagian field.**

```typescript
// ❌ SALAH — komponen kecil dipaksa tahu seluruh struktur Project
function ProjectBadge({ project }: { project: Project }) {
  return <Badge>{project.type}</Badge>  // hanya butuh 'type', tapi dapat seluruh Project
}

// ✅ BENAR — props hanya apa yang dibutuhkan
function ProjectBadge({ type }: { type: Project['type'] }) {
  return <Badge>{type}</Badge>
}

// ❌ SALAH — satu hook besar yang return banyak hal tidak terkait
function usePageData() {
  return { invoices, clients, projects, users, roles }  // consumer terpaksa ambil semua
}

// ✅ BENAR — hook terpisah per concern
function useInvoices() { return { invoices, isLoading } }
function useClients() { return { clients, isLoading } }
```

**Aturan:**
- Props interface setiap komponen hanya boleh berisi field yang benar-benar dirender
- Hook hanya return state/fungsi yang dipakai oleh konsumernya
- Gunakan `Pick<T, ...>` atau type inline daripada pass seluruh object
- Jangan buat "god hook" yang mengurus banyak domain sekaligus

---

### 5. D — Dependency Inversion Principle

> *"High-level modules should not depend on low-level modules. Both should depend on abstractions."*

**Komponen tidak boleh tahu dari mana data berasal — data masuk lewat props atau hook.**

```typescript
// ❌ SALAH — komponen tinggi langsung panggil PocketBase (konkret)
function InvoiceCard() {
  const [invoice, setInvoice] = useState(null)
  useEffect(() => {
    pb.collection('invoices').getOne(id).then(setInvoice)  // ← tight coupling ke PocketBase
  }, [id])
  return <div>{invoice?.invoice_number}</div>
}

// ✅ BENAR — komponen bergantung pada abstraksi (hook), bukan implementasi
// hooks/useInvoices.ts — abstraksi layer PocketBase
export function useInvoices() {
  return useQuery({ queryFn: () => pb.collection('invoices').getFullList() })
}

// InvoiceCard hanya tahu "ada data invoice", tidak tahu dari mana
function InvoiceCard({ invoice }: { invoice: Invoice }) {
  return <div>{invoice.invoice_number}</div>
}

// ❌ SALAH — komponen layout tahu cara export dokumen (detail implementasi)
function DocumentEditorLayout() {
  const exportToJpeg = async () => {
    const canvas = await toJpeg(ref.current)  // ← langsung akses implementasi
    // ...
  }
}

// ✅ BENAR — layout hanya tahu ada callback, implementasi di luar
function DocumentEditorLayout({ onDownload }: { onDownload: () => void }) {
  return <Button onClick={onDownload}>Download</Button>
}

// Parent inject implementasinya
const { exportToJpeg } = useDocumentExport(ref)
<DocumentEditorLayout onDownload={() => exportToJpeg('invoice')} />
```

**Aturan:**
- Komponen UI tidak boleh memanggil `pb.collection()` langsung — harus lewat hook
- Komponen presentation menerima data via props, bukan fetch sendiri
- Inject callback (`onSave`, `onDelete`, `onExport`) dari parent — jangan hardcode di dalam komponen
- Lapisan: `Page → Hook → lib/` (page tidak tahu PocketBase, hook tidak tahu UI)

---

## Aturan Tambahan

### Reusable Components

**Komponen wajib dibuat reusable jika pola sama muncul 2+ kali.**

```typescript
// ✅ Props eksplisit, tidak pakai any
interface DocumentToolbarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  clients: { id: string; company_name: string }[]
  hasActiveFilter: boolean
  onResetFilter: () => void
}
```

### Custom Hooks

**Semua logic non-rendering harus di custom hook.**

- Nama selalu `useXxx`
- Satu hook = satu tanggung jawab (ISP + SRP)
- Tidak boleh ada API call + UI state dalam satu hook
- Return object (bukan array) kecuali state sederhana

Hooks yang tersedia: `useInvoices`, `useQuotations`, `useProjects`, `useClients`, `useUsers`, `useRoles`, `useProfile`, `useUserManagement`, `useProjectFilters`, `useInvoiceFilters`, `useQuotationFilters`, `useDateRangeFilter`, `useInvoiceRevenue`, `useQuotationRevenue`, `useWorkloadData`, `useDocumentScaling`, `useDocumentExport`, `useWhatsAppShare`, `useUnsavedChanges`, `useDebounce`, `useRole`, `useSessionTimeout`

### Validasi Schema

**Semua Zod schema harus di `lib/validations/`**

```typescript
// ❌ SALAH — inline di komponen
const schema = z.object({ name: z.string() })

// ✅ BENAR — lib/validations/user.ts
export const userFormSchema = z.object({ ... })
export type UserFormValues = z.infer<typeof userFormSchema>
```

### Konstanta & Magic Numbers

**Tidak boleh ada magic number atau string literal status tersebar.**

```typescript
// ❌ SALAH
if (file.size > 5 * 1024 * 1024) { ... }
if (project.type === 'arsitektur') { ... }

// ✅ BENAR — lib/constant.ts
if (file.size > MAX_AVATAR_SIZE_BYTES) { ... }
if (project.type === DIVISION.ARCHITECTURE) { ... }
```

### Struktur File Komponen

```typescript
// Urutan dalam file:
// 1. Imports
// 2. Types/interfaces (lokal)
// 3. Konstanta lokal
// 4. Komponen utama (hooks di atas, JSX di bawah)
// 5. Sub-komponen kecil (hanya jika dipakai di file ini saja)
```

### Error Handling

```typescript
// ✅ Selalu tangkap dengan pesan informatif
try {
  await mutation.mutateAsync(data)
  toast.success('Data berhasil disimpan')
} catch (error) {
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
  toast.error(message)
}
```

### TypeScript & Import Type

```typescript
// ❌ Jangan pakai any
const data: any = response.data

// ✅ Tipe eksplisit atau unknown + type guard
const data: ApiResponse<Invoice> = response.data

// ✅ Gunakan import type untuk tipe yang tidak dipakai sebagai nilai
import type { RefObject } from 'react'
import type { Invoice } from '@/types'
```

---

## Checklist Sebelum Commit

- [ ] **S** — File tidak melebihi batas baris (komponen 200, hook 150, util 100)
- [ ] **S** — Tidak ada business logic di dalam komponen React
- [ ] **O** — Fitur baru ditambah lewat props/komposisi, bukan modifikasi komponen lama
- [ ] **L** — Props interface jujur — tidak ada akses field yang tidak dideklarasikan
- [ ] **I** — Props hanya berisi field yang benar-benar dipakai komponen itu
- [ ] **D** — Komponen tidak memanggil `pb.collection()` langsung — lewat hook
- [ ] Zod schema ada di `lib/validations/`
- [ ] Tidak ada magic number — semua ada di `lib/constant.ts`
- [ ] Props interface eksplisit, tidak ada `any`
- [ ] Error handling dengan toast dan pesan informatif
- [ ] `import type` untuk import yang hanya dipakai sebagai tipe

---

*Dokumen ini wajib diperbarui jika ada perubahan arsitektur besar.*
