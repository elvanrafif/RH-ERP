# Sort Feature

Fitur sort reusable untuk semua tabel. Sort diterapkan client-side pada data yang sudah di-fetch (`getFullList`), bukan server-side request baru.

---

## File yang Terlibat

| File | Peran |
|---|---|
| `hooks/useSort.ts` | Hook generik — manage sort state + compute sorted data |
| `components/shared/SortPopover.tsx` | UI button + popover pilihan sort |
| `pages/.../[nama]SortOptions.ts` | Config sort per tabel (kolom + compareFn) |

---

## Cara Pakai di Tabel Baru

### 1. Buat file config sort

Buat file `[nama]SortOptions.ts` di folder page yang bersangkutan:

```ts
// pages/projects/projectArchitecture/architectureSortOptions.ts
import type { SortOption } from '@/hooks/useSort'
import type { Project } from '@/types'

export const ARCHITECTURE_SORT_OPTIONS: SortOption<Project>[] = [
  {
    value: 'deadline_asc',
    label: 'Soonest Deadline',
    compareFn: (a, b) => {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity
      const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity
      return aTime - bTime
    },
  },
  {
    value: 'deadline_desc',
    label: 'Latest Deadline',
    compareFn: (a, b) => {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity
      const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity
      return bTime - aTime
    },
  },
]
```

### 2. Panggil `useSort` di page

Sort diterapkan **setelah filter, sebelum pagination**:

```ts
import { useSort } from '@/hooks/useSort'
import { ARCHITECTURE_SORT_OPTIONS } from './architectureSortOptions'

// Setelah useProjectFilters:
const { sortedData: sortedProjects, sortValue, setSortValue } =
  useSort(filteredProjects, ARCHITECTURE_SORT_OPTIONS)

// Ganti filteredProjects → sortedProjects di usePagination:
const { paginatedData } = usePagination(sortedProjects, [
  searchQuery,
  filterPic,
  statusFilter,
  sortValue,   // ← tambahkan ke resetDeps
])
```

### 3. Taruh `SortPopover` di toolbar

```tsx
import { SortPopover } from '@/components/shared/SortPopover'

// Di dalam div toolbar, paling kanan:
<SortPopover
  options={ARCHITECTURE_SORT_OPTIONS}
  value={sortValue}
  onChange={setSortValue}
/>
```

---

## `SortOption<T>` Type

```ts
interface SortOption<T> {
  value: string                      // unique key, e.g. 'deadline_asc'
  label: string                      // teks di popover, e.g. 'Soonest Deadline'
  compareFn: (a: T, b: T) => number  // standard Array.sort comparator
}
```

**Konvensi `compareFn`:**
- Return negatif → `a` sebelum `b`
- Return positif → `b` sebelum `a`
- Data tanpa nilai (null/undefined) → push ke bawah dengan `?? 0` atau `?? Infinity`

```ts
// Numerik — terbesar duluan
compareFn: (a, b) => (b.luas_tanah ?? 0) - (a.luas_tanah ?? 0)

// Tanggal — terlama duluan, tanpa tanggal ke bawah
compareFn: (a, b) => {
  const aTime = a.end_date ? new Date(a.end_date).getTime() : Infinity
  const bTime = b.end_date ? new Date(b.end_date).getTime() : Infinity
  return bTime - aTime
}
```

---

## `useSort` Hook

```ts
const { sortedData, sortValue, setSortValue } = useSort(data, options)
```

| Return | Tipe | Keterangan |
|---|---|---|
| `sortedData` | `T[]` | Data setelah sort diterapkan. Sama dengan `data` jika tidak ada sort aktif |
| `sortValue` | `string \| null` | Key opsi sort yang aktif, `null` jika belum dipilih |
| `setSortValue` | `(v: string \| null) => void` | Dipassing ke `SortPopover` via prop `onChange` |

---

## `SortPopover` Component

```tsx
<SortPopover
  options={OPTIONS}   // Array<{ value: string; label: string }>
  value={sortValue}
  onChange={setSortValue}
/>
```

- Button `h-9 variant="outline"` konsisten dengan filter bar
- Dot indikator `bg-rose-500` muncul saat `value !== null`
- Border aktif `border-primary/50 ring-1 ring-primary/30 text-primary` saat sort aktif
- Klik opsi → popover langsung tutup + sort aktif
- Tombol "Clear Sort" muncul saat ada sort aktif → reset ke urutan default BE

---

## Referensi Implementasi

Civil table adalah referensi lengkap:

```
pages/projects/projectCivil/
├── civilSortOptions.ts   ← config: deadline, land area, building area
└── index.tsx             ← useSort + SortPopover integration
```
