# Survey & Measurement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Survey & Measurement module — a new page accessible to the sosmed role and superadmin — where staff can create, view, edit, and delete survey appointments linking a client to an assigned surveyor with a datetime and optional notes.

**Architecture:** Table-based CRUD page following the same layout pattern as `ClientsPage`. Data lives in a new PocketBase `surveys` collection with relations to `clients` and `users`. A new `manage_surveys` permission controls access.

**Tech Stack:** React 19, TypeScript, TanStack Query, React Hook Form + Zod, PocketBase SDK, shadcn/ui (Radix), lucide-react, cmdk, sonner

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `frontend/src/types.ts` | Add `Survey` interface |
| Create | `frontend/src/lib/validations/survey.ts` | Zod schema + inferred types |
| Create | `frontend/src/hooks/useSurveys.ts` | Fetch + client-side search |
| Create | `frontend/src/components/forms/UserComboboxField.tsx` | Combobox for selecting an internal user (surveyor) |
| Create | `frontend/src/pages/survey/SurveyForm.tsx` | Create/edit form |
| Create | `frontend/src/pages/survey/SurveyTable.tsx` | DataTable with clickable rows |
| Create | `frontend/src/pages/survey/SurveyPage.tsx` | Main page (layout + state + dialogs) |
| Modify | `frontend/src/App.tsx` | Add `/survey` route with `PermissionGuard` |
| Modify | `frontend/src/components/layout/Sidebar/SidebarNav.tsx` | Add nav item after Prospects |
| Modify | `frontend/src/pages/settings/roleManagement/roleForm.tsx` | Add `manage_surveys` to permission checklist |

---

## Task 1: Add `Survey` type + Zod schema

**Files:**
- Modify: `frontend/src/types.ts`
- Create: `frontend/src/lib/validations/survey.ts`

- [ ] **Step 1: Add `Survey` interface to `types.ts`**

Open `frontend/src/types.ts` and append this block at the end of the file (after the `Project` interface):

```ts
export interface Survey {
  id: string
  client: string      // relation ID → clients
  surveyor: string    // relation ID → users
  schedule: string    // ISO datetime string
  notes?: string
  expand?: {
    client?: Client
    surveyor?: User
  }
  created: string
  updated: string
}
```

- [ ] **Step 2: Create Zod schema**

Create `frontend/src/lib/validations/survey.ts`:

```ts
import { z } from 'zod'

export const surveySchema = z.object({
  client:   z.string().min(1, 'Client is required'),
  surveyor: z.string().min(1, 'Surveyor is required'),
  schedule: z.string().min(1, 'Schedule is required'),
  notes:    z.string().max(500).optional(),
})

export type SurveyFormValues = z.infer<typeof surveySchema>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types.ts frontend/src/lib/validations/survey.ts
git commit -m "feat: add Survey type and Zod schema"
```

---

## Task 2: `useSurveys` hook

**Files:**
- Create: `frontend/src/hooks/useSurveys.ts`

- [ ] **Step 1: Create the hook**

Create `frontend/src/hooks/useSurveys.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Survey } from '@/types'

interface UseSurveysOptions {
  searchTerm?: string
}

export function useSurveys({ searchTerm = '' }: UseSurveysOptions = {}) {
  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () =>
      await pb.collection('surveys').getFullList<Survey>({
        sort: '-schedule',
        expand: 'client,surveyor',
      }),
  })

  const filtered = searchTerm
    ? surveys.filter((s) =>
        s.expand?.client?.company_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : surveys

  return { surveys: filtered, isLoading }
}
```

> Note: Filtering is done client-side because `company_name` lives on the expanded relation. The full list is cached by TanStack Query and filtered in-memory on each render.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useSurveys.ts
git commit -m "feat: add useSurveys hook"
```

---

## Task 3: `UserComboboxField` component

**Files:**
- Create: `frontend/src/components/forms/UserComboboxField.tsx`

This follows the exact same pattern as `ClientComboboxField` — a `<Popover>` + `cmdk` `<Command>` that searches users by name. The field name is hardcoded to `'surveyor'`.

- [ ] **Step 1: Create the component**

Create `frontend/src/components/forms/UserComboboxField.tsx`:

```tsx
import { useState } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import type { User } from '@/types'

interface UserComboboxFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>
  users: User[] | undefined
}

export function UserComboboxField<T extends FieldValues = FieldValues>({
  control,
  users,
}: UserComboboxFieldProps<T>) {
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={control}
      name={'surveyor' as Path<T>}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Surveyor</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    'w-full justify-between',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  {field.value
                    ? users?.find((u) => u.id === field.value)?.name
                    : 'Search & Select Surveyor...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Type name..." />
                <CommandList>
                  <CommandEmpty>No user found.</CommandEmpty>
                  <CommandGroup>
                    {users?.map((user) => (
                      <CommandItem
                        value={user.name}
                        key={user.id}
                        onSelect={() => {
                          field.onChange(user.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            user.id === field.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {user.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/forms/UserComboboxField.tsx
git commit -m "feat: add UserComboboxField combobox component"
```

---

## Task 4: `SurveyForm` component

**Files:**
- Create: `frontend/src/pages/survey/SurveyForm.tsx`

- [ ] **Step 1: Create the `survey/` directory and `SurveyForm.tsx`**

Create `frontend/src/pages/survey/SurveyForm.tsx`:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { surveySchema, type SurveyFormValues } from '@/lib/validations/survey'
import type { Survey } from '@/types'
import { useFormMutation } from '@/hooks/useFormMutation'
import { useClients } from '@/hooks/useClients'
import { useUsers } from '@/hooks/useUsers'
import { toLocalDateTimeInput } from '@/lib/helpers'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormSubmitButton } from '@/components/shared/FormSubmitButton'
import { ClientComboboxField } from '@/components/forms/ClientComboboxField'
import { UserComboboxField } from '@/components/forms/UserComboboxField'

interface SurveyFormProps {
  onSuccess?: () => void
  initialData?: Survey | null
}

export function SurveyForm({ onSuccess, initialData }: SurveyFormProps) {
  const { clients } = useClients()
  const { users } = useUsers()

  const { mutate, isPending } = useFormMutation<SurveyFormValues>({
    collection: 'surveys',
    queryKey: ['surveys'],
    initialData,
    onSuccess,
  })

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      client:   initialData?.client ?? '',
      surveyor: initialData?.surveyor ?? '',
      schedule: toLocalDateTimeInput(initialData?.schedule),
      notes:    initialData?.notes ?? '',
    },
  })

  function handleSubmit(values: SurveyFormValues) {
    const schedule = values.schedule
      ? new Date(values.schedule.length === 16 ? values.schedule + ':00' : values.schedule).toISOString()
      : values.schedule
    mutate({ ...values, schedule })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ClientComboboxField control={form.control} clients={clients} />
        <UserComboboxField control={form.control} users={users} />

        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this survey..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSubmitButton
          isPending={isPending}
          label={initialData ? 'Save Changes' : 'Create Survey'}
        />
      </form>
    </Form>
  )
}
```

> **Note on `ClientComboboxField`:** The existing component hardcodes field name `'client_id'`. For surveys the field is `'client'`. You need to check `ClientComboboxField.tsx` — if the hardcoded name is `'client_id'`, create a copy or pass `name` as a prop. See the workaround below.

**Workaround if `ClientComboboxField` hardcodes `'client_id'`:**

The existing `ClientComboboxField` uses `name={'client_id' as Path<T>}` — that won't match the `'client'` field in `surveySchema`. Use a plain `FormField` for the client instead:

```tsx
// Replace <ClientComboboxField ...> with this block:
<FormField
  control={form.control}
  name="client"
  render={({ field }) => {
    const [open, setOpen] = useState(false)
    return (
      <FormItem className="flex flex-col">
        <FormLabel>Client</FormLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                role="combobox"
                className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
              >
                {field.value
                  ? clients?.find((c) => c.id === field.value)?.company_name
                  : 'Search & Select Client...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Type client name..." />
              <CommandList>
                <CommandEmpty>No client found.</CommandEmpty>
                <CommandGroup>
                  {clients?.map((client) => (
                    <CommandItem
                      value={client.company_name}
                      key={client.id}
                      onSelect={() => { field.onChange(client.id); setOpen(false) }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', client.id === field.value ? 'opacity-100' : 'opacity-0')} />
                      {client.company_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )
  }}
/>
```

Add these imports to the top of `SurveyForm.tsx` if using the workaround:

```ts
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import type { Client } from '@/types'
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/survey/SurveyForm.tsx
git commit -m "feat: add SurveyForm component"
```

---

## Task 5: `SurveyTable` component

**Files:**
- Create: `frontend/src/pages/survey/SurveyTable.tsx`

- [ ] **Step 1: Create `SurveyTable.tsx`**

Create `frontend/src/pages/survey/SurveyTable.tsx`:

```tsx
import type { Survey } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RowActions } from '@/components/shared/RowActions'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { formatDateTime } from '@/lib/helpers'
import { ClipboardList } from 'lucide-react'

interface SurveyTableProps {
  surveys: Survey[]
  isLoading: boolean
  onEdit: (survey: Survey) => void
  onDelete: (survey: Survey) => void
}

export function SurveyTable({
  surveys,
  isLoading,
  onEdit,
  onDelete,
}: SurveyTableProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[220px]">Client</TableHead>
                <TableHead className="w-[180px]">Surveyor</TableHead>
                <TableHead className="w-[200px]">Schedule</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} columns={6} />
              ) : surveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60">
                    <EmptyState
                      icon={ClipboardList}
                      title="No surveys yet"
                      description="Create your first survey appointment to get started"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                surveys.map((survey, index) => (
                  <TableRow
                    key={survey.id}
                    className="h-14 cursor-pointer"
                    onClick={() => onEdit(survey)}
                  >
                    <TableCell className="text-slate-400 text-xs tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {survey.expand?.client?.company_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {survey.expand?.surveyor?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-600 tabular-nums">
                      {formatDateTime(survey.schedule)}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {survey.notes
                        ? survey.notes.length > 60
                          ? survey.notes.slice(0, 60) + '…'
                          : survey.notes
                        : '—'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <RowActions
                        actions={[
                          { label: 'Edit', icon: undefined, onClick: () => onEdit(survey) },
                          {
                            label: 'Delete',
                            icon: undefined,
                            onClick: () => onDelete(survey),
                            variant: 'destructive',
                          },
                        ]}
                      />
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
git add frontend/src/pages/survey/SurveyTable.tsx
git commit -m "feat: add SurveyTable component"
```

---

## Task 6: `SurveyPage` + route wiring

**Files:**
- Create: `frontend/src/pages/survey/SurveyPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create `SurveyPage.tsx`**

Create `frontend/src/pages/survey/SurveyPage.tsx`:

```tsx
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pb } from '@/lib/pocketbase'
import type { Survey } from '@/types'
import { useSurveys } from '@/hooks/useSurveys'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { useTableState } from '@/hooks/useTableState'
import { SurveyTable } from './SurveyTable'
import { SurveyForm } from './SurveyForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { TablePagination } from '@/components/shared/TablePagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ClipboardList, Plus, Search } from 'lucide-react'

export default function SurveyPage() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<Survey | null>(null)

  const {
    open,
    setOpen,
    editing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleCloseForm,
  } = useTableState<Survey>()

  const debouncedSearch = useDebounce(searchTerm, 300)
  const { surveys, isLoading } = useSurveys({ searchTerm: debouncedSearch })
  const { page, setPage, totalItems, totalPages, paginatedData } = usePagination(
    surveys,
    [debouncedSearch]
  )

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pb.collection('surveys').delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
      toast.success('Survey appointment deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete survey'),
  })

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<ClipboardList className="h-6 w-6 text-slate-800" />}
        title="Survey & Measurement"
        description="Manage survey and measurement appointments"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> New Survey
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <SurveyTable
          surveys={paginatedData}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemCount={paginatedData.length}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit Survey Appointment' : 'New Survey Appointment'}
        description={
          editing
            ? 'Update the survey appointment details.'
            : 'Fill in the details to schedule a new survey.'
        }
      >
        <SurveyForm
          key={editing ? editing.id : 'new-survey'}
          initialData={editing}
          onSuccess={handleCloseForm}
        />
      </FormDialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
        title="Delete Survey"
        description="This action cannot be undone."
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
```

- [ ] **Step 2: Add route in `App.tsx`**

In `frontend/src/App.tsx`, add the import at the top with the other page imports:

```ts
import SurveyPage from './pages/survey/SurveyPage'
```

Then add the route inside the layout route (after the `manage_prospects` block, before `settings/users`):

```tsx
<Route element={<PermissionGuard require="manage_surveys" />}>
  <Route path="survey" element={<SurveyPage />} />
</Route>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/survey/SurveyPage.tsx frontend/src/App.tsx
git commit -m "feat: add SurveyPage and register /survey route"
```

---

## Task 7: Sidebar nav item + permission registration

**Files:**
- Modify: `frontend/src/components/layout/Sidebar/SidebarNav.tsx`
- Modify: `frontend/src/pages/settings/roleManagement/roleForm.tsx`

- [ ] **Step 1: Add `ClipboardList` import to `SidebarNav.tsx`**

In `frontend/src/components/layout/Sidebar/SidebarNav.tsx`, add `ClipboardList` to the existing lucide-react import:

```ts
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
  Instagram,
  TrendingUp,
  ClipboardList,   // ← add this
} from 'lucide-react'
```

- [ ] **Step 2: Add nav item after the Prospects `<Guard>` block**

Find this block in `SidebarNav.tsx`:

```tsx
<Guard require="manage_prospects">
  <NavItem
    to="/prospects"
    icon={Instagram}
    label="Prospects"
    collapsed={collapsed}
    isActive={isActive('/prospects')}
    onClick={onLinkClick}
  />
</Guard>
```

Insert immediately after it:

```tsx
<Guard require="manage_surveys">
  <NavItem
    to="/survey"
    icon={ClipboardList}
    label="Survey & Measurement"
    collapsed={collapsed}
    isActive={isActive('/survey')}
    onClick={onLinkClick}
  />
</Guard>
```

- [ ] **Step 3: Add `manage_surveys` to `roleForm.tsx` permission checklist**

In `frontend/src/pages/settings/roleManagement/roleForm.tsx`, find the `Prospects` permission group:

```ts
{
  title: 'Prospects',
  permissions: [
    { id: 'manage_prospects', label: 'Manage Prospects (View/Create/Edit)' },
  ],
},
```

Add a new group directly after it:

```ts
{
  title: 'Survey & Measurement',
  permissions: [
    { id: 'manage_surveys', label: 'Manage Surveys (View/Create/Edit/Delete)' },
  ],
},
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/layout/Sidebar/SidebarNav.tsx \
        frontend/src/pages/settings/roleManagement/roleForm.tsx
git commit -m "feat: add Survey & Measurement to sidebar and permission checklist"
```

---

## Task 8: PocketBase collection setup (manual)

This task is performed in the PocketBase admin dashboard at `https://pb-rh.elvanrff.com/_/`.

- [ ] **Step 1: Create the `surveys` collection**

Go to **Collections → New collection** → name: `surveys`, type: **Base**.

Add fields:

| Field name | Type | Options |
|---|---|---|
| `client` | Relation | Collection: `clients`, Required |
| `surveyor` | Relation | Collection: `users`, Required |
| `schedule` | DateTime | Required |
| `notes` | Text | Max length: 500, Optional |

- [ ] **Step 2: Configure collection rules**

In the `surveys` collection → **API Rules** tab:

| Rule | Value |
|---|---|
| List | `@request.auth.id != ""` |
| View | `@request.auth.id != ""` |
| Create | `@request.auth.id != ""` |
| Update | `@request.auth.id != ""` |
| Delete | `@request.auth.isSuperAdmin = true` |

- [ ] **Step 3: Assign `manage_surveys` to sosmed role**

Go to **Collections → roles → Records** → find the sosmed role record → edit its `permissions` JSON array → add `"manage_surveys"` to the array → save.

- [ ] **Step 4: Verify**

Open the app, log in as a sosmed user — "Survey & Measurement" should appear in the sidebar. Click it to confirm the page loads and the "New Survey" button opens the form.

---

## Self-Review Checklist

- [x] All spec requirements covered: type, schema, hook, form, table, page, route, sidebar, permission
- [x] No TBD or TODO placeholders
- [x] `Survey` interface uses `client` (not `client_id`) — matches `surveySchema` field name
- [x] `toLocalDateTimeInput` used for defaultValue in form, ISO conversion on submit matches `useProspectMutation` pattern
- [x] `RowActions` `onClick` on cell uses `e.stopPropagation()` to prevent row click conflict
- [x] Delete uses inline `useMutation` (not `useFormMutation`) — same pattern as `ProjectPageTemplate`
- [x] `useTableState` provides `handleCloseForm` (not `handleCloseDetail`) — verify this method name exists; if not, use `() => setOpen(false)` instead
