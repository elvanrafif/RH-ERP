# Refactor: useTableState & useFormMutation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminasi boilerplate duplikat di CRUD pages dan forms dengan dua hook generik: `useTableState` dan `useFormMutation`.

**Architecture:** Dua hook baru di `frontend/src/hooks/` — `useTableState<T>` untuk manage open/editing/viewing/search state, `useFormMutation<TValues>` untuk handle create/update PocketBase + query invalidation + toast error. Semua pages dan forms yang terpengaruh di-refactor untuk pakai hook ini.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, PocketBase JS SDK, Sonner toast

---

## File Map

| Action | File |
|---|---|
| Create | `frontend/src/hooks/useTableState.ts` |
| Create | `frontend/src/hooks/useFormMutation.ts` |
| Modify | `frontend/src/pages/clients/ClientsPage.tsx` |
| Modify | `frontend/src/pages/vendors/VendorsPage.tsx` |
| Modify | `frontend/src/pages/prospects/ProspectsPage.tsx` |
| Modify | `frontend/src/pages/settings/users/UserManagement.tsx` |
| Modify | `frontend/src/pages/clients/ClientForm.tsx` |
| Modify | `frontend/src/pages/vendors/VendorForm.tsx` |

---

## Task 1: Buat `useTableState<T>`

**Files:**
- Create: `frontend/src/hooks/useTableState.ts`

- [ ] **Step 1: Buat file hook**

```ts
// frontend/src/hooks/useTableState.ts
import { useState } from 'react'

export function useTableState<T>() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [viewing, setViewing] = useState<T | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const handleEdit = (item: T) => {
    setEditing(item)
    setOpen(true)
  }

  const handleView = (item: T) => {
    setViewing(item)
  }

  const handleCloseDetail = () => {
    setViewing(null)
  }

  const handleCloseForm = () => {
    setOpen(false)
  }

  return {
    open,
    setOpen,
    editing,
    viewing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleView,
    handleCloseDetail,
    handleCloseForm,
  }
}
```

- [ ] **Step 2: Verifikasi TypeScript compile**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useTableState.ts
git commit -m "feat: add useTableState generic hook for CRUD page state"
```

---

## Task 2: Buat `useFormMutation<TValues>`

**Files:**
- Create: `frontend/src/hooks/useFormMutation.ts`

- [ ] **Step 1: Buat file hook**

```ts
// frontend/src/hooks/useFormMutation.ts
import { toast } from 'sonner'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

interface UseFormMutationOptions<TValues> {
  collection: string
  queryKey: string[]
  initialData?: { id: string } | null
  onSuccess?: () => void
}

export function useFormMutation<TValues>({
  collection,
  queryKey,
  initialData,
  onSuccess,
}: UseFormMutationOptions<TValues>) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: TValues) => {
      if (initialData) {
        return await pb
          .collection(collection)
          .update(initialData.id, values as Record<string, unknown>)
      }
      return await pb
        .collection(collection)
        .create(values as Record<string, unknown>)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      onSuccess?.()
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to save data.'
      toast.error(message)
    },
  })

  return {
    mutate: (values: TValues) => mutation.mutate(values),
    isPending: mutation.isPending,
  }
}
```

- [ ] **Step 2: Verifikasi TypeScript compile**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useFormMutation.ts
git commit -m "feat: add useFormMutation generic hook for PocketBase create/update"
```

---

## Task 3: Refactor ClientsPage

**Files:**
- Modify: `frontend/src/pages/clients/ClientsPage.tsx`

- [ ] **Step 1: Ganti isi file**

```tsx
// frontend/src/pages/clients/ClientsPage.tsx
import type { Client } from '@/types'
import { ClientTable } from './ClientTable'
import { ClientForm } from './ClientForm'
import { ClientDetailDialog } from './ClientDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useClients } from '@/hooks/useClients'
import { useAuth } from '@/contexts/AuthContext'
import { TablePagination } from '@/components/shared/TablePagination'
import { usePagination } from '@/hooks/usePagination'
import { useTableState } from '@/hooks/useTableState'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'

export default function ClientsPage() {
  const { can } = useAuth()
  const {
    open,
    setOpen,
    editing,
    viewing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleView,
    handleCloseDetail,
  } = useTableState<Client>()

  const debouncedSearch = useDebounce(searchTerm, 500)
  const { clients: data, isLoading } = useClients(debouncedSearch)
  const {
    page,
    setPage,
    totalItems,
    totalPages,
    paginatedData: paginatedClients,
  } = usePagination(data, [debouncedSearch])

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<Users className="h-6 w-6 text-slate-800" />}
        title="Clients"
        description="Manage customer data and contact information."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, or phone..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ClientTable
          clients={paginatedClients}
          isLoading={isLoading}
          onView={handleView}
          onEdit={can('manage_clients') ? handleEdit : undefined}
        />
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemCount={paginatedClients.length}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit Client' : 'Add New Client'}
        description={
          editing
            ? 'Update the client information below.'
            : 'Fill in the complete client details below.'
        }
      >
        <ClientForm
          key={editing ? editing.id : 'new-client'}
          initialData={editing}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <ClientDetailDialog
        client={viewing}
        open={!!viewing}
        onOpenChange={(isOpen) => !isOpen && handleCloseDetail()}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript compile**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/clients/ClientsPage.tsx
git commit -m "refactor: use useTableState in ClientsPage"
```

---

## Task 4: Refactor VendorsPage

**Files:**
- Modify: `frontend/src/pages/vendors/VendorsPage.tsx`

- [ ] **Step 1: Ganti isi file**

```tsx
// frontend/src/pages/vendors/VendorsPage.tsx
import { useState } from 'react'
import type { Vendor } from '@/types'
import { VendorTable } from './VendorTable'
import { VendorForm } from './VendorForm'
import { VendorDetailDialog } from './VendorDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useVendors } from '@/hooks/useVendors'
import { TablePagination } from '@/components/shared/TablePagination'
import { usePagination } from '@/hooks/usePagination'
import { useTableState } from '@/hooks/useTableState'

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

export default function VendorsPage() {
  const {
    open,
    setOpen,
    editing,
    viewing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleView,
    handleCloseDetail,
  } = useTableState<Vendor>()

  const [projectTypeFilter, setProjectTypeFilter] = useState<
    'civil' | 'interior' | ''
  >('')

  const debouncedSearch = useDebounce(searchTerm, 500)
  const { vendors: data, isLoading } = useVendors({
    searchTerm: debouncedSearch,
    projectType: projectTypeFilter,
  })
  const {
    page,
    setPage,
    totalItems,
    totalPages,
    paginatedData: paginatedVendors,
  } = usePagination(data, [debouncedSearch, projectTypeFilter])

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<Users2 className="h-6 w-6 text-slate-800" />}
        title="Vendors & Partners"
        description="Manage vendor, partner, and contractor data for civil and interior projects."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={projectTypeFilter || 'all'}
            onValueChange={(val) =>
              setProjectTypeFilter(
                val === 'all' ? '' : (val as 'civil' | 'interior')
              )
            }
          >
            <SelectTrigger className="w-[160px] h-9 bg-white">
              <SelectValue placeholder="Semua Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="civil">Civil</SelectItem>
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
        title={editing ? 'Edit Vendor' : 'Add New Vendor'}
        description={
          editing
            ? 'Update the vendor information below.'
            : 'Fill in the vendor details below.'
        }
      >
        <VendorForm
          key={editing ? editing.id : 'new-vendor'}
          initialData={editing}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <VendorDetailDialog
        vendor={viewing}
        open={!!viewing}
        onOpenChange={(isOpen) => !isOpen && handleCloseDetail()}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript compile**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/vendors/VendorsPage.tsx
git commit -m "refactor: use useTableState in VendorsPage"
```

---

## Task 5: Refactor ProspectsPage

**Files:**
- Modify: `frontend/src/pages/prospects/ProspectsPage.tsx`

- [ ] **Step 1: Ganti isi file**

```tsx
// frontend/src/pages/prospects/ProspectsPage.tsx
import type { Prospect } from '@/types'
import { ProspectTable } from './ProspectTable'
import { ProspectForm } from './ProspectForm'
import { ProspectDetailDialog } from './ProspectDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useProspects } from '@/hooks/useProspects'
import { TablePagination } from '@/components/shared/TablePagination'
import { usePagination } from '@/hooks/usePagination'
import { useTableState } from '@/hooks/useTableState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Instagram } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'

export default function ProspectsPage() {
  const {
    open,
    setOpen,
    editing,
    viewing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleView,
    handleCloseDetail,
  } = useTableState<Prospect>()

  const debouncedSearch = useDebounce(searchTerm, 500)
  const { prospects: data, isLoading } = useProspects({
    searchTerm: debouncedSearch,
  })
  const {
    page,
    setPage,
    totalItems,
    totalPages,
    paginatedData: paginatedProspects,
  } = usePagination(data, [debouncedSearch])

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<Instagram className="h-6 w-6 text-slate-800" />}
        title="Prospect Clients"
        description="Track Instagram prospect clients and their consultation progress."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Prospect
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, instagram, phone..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ProspectTable
          prospects={paginatedProspects}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
        />
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemCount={paginatedProspects.length}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit Prospect' : 'Add New Prospect'}
        description={
          editing
            ? 'Update the prospect information below.'
            : 'Fill in the prospect details below.'
        }
        scrollable
        maxWidth="sm:max-w-[600px]"
      >
        <ProspectForm
          key={editing ? editing.id : 'new-prospect'}
          initialData={editing}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <ProspectDetailDialog
        prospect={viewing}
        open={!!viewing}
        onOpenChange={(isOpen) => !isOpen && handleCloseDetail()}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript compile**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/prospects/ProspectsPage.tsx
git commit -m "refactor: use useTableState in ProspectsPage"
```

---

## Task 6: Refactor UserManagement

**Files:**
- Modify: `frontend/src/pages/settings/users/UserManagement.tsx`

> UserManagement menggunakan client-side search via `useMemo` (karena `useUserManagement` tidak terima search param). `searchTerm` dari `useTableState` tetap dipakai untuk filter, dan `viewing` tidak dipakai (tidak ada detail dialog di halaman ini).

- [ ] **Step 1: Ganti isi file**

```tsx
// frontend/src/pages/settings/users/UserManagement.tsx
import { useMemo } from 'react'
import type { User } from '@/types'
import { useUserManagement } from '@/hooks/useUserManagement'
import { useTableState } from '@/hooks/useTableState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, UserCog, Search } from 'lucide-react'
import { UserForm } from './components/UserForm'
import { UserList } from './components/UserList'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { PageTableSkeleton } from '@/components/shared/TableSkeleton'

export default function UserManagementPage() {
  const {
    open,
    setOpen,
    editing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
  } = useTableState<User>()

  const { users, isLoading } = useUserManagement()

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users
    const q = searchTerm.toLowerCase()
    return users?.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    )
  }, [users, searchTerm])

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<UserCog className="h-6 w-6" />}
        title="User Management"
        description="Manage employee accounts, roles, and divisions."
        action={
          <Button onClick={handleCreate} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-4">
            <PageTableSkeleton />
          </div>
        ) : (
          <UserList users={filteredUsers} onEdit={handleEdit} />
        )}
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit User' : 'Add New User'}
      >
        <UserForm
          initialData={editing}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript compile**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/settings/users/UserManagement.tsx
git commit -m "refactor: use useTableState in UserManagement"
```

---

## Task 7: Refactor ClientForm

**Files:**
- Modify: `frontend/src/pages/clients/ClientForm.tsx`

- [ ] **Step 1: Ganti isi file**

```tsx
// frontend/src/pages/clients/ClientForm.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormValues } from '@/lib/validations/client'
import type { Client } from '@/types'
import { useFormMutation } from '@/hooks/useFormMutation'

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
import { Loader2 } from 'lucide-react'

interface ClientFormProps {
  onSuccess?: () => void
  initialData?: Client | null
}

export function ClientForm({ onSuccess, initialData }: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        company_name: initialData.company_name,
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address,
      })
    } else {
      form.reset({
        company_name: '',
        email: '',
        phone: '',
        address: '',
      })
    }
  }, [initialData, form])

  const mutation = useFormMutation<ClientFormValues>({
    collection: 'clients',
    queryKey: ['clients'],
    initialData,
    onSuccess,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company / Client Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone / WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="0812..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complete Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 Main St..."
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
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? 'Save Changes' : 'Create New Client'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript compile**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/clients/ClientForm.tsx
git commit -m "refactor: use useFormMutation in ClientForm"
```

---

## Task 8: Refactor VendorForm

**Files:**
- Modify: `frontend/src/pages/vendors/VendorForm.tsx`

- [ ] **Step 1: Ganti isi file**

```tsx
// frontend/src/pages/vendors/VendorForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vendorSchema, type VendorFormValues } from '@/lib/validations/vendor'
import type { Vendor } from '@/types'
import { useFormMutation } from '@/hooks/useFormMutation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      phone: initialData?.phone ?? '',
      project_type: initialData?.project_type,
      isActive: initialData?.isActive ?? true,
      notes: initialData?.notes ?? '',
    },
  })

  const mutation = useFormMutation<VendorFormValues>({
    collection: 'vendors',
    queryKey: ['vendors'],
    initialData,
    onSuccess,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor / Contractor Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
                <FormLabel>Phone / WhatsApp</FormLabel>
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
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="civil">Civil</SelectItem>
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
                  placeholder="Skills, experience, or other relevant notes..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-col items-end">
              <FormLabel>Vendor Status</FormLabel>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${field.value ? 'text-emerald-600' : 'text-slate-400'}`}
                >
                  {field.value ? 'Active' : 'Inactive'}
                </span>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? 'Save Changes' : 'Add Vendor'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript compile**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/vendors/VendorForm.tsx
git commit -m "refactor: use useFormMutation in VendorForm"
```

---

## Task 9: Final verification

- [ ] **Step 1: Full TypeScript compile check**

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 2: Update docs/claude/architecture.md — tambah dua hook baru ke tabel**

Di file `docs/claude/architecture.md`, tambah dua baris ke tabel Custom Hooks:

```markdown
| `useTableState` | Generic CRUD page state: open dialog, editing/viewing entity, search term |
| `useFormMutation` | Generic PocketBase create/update mutation dengan query invalidation dan toast error |
```

- [ ] **Step 3: Commit docs**

```bash
git add docs/claude/architecture.md
git commit -m "docs: document useTableState and useFormMutation hooks"
```
