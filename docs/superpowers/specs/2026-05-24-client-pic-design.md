# Design Spec: Client PIC (Person In Charge)

> Created: 2026-05-24

## Overview

Tambah relasi many-to-many antara `clients` dan `users` — seorang client bisa diasosiasikan dengan beberapa user sebagai PIC. Tujuannya informatif: tracking siapa yang berhubungan dengan client tersebut.

PocketBase field `pic_users` (relation, multi, pointing ke `users`) sudah ditambahkan di collection `clients`.

---

## Data & Types

### `types.ts` — Update `Client` interface

```ts
export interface Client {
  id: string
  salutation?: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  address?: string
  maps_link?: string
  pic_users?: string[]           // array of user IDs (raw relation)
  expand?: {
    pic_users?: User[]           // expanded dari PocketBase
  }
}
```

### `lib/validations/client.ts`

Tambah field ke `clientSchema`:

```ts
pic_users: z.array(z.string()).optional(),
```

Dan update `ClientFormValues` (auto via `z.infer`).

---

## Hook: `useClients`

- Tambah parameter `filterPic?: string` (default `''`)
- Tambah `expand: 'pic_users'` ke semua query
- Ketika `filterPic` aktif (non-empty, non-`'all'`), tambahkan filter server-side: `pic_users ~ "${filterPic}"`
- `queryKey` include `filterPic` agar cache terpisah per filter

```ts
export function useClients(searchTerm = '', filterPic = '') {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', searchTerm, filterPic],
    queryFn: async () => {
      const parts: string[] = []
      if (searchTerm) parts.push(`(company_name ~ "${searchTerm}" || ...)`)
      if (filterPic && filterPic !== 'all') parts.push(`pic_users ~ "${filterPic}"`)
      return await pb.collection('clients').getFullList<Client>({
        sort: '-created',
        filter: parts.join(' && '),
        expand: 'pic_users',
      })
    },
  })
  return { clients, isLoading }
}
```

---

## Komponen Baru: `ClientPicMultiSelectField`

**Lokasi:** `components/forms/ClientPicMultiSelectField.tsx`

- Terima `control: Control<ClientFormValues>`, `users: User[]`
- Render: Popover trigger (badge count / "Select PICs") + daftar checkbox per user di dalam popover
- Tidak pakai `cmdk` — user list kecil, tidak butuh search
- Field name: `pic_users` (array of user IDs)
- Dipakai di `ClientForm` di bawah Maps Link field

---

## `ClientForm`

- Import `useUsers` hook untuk ambil daftar semua user
- Tambah `pic_users` ke `defaultValues` dan `form.reset()`: `pic_users: initialData?.pic_users ?? []`
- Render `<ClientPicMultiSelectField control={form.control} users={users} />` di bawah Maps Link
- `useFormMutation` mengirim `pic_users` array of IDs langsung ke PocketBase (native relation field)

---

## `ClientTable`

- Tambah kolom "PIC" sebelum kolom actions
- Baca dari `client.expand?.pic_users ?? []`
- Tampil avatar initials stack: max 3 avatar, sisanya "+N"
- Tooltip on hover per avatar: nama lengkap user
- Jika kosong: tampil `—`

---

## `ClientsPage`

- Tambah state `filterPic` (string, default `'all'`)
- Pass `filterPic` ke `useClients(debouncedSearch, filterPic)`
- Import `useUsers` untuk populate dropdown
- Tambah `Select` dropdown di toolbar (pola sama dengan `ArchitectureFilterBar`):
  - Value `'all'` → "All PICs"
  - Per user: `value={user.id}` → `{user.name}`
  - Dot indicator saat filter aktif
- `usePagination` reset ketika `filterPic` berubah: tambah ke `resetDeps`

---

## Out of Scope

- PIC tidak ditampilkan di `ClientDetailDialog` (hanya tabel + filter)
- Tidak ada notifikasi ke PIC saat client diassign
- Tidak ada filter PIC di halaman proyek/invoice/quotation

---

## Checklist SOLID

- **S**: `ClientPicMultiSelectField` satu tanggung jawab (field UI only)
- **O**: `ClientForm` diperluas via props dan field baru, tidak ubah logic lama
- **I**: `ClientPicMultiSelectField` hanya terima `control` + `users`, tidak seluruh form state
- **D**: `ClientForm` fetch users via `useUsers` hook, tidak akses `pb` langsung
