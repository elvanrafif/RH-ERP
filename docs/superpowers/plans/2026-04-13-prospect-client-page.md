# Prospect Client Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat halaman `/prospects` untuk mendata prospect client dari Instagram, menggantikan Google Sheets yang lama.

**Architecture:** Mengikuti pola VendorsPage — table + form dialog + detail dialog. Data disimpan di PocketBase collection `prospects` yang sudah dibuat. Access control via permission `manage_prospects` (superadmin selalu punya akses karena `can()` return true untuk superadmin).

**Tech Stack:** React 19, TypeScript, TanStack Query, React Hook Form + Zod, PocketBase, Radix UI + Tailwind CSS 4

---

## File Map

| File | Status | Tanggung Jawab |
|---|---|---|
| `frontend/src/types.ts` | Modify | Tambah interface `Prospect` |
| `frontend/src/lib/constant.ts` | Modify | Tambah konstanta prospect options |
| `frontend/src/lib/helpers.ts` | Modify | Tambah `formatDateTime` helper |
| `frontend/src/lib/validations/prospect.ts` | Create | Zod schema untuk form |
| `frontend/src/hooks/useProspects.ts` | Create | Query hook untuk fetch prospects |
| `frontend/src/pages/prospects/ProspectTable.tsx` | Create | Table component |
| `frontend/src/pages/prospects/ProspectDetailDialog.tsx` | Create | Read-only detail dialog |
| `frontend/src/pages/prospects/ProspectForm.tsx` | Create | Create/edit form dialog |
| `frontend/src/pages/prospects/ProspectsPage.tsx` | Create | Page utama (orchestrator) |
| `frontend/src/App.tsx` | Modify | Tambah route `/prospects` |
| `frontend/src/components/layout/Sidebar/SidebarNav.tsx` | Modify | Tambah nav item Prospects |

---

## Task 1: Tambah Prospect type, konstanta, dan formatDateTime helper

**Files:**
- Modify: `frontend/src/types.ts`
- Modify: `frontend/src/lib/constant.ts`
- Modify: `frontend/src/lib/helpers.ts`

- [ ] **Step 1: Tambah interface `Prospect` di `types.ts`**

Tambahkan di bawah interface `Vendor` (setelah baris 31):

```typescript
export interface Prospect {
  id: string
  instagram: string
  client_name: string
  phone: string
  address?: string
  land_size?: number
  needs: string[] // JSON array: ["Design", "Build"]
  floor?: string
  renovation_type?: string
  status: string
  notes?: string
  meeting_schedule?: string
  confirmation?: string
  quotation?: string
  survey_schedule?: string
  result?: string
  created: string
  updated: string
}
```

- [ ] **Step 2: Tambah konstanta prospect di `constant.ts`**

Tambahkan di akhir file:

```typescript
// Prospect
export const PROSPECT_STATUS = {
  WAITING: 'waiting for online schedule',
} as const

export const FLOOR_OPTIONS = ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'] as const

export const NEEDS_OPTIONS = ['Design', 'Build'] as const

export const RENOVATION_TYPE_OPTIONS = ['new build', 'total renovation'] as const

export const QUOTATION_OPTIONS = ['design', 'civil'] as const
```

- [ ] **Step 3: Tambah `formatDateTime` helper di `helpers.ts`**

Tambahkan setelah fungsi `formatDateLong`:

```typescript
export const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types.ts frontend/src/lib/constant.ts frontend/src/lib/helpers.ts
git commit -m "feat(prospects): add Prospect type, constants, and formatDateTime helper"
```

---

## Task 2: Buat Zod schema

**Files:**
- Create: `frontend/src/lib/validations/prospect.ts`

- [ ] **Step 1: Buat file `frontend/src/lib/validations/prospect.ts`**

```typescript
import { z } from 'zod'

export const prospectSchema = z.object({
  instagram: z.string().min(1, { message: 'Instagram handle is required.' }),
  client_name: z.string().min(1, { message: 'Client name is required.' }),
  phone: z.string().min(1, { message: 'Phone number is required.' }),
  address: z.string().optional(),
  land_size: z.coerce.number().positive().optional().or(z.literal('')),
  needs: z.array(z.string()).default([]),
  floor: z.string().optional(),
  renovation_type: z.string().optional(),
  status: z.string().min(1, { message: 'Status is required.' }),
  notes: z.string().optional(),
  meeting_schedule: z.string().optional(),
  confirmation: z.string().optional(),
  quotation: z.string().optional(),
  survey_schedule: z.string().optional(),
  result: z.string().optional(),
})

export type ProspectFormValues = z.infer<typeof prospectSchema>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/validations/prospect.ts
git commit -m "feat(prospects): add Zod validation schema"
```

---

## Task 3: Buat `useProspects` hook

**Files:**
- Create: `frontend/src/hooks/useProspects.ts`

- [ ] **Step 1: Buat file `frontend/src/hooks/useProspects.ts`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Prospect } from '@/types'

interface UseProspectsOptions {
  searchTerm?: string
}

export function useProspects({ searchTerm = '' }: UseProspectsOptions = {}) {
  const { data: prospects = [], isLoading } = useQuery({
    queryKey: ['prospects', searchTerm],
    queryFn: async () => {
      const filters: string[] = []

      if (searchTerm) {
        filters.push(
          `client_name ~ "${searchTerm}" || instagram ~ "${searchTerm}" || phone ~ "${searchTerm}"`
        )
      }

      return await pb.collection('prospects').getFullList<Prospect>({
        sort: '-created',
        filter: filters.join(' && '),
      })
    },
  })

  return { prospects, isLoading }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useProspects.ts
git commit -m "feat(prospects): add useProspects query hook"
```

---

## Task 4: Buat `ProspectTable`

**Files:**
- Create: `frontend/src/pages/prospects/ProspectTable.tsx`

- [ ] **Step 1: Buat file `frontend/src/pages/prospects/ProspectTable.tsx`**

```typescript
import type { Prospect } from '@/types'
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
import { formatDateTime } from '@/lib/helpers'

interface ProspectTableProps {
  prospects: Prospect[]
  isLoading: boolean
  onView: (prospect: Prospect) => void
  onEdit: (prospect: Prospect) => void
}

export function ProspectTable({
  prospects,
  isLoading,
  onView,
  onEdit,
}: ProspectTableProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[120px]">Needs</TableHead>
                <TableHead className="w-[150px]">Meeting Schedule</TableHead>
                <TableHead className="w-[150px]">Survey Schedule</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton cols={10} rows={8} />
              ) : prospects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10}>
                    <EmptyState message="No prospects found." />
                  </TableCell>
                </TableRow>
              ) : (
                prospects.map((prospect, index) => (
                  <TableRow
                    key={prospect.id}
                    className="cursor-pointer hover:bg-slate-50/80"
                    onClick={() => onView(prospect)}
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {prospect.instagram || '—'}
                    </TableCell>
                    <TableCell className="text-sm">{prospect.client_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {prospect.phone}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs capitalize">
                        {prospect.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {prospect.needs?.length
                        ? prospect.needs.join(', ')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(prospect.meeting_schedule)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(prospect.survey_schedule)}
                    </TableCell>
                    <TableCell className="text-sm max-w-[160px] truncate">
                      {prospect.result || '—'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(prospect)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Detail
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(prospect)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
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
git add frontend/src/pages/prospects/ProspectTable.tsx
git commit -m "feat(prospects): add ProspectTable component"
```

---

## Task 5: Buat `ProspectDetailDialog`

**Files:**
- Create: `frontend/src/pages/prospects/ProspectDetailDialog.tsx`

- [ ] **Step 1: Buat file `frontend/src/pages/prospects/ProspectDetailDialog.tsx`**

```typescript
import type { Prospect } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Instagram,
  Phone,
  MapPin,
  CalendarClock,
  FileText,
  CheckSquare,
  Layers,
  Wrench,
  ClipboardList,
  CalendarCheck,
} from 'lucide-react'
import { formatDateTime } from '@/lib/helpers'

interface ProspectDetailDialogProps {
  prospect: Prospect | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-slate-800 break-words">{value || '—'}</p>
      </div>
    </div>
  )
}

export function ProspectDetailDialog({
  prospect,
  open,
  onOpenChange,
}: ProspectDetailDialogProps) {
  if (!prospect) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {prospect.client_name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                @{prospect.instagram}
              </p>
              <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs capitalize">
                {prospect.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-3">
          <DetailRow icon={Phone} label="Phone" value={prospect.phone} />
          <DetailRow icon={MapPin} label="Address" value={prospect.address} />
          <DetailRow
            icon={Layers}
            label="Land Size"
            value={prospect.land_size ? `${prospect.land_size} m²` : undefined}
          />
          <DetailRow
            icon={CheckSquare}
            label="Needs"
            value={
              prospect.needs?.length ? (
                <div className="flex gap-1 flex-wrap">
                  {prospect.needs.map((n) => (
                    <Badge key={n} variant="outline" className="text-xs">
                      {n}
                    </Badge>
                  ))}
                </div>
              ) : undefined
            }
          />
          <DetailRow
            icon={Wrench}
            label="Floor"
            value={prospect.floor ? `${prospect.floor} Lantai` : undefined}
          />
          <DetailRow
            icon={Wrench}
            label="Renovation Type"
            value={prospect.renovation_type}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <DetailRow
            icon={FileText}
            label="Notes"
            value={
              prospect.notes ? (
                <span className="whitespace-pre-wrap">{prospect.notes}</span>
              ) : undefined
            }
          />
          <DetailRow
            icon={CalendarClock}
            label="Meeting Schedule (WIB)"
            value={formatDateTime(prospect.meeting_schedule)}
          />
          <DetailRow
            icon={FileText}
            label="Confirmation"
            value={prospect.confirmation}
          />
          <DetailRow
            icon={ClipboardList}
            label="Quotation"
            value={prospect.quotation}
          />
          <DetailRow
            icon={CalendarCheck}
            label="Survey Schedule"
            value={formatDateTime(prospect.survey_schedule)}
          />
          <DetailRow
            icon={FileText}
            label="Result"
            value={prospect.result}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/prospects/ProspectDetailDialog.tsx
git commit -m "feat(prospects): add ProspectDetailDialog component"
```

---

## Task 6: Buat `ProspectForm`

**Files:**
- Create: `frontend/src/pages/prospects/ProspectForm.tsx`

- [ ] **Step 1: Buat file `frontend/src/pages/prospects/ProspectForm.tsx`**

```typescript
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { prospectSchema, type ProspectFormValues } from '@/lib/validations/prospect'
import type { Prospect } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import {
  FLOOR_OPTIONS,
  NEEDS_OPTIONS,
  RENOVATION_TYPE_OPTIONS,
  QUOTATION_OPTIONS,
  PROSPECT_STATUS,
} from '@/lib/constant'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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

interface ProspectFormProps {
  onSuccess?: () => void
  initialData?: Prospect | null
}

export function ProspectForm({ onSuccess, initialData }: ProspectFormProps) {
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useAuth()

  const form = useForm<ProspectFormValues>({
    resolver: zodResolver(prospectSchema),
    defaultValues: {
      instagram: initialData?.instagram ?? '',
      client_name: initialData?.client_name ?? '',
      phone: initialData?.phone ?? '',
      address: initialData?.address ?? '',
      land_size: initialData?.land_size ?? undefined,
      needs: initialData?.needs ?? [],
      floor: initialData?.floor ?? '',
      renovation_type: initialData?.renovation_type ?? '',
      status: initialData?.status ?? PROSPECT_STATUS.WAITING,
      notes: initialData?.notes ?? '',
      meeting_schedule: initialData?.meeting_schedule
        ? initialData.meeting_schedule.slice(0, 16)
        : '',
      confirmation: initialData?.confirmation ?? '',
      quotation: initialData?.quotation ?? '',
      survey_schedule: initialData?.survey_schedule
        ? initialData.survey_schedule.slice(0, 16)
        : '',
      result: initialData?.result ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: ProspectFormValues) => {
      const payload = {
        ...values,
        land_size: values.land_size === '' ? null : values.land_size,
        meeting_schedule: values.meeting_schedule || null,
        survey_schedule: values.survey_schedule || null,
      }
      if (initialData) {
        return await pb.collection('prospects').update(initialData.id, payload)
      }
      return await pb.collection('prospects').create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
      toast.success(initialData ? 'Prospect updated.' : 'Prospect added.')
      onSuccess?.()
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to save prospect.'
      toast.error(message)
    },
  })

  function onSubmit(values: ProspectFormValues) {
    mutation.mutate(values)
  }

  const needsValue = form.watch('needs') ?? []

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Row 1: Instagram + Client Name */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input placeholder="@username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="client_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Phone + Address */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="0812..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="City / Area" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Land Size + Floor */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="land_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Land Size (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 120"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select floor..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FLOOR_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f} Lantai
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4: Renovation Type + Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="renovation_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Renovation Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RENOVATION_TYPE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={PROSPECT_STATUS.WAITING} className="capitalize">
                      {PROSPECT_STATUS.WAITING}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Needs — multi-checkbox */}
        <FormItem>
          <FormLabel>Needs</FormLabel>
          <div className="flex gap-6 mt-1">
            {NEEDS_OPTIONS.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`needs-${option}`}
                  checked={needsValue.includes(option)}
                  onCheckedChange={(checked) => {
                    const current = form.getValues('needs') ?? []
                    form.setValue(
                      'needs',
                      checked
                        ? [...current, option]
                        : current.filter((n) => n !== option)
                    )
                  }}
                />
                <label
                  htmlFor={`needs-${option}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </FormItem>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes..."
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meeting Schedule — disabled for non-superadmin */}
        <FormField
          control={form.control}
          name="meeting_schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Schedule (WIB)</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={field.value ?? ''}
                  disabled={!isSuperAdmin}
                  className={!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}
                />
              </FormControl>
              {!isSuperAdmin && (
                <p className="text-xs text-muted-foreground">
                  Only superadmin can set the meeting schedule.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row: Confirmation + Quotation */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmation</FormLabel>
                <FormControl>
                  <Input placeholder="Confirmation notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quotation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quotation</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {QUOTATION_OPTIONS.map((q) => (
                      <SelectItem key={q} value={q} className="capitalize">
                        {q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Survey Schedule */}
        <FormField
          control={form.control}
          name="survey_schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Survey Schedule</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Result */}
        <FormField
          control={form.control}
          name="result"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Result</FormLabel>
              <FormControl>
                <Input placeholder="Outcome or next steps..." {...field} />
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
            {initialData ? 'Save Changes' : 'Add Prospect'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/prospects/ProspectForm.tsx
git commit -m "feat(prospects): add ProspectForm component"
```

---

## Task 7: Buat `ProspectsPage`

**Files:**
- Create: `frontend/src/pages/prospects/ProspectsPage.tsx`

- [ ] **Step 1: Buat file `frontend/src/pages/prospects/ProspectsPage.tsx`**

```typescript
import { useState, useEffect } from 'react'
import type { Prospect } from '@/types'
import { ProspectTable } from './ProspectTable'
import { ProspectForm } from './ProspectForm'
import { ProspectDetailDialog } from './ProspectDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useProspects } from '@/hooks/useProspects'
import { TablePagination } from '@/components/shared/TablePagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Instagram } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'

const PAGE_SIZE = 15

export default function ProspectsPage() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)
  const [viewingProspect, setViewingProspect] = useState<Prospect | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const { prospects: data, isLoading } = useProspects({
    searchTerm: debouncedSearch,
  })

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const paginatedProspects = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreate = () => {
    setEditingProspect(null)
    setOpen(true)
  }

  const handleEdit = (prospect: Prospect) => {
    setEditingProspect(prospect)
    setOpen(true)
  }

  const handleView = (prospect: Prospect) => {
    setViewingProspect(prospect)
  }

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
        title={editingProspect ? 'Edit Prospect' : 'Add New Prospect'}
        description={
          editingProspect
            ? 'Update the prospect information below.'
            : 'Fill in the prospect details below.'
        }
      >
        <ProspectForm
          key={editingProspect ? editingProspect.id : 'new-prospect'}
          initialData={editingProspect}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <ProspectDetailDialog
        prospect={viewingProspect}
        open={!!viewingProspect}
        onOpenChange={(isOpen) => !isOpen && setViewingProspect(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/prospects/ProspectsPage.tsx
git commit -m "feat(prospects): add ProspectsPage orchestrator"
```

---

## Task 8: Wire up route dan sidebar

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/layout/Sidebar/SidebarNav.tsx`

- [ ] **Step 1: Tambah import dan route di `App.tsx`**

Tambah import di bagian `--- NEW PAGES IMPORTS ---` (sekitar baris 39, setelah `VendorsPage` import):

```typescript
import ProspectsPage from './pages/prospects/ProspectsPage'
```

Tambah route setelah route `vendors` (sekitar baris 109):

```typescript
<Route element={<PermissionGuard require="manage_prospects" />}>
  <Route path="prospects" element={<ProspectsPage />} />
</Route>
```

- [ ] **Step 2: Tambah nav item di `SidebarNav.tsx`**

Tambah import `Instagram` dari lucide-react di baris imports (baris 1-12):

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
  Instagram,
} from 'lucide-react'
```

Tambah nav item setelah `<NavItem to="/clients" ...>` dan sebelum `{isSuperAdmin && ...vendors...}` (sekitar baris 117):

```typescript
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

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/layout/Sidebar/SidebarNav.tsx
git commit -m "feat(prospects): wire up /prospects route and sidebar nav item"
```

---

## Task 9: Tambah permission `manage_prospects` di Role Management

> Ini dilakukan manual via UI Role Management di browser, bukan via code.

- [ ] **Step 1:** Login sebagai superadmin → buka `/settings/roles`
- [ ] **Step 2:** Edit role yang dipakai oleh admin sosmed → tambah permission `manage_prospects`
- [ ] **Step 3:** Verifikasi login dengan akun admin sosmed → halaman `/prospects` muncul di sidebar dan bisa diakses

---

## Self-Review

**Spec coverage check:**
- ✅ Semua 15 fields dari DB schema diimplementasi di form dan detail dialog
- ✅ `meeting_schedule` disabled untuk non-superadmin
- ✅ `needs` multi-checkbox
- ✅ `floor` selection dengan format "X Lantai"
- ✅ Search bar (client_name, instagram, phone)
- ✅ Pagination 15 rows
- ✅ Route guard via `PermissionGuard require="manage_prospects"` (superadmin auto-pass)
- ✅ Sidebar nav dengan Guard
- ✅ Instruksi manual untuk assign permission ke role admin sosmed

**Type consistency check:**
- `Prospect` interface di `types.ts` dipakai konsisten di semua komponen
- `ProspectFormValues` dari Zod schema dipakai di `ProspectForm`
- `FLOOR_OPTIONS`, `NEEDS_OPTIONS`, dll dari `constant.ts` dipakai di form
- `formatDateTime` dari `helpers.ts` dipakai di table dan detail dialog
