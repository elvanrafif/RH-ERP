# Quotation Restricted Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah permission `manage_quotations` dan `manage_quotations_restricted` agar divisi sosmed bisa membuat dan mengedit quotation dengan akses terbatas (field & kolom finansial disembunyikan/disabled).

**Architecture:** Gunakan sistem permission yang sudah ada (`can()` dari `useAuth()`). Tambah 2 permission baru ke role management. `PermissionGuard` diperluas dengan prop `requireAny` untuk OR logic di route guard. Komponen table dan editor membaca permission langsung via `useAuth()`.

**Tech Stack:** React 19 + TypeScript, TanStack Query, `useAuth()` dari `AuthContext`, React Router `PermissionGuard`

---

## File Map

| File | Aksi | Keterangan |
|---|---|---|
| `frontend/src/components/ui/PermissionGuard.tsx` | Modify | Tambah prop `requireAny?: string[]` untuk OR logic |
| `frontend/src/App.tsx` | Modify | Ubah route guard quotations dari `view_revenue` ke `requireAny` |
| `frontend/src/pages/settings/roleManagement/roleForm.tsx` | Modify | Tambah group "Quotations" dengan 2 permission baru |
| `frontend/src/pages/quotations/components/QuotationTable.tsx` | Modify | Sembunyikan kolom Project Area & Total Amount untuk restricted user |
| `frontend/src/pages/quotations/QuotationEditor.tsx` | Modify | Disable field area/status/bank_details untuk restricted; fix bug address |

---

### Task 1: Extend PermissionGuard dengan `requireAny` prop

**File:** `frontend/src/components/ui/PermissionGuard.tsx`

- [ ] **Step 1: Buka file dan tambah prop `requireAny`**

Ganti seluruh isi file dengan:

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface PermissionGuardProps {
  require?: string
  requireAny?: string[]
}

export function PermissionGuard({ require, requireAny }: PermissionGuardProps) {
  const { can, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    )
  }

  const hasAccess = require
    ? can(require)
    : requireAny
      ? requireAny.some((p) => can(p))
      : false

  if (!hasAccess) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
```

- [ ] **Step 2: Verifikasi tidak ada TypeScript error**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep PermissionGuard
```

Expected: tidak ada output (tidak ada error).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/PermissionGuard.tsx
git commit -m "feat(auth): extend PermissionGuard with requireAny prop for OR logic"
```

---

### Task 2: Update route guard quotations di App.tsx

**File:** `frontend/src/App.tsx`

Saat ini quotations dilindungi oleh `<Route element={<PermissionGuard require="view_revenue" />}>` yang jadi satu group dengan invoices. Quotations perlu dipisah ke guard sendiri dengan `requireAny`.

- [ ] **Step 1: Pisahkan route quotations dari route invoices**

Cari blok ini di `App.tsx`:

```tsx
{/* --- COMMERCIAL (Quotations & Invoices) --- */}
<Route element={<PermissionGuard require="view_revenue" />}>
  <Route path="quotations" element={<QuotationsPage />} />
  <Route path="quotations/:id" element={<QuotationEditor />} />
  <Route path="invoices" element={<InvoicesPage />} />
  <Route path="/invoices:id" element={<InvoiceDetailPage />} />
</Route>
```

Ganti dengan:

```tsx
{/* --- COMMERCIAL (Quotations & Invoices) --- */}
<Route
  element={
    <PermissionGuard
      requireAny={['manage_quotations', 'manage_quotations_restricted']}
    />
  }
>
  <Route path="quotations" element={<QuotationsPage />} />
  <Route path="quotations/:id" element={<QuotationEditor />} />
</Route>

<Route element={<PermissionGuard require="view_revenue" />}>
  <Route path="invoices" element={<InvoicesPage />} />
  <Route path="/invoices:id" element={<InvoiceDetailPage />} />
</Route>
```

- [ ] **Step 2: Verifikasi TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep App
```

Expected: tidak ada output.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat(routing): separate quotation routes with own permission guard"
```

---

### Task 3: Tambah permission group Quotations di roleForm

**File:** `frontend/src/pages/settings/roleManagement/roleForm.tsx`

- [ ] **Step 1: Tambah group baru di `PERMISSION_GROUPS` array**

Cari baris penutup array `PERMISSION_GROUPS` (baris `]` setelah group "Master Data & Settings"). Tambahkan group baru **sebelum** closing `]`:

```tsx
  {
    title: 'Quotations',
    permissions: [
      {
        id: 'manage_quotations',
        label: 'Create/Edit Quotation (Full Access)',
      },
      {
        id: 'manage_quotations_restricted',
        label: 'Create/Edit Quotation (Restricted — hide financials)',
      },
    ],
  },
```

Posisi lengkapnya di dalam array setelah grup "Master Data & Settings":

```tsx
  {
    title: 'Master Data & Settings',
    permissions: [
      { id: 'manage_clients', label: 'Manage Clients (Edit)' },
      { id: 'manage_users', label: 'Manage Users & Roles (Superadmin)' },
    ],
  },
  // ← tambahkan di sini
  {
    title: 'Quotations',
    permissions: [
      {
        id: 'manage_quotations',
        label: 'Create/Edit Quotation (Full Access)',
      },
      {
        id: 'manage_quotations_restricted',
        label: 'Create/Edit Quotation (Restricted — hide financials)',
      },
    ],
  },
]
```

- [ ] **Step 2: Verifikasi TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep roleForm
```

Expected: tidak ada output.

- [ ] **Step 3: Verifikasi di browser**

Buka Settings → Roles → Edit salah satu role. Scroll ke bawah — harus muncul group "Quotations" dengan 2 checkbox.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/settings/roleManagement/roleForm.tsx
git commit -m "feat(roles): add Quotations permission group with manage_quotations and manage_quotations_restricted"
```

---

### Task 4: Sembunyikan kolom finansial di QuotationTable untuk restricted user

**File:** `frontend/src/pages/quotations/components/QuotationTable.tsx`

- [ ] **Step 1: Tambah import `useAuth`**

Di bagian import, tambahkan:

```tsx
import { useAuth } from '@/contexts/AuthContext'
```

- [ ] **Step 2: Tambah restricted check di dalam komponen**

Di dalam fungsi `QuotationTable`, tepat sebelum `return`, tambahkan:

```tsx
const { can } = useAuth()
const isRestricted = can('manage_quotations_restricted') && !can('manage_quotations')
```

- [ ] **Step 3: Kondisikan kolom Project Area dan Total Amount**

Cari `<TableHead>Project Area</TableHead>` dan `<TableHead className="text-right">Total Amount</TableHead>` — bungkus keduanya dengan kondisi:

```tsx
{!isRestricted && <TableHead>Project Area</TableHead>}
```

```tsx
{!isRestricted && <TableHead className="text-right">Total Amount</TableHead>}
```

Cari juga cell-nya di dalam `quotations?.map(...)` dan kondisikan juga:

```tsx
{!isRestricted && (
  <TableCell className="text-slate-600">
    {q.project_area || '-'} m2
  </TableCell>
)}
```

```tsx
{!isRestricted && (
  <TableCell className="text-right font-bold text-slate-700">
    {formatRupiah(q.total_price || 0)}
  </TableCell>
)}
```

Pastikan juga `colSpan` di EmptyState row menyesuaikan:

```tsx
<TableCell colSpan={isRestricted ? 5 : 7} className="h-60">
```

- [ ] **Step 4: Verifikasi TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep QuotationTable
```

Expected: tidak ada output.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/quotations/components/QuotationTable.tsx
git commit -m "feat(quotations): hide financial columns for restricted users"
```

---

### Task 5: Disable field di QuotationEditor + fix bug address

**File:** `frontend/src/pages/quotations/QuotationEditor.tsx`

Ada 2 hal yang dikerjakan di sini: (a) disable fields untuk restricted user, (b) fix bug address tidak update saat ganti client.

- [ ] **Step 1: Tambah import `useAuth`**

Di bagian import paling atas, tambahkan:

```tsx
import { useAuth } from '@/contexts/AuthContext'
```

- [ ] **Step 2: Tambah restricted check**

Di dalam fungsi `QuotationEditor`, tepat setelah semua `useState` dan sebelum `useEffect`, tambahkan:

```tsx
const { can } = useAuth()
const isRestricted = can('manage_quotations_restricted') && !can('manage_quotations')
```

- [ ] **Step 3: Fix bug address — update address saat ganti client**

Cari fungsi `handleClientChange` (sekitar baris 89):

```tsx
const handleClientChange = (newClientId: string) => {
  markAsDirty()
  setSelectedClientId(newClientId)
  const clientObj = clientsList?.find((c: any) => c.id === newClientId)
  if (clientObj) {
    setSelectedClientData(clientObj)
    if (!address) setAddress(clientObj.address)  // ← bug: hanya set jika kosong
  }
}
```

Ganti dengan:

```tsx
const handleClientChange = (newClientId: string) => {
  markAsDirty()
  setSelectedClientId(newClientId)
  const clientObj = clientsList?.find((c: any) => c.id === newClientId)
  if (clientObj) {
    setSelectedClientData(clientObj)
    setAddress(clientObj.address || '')  // ← selalu update ke alamat client baru
  }
}
```

- [ ] **Step 4: Disable field Status**

Cari `<Select value={status} onValueChange={...}>` untuk field Status. Tambahkan prop `disabled={isRestricted}` ke `<Select>`:

```tsx
<Select
  value={status}
  disabled={isRestricted}
  onValueChange={(val) => {
    setStatus(val)
    markAsDirty()
  }}
>
```

- [ ] **Step 5: Disable field Area (m²)**

Cari `<NumberInput value={projectArea} ...>`. Tambahkan prop `disabled={isRestricted}`:

```tsx
<NumberInput
  value={projectArea}
  onChange={(val) => {
    setProjectArea(val)
    markAsDirty()
  }}
  step={1}
  min={0}
  placeholder="0"
  disabled={isRestricted}
/>
```

- [ ] **Step 6: Disable field Payment Information (bank details)**

Cari `<Textarea value={bankDetails} ...>` di section "Payment Information (PDF Footer)". Tambahkan prop `disabled={isRestricted}`:

```tsx
<Textarea
  value={bankDetails}
  onChange={(e) => {
    setBankDetails(e.target.value)
    markAsDirty()
  }}
  className="text-xs min-h-[60px] resize-none"
  disabled={isRestricted}
/>
```

- [ ] **Step 7: Verifikasi komponen `NumberInput` mendukung prop `disabled`**

```bash
cat frontend/src/components/shared/NumberInput.tsx | grep disabled
```

Jika tidak ada `disabled` di interface/props — buka file tersebut dan tambahkan `disabled?: boolean` ke props interface dan pass ke elemen `<input>` di dalamnya.

- [ ] **Step 8: Verifikasi TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep QuotationEditor
```

Expected: tidak ada output.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/pages/quotations/QuotationEditor.tsx frontend/src/components/shared/NumberInput.tsx
git commit -m "feat(quotations): disable restricted fields for sosmed role; fix address auto-fill on client change"
```

---

### Task 6: Verifikasi manual di browser

- [ ] **Step 1: Jalankan dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Test sebagai superadmin**

Login sebagai superadmin. Buka `/quotations`:
- Harus muncul semua kolom: No. Quotation, Client, Project Area, Status, Total Amount
- Buka salah satu quotation — semua field harus editable

- [ ] **Step 3: Assign permission ke role sosmed**

Buka Settings → Roles → Edit role sosmed. Centang `manage_quotations_restricted`. Simpan.

- [ ] **Step 4: Test sebagai user sosmed**

Login sebagai user dengan role sosmed. Buka `/quotations`:
- Kolom **Project Area** tidak muncul
- Kolom **Total Amount** tidak muncul
- Buka salah satu quotation:
  - Field **Status** → disabled (tidak bisa diklik)
  - Field **Area (m²)** → disabled
  - Field **Payment Information** textarea → disabled
  - Field **Price / m²** → tetap bisa diedit
  - Field **Client**, **Address**, **Quotation Number** → tetap bisa diedit

- [ ] **Step 5: Test bug fix address**

Di editor, ganti client ke client lain yang punya alamat berbeda. Address textarea harus otomatis berubah ke alamat client baru.

- [ ] **Step 6: Test route guard**

Login sebagai user yang tidak punya `manage_quotations` maupun `manage_quotations_restricted`. Akses `/quotations` langsung — harus redirect ke `/`.
