# Refactor: useTableState & useFormMutation

**Date:** 2026-04-15
**Priority:** High
**Scope:** 2 new hooks, refactor 4 pages + 4 forms

---

## Problem

Dua pola boilerplate tersebar di seluruh CRUD pages dan forms:

1. **CRUD Page state** — `open`, `searchTerm`, `editing*`, `viewing*`, `handleCreate`, `handleEdit`, `handleView` ditulis ulang identik di ClientsPage, VendorsPage, ProspectsPage, UserManagement.
2. **Form mutation** — blok `useMutation` + `invalidateQueries` + `toast.error` ditulis ulang identik di ClientForm, VendorForm, ProspectForm, UserForm.

---

## Hook 1: `useTableState<T>`

**File:** `frontend/src/hooks/useTableState.ts`

Hook generik untuk manage state CRUD page.

### Interface

```ts
function useTableState<T>(): {
  open: boolean
  setOpen: (open: boolean) => void
  editing: T | null
  viewing: T | null
  searchTerm: string
  setSearchTerm: (term: string) => void
  handleCreate: () => void       // editing=null, open=true
  handleEdit: (item: T) => void  // editing=item, open=true
  handleView: (item: T) => void  // viewing=item
  handleCloseDetail: () => void  // viewing=null
  handleCloseForm: () => void    // open=false
}
```

### Pages yang di-refactor

| Page | File |
|---|---|
| ClientsPage | `pages/clients/ClientsPage.tsx` |
| VendorsPage | `pages/vendors/VendorsPage.tsx` |
| ProspectsPage | `pages/prospects/ProspectsPage.tsx` |
| UserManagement | `pages/settings/users/UserManagement.tsx` |

RoleManagement tidak di-refactor karena tidak punya search/viewing state.

### Contoh sebelum/sesudah

**Sebelum (ClientsPage):**
```ts
const [open, setOpen] = useState(false)
const [searchTerm, setSearchTerm] = useState('')
const [editingClient, setEditingClient] = useState<Client | null>(null)
const [viewingClient, setViewingClient] = useState<Client | null>(null)

const handleCreate = () => { setEditingClient(null); setOpen(true) }
const handleEdit = (client: Client) => { setEditingClient(client); setOpen(true) }
const handleView = (client: Client) => { setViewingClient(client) }
```

**Sesudah:**
```ts
const { open, setOpen, editing, viewing, searchTerm, setSearchTerm,
  handleCreate, handleEdit, handleView, handleCloseDetail } = useTableState<Client>()
```

---

## Hook 2: `useFormMutation<TValues>`

**File:** `frontend/src/hooks/useFormMutation.ts`

Hook generik untuk handle create/update ke PocketBase collection.

### Interface

```ts
interface UseFormMutationOptions<TValues> {
  collection: string
  queryKey: string[]
  initialData?: { id: string } | null
  onSuccess?: () => void
}

function useFormMutation<TValues>(
  options: UseFormMutationOptions<TValues>
): {
  mutate: (values: TValues) => void
  isPending: boolean
}
```

### Behavior internal

- Jika `initialData` ada → `pb.collection(collection).update(initialData.id, values)`
- Jika tidak → `pb.collection(collection).create(values)`
- On success → `queryClient.invalidateQueries({ queryKey })` + `onSuccess?.()`
- On error → `toast.error(message)`

### Forms yang di-refactor

| Form | File | Collection | QueryKey |
|---|---|---|---|
| ClientForm | `pages/clients/ClientForm.tsx` | `clients` | `['clients']` |
| VendorForm | `pages/vendors/VendorForm.tsx` | `vendors` | `['vendors']` |

> ProspectForm sudah pakai `useProspectMutation`, UserForm sudah pakai `useUserFormMutation` — keduanya sudah di-extract, tidak perlu diubah.

Field-field form tidak berubah — hanya blok `useMutation` yang diganti hook ini.

### Contoh sebelum/sesudah

**Sebelum (ClientForm):**
```ts
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: async (values: ClientFormValues) => {
    if (initialData) return await pb.collection('clients').update(initialData.id, values)
    return await pb.collection('clients').create(values)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] })
    onSuccess?.()
  },
  onError: (error) => {
    const message = error instanceof Error ? error.message : 'Failed to save client data.'
    toast.error(message)
  },
})
```

**Sesudah:**
```ts
const mutation = useFormMutation<ClientFormValues>({
  collection: 'clients',
  queryKey: ['clients'],
  initialData,
  onSuccess,
})
```

---

## Out of Scope

Item-item Prioritas Menengah dan Low (SearchInput komponen, ToolbarContainer, DetailDialog, filter hooks generik) tidak termasuk dalam refactor ini.

---

## Checklist Implementasi

- [ ] Buat `frontend/src/hooks/useTableState.ts`
- [ ] Buat `frontend/src/hooks/useFormMutation.ts`
- [ ] Refactor ClientsPage
- [ ] Refactor VendorsPage
- [ ] Refactor ProspectsPage
- [ ] Refactor UserManagement
- [ ] Refactor ClientForm
- [ ] Refactor VendorForm
- [ ] ~~ProspectForm~~ (sudah pakai useProspectMutation)
- [ ] ~~UserForm~~ (sudah pakai useUserFormMutation)
- [ ] Verifikasi tidak ada TypeScript error
