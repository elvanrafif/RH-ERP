# Project–Invoice Link & Revenue Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Link each project to one invoice, then show Realized + Potential Revenue in the project page stats bar, and display the linked project name as read-only info on the invoice detail page.

**Architecture:** `invoice_id` (optional relation) is stored on the `projects` collection. A new hook `useProjectInvoiceStats` fetches active projects with their expanded invoices and computes both revenue figures. The project form gains a "Linked Invoice" combobox; the invoice detail page shows the linked project via reverse query.

**Tech Stack:** React 19, TypeScript, PocketBase SDK, TanStack Query, React Hook Form + Zod, Tailwind CSS 4

---

## Pre-requisite: PocketBase Schema Change (Manual — done by developer)

Before running any code tasks, add the field in PocketBase admin panel:

1. Open collection `projects`
2. Click **New field** → Type: **Relation**
3. Field name: `invoice_id`
4. Target collection: `invoices`
5. Max select: `1`
6. Required: **No**
7. Save

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `frontend/src/types.ts` | Modify | Add `invoice_id` and `expand.invoice_id` to `Project` interface |
| `frontend/src/lib/validations/project.ts` | Modify | Add optional `invoice_id` field to Zod schema |
| `frontend/src/hooks/useProjectInvoiceStats.ts` | Create | Fetch & compute Realized + Potential revenue |
| `frontend/src/pages/projects/ProjectForm.tsx` | Modify | Add Linked Invoice combobox + update mutation payload |
| `frontend/src/pages/projects/ProjectPageTemplate.tsx` | Modify | Replace Potential Revenue card with dual-revenue card |
| `frontend/src/pages/invoices/InvoiceDetailPage.tsx` | Modify | Add reverse query + read-only Linked Project info |

---

## Task 1: Update Types and Validation Schema

**Files:**
- Modify: `frontend/src/types.ts`
- Modify: `frontend/src/lib/validations/project.ts`

- [ ] **Step 1: Add `invoice_id` and expand to `Project` interface in `types.ts`**

In `frontend/src/types.ts`, add to the `Project` interface:

```ts
export interface Project {
  id: string
  client: string
  type: 'architecture' | 'civil' | 'interior'
  status: string
  value: number
  contract_value: number
  deadline: string
  start_date?: string
  end_date?: string
  assignee?: string
  vendor?: string
  source_architecture?: string
  luas_tanah?: number
  luas_bangunan?: number
  notes?: string
  is_on_hold?: boolean
  hold_reason?: string
  held_at?: string
  invoice_id?: string // Relation ID → invoices (optional)

  meta_data: {
    area_scope?: string
    additional_links?: Array<{ label?: string; url: string } | string>
    [key: string]: any
  }

  expand?: {
    client?: Client
    assignee?: User
    vendor?: Vendor
    source_architecture?: Project
    invoice_id?: {
      id: string
      invoice_number: string
      total_amount: number
      items: Array<{ amount: number; status?: string; paymentDate?: string }>
      type: string
    }
  }
  created: string
  updated: string
}
```

- [ ] **Step 2: Add `invoice_id` to Zod project schema**

In `frontend/src/lib/validations/project.ts`:

```ts
import { z } from 'zod'

export const projectSchema = z.object({
  client_id: z.string().min(1, 'Please select a client'),
  assignee: z.string().optional(),
  status: z.string(),
  contract_value: z.coerce
    .number()
    .min(0)
    .optional() as z.ZodOptional<z.ZodNumber>,
  deadline: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  luas_tanah: z.coerce.number().optional() as z.ZodOptional<z.ZodNumber>,
  luas_bangunan: z.coerce.number().optional() as z.ZodOptional<z.ZodNumber>,
  vendor: z.string().optional(),
  source_architecture: z.string().optional(),
  area_scope: z.string().optional(),
  notes: z.string().optional(),
  invoice_id: z.string().optional(),
  additional_links: z
    .array(z.object({ label: z.string().optional(), url: z.string() }))
    .max(5)
    .optional(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors related to `invoice_id`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types.ts frontend/src/lib/validations/project.ts
git commit -m "feat(project): add invoice_id field to Project type and schema"
```

---

## Task 2: Create `useProjectInvoiceStats` Hook

**Files:**
- Create: `frontend/src/hooks/useProjectInvoiceStats.ts`

- [ ] **Step 1: Create the hook**

```ts
// frontend/src/hooks/useProjectInvoiceStats.ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

type ProjectType = 'architecture' | 'civil' | 'interior'

const INVOICE_TYPE_MAP: Record<ProjectType, string> = {
  architecture: 'design',
  civil: 'sipil',
  interior: 'interior',
}

export function useProjectInvoiceStats(projectType: ProjectType) {
  const { data, isLoading } = useQuery({
    queryKey: ['project-invoice-stats', projectType],
    queryFn: async () => {
      const records = await pb.collection('projects').getFullList({
        filter: `type = '${projectType}' && invoice_id != '' && status != 'done' && status != 'finish'`,
        expand: 'invoice_id',
        fields: 'id,invoice_id,expand.invoice_id.total_amount,expand.invoice_id.items',
      })

      let potentialRevenue = 0
      let realizationRevenue = 0

      for (const project of records) {
        const invoice = project.expand?.invoice_id
        if (!invoice) continue

        potentialRevenue += invoice.total_amount ?? 0

        const items: Array<{ amount: number; status?: string; paymentDate?: string }> =
          invoice.items ?? []

        for (const item of items) {
          if (item.status === 'Success' && item.paymentDate && item.paymentDate !== '') {
            realizationRevenue += item.amount ?? 0
          }
        }
      }

      return { potentialRevenue, realizationRevenue }
    },
  })

  return {
    potentialRevenue: data?.potentialRevenue ?? 0,
    realizationRevenue: data?.realizationRevenue ?? 0,
    isLoading,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useProjectInvoiceStats.ts
git commit -m "feat(project): add useProjectInvoiceStats hook for revenue computation"
```

---

## Task 3: Update Project Form — Linked Invoice Combobox

**Files:**
- Modify: `frontend/src/pages/projects/ProjectForm.tsx`

- [ ] **Step 1: Add invoice fetch query and `invoice_id` defaultValue**

In `ProjectForm.tsx`, add after the existing `useVendors` calls (around line 64):

```ts
// Map project type to invoice type for fetching
const invoiceTypeMap: Record<string, string> = {
  architecture: 'design',
  civil: 'sipil',
  interior: 'interior',
}
const invoiceType = invoiceTypeMap[fixedType]

const { data: linkedInvoices = [] } = useQuery({
  queryKey: ['invoices-for-project', invoiceType],
  queryFn: () =>
    pb.collection('invoices').getFullList({
      filter: `type = "${invoiceType}"`,
      expand: 'client_id',
      fields: 'id,invoice_number,expand.client_id.company_name,expand.client_id.salutation',
      sort: '-created',
    }),
})
```

- [ ] **Step 2: Add `invoice_id` to form defaultValues**

In the `useForm` defaultValues object (around line 92), add:

```ts
invoice_id: initialData?.invoice_id || '',
```

- [ ] **Step 3: Add `invoice_id` to mutation payload**

In the `mutationFn` payload object (around line 148), add:

```ts
invoice_id: values.invoice_id || null,
```

- [ ] **Step 4: Add Linked Invoice Select field to JSX**

Add between `<AdditionalLinksField />` and the `notes` FormField (around line 249):

```tsx
{isSuperAdmin && (
  <FormField
    control={form.control}
    name="invoice_id"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Linked Invoice</FormLabel>
        <Select
          onValueChange={field.onChange}
          value={field.value as string || ''}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select invoice (optional)" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {linkedInvoices.map((inv) => {
              const clientName = inv.expand?.client_id?.company_name ?? '—'
              return (
                <SelectItem key={inv.id} value={inv.id}>
                  {inv.invoice_number} — {clientName}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </FormItem>
    )}
  />
)}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Manual test**

1. Open Architecture project form (create or edit)
2. Scroll to "Linked Invoice" field — should show dropdown with all `design` invoices
3. Select one, save — check PocketBase admin that `invoice_id` is saved on the project record
4. Re-open the project form — should pre-fill with the selected invoice

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/projects/ProjectForm.tsx
git commit -m "feat(project): add Linked Invoice combobox to project form"
```

---

## Task 4: Update Stats Bar Widget — Dual Revenue Card

**Files:**
- Modify: `frontend/src/pages/projects/ProjectPageTemplate.tsx`

- [ ] **Step 1: Import `useProjectInvoiceStats` and `TrendingUp` icon**

At the top of `ProjectPageTemplate.tsx`, add to imports:

```ts
import { useProjectInvoiceStats } from '@/hooks/useProjectInvoiceStats'
```

And add `TrendingUp` to the lucide import:

```ts
import { Plus, Banknote, Activity, AlertTriangle, TrendingUp } from 'lucide-react'
```

- [ ] **Step 2: Call hook in component body**

After the `atRiskStats` useMemo (around line 102), add:

```ts
const { potentialRevenue, realizationRevenue } = useProjectInvoiceStats(projectType)
```

- [ ] **Step 3: Replace the Potential Revenue card JSX**

Replace the existing `{isSuperAdmin && (<ProjectStatCard ... label="Potential Revenue" .../>)}` block (lines 160–172) with:

```tsx
{isSuperAdmin && (
  <ProjectStatCard
    icon={<Banknote />}
    label="Project Revenue"
    color="emerald"
    value={
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between md:justify-start gap-2">
          <span className="text-xs text-emerald-600 font-medium w-16 shrink-0">Realized</span>
          <span className="text-sm md:text-base font-bold text-slate-800">
            {formatRupiah(realizationRevenue)}
          </span>
        </div>
        <div className="flex items-baseline justify-between md:justify-start gap-2">
          <span className="text-xs text-slate-400 font-medium w-16 shrink-0">Potential</span>
          <span className="text-sm md:text-base font-bold text-slate-500">
            {formatRupiah(potentialRevenue)}
          </span>
        </div>
      </div>
    }
    description="From linked invoices on active projects."
  />
)}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Manual test**

1. Open Architecture page
2. Stats bar should show "Project Revenue" card with two rows: Realized and Potential
3. If no invoices are linked yet, both show `Rp 0`
4. Link an invoice to a project (Task 3), check that Potential updates to that invoice's `total_amount`
5. Mark a termin as `Success` with a `paymentDate` in the invoice editor, check Realized updates

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/projects/ProjectPageTemplate.tsx
git commit -m "feat(project): replace Potential Revenue card with dual Realized/Potential revenue widget"
```

---

## Task 5: Invoice Detail — Linked Project Info (Read-Only)

**Files:**
- Modify: `frontend/src/pages/invoices/InvoiceDetailPage.tsx`

- [ ] **Step 1: Add reverse query for linked project**

In `InvoiceDetailPage.tsx`, add after the existing `useQuery` for invoice (around line 44):

```ts
const { data: linkedProject } = useQuery({
  queryKey: ['project-by-invoice', id],
  queryFn: async () => {
    const results = await pb.collection('projects').getList(1, 1, {
      filter: `invoice_id = "${id}"`,
      expand: 'client',
      fields: 'id,type,expand.client.company_name,expand.client.salutation',
    })
    return results.items[0] ?? null
  },
  enabled: !!id,
})
```

- [ ] **Step 2: Display linked project info in the UI**

Find where invoice info/settings are displayed in the editor. In `InvoiceDetailPage.tsx`, locate the section that renders the notes/settings panel. Add the linked project row just before or after the existing `notes` label section. Look for `<Label>` usage and add:

```tsx
{linkedProject && (
  <div className="flex flex-col gap-1">
    <Label className="text-xs text-muted-foreground">Linked Project</Label>
    <p className="text-sm font-medium text-slate-700">
      {linkedProject.expand?.client?.company_name ?? '—'}
      <span className="ml-2 text-xs text-muted-foreground capitalize">
        ({linkedProject.type})
      </span>
    </p>
  </div>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual test**

1. Open an invoice that has been linked to a project (linked in Task 3)
2. Should show "Linked Project" label with client name and project type
3. Open an invoice NOT linked to any project — section should not render (hidden)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/invoices/InvoiceDetailPage.tsx
git commit -m "feat(invoice): show linked project info (read-only) on invoice detail page"
```

---

## Task 6: Final Integration Check

- [ ] **Step 1: Full TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: End-to-end flow test**

1. Go to PocketBase admin — confirm `invoice_id` field exists on `projects` collection
2. Open a project edit form → select a Linked Invoice → save
3. Check PocketBase admin → confirm `invoice_id` is populated on the project record
4. Open the linked invoice detail page → confirm "Linked Project" shows correct client name
5. Open Architecture/Civil/Interior page → confirm "Project Revenue" card shows correct Potential value
6. In the invoice editor, set a termin to `status = Success` and fill `paymentDate` → save
7. Return to project page → confirm Realized Revenue reflects the termin amount

- [ ] **Step 3: Push to staging**

```bash
git checkout staging
git push
```
