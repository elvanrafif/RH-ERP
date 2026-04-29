# Design System & UI Architecture

Referensi lengkap komponen, pola, dan library UI yang digunakan di RH-ERP frontend.

---

## Tipografi

| Peran | Font | Weight | Penerapan |
|---|---|---|---|
| Body / UI | **Inter** | 400, 500, 600 | Semua teks default, label form, tabel |
| Heading | **Plus Jakarta Sans** | 600, 700, 800 | `h1`–`h6` |

Diload via Google Fonts di `src/index.css`. Fallback heading ke Inter.

---

## Warna & Tema

Tema bernama **Charcoal** — berbasis CSS custom properties dengan color space `oklch`.

| Token | Nilai | Deskripsi |
|---|---|---|
| `--background` | `oklch(1 0 0)` | Putih murni |
| `--foreground` | `oklch(0.14 0.005 285)` | Charcoal gelap |
| `--primary` | `oklch(0.32 0.008 250)` | Charcoal medium — tombol, ring, sidebar active |
| `--primary-foreground` | `oklch(0.985 0 0)` | Putih — teks di atas primary |
| `--muted` | `oklch(0.967 0.001 286)` | Abu sangat muda — background sekunder |
| `--muted-foreground` | `oklch(0.552 0.016 286)` | Abu medium — teks bantuan |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Merah — tombol hapus, error |
| `--border` | `oklch(0.91 0.004 286)` | Abu muda — garis border |
| `--radius` | `0.625rem` | Border radius default |

Dark mode didukung via class `.dark` (`@custom-variant dark (&:is(.dark *))`), tapi belum diaktifkan di UI.

---

## Library Utama

| Kategori | Library | Versi |
|---|---|---|
| UI primitives | `@radix-ui/*` | berbagai |
| Icon | `lucide-react` | ^0.562 |
| Styling | `tailwindcss` v4 + `tailwindcss-animate` | ^4.1 |
| Utility CSS | `clsx` + `tailwind-merge` (via `cn()`) | — |
| Animasi | `framer-motion` | ^12 |
| Data fetching | `@tanstack/react-query` | ^5 |
| Tabel | `@tanstack/react-table` | ^8 |
| Form | `react-hook-form` + `zod` + `@hookform/resolvers` | — |
| Toast | `sonner` | ^2 |
| Combobox/command palette | `cmdk` | ^1 |
| Drag & drop | `@hello-pangea/dnd` | ^18 |
| Charts | `recharts` | ^3 |
| Tanggal | `date-fns` | ^4 |
| Export gambar | `html-to-image` | — |
| Export PDF | `jspdf` | — |
| Print | `react-to-print` | — |
| QR code | `react-qr-code` | — |
| Routing | `react-router-dom` | v7 |
| Backend client | `pocketbase` | ^0.26 |

---

## Tabel

### Komponen

**`DataTable<TData, TValue>`** — `components/ui/data-table.tsx`

Wrapper generik di atas `@tanstack/react-table`. Terima `columns` (ColumnDef array) dan `data`. Mendukung sorting bawaan — sort state dikelola internal, ikon sort otomatis tampil di header kolom yang sortable.

```tsx
<DataTable columns={columns} data={projects} />
```

Styling tabel:
- Container: `rounded-md border bg-white shadow-sm`
- Scroll wrapper: `overflow-x-auto`, min-width tabel `1000px`
- Header row: `bg-slate-50/50`, header cell: `font-semibold text-slate-700`
- Data row: `hover:bg-slate-50/50`, cell padding `py-3`

### Definisi Kolom

Tiap halaman punya file `columns.tsx` (atau `columnsSipil.tsx`) yang mendefinisikan `ColumnDef[]`. Gunakan `accessorKey` untuk nilai langsung, `cell` untuk render kustom.

**Sorting per kolom:** Tambah `enableSorting: true` + `sortingFn` di definisi kolom untuk mengaktifkan sort. Header akan otomatis clickable dan tampil ikon `ArrowUpDown` / `ArrowUp` / `ArrowDown`. Contoh di `columnsSipil.tsx` (sort by `end_date`):

```ts
{
  id: 'contract_info',
  accessorFn: (row) => row.end_date ?? '',
  enableSorting: true,
  sortingFn: (rowA, rowB) => {
    const a = rowA.original.end_date ? new Date(rowA.original.end_date).getTime() : 0
    const b = rowB.original.end_date ? new Date(rowB.original.end_date).getTime() : 0
    return a - b
  },
  cell: ({ row }) => { ... }
}
```

### Pagination

**`TablePagination`** — `components/shared/TablePagination.tsx`

Prev/next button + label "Showing X of Y entries". Tidak render jika `totalPages <= 1`.

**`usePagination<T>(data, resetDeps, pageSize?)`** — `hooks/usePagination.ts`

Client-side pagination. Default page size 15. Auto-reset ke page 1 saat `resetDeps` berubah (biasanya search/filter state).

```tsx
const { page, setPage, totalPages, totalItems, paginatedData } = usePagination(
  filteredData,
  [searchTerm, filterStatus]
)
```

### Loading State

**`TableRowsSkeleton`** — render skeleton rows di dalam `<TableBody>`.

**`PageTableSkeleton`** — skeleton untuk seluruh halaman tabel (include search bar placeholder).

---

## Search Bar

Search bar diimplementasi inline (bukan komponen tersendiri) dengan pola yang konsisten di semua halaman.

```tsx
<div className="relative flex-1 sm:max-w-[240px]">
  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Search client..."
    className="pl-9 h-9 bg-white w-full"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
```

**Konvensi width:**
- `flex-1` — agar stretch di dalam toolbar
- `sm:max-w-[240px]` atau `md:max-w-xs` — wajib di semua toolbar agar tidak mendorong filter ke kanan
- Mobile (< sm/md): full width, filter turun ke bawah (wrap)

Search dilakukan client-side dengan `array.filter()` — tidak ada debounce (pakai `useDebounce` jika query server-side).

---

## Filter

### Select Filter

Komponen Radix `<Select>` height `h-9 bg-white shadow-sm`. Filter aktif ditandai dengan dot indicator:

```tsx
{filterValue !== 'all' && (
  <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
)}
```

Border aktif: `border-primary/50 ring-1 ring-primary/30 text-primary`.

### Toolbar Siap Pakai

**`DocumentToolbar`** — `components/filters/DocumentToolbar.tsx`

Dipakai di halaman Invoice dan Quotation. Props:
- `searchTerm` / `onSearchChange`
- `filterClient` / `onClientFilterChange` — daftar client di Select
- `typeFilter?` — optional Select tambahan (mis. status invoice)
- `hasActiveFilter` / `onResetFilter` — tampilkan tombol X reset

**`ProjectFilterBar`** — `components/projects/ProjectFilterBar.tsx`

Dipakai di semua halaman proyek. Props:
- `searchQuery` — filter by nama client
- `filterPic` — filter by PIC (user atau vendor tergantung `isCivil`)
- `filterVendor?` — hanya untuk interior
- `filterStatus` — `'all' | 'active' | 'finished'`
- `filterDeadline` — `'all' | 'near' | 'overdue'`

---

## Form

### Struktur

React Hook Form + Zod. Schema selalu di `lib/validations/`. Komponen form menggunakan `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>` dari `components/ui/form.tsx` (shadcn/ui).

### Input Numerik Kustom

**`NumberInput`** — `components/shared/NumberInput.tsx`

Input angka dengan:
- Format `id-ID` saat blur (separator titik ribuan)
- Stepper up/down di sisi kanan
- Support `min`, `max`, `step`, `disabled`

Dipakai untuk field nilai proyek, jumlah item, persentase termin.

### Combobox Client

**`ClientComboboxField`** — `components/forms/ClientComboboxField.tsx`

Combobox search client menggunakan `cmdk`. Wraps `<Popover>` + `<Command>`.

### Submit Button

**`FormSubmitButton`** — `components/shared/FormSubmitButton.tsx`

Tombol submit standar untuk semua form. Props: `isPending`, `label`, `className?`.

```tsx
<FormSubmitButton
  isPending={mutation.isPending}
  label={initialData ? 'Save Changes' : 'Add Client'}
/>
// roleForm — dengan border atas
<FormSubmitButton isPending={mutation.isPending} label="Save Role" className="border-t" />
```

`className` di-merge ke wrapper `div` (bukan ke `Button`) — cocok untuk tambah `border-t` atau spacing custom.

### Mutation

**`useFormMutation<TValues>`** — `hooks/useFormMutation.ts`

Generic create/update ke PocketBase dengan otomatis:
- Invalidate query setelah sukses
- `toast.error()` saat gagal

```tsx
const { mutate, isPending } = useFormMutation({
  collection: 'clients',
  queryKey: ['clients'],
  initialData: editingClient,    // null → create, object → update
  onSuccess: handleClose,
})
```

---

## Dialog & Modal

### FormDialog

**`FormDialog`** — `components/shared/FormDialog.tsx`

Wrapper `<Dialog>` standar untuk semua form CRUD.

```tsx
<FormDialog
  open={open}
  onOpenChange={setOpen}
  title="Edit Client"
  description="Ubah data klien"
  maxWidth="sm:max-w-[600px]"   // default 500px
  scrollable                      // tambah max-h + overflow-y-auto
>
  <ClientForm ... />
</FormDialog>
```

### DeleteConfirmDialog

**`DeleteConfirmDialog`** — `components/shared/DeleteConfirmDialog.tsx`

Radix `<AlertDialog>` untuk konfirmasi hapus. Tombol confirm merah `bg-red-600`. Support loading state dengan spinner.

---

## Komponen Shared Lainnya

### CrudPageShell

**`CrudPageShell`** — `components/shared/CrudPageShell.tsx`

Layout standar untuk semua halaman CRUD. Dipakai di ClientsPage, VendorsPage, ProspectsPage, UserManagement.

Props: `header`, `toolbar`, `table`, `dialogs?` — semua `ReactNode`.

```tsx
<CrudPageShell
  header={<PageHeader ... />}
  toolbar={<SearchInput ... />}
  table={<><ClientTable .../><TablePagination .../></>}
  dialogs={<><FormDialog .../><ClientDetailDialog .../></>}
/>
```

### EntityAvatar

**`EntityAvatar`** — `components/shared/EntityAvatar.tsx`

Avatar initials bulat untuk client/vendor. Props: `name`, `size?: 'sm' | 'md'` (default `'sm'`).

- `sm` → `h-8 w-8 text-xs` — untuk baris tabel
- `md` → `h-12 w-12 text-lg` — untuk header dialog

### ActiveBadge

**`ActiveBadge`** — `components/shared/ActiveBadge.tsx`

Badge status aktif/nonaktif vendor. Props: `isActive: boolean`.

- Active: `bg-emerald-50 text-emerald-700 border-emerald-200`
- Inactive: `bg-slate-100 text-slate-500 border-slate-200`

### DetailField

**`DetailField`** — `components/shared/DetailField.tsx`

Field display untuk detail dialog. Props: `label`, `value?`, `icon?`, `className?`.

Dua varian berdasarkan ada/tidaknya `icon`:
- **Dengan icon** (Client/VendorDetailDialog): `flex items-start gap-3` — icon di kiri, nilai di kanan
- **Tanpa icon** (ProspectDetailDialog): `label` di atas kecil, `value` di bawah

```tsx
// dengan icon
<DetailField label="Phone" value={client.phone}
  icon={<Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />} />

// tanpa icon
<DetailField label="Land Size" value="120 m²" />
```

### PageHeader

**`PageHeader`** — `components/shared/PageHeader.tsx`

Header standar tiap halaman. Props: `icon?`, `title`, `description?`, `action?` (slot kanan untuk tombol tambah).

### StatCard

**`StatCard`** — `components/shared/StatCard.tsx`

Card statistik kecil. Props: `icon`, `iconBg`, `label`, `value`, `urgent?`.

Saat `urgent=true`: background `bg-red-50/30`, label merah, icon pulse.

### EmptyState

**`EmptyState`** — `components/shared/EmptyState.tsx`

Tampilan saat data kosong. Props: `icon?` (default `FolderOpen`), `title`, `description?`, `action?`.

### RowActions

**`RowActions`** — `components/shared/RowActions.tsx`

Tombol `...` (MoreHorizontal) di tiap baris tabel yang membuka `<DropdownMenu>`. Tiap action: `{ label, icon, onClick, variant?, separator? }`. Variant `'destructive'` render teks merah.

### ChartSkeleton

**`ChartSkeleton`** — `components/shared/ChartSkeleton.tsx`

Skeleton placeholder saat chart loading.

### MonthYearPicker

**`MonthYearPicker`** — `components/shared/MonthYearPicker.tsx`

Picker bulan & tahun tanpa grid tanggal. Grid 3x4 bulan (Jan–Dec) dengan navigasi tahun. Props: `selected: Date | undefined`, `onSelect: (date: Date | undefined) => void`.

Dipakai di ProspectsPage untuk filter berdasarkan bulan created date. Dipakai bersama `<Popover>`:

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">...</Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <MonthYearPicker selected={selectedMonth} onSelect={handleMonthSelect} />
  </PopoverContent>
</Popover>
```

---

## CRUD Page State

**`useTableState<T>()`** — `hooks/useTableState.ts`

State standar untuk halaman CRUD: open form dialog, item sedang diedit, item sedang dilihat, search term.

```tsx
const {
  open, editing, viewing,
  searchTerm, setSearchTerm,
  handleCreate, handleEdit, handleView,
  handleCloseForm, handleCloseDetail,
} = useTableState<Client>()
```

---

## Toast

**Sonner** via `toast.success()` / `toast.error()`. Provider `<Toaster>` di `App.tsx`. Dipakai di semua mutation handler.

---

## Drag & Drop (Kanban)

**`@hello-pangea/dnd`** — `DragDropContext`, `Droppable`, `Draggable`. Dipakai di `ProjectKanban.tsx` untuk memindahkan status proyek.

---

## Charts

**Recharts** — dipakai di dashboard tabs:
- `WorkloadChart` — bar chart beban kerja per PIC
- `RevenuePieChart` — pie chart revenue
- `InvoiceRevenue` / `QuotationRevenue` — bar chart per periode

Semua chart wrap dalam `<ChartSkeleton>` saat loading.

---

## Guard Komponen

| Komponen | Lokasi | Fungsi |
|---|---|---|
| `<PermissionGuard require="...">` | `components/ui/PermissionGuard.tsx` | Render children hanya jika user punya permission |
| `<PermissionGuard requireAny={[...]}>` | sama | OR — salah satu permission cukup |
| `<SuperAdminGuard>` | `components/ui/SuperAdminGuard.tsx` | Render hanya untuk `isSuperAdmin` |
| `<ProtectedRoute>` | `components/auth/route.tsx` | Redirect ke login jika belum auth |
| `<PublicRoute>` | sama | Redirect ke dashboard jika sudah login |
