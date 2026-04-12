# Clients Open Access + View Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Buka akses halaman Clients ke semua role, batasi Edit dengan permission `manage_clients`, hapus Delete permanen, dan tambah modal View Details read-only untuk semua role.

**Architecture:** `ClientsPage` bertanggung jawab atas auth — ia menggunakan `can('manage_clients')` untuk kondisikan apakah `onEdit` dikirim ke `ClientTable`. `ClientTable` hanya menerima callback via props dan tidak tahu auth sama sekali. `ClientDetailDialog` adalah komponen standalone read-only.

**Tech Stack:** React 19, TypeScript, shadcn/ui (Dialog, Separator, DropdownMenu), Lucide React, `useAuth` dari `AuthContext`

---

## File Map

| File | Action | Tanggung Jawab |
|---|---|---|
| `frontend/src/pages/clients/ClientDetailDialog.tsx` | **CREATE** | Modal read-only: avatar inisial + semua field client |
| `frontend/src/pages/clients/ClientTable.tsx` | **MODIFY** | `onEdit?` optional, hapus `onDelete`, tambah `onView` |
| `frontend/src/pages/clients/ClientsPage.tsx` | **MODIFY** | Hapus delete logic, gunakan `can('manage_clients')`, tambah view state |
| `frontend/src/components/layout/Sidebar/SidebarNav.tsx` | **MODIFY** | Hapus `<Guard require="view_clients">` dari Clients NavItem |
| `frontend/src/pages/settings/roleManagement/roleForm.tsx` | **MODIFY** | Hapus `view_clients` dari PERMISSION_GROUPS |

---

## Task 1: Buat ClientDetailDialog

**Files:**
- Create: `frontend/src/pages/clients/ClientDetailDialog.tsx`

- [ ] **Step 1: Buat file ClientDetailDialog.tsx**

```typescript
import type { Client } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Mail, Phone, MapPin } from 'lucide-react'

interface ClientDetailDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function ClientDetailDialog({
  client,
  open,
  onOpenChange,
}: ClientDetailDialogProps) {
  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
              {getInitials(client.company_name)}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {client.company_name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {client.contact_person || '—'}
              </p>
            </div>
          </div>
        </DialogHeader>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700">{client.email || '—'}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700">{client.phone || '—'}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700">{client.address || '—'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/clients/ClientDetailDialog.tsx
git commit -m "feat(clients): add ClientDetailDialog read-only modal"
```

---

## Task 2: Update ClientTable

**Files:**
- Modify: `frontend/src/pages/clients/ClientTable.tsx`

Update interface, hapus `onDelete`, buat `onEdit` optional, tambah `onView`, update dropdown.

- [ ] **Step 1: Ganti seluruh isi ClientTable.tsx**

```typescript
import type { Client } from '@/types'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MoreHorizontal, Pencil, Eye } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

interface ClientTableProps {
  clients: Client[]
  isLoading: boolean
  onView: (client: Client) => void
  onEdit?: (client: Client) => void
}

export function ClientTable({
  clients,
  isLoading,
  onView,
  onEdit,
}: ClientTableProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[280px]">Client / Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} columns={6} />
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60">
                    <EmptyState
                      title="No clients found"
                      description="Try changing your search keywords or add a new client."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client, index) => (
                  <TableRow key={client.id} className="h-14">
                    <TableCell className="text-slate-400 text-xs tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {getInitials(client.company_name)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {client.company_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {client.email || '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {client.phone || '—'}
                    </TableCell>
                    <TableCell>
                      {!client.address || client.address.length < 20 ? (
                        <span className="text-slate-600">
                          {client.address || '—'}
                        </span>
                      ) : (
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[250px] block cursor-default text-slate-600 hover:text-slate-900 transition-colors">
                                {client.address}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[400px] break-words bg-slate-800 text-white">
                              <p>{client.address}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
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
                          <DropdownMenuItem onClick={() => onView(client)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          {onEdit && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onEdit(client)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            </>
                          )}
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
git add frontend/src/pages/clients/ClientTable.tsx
git commit -m "feat(clients): make onEdit optional, add onView, remove delete from table"
```

---

## Task 3: Update ClientsPage

**Files:**
- Modify: `frontend/src/pages/clients/ClientsPage.tsx`

Hapus seluruh delete logic. Tambah view state. Gunakan `can('manage_clients')` untuk kondisikan `onEdit`.

- [ ] **Step 1: Ganti seluruh isi ClientsPage.tsx**

```typescript
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Client } from '@/types'
import { ClientTable } from './ClientTable'
import { ClientForm } from './ClientForm'
import { ClientDetailDialog } from './ClientDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'

export default function ClientsPage() {
  const queryClient = useQueryClient()
  const { can } = useAuth()

  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data, isLoading } = useQuery({
    queryKey: ['clients', debouncedSearch],
    queryFn: async () => {
      const filterRule = debouncedSearch
        ? `company_name ~ "${debouncedSearch}" || email ~ "${debouncedSearch}" || phone ~ "${debouncedSearch}" || address ~ "${debouncedSearch}"`
        : ''
      return await pb.collection('clients').getFullList<Client>({
        sort: '-created',
        filter: filterRule,
      })
    },
  })

  const handleCreate = () => {
    setEditingClient(null)
    setOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setOpen(true)
  }

  const handleView = (client: Client) => {
    setViewingClient(client)
  }

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

      {/* CONTENT CARD */}
      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        {/* INTEGRATED TOOLBAR */}
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
          clients={data || []}
          isLoading={isLoading}
          onView={handleView}
          onEdit={can('manage_clients') ? handleEdit : undefined}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        description={
          editingClient
            ? 'Update the client information below.'
            : 'Fill in the complete client details below.'
        }
      >
        <ClientForm
          key={editingClient ? editingClient.id : 'new-client'}
          initialData={editingClient}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <ClientDetailDialog
        client={viewingClient}
        open={!!viewingClient}
        onOpenChange={(isOpen) => !isOpen && setViewingClient(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/clients/ClientsPage.tsx
git commit -m "feat(clients): open access to all roles, gate edit with manage_clients permission"
```

---

## Task 4: Update SidebarNav

**Files:**
- Modify: `frontend/src/components/layout/Sidebar/SidebarNav.tsx`

Hapus `<Guard require="view_clients">` yang membungkus Clients NavItem. NavItem Clients harus tampil untuk semua role tanpa kondisi.

- [ ] **Step 1: Edit SidebarNav.tsx — hapus Guard di sekitar Clients NavItem**

Cari blok ini (sekitar baris 119–128):
```typescript
<Guard require="view_clients">
  <NavItem
    to="/clients"
    icon={Users}
    label="Clients"
    collapsed={collapsed}
    isActive={isActive('/clients')}
    onClick={onLinkClick}
  />
</Guard>
```

Ganti dengan:
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

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/layout/Sidebar/SidebarNav.tsx
git commit -m "feat(clients): show clients in sidebar for all roles"
```

---

## Task 5: Update roleForm — Hapus view_clients

**Files:**
- Modify: `frontend/src/pages/settings/roleManagement/roleForm.tsx`

Permission `view_clients` tidak lagi digunakan untuk gate apapun. Hapus dari PERMISSION_GROUPS agar tidak membingungkan admin.

- [ ] **Step 1: Edit roleForm.tsx — hapus view_clients dari group Master Data & Settings**

Cari blok ini di dalam `PERMISSION_GROUPS` (sekitar baris 83–89):
```typescript
{
  title: 'Master Data & Settings',
  permissions: [
    { id: 'view_clients', label: 'View Client Database' },
    { id: 'manage_clients', label: 'Manage Clients' },
    { id: 'manage_users', label: 'Manage Users & Roles (Superadmin)' },
  ],
},
```

Ganti dengan:
```typescript
{
  title: 'Master Data & Settings',
  permissions: [
    { id: 'manage_clients', label: 'Manage Clients (Edit)' },
    { id: 'manage_users', label: 'Manage Users & Roles (Superadmin)' },
  ],
},
```

Label `manage_clients` diubah menjadi `Manage Clients (Edit)` agar lebih eksplisit bahwa ini mengontrol aksi Edit, bukan akses halaman.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/settings/roleManagement/roleForm.tsx
git commit -m "chore(roles): remove obsolete view_clients permission, clarify manage_clients label"
```

---

## Verifikasi Manual

Setelah semua task selesai, lakukan pengujian manual di browser:

- [ ] Login sebagai user **tanpa** `manage_clients` permission → Clients muncul di sidebar, buka halaman, dropdown hanya tampilkan "View Details", tombol "Add Client" muncul
- [ ] Buka "View Details" → modal muncul dengan avatar inisial, company name, contact person, email, phone, address
- [ ] Login sebagai user **dengan** `manage_clients` permission → dropdown tampilkan "View Details" + separator + "Edit"
- [ ] Login sebagai **superadmin** → semua aksi tersedia (superadmin selalu `can()` = true)
- [ ] Buka Role Management → pastikan `view_clients` sudah tidak ada di daftar permission, `manage_clients` labelnya sudah "Manage Clients (Edit)"
