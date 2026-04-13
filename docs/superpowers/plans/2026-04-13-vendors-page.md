# Vendors Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Buat halaman master data Vendor (rekanan/mandor) yang hanya bisa diakses superadmin, dengan fitur index table, search, filter project type (sipil/interior), serta edit dan view details via dialog — mirip pola ClientsPage.

**Architecture:** Ikuti pola yang sama dengan `ClientsPage`: page hanya render, business logic di custom hook, data fetch di `useVendors`, validasi di `lib/validations/vendor.ts`. Route dilindungi `SuperAdminGuard` yang mengecek `isSuperAdmin` dari `AuthContext`.

**Tech Stack:** React 19, TypeScript, TanStack Query, PocketBase JS SDK, React Hook Form + Zod, Radix UI (shadcn/ui), Tailwind CSS 4

---

## Pre-requisite: Buat Collection di PocketBase

Sebelum mulai coding, buat collection `vendors` di PocketBase admin panel (`https://pb-rh.elvanrff.com/_/`):

1. Sidebar kiri → **Collections** → klik **+ New collection**
2. Name: `vendors`, Type: **Base**
3. Tab **Fields** → tambah field berikut:

| Field name | Type | Options |
|---|---|---|
| `name` | Text | Required: ✅ |
| `phone` | Text | Required: ❌ |
| `project_type` | Select | Required: ✅, Max select: 1, Values: `civil`, `interior` |
| `notes` | Text | Required: ❌ |

4. Tab **API Rules** → set semua rule ke: `@request.auth.id != ""`
5. Klik **Create**

---

## File Map

| Status | Path | Tanggung Jawab |
|---|---|---|
| Modify | `frontend/src/types.ts` | Tambah interface `Vendor` |
| Create | `frontend/src/lib/validations/vendor.ts` | Zod schema untuk form vendor |
| Create | `frontend/src/hooks/useVendors.ts` | Fetch + mutate vendors via PocketBase |
| Modify | `frontend/src/contexts/AuthContext.tsx` | Expose `isSuperAdmin` ke context |
| Create | `frontend/src/components/ui/SuperAdminGuard.tsx` | Route guard untuk superadmin-only |
| Create | `frontend/src/pages/vendors/VendorTable.tsx` | Table component |
| Create | `frontend/src/pages/vendors/VendorForm.tsx` | Create/edit form |
| Create | `frontend/src/pages/vendors/VendorDetailDialog.tsx` | View details dialog |
| Create | `frontend/src/pages/vendors/VendorsPage.tsx` | Main page (index) |
| Modify | `frontend/src/App.tsx` | Tambah route `/vendors` |
| Modify | `frontend/src/components/layout/Sidebar/SidebarNav.tsx` | Tambah nav item Vendors |

---

## Task 1: Tambah Tipe `Vendor` ke `types.ts`

**Files:**
- Modify: `frontend/src/types.ts`

- [ ] **Step 1: Tambah interface Vendor setelah interface `Client`**

Buka `frontend/src/types.ts`. Setelah blok `export interface Client { ... }`, tambahkan:

```typescript
export interface Vendor {
  id: string
  name: string
  phone: string
  project_type: 'civil' | 'interior'
  notes?: string
  created: string
  updated: string
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types.ts
git commit -m "feat(vendors): add Vendor type"
```

---

## Task 2: Buat Zod Schema `lib/validations/vendor.ts`

**Files:**
- Create: `frontend/src/lib/validations/vendor.ts`

- [ ] **Step 1: Buat file schema**

```typescript
import { z } from 'zod'

export const vendorSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama vendor minimal 2 karakter.',
  }),
  phone: z.string().min(10, {
    message: 'Nomor telepon minimal 10 digit.',
  }),
  project_type: z.enum(['civil', 'interior'], {
    required_error: 'Project type wajib dipilih.',
  }),
  notes: z.string().optional(),
})

export type VendorFormValues = z.infer<typeof vendorSchema>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/validations/vendor.ts
git commit -m "feat(vendors): add vendor Zod schema"
```

---

## Task 3: Buat Hook `useVendors`

**Files:**
- Create: `frontend/src/hooks/useVendors.ts`

- [ ] **Step 1: Buat file hook**

```typescript
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Vendor } from '@/types'

interface UseVendorsOptions {
  searchTerm?: string
  projectType?: 'civil' | 'interior' | ''
}

export function useVendors({ searchTerm = '', projectType = '' }: UseVendorsOptions = {}) {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors', searchTerm, projectType],
    queryFn: async () => {
      const filters: string[] = []

      if (searchTerm) {
        filters.push(`name ~ "${searchTerm}" || phone ~ "${searchTerm}"`)
      }
      if (projectType) {
        filters.push(`project_type = "${projectType}"`)
      }

      return await pb.collection('vendors').getFullList<Vendor>({
        sort: 'name',
        filter: filters.join(' && '),
      })
    },
  })

  return { vendors, isLoading }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useVendors.ts
git commit -m "feat(vendors): add useVendors hook"
```

---

## Task 4: Expose `isSuperAdmin` di `AuthContext`

`isSuperAdmin` saat ini hanya dipakai secara internal di `can()`. Kita perlu expose-nya agar bisa dipakai di `SuperAdminGuard`.

**Files:**
- Modify: `frontend/src/contexts/AuthContext.tsx`

- [ ] **Step 1: Update `AuthContextType` interface**

Cari blok:
```typescript
interface AuthContextType {
  user: any
  permissions: string[]
  can: (permission: string) => boolean
  isLoading: boolean
}
```

Ganti dengan:
```typescript
interface AuthContextType {
  user: any
  permissions: string[]
  can: (permission: string) => boolean
  isSuperAdmin: boolean
  isLoading: boolean
}
```

- [ ] **Step 2: Tambah `isSuperAdmin` ke value context**

Cari baris:
```typescript
const [authModel, setAuthModel] = useState(pb.authStore.model)
```

Tambahkan setelah baris tersebut:
```typescript
const isSuperAdmin = !!authModel?.isSuperAdmin
```

- [ ] **Step 3: Pass `isSuperAdmin` ke Provider**

Cari:
```typescript
<AuthContext.Provider
  value={{ user: userData, permissions, can, isLoading }}
>
```

Ganti dengan:
```typescript
<AuthContext.Provider
  value={{ user: userData, permissions, can, isSuperAdmin, isLoading }}
>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/contexts/AuthContext.tsx
git commit -m "feat(auth): expose isSuperAdmin from AuthContext"
```

---

## Task 5: Buat `SuperAdminGuard`

**Files:**
- Create: `frontend/src/components/ui/SuperAdminGuard.tsx`

- [ ] **Step 1: Buat file guard**

```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function SuperAdminGuard() {
  const { isSuperAdmin, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ui/SuperAdminGuard.tsx
git commit -m "feat(auth): add SuperAdminGuard route component"
```

---

## Task 6: Buat `VendorTable`

**Files:**
- Create: `frontend/src/pages/vendors/VendorTable.tsx`

- [ ] **Step 1: Buat file table**

```typescript
import type { Vendor } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Pencil, Eye } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { getInitials } from '@/lib/helpers'

const PROJECT_TYPE_LABEL: Record<Vendor['project_type'], string> = {
  civil: 'Sipil',
  interior: 'Interior',
}

const PROJECT_TYPE_BADGE_CLASS: Record<Vendor['project_type'], string> = {
  civil: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  interior: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
}

interface VendorTableProps {
  vendors: Vendor[]
  isLoading: boolean
  onView: (vendor: Vendor) => void
  onEdit: (vendor: Vendor) => void
}

export function VendorTable({ vendors, isLoading, onView, onEdit }: VendorTableProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[700px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[260px]">Nama Vendor</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead className="w-[120px]">Project Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} columns={6} />
              ) : vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60">
                    <EmptyState
                      title="Belum ada vendor"
                      description="Coba ubah filter atau tambahkan vendor baru."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor, index) => (
                  <TableRow key={vendor.id} className="h-14">
                    <TableCell className="text-slate-400 text-xs tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {getInitials(vendor.name)}
                        </div>
                        <span className="font-medium text-slate-900">{vendor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{vendor.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge className={PROJECT_TYPE_BADGE_CLASS[vendor.project_type]}>
                        {PROJECT_TYPE_LABEL[vendor.project_type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">
                      {vendor.notes || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(vendor)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(vendor)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/vendors/VendorTable.tsx
git commit -m "feat(vendors): add VendorTable component"
```

---

## Task 7: Buat `VendorForm`

**Files:**
- Create: `frontend/src/pages/vendors/VendorForm.tsx`

- [ ] **Step 1: Buat file form**

```typescript
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { vendorSchema, type VendorFormValues } from '@/lib/validations/vendor'
import type { Vendor } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface VendorFormProps {
  onSuccess?: () => void
  initialData?: Vendor | null
}

export function VendorForm({ onSuccess, initialData }: VendorFormProps) {
  const queryClient = useQueryClient()

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      phone: '',
      project_type: undefined,
      notes: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        phone: initialData.phone,
        project_type: initialData.project_type,
        notes: initialData.notes ?? '',
      })
    } else {
      form.reset({ name: '', phone: '', project_type: undefined, notes: '' })
    }
  }, [initialData, form])

  const mutation = useMutation({
    mutationFn: async (values: VendorFormValues) => {
      if (initialData) {
        return await pb.collection('vendors').update(initialData.id, values)
      }
      return await pb.collection('vendors').create(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      onSuccess?.()
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan data vendor.'
      toast.error(message)
    },
  })

  function onSubmit(values: VendorFormValues) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Vendor / Mandor</FormLabel>
              <FormControl>
                <Input placeholder="Budi Santoso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor HP / WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="0812..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="project_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="civil">Sipil</SelectItem>
                    <SelectItem value="interior">Interior</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Keahlian, pengalaman, atau catatan lainnya..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Simpan Perubahan' : 'Tambah Vendor'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/vendors/VendorForm.tsx
git commit -m "feat(vendors): add VendorForm component"
```

---

## Task 8: Buat `VendorDetailDialog`

**Files:**
- Create: `frontend/src/pages/vendors/VendorDetailDialog.tsx`

- [ ] **Step 1: Buat file dialog**

```typescript
import type { Vendor } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Phone, FileText, HardHat, Sofa } from 'lucide-react'
import { getInitials } from '@/lib/helpers'

const PROJECT_TYPE_LABEL: Record<Vendor['project_type'], string> = {
  civil: 'Sipil',
  interior: 'Interior',
}

const PROJECT_TYPE_BADGE_CLASS: Record<Vendor['project_type'], string> = {
  civil: 'bg-amber-100 text-amber-800',
  interior: 'bg-purple-100 text-purple-800',
}

const PROJECT_TYPE_ICON: Record<Vendor['project_type'], React.ElementType> = {
  civil: HardHat,
  interior: Sofa,
}

interface VendorDetailDialogProps {
  vendor: Vendor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VendorDetailDialog({ vendor, open, onOpenChange }: VendorDetailDialogProps) {
  if (!vendor) return null

  const TypeIcon = PROJECT_TYPE_ICON[vendor.project_type]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
              {getInitials(vendor.name)}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {vendor.name}
              </DialogTitle>
              <Badge className={PROJECT_TYPE_BADGE_CLASS[vendor.project_type]}>
                <TypeIcon className="mr-1 h-3 w-3" />
                {PROJECT_TYPE_LABEL[vendor.project_type]}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700">{vendor.phone || '—'}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700 whitespace-pre-wrap">{vendor.notes || '—'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

> **Note:** Tambahkan `import React from 'react'` di baris pertama jika TypeScript complain tentang `React.ElementType`.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/vendors/VendorDetailDialog.tsx
git commit -m "feat(vendors): add VendorDetailDialog component"
```

---

## Task 9: Buat `VendorsPage`

**Files:**
- Create: `frontend/src/pages/vendors/VendorsPage.tsx`

- [ ] **Step 1: Buat file page**

```typescript
import { useState, useEffect } from 'react'
import type { Vendor } from '@/types'
import { VendorTable } from './VendorTable'
import { VendorForm } from './VendorForm'
import { VendorDetailDialog } from './VendorDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useVendors } from '@/hooks/useVendors'
import { TablePagination } from '@/components/shared/TablePagination'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Users2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'

const PAGE_SIZE = 15

export default function VendorsPage() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [projectTypeFilter, setProjectTypeFilter] = useState<'civil' | 'interior' | ''>('')
  const [page, setPage] = useState(1)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const { vendors: data, isLoading } = useVendors({
    searchTerm: debouncedSearch,
    projectType: projectTypeFilter,
  })

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, projectTypeFilter])

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const paginatedVendors = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreate = () => {
    setEditingVendor(null)
    setOpen(true)
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setOpen(true)
  }

  const handleView = (vendor: Vendor) => {
    setViewingVendor(vendor)
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<Users2 className="h-6 w-6 text-slate-800" />}
        title="Vendors & Rekanan"
        description="Kelola data vendor, rekanan, dan mandor untuk proyek sipil dan interior."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Vendor
          </Button>
        }
      />

      {/* CONTENT CARD */}
      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        {/* INTEGRATED TOOLBAR */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau nomor HP..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={projectTypeFilter}
            onValueChange={(val) => setProjectTypeFilter(val as typeof projectTypeFilter)}
          >
            <SelectTrigger className="w-[160px] h-9 bg-white">
              <SelectValue placeholder="Semua Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Project</SelectItem>
              <SelectItem value="civil">Sipil</SelectItem>
              <SelectItem value="interior">Interior</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <VendorTable
          vendors={paginatedVendors}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
        />
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemCount={paginatedVendors.length}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingVendor ? 'Edit Vendor' : 'Tambah Vendor Baru'}
        description={
          editingVendor
            ? 'Perbarui informasi vendor di bawah ini.'
            : 'Isi detail vendor baru di bawah ini.'
        }
      >
        <VendorForm
          key={editingVendor ? editingVendor.id : 'new-vendor'}
          initialData={editingVendor}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <VendorDetailDialog
        vendor={viewingVendor}
        open={!!viewingVendor}
        onOpenChange={(isOpen) => !isOpen && setViewingVendor(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/vendors/VendorsPage.tsx
git commit -m "feat(vendors): add VendorsPage"
```

---

## Task 10: Tambah Route di `App.tsx`

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Import `SuperAdminGuard` dan `VendorsPage`**

Cari blok import di `frontend/src/App.tsx`:
```typescript
import { PermissionGuard } from './components/ui/PermissionGuard'
```

Tambahkan setelah baris itu:
```typescript
import { SuperAdminGuard } from './components/ui/SuperAdminGuard'
import VendorsPage from './pages/vendors/VendorsPage'
```

- [ ] **Step 2: Tambah route `/vendors`**

Cari baris:
```typescript
<Route path="clients" element={<ClientsPage />} />
```

Tambahkan setelah baris itu:
```typescript
<Route element={<SuperAdminGuard />}>
  <Route path="vendors" element={<VendorsPage />} />
</Route>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat(vendors): add /vendors route with SuperAdminGuard"
```

---

## Task 11: Tambah Nav Item di Sidebar

**Files:**
- Modify: `frontend/src/components/layout/Sidebar/SidebarNav.tsx`

- [ ] **Step 1: Tambah icon `Users2` ke import**

Cari baris import lucide-react:
```typescript
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Settings,
  PencilRuler,
  HardHat,
  Sofa,
  ShieldCheck,
} from 'lucide-react'
```

Tambahkan `Users2` ke dalam list:
```typescript
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Users2,
  Settings,
  PencilRuler,
  HardHat,
  Sofa,
  ShieldCheck,
} from 'lucide-react'
```

- [ ] **Step 2: Tambah NavItem untuk Vendors**

Cari blok NavItem untuk Clients:
```typescript
<NavItem
  to="/clients"
  icon={Users}
  label="Clients"
  collapsed={collapsed}
  isActive={isActive('/clients')}
  onClick={onLinkClick}
/>
```

Tambahkan setelah blok tersebut:
```typescript
{isSuperAdmin && (
  <NavItem
    to="/vendors"
    icon={Users2}
    label="Vendors & Rekanan"
    collapsed={collapsed}
    isActive={isActive('/vendors')}
    onClick={onLinkClick}
  />
)}
```

> **Note:** `isSuperAdmin` sudah tersedia sebagai prop di `SidebarNav` — tidak perlu tambah apapun lagi.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/Sidebar/SidebarNav.tsx
git commit -m "feat(vendors): add Vendors nav item to sidebar (superadmin only)"
```

---

## Task 12: Verifikasi Manual

- [ ] Login sebagai superadmin → pastikan menu "Vendors & Rekanan" muncul di sidebar
- [ ] Buka `/vendors` → pastikan page load dan table muncul (kosong)
- [ ] Klik "Tambah Vendor" → isi form → submit → pastikan data muncul di table
- [ ] Klik `⋯` → View Details → pastikan dialog muncul dengan data benar
- [ ] Klik `⋯` → Edit → ubah data → simpan → pastikan update berhasil
- [ ] Coba filter by project type "Sipil" → pastikan hanya vendor sipil yang muncul
- [ ] Coba search by nama → pastikan filter berjalan
- [ ] Login sebagai non-superadmin → pastikan menu tidak muncul dan akses `/vendors` redirect ke `/`

---

## Catatan untuk Sesi Berikutnya

- Semua kode di atas sudah lengkap dan siap eksekusi — tidak ada placeholder
- Ikuti urutan task 1 → 11 karena ada dependency (tipe `Vendor` dipakai di hook, hook dipakai di page, dsb.)
- Jika TypeScript error di `VendorDetailDialog` soal `React.ElementType`, tambahkan `import type { ElementType } from 'react'` dan ganti tipenya ke `ElementType`
- Collection PocketBase **harus dibuat terlebih dahulu** sebelum testing apapun
