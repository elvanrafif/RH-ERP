# Invoice Payment Dates Filter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a filter-by-payment-month to the invoice table by storing derived payment dates in a new `payment_dates` JSON field on each invoice record.

**Architecture:** Each time an invoice is saved in `InvoiceDetailPage`, a helper derives non-empty `paymentDate` values from `items[]` and persists them as `payment_dates` (string array) via FormData. The filter in `useInvoices` passes `payment_dates ?~ "YYYY-MM"` to PocketBase, enabling server-side filtering. A one-time backfill script populates `payment_dates` for existing records.

**Tech Stack:** PocketBase (JSON field + `?~` filter operator), React + TypeScript, TanStack Query, date-fns, existing `MonthYearPicker` shared component.

---

## File Map

| File | Action | What changes |
|---|---|---|
| PocketBase Admin | Manual | Add `payment_dates` JSON field to `invoices` collection |
| `frontend/src/types.ts` | Modify | Add `payment_dates?: string[]` to `Invoice` interface |
| `frontend/src/lib/invoicing/paymentDates.ts` | **Create** | `derivePaymentDates(items)` helper |
| `frontend/src/pages/invoices/InvoiceDetailPage.tsx` | Modify | Append `payment_dates` to FormData in `handleSave` |
| `frontend/src/hooks/useInvoiceFilters.ts` | Modify | Add `filterPaymentMonth` state + reset |
| `frontend/src/hooks/useInvoices.ts` | Modify | Add `payment_dates ?~` filter + queryKey entry |
| `frontend/src/pages/invoices/components/InvoiceToolbar.tsx` | Modify | Add `MonthYearPicker` popover |
| `frontend/src/pages/invoices/InvoicesPage.tsx` | Modify | Wire new filter props through |
| `frontend/src/lib/invoicing/backfillPaymentDates.ts` | **Create** | One-time backfill script for existing records |

---

## Task 1: PocketBase Schema (Manual)

**Files:**
- PocketBase Admin Panel — `invoices` collection

- [ ] **Step 1: Add field in PocketBase Admin**

  Go to PocketBase Admin → Collections → `invoices` → Edit → Add field:
  - Name: `payment_dates`
  - Type: **JSON**
  - Required: No (leave unchecked)

  Save the collection. Existing records will have `null` for this field — this is expected and safe.

- [ ] **Step 2: Verify field exists**

  Open any invoice record in PocketBase Admin and confirm `payment_dates` column appears (value is null).

---

## Task 2: Update TypeScript Type

**Files:**
- Modify: `frontend/src/types.ts`

- [ ] **Step 1: Add `payment_dates` to Invoice interface**

  Find the `Invoice` interface (currently around line 20). Add one field:

  ```ts
  export interface Invoice {
    id: string
    invoice_number: string
    client_id: string
    type: string
    date: string | Date
    status: string
    active_termin: string
    price_per_meter: number
    project_area: number
    total_amount: number
    bank_details?: string
    items?: any[]
    payment_dates?: string[]   // ← add this
    expand?: {
      client_id?: Client
    }
    created: string
    updated: string
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add frontend/src/types.ts
  git commit -m "feat(invoice): add payment_dates field to Invoice type"
  ```

---

## Task 3: Create `derivePaymentDates` Helper

**Files:**
- Create: `frontend/src/lib/invoicing/paymentDates.ts`

- [ ] **Step 1: Create the file**

  ```ts
  import type { TermItem } from './termCalculation'

  export function derivePaymentDates(items: TermItem[]): string[] {
    return items
      .map((item) => item.paymentDate ?? '')
      .filter(Boolean)
  }
  ```

  Logic: map each termin to its `paymentDate`, drop empty strings. No dedup needed — each termin has at most one payment date. Result example: `["2026-02-08", "2026-05-15"]`.

- [ ] **Step 2: Commit**

  ```bash
  git add frontend/src/lib/invoicing/paymentDates.ts
  git commit -m "feat(invoice): add derivePaymentDates helper"
  ```

---

## Task 4: Sync `payment_dates` on Save

**Files:**
- Modify: `frontend/src/pages/invoices/InvoiceDetailPage.tsx`

- [ ] **Step 1: Import the helper**

  Find the existing imports at the top of `InvoiceDetailPage.tsx`. Add:

  ```ts
  import { derivePaymentDates } from '@/lib/invoicing/paymentDates'
  ```

- [ ] **Step 2: Append `payment_dates` to FormData in `handleSave`**

  In `handleSave` (around line 178), after `formData.append('active_termin', activeTermin)` and before `const blob = await generateJpeg()`, add:

  ```ts
  formData.append('payment_dates', JSON.stringify(derivePaymentDates(items)))
  ```

  Full context after the change:

  ```ts
  formData.append('status', derivedStatus)
  formData.append('active_termin', activeTermin)
  formData.append('payment_dates', JSON.stringify(derivePaymentDates(items)))  // ← add here
  const blob = await generateJpeg()
  ```

- [ ] **Step 3: Manual verify**

  Open any invoice in the editor, make no changes, hit Save. In PocketBase Admin check that the `payment_dates` field on that record is now populated (e.g. `["2026-02-08"]` if termin 1 is paid, `[]` if none paid).

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/src/pages/invoices/InvoiceDetailPage.tsx
  git commit -m "feat(invoice): sync payment_dates on save"
  ```

---

## Task 5: Backfill Existing Records

**Files:**
- Create: `frontend/src/lib/invoicing/backfillPaymentDates.ts`

This is a one-time script. Run it once in staging, verify results, then run in production.

- [ ] **Step 1: Create the script**

  ```ts
  import { pb } from '@/lib/pocketbase'
  import { derivePaymentDates } from './paymentDates'

  export async function backfillPaymentDates() {
    const records = await pb.collection('invoices').getFullList({
      fields: 'id,items',
    })

    let updated = 0
    for (const record of records) {
      const items = Array.isArray(record.items) ? record.items : []
      const paymentDates = derivePaymentDates(items)
      await pb.collection('invoices').update(record.id, { payment_dates: paymentDates })
      updated++
    }

    console.log(`Backfill complete: ${updated} records updated`)
  }
  ```

- [ ] **Step 2: Run in staging**

  Import and call from browser console (while logged in as superadmin on the staging app):

  ```ts
  // In browser console on staging:
  const { backfillPaymentDates } = await import('/src/lib/invoicing/backfillPaymentDates.ts')
  await backfillPaymentDates()
  // Expected: "Backfill complete: N records updated"
  ```

  Alternatively, temporarily call it from a component and remove after.

- [ ] **Step 3: Verify in PocketBase staging admin**

  Open a few invoices in PocketBase Admin. Invoices with paid termins should have non-empty `payment_dates`. Invoices with no paid termins should have `[]`.

- [ ] **Step 4: Run in production**

  Repeat Step 2 on the production app once staging results look correct.

- [ ] **Step 5: Commit the script (keep for reference)**

  ```bash
  git add frontend/src/lib/invoicing/backfillPaymentDates.ts
  git commit -m "feat(invoice): add one-time backfill script for payment_dates"
  ```

---

## Task 6: Update `useInvoiceFilters`

**Files:**
- Modify: `frontend/src/hooks/useInvoiceFilters.ts`

- [ ] **Step 1: Add `filterPaymentMonth` state and expose it**

  Replace the entire file with:

  ```ts
  import { useState, useEffect } from 'react'
  import { useDebounce } from './useDebounce'

  export interface InvoiceFilters {
    debouncedSearch: string
    activeTab: string
    filterTermin: string
    filterPaymentMonth: string | null
    sortBy: string
  }

  export function useInvoiceFilters() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [filterTermin, setFilterTermin] = useState('all')
    const [filterPaymentMonth, setFilterPaymentMonth] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState('created_desc')
    const [page, setPage] = useState(1)

    const debouncedSearch = useDebounce(searchTerm, 500)

    useEffect(() => {
      setPage(1)
    }, [debouncedSearch, activeTab, filterTermin, filterPaymentMonth, sortBy])

    const resetFilters = () => {
      setSearchTerm('')
      setActiveTab('all')
      setFilterTermin('all')
      setFilterPaymentMonth(null)
      setSortBy('created_desc')
      setPage(1)
    }

    return {
      searchTerm,
      setSearchTerm,
      activeTab,
      setActiveTab,
      filterTermin,
      setFilterTermin,
      filterPaymentMonth,
      setFilterPaymentMonth,
      sortBy,
      setSortBy,
      page,
      setPage,
      resetFilters,
      filters: {
        debouncedSearch,
        activeTab,
        filterTermin,
        filterPaymentMonth,
        sortBy,
      } satisfies InvoiceFilters,
    }
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add frontend/src/hooks/useInvoiceFilters.ts
  git commit -m "feat(invoice): add filterPaymentMonth state to useInvoiceFilters"
  ```

---

## Task 7: Update `useInvoices` Query

**Files:**
- Modify: `frontend/src/hooks/useInvoices.ts`

- [ ] **Step 1: Add `filterPaymentMonth` to queryKey and filter logic**

  In the `useInvoices` function, update the `useQuery` block:

  ```ts
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: [
      'invoices',
      page,
      filters.debouncedSearch,
      filters.activeTab,
      filters.filterTermin,
      filters.filterPaymentMonth,   // ← add
      filters.sortBy,
    ],
    queryFn: () => {
      const filterParts: string[] = []

      if (filters.debouncedSearch) {
        filterParts.push(
          `(title ~ "${filters.debouncedSearch}" || invoice_number ~ "${filters.debouncedSearch}" || client_id.company_name ~ "${filters.debouncedSearch}")`
        )
      }
      if (filters.activeTab !== 'all') {
        filterParts.push(`type = "${filters.activeTab}"`)
      }
      if (filters.filterTermin !== 'all') {
        filterParts.push(`active_termin = "${filters.filterTermin}"`)
      }
      if (filters.filterPaymentMonth) {                                      // ← add
        filterParts.push(`payment_dates ?~ "${filters.filterPaymentMonth}"`) // ← add
      }                                                                      // ← add

      const sortOption = INVOICE_SORT_OPTIONS.find((o) => o.value === filters.sortBy)
      const sortParam = sortOption?.sortParam ?? '-created'

      return pb.collection('invoices').getList(page, 50, {
        sort: sortParam,
        expand: 'client_id',
        filter: filterParts.join(' && '),
      })
    },
    placeholderData: (prev) => prev,
  })
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add frontend/src/hooks/useInvoices.ts
  git commit -m "feat(invoice): add payment month filter to useInvoices query"
  ```

---

## Task 8: Add MonthYearPicker to InvoiceToolbar

**Files:**
- Modify: `frontend/src/pages/invoices/components/InvoiceToolbar.tsx`

- [ ] **Step 1: Replace the file**

  ```tsx
  import { useState } from 'react'
  import { CalendarIcon, X } from 'lucide-react'
  import { format } from 'date-fns'
  import { Button } from '@/components/ui/button'
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { DocumentToolbar } from '@/components/filters/DocumentToolbar'
  import { SortPopover } from '@/components/shared/SortPopover'
  import { MonthYearPicker } from '@/components/shared/MonthYearPicker'
  import { INVOICE_SORT_OPTIONS } from '../invoiceSortOptions'

  const INVOICE_TYPE_OPTIONS = [
    { label: 'All Types', value: 'all' },
    { label: 'Architecture', value: 'design' },
    { label: 'Civil', value: 'sipil' },
    { label: 'Interior', value: 'interior' },
  ]

  const TERMIN_OPTIONS = [
    { label: 'All Termins', value: 'all' },
    { label: 'Termin 1', value: '1' },
    { label: 'Termin 2', value: '2' },
    { label: 'Termin 3', value: '3' },
    { label: 'Termin 4', value: '4' },
    { label: 'Termin 5', value: '5' },
    { label: 'Termin 6', value: '6' },
  ]

  interface InvoiceToolbarProps {
    activeTab: string
    onTabChange: (val: string) => void
    searchTerm: string
    onSearchChange: (val: string) => void
    filterTermin: string
    onTerminFilterChange: (val: string) => void
    filterPaymentMonth: string | null
    onPaymentMonthChange: (val: string | null) => void
    sortBy: string
    onSortChange: (val: string) => void
    onResetFilter: () => void
  }

  export function InvoiceToolbar({
    activeTab,
    onTabChange,
    searchTerm,
    onSearchChange,
    filterTermin,
    onTerminFilterChange,
    filterPaymentMonth,
    onPaymentMonthChange,
    sortBy,
    onSortChange,
    onResetFilter,
  }: InvoiceToolbarProps) {
    const [calendarOpen, setCalendarOpen] = useState(false)

    const hasActiveFilter =
      searchTerm !== '' ||
      activeTab !== 'all' ||
      filterTermin !== 'all' ||
      filterPaymentMonth !== null

    // Convert YYYY-MM string → Date for MonthYearPicker
    const selectedMonthDate = filterPaymentMonth
      ? new Date(`${filterPaymentMonth}-01`)
      : undefined

    const handleMonthSelect = (date: Date | undefined) => {
      onPaymentMonthChange(date ? format(date, 'yyyy-MM') : null)
      setCalendarOpen(false)
    }

    return (
      <DocumentToolbar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by client, title, or inv. number..."
        onResetFilter={onResetFilter}
        hasActiveFilter={hasActiveFilter}
        typeFilter={{
          value: activeTab,
          onChange: onTabChange,
          options: INVOICE_TYPE_OPTIONS,
        }}
        secondFilter={{
          value: filterTermin,
          onChange: onTerminFilterChange,
          options: TERMIN_OPTIONS,
        }}
        sortButton={
          <>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-9 text-sm bg-white shadow-sm w-[160px] justify-start text-left font-normal ${
                    filterPaymentMonth
                      ? 'border-primary/50 ring-1 ring-primary/30 text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {filterPaymentMonth
                      ? format(new Date(`${filterPaymentMonth}-01`), 'MMMM yyyy')
                      : 'Payment month'}
                  </span>
                  {filterPaymentMonth && (
                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-auto opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onPaymentMonthChange(null)
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <MonthYearPicker
                  selected={selectedMonthDate}
                  onSelect={handleMonthSelect}
                />
              </PopoverContent>
            </Popover>
            <SortPopover
              options={INVOICE_SORT_OPTIONS}
              value={sortBy === 'created_desc' ? null : sortBy}
              onChange={(val) => onSortChange(val ?? 'created_desc')}
            />
          </>
        }
      />
    )
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add frontend/src/pages/invoices/components/InvoiceToolbar.tsx
  git commit -m "feat(invoice): add payment month picker to InvoiceToolbar"
  ```

---

## Task 9: Wire Up in InvoicesPage

**Files:**
- Modify: `frontend/src/pages/invoices/InvoicesPage.tsx`

- [ ] **Step 1: Destructure new filter values and pass to InvoiceToolbar**

  In `InvoicesPage`, add `filterPaymentMonth` and `setFilterPaymentMonth` from `useInvoiceFilters`:

  ```tsx
  const {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    filterTermin,
    setFilterTermin,
    filterPaymentMonth,          // ← add
    setFilterPaymentMonth,       // ← add
    sortBy,
    setSortBy,
    page,
    setPage,
    resetFilters,
    filters,
  } = useInvoiceFilters()
  ```

  Then pass to `InvoiceToolbar`:

  ```tsx
  <InvoiceToolbar
    activeTab={activeTab}
    onTabChange={setActiveTab}
    searchTerm={searchTerm}
    onSearchChange={setSearchTerm}
    filterTermin={filterTermin}
    onTerminFilterChange={setFilterTermin}
    filterPaymentMonth={filterPaymentMonth}          // ← add
    onPaymentMonthChange={setFilterPaymentMonth}     // ← add
    sortBy={sortBy}
    onSortChange={setSortBy}
    onResetFilter={resetFilters}
  />
  ```

- [ ] **Step 2: Verify end-to-end**

  1. Open the invoices page — payment month picker appears in toolbar
  2. Select a month — table updates, only invoices with a `paymentDate` in that month appear
  3. Click X on the picker — filter clears, all invoices return
  4. Click the global X reset button — all filters including month clear

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/pages/invoices/InvoicesPage.tsx
  git commit -m "feat(invoice): wire payment month filter in InvoicesPage"
  ```

---

## Execution Order

Run tasks in this order — each task builds on the previous:

```
Task 1 (PocketBase) → Task 2 (types) → Task 3 (helper) → Task 4 (save sync)
  → Task 5 (backfill) → Task 6 (filters hook) → Task 7 (query) → Task 8 (UI) → Task 9 (wire)
```

Task 5 (backfill) must run **after** Task 4 is deployed to staging so the helper is available. Run backfill on staging first, verify, then production.
