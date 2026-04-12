# Design Spec: Clients Page — Open Access + View Details

**Date:** 2026-04-12
**Branch:** fix/ui-copy-improvements
**Status:** Approved

---

## Overview

Halaman Clients sebelumnya hanya bisa diakses oleh superadmin via `Guard require="view_clients"`. Perubahan ini membuka akses ke semua role, menggunakan permission `manage_clients` untuk mengontrol aksi Edit, dan menambahkan fitur View Details (modal read-only) yang bisa diakses oleh semua role. Fitur Delete dihapus permanen karena terlalu riskan.

---

## Requirements

| Aksi | Siapa yang bisa |
|---|---|
| Lihat halaman Clients (sidebar + page) | Semua role |
| Add Client | Semua role |
| View Details | Semua role |
| Edit Client | Role dengan permission `manage_clients` |
| Delete Client | **Dihapus permanen** |

---

## Architecture

### Approach: Optional Callback Props (Pendekatan B)

`ClientsPage` yang bertanggung jawab atas auth. `ClientTable` hanya menerima callback via props — tidak tahu soal auth sama sekali. Ini mengikuti DIP dan SRP dari CLAUDE.md.

```
ClientsPage (owns auth logic)
  ├── can('manage_clients') → onEdit? (hanya dikirim jika punya permission)
  ├── onView → selalu dikirim
  └── Add Client button → selalu tampil

ClientTable
  ├── dropdown: "View Details" (selalu ada, karena onView selalu dikirim)
  ├── dropdown separator (hanya render jika onEdit ada)
  └── dropdown: "Edit" (hanya jika onEdit prop dikirim)
```

---

## File Changes

### 1. `SidebarNav.tsx`
- Hapus `<Guard require="view_clients">` yang membungkus Clients NavItem
- Clients NavItem menjadi visible untuk semua role tanpa kondisi

### 2. `roleForm.tsx`
- Hapus permission `{ id: 'view_clients', label: 'View Client Database' }` dari group `Master Data & Settings`
- Permission ini tidak lagi digunakan untuk gate apapun sehingga membingungkan admin
- Permission `manage_clients` tetap ada untuk mengontrol Edit

### 3. `ClientsPage.tsx`
- Import `useAuth` dan gunakan `can('manage_clients')`
- Hapus seluruh delete logic: `deleteId` state, `deleteMutation`, `DeleteConfirmDialog`, import `DeleteConfirmDialog`
- Hapus `handleDeleteClick` handler
- Kondisikan `onEdit` prop ke `ClientTable`: hanya dikirim jika `can('manage_clients')`
- Tambah `viewingClient` state (`Client | null`) dan `handleView` handler
- Selalu kirim `onView={handleView}` ke `ClientTable`
- Render `ClientDetailDialog` dengan `viewingClient`

### 4. `ClientTable.tsx`
- Ubah interface: `onEdit?` jadi optional (`onEdit?: (client: Client) => void`)
- Hapus `onDelete` prop sepenuhnya
- Tambah `onView: (client: Client) => void` (required)
- Hapus import `Trash2`
- Dropdown menu:
  - Item "View Details" selalu render (pakai ikon `Eye`)
  - `DropdownMenuSeparator` + item "Edit" hanya render jika `onEdit` prop ada
- Hapus `DropdownMenuSeparator` yang lama

### 5. `ClientDetailDialog.tsx` *(file baru)*
- Komponen standalone, tidak ada state internal selain yang diterima via props
- Props: `client: Client | null`, `open: boolean`, `onOpenChange: (open: boolean) => void`
- Menggunakan `Dialog`, `DialogContent`, `DialogHeader` dari shadcn/ui
- Layout:
  - Avatar lingkaran 48px dengan inisial 2 huruf dari `company_name` (`bg-primary/10 text-primary font-bold`)
  - `company_name` sebagai heading (`font-semibold text-lg`)
  - `contact_person` sebagai subheading (`text-muted-foreground text-sm`)
  - Separator
  - Tiga baris field dengan ikon Lucide: Email (`Mail`), Phone (`Phone`), Address (`MapPin`)
  - Nilai kosong tampil sebagai `—`
  - Tidak ada tombol aksi (read-only murni)

---

## What is Removed

- `deleteMutation` — `useMutation` untuk delete di `ClientsPage`
- `deleteId` state di `ClientsPage`
- `DeleteConfirmDialog` render di `ClientsPage`
- `handleDeleteClick` handler di `ClientsPage`
- `onDelete` prop dari `ClientTable` interface
- Item "Delete" dari dropdown `ClientTable`
- Import `Trash2` dari `ClientTable`
- Import `DeleteConfirmDialog` dari `ClientsPage`
- Permission `view_clients` dari `roleForm.tsx` PERMISSION_GROUPS

---

## SOLID Compliance

- **S** — `ClientDetailDialog` satu tanggung jawab: render detail read-only
- **O** — `ClientTable` di-extend via optional `onEdit` prop tanpa modifikasi kondisional di dalam
- **L** — Props interface jujur, tidak ada akses field yang tidak dideklarasikan
- **I** — `ClientTable` hanya terima prop yang benar-benar dipakai
- **D** — `ClientTable` tidak tahu auth; `ClientsPage` inject callback sesuai permission

---

## Out of Scope

- Pagination untuk daftar clients
- Export data clients
- Relasi clients ke projects di dalam modal detail
