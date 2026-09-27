# Petty Cash Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a petty cash workspace for creating cash periods, recording expenses and top-ups, managing receipts, locking/unlocking periods, calculating balances, and exporting a PDF report.

**Architecture:** Keep PocketBase access in dedicated TanStack Query hooks and business logic in focused utilities. Add protected React Router pages for list/detail, small dialogs for period and transaction actions, client-side receipt WebP conversion, PocketBase tokenized file previews, and jsPDF report generation. Follow existing app layout, English UI, Zod validation, and repository file-size conventions.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, PocketBase JS SDK, React Hook Form, Zod, Tailwind/shadcn UI, jsPDF, Vitest/testing-library if available.

---

## File Map

- Modify `frontend/src/App.tsx` to register `/petty-cash` and `/petty-cash/:id` under the existing protected application layout.
- Modify `frontend/src/components/layout/Sidebar/SidebarNav.tsx` to expose Petty Cash navigation.
- Create `frontend/src/types/pettyCash.ts` for collection records and form/domain types.
- Modify `frontend/src/types.ts` only if the repository convention requires central exported types.
- Create `frontend/src/lib/constant.ts` additions for collection names, status/type values, and image sizing/quality constants.
- Create `frontend/src/lib/validations/pettyCash.ts` for Zod schemas for period, expense, and top-up forms.
- Create `frontend/src/lib/pettyCash/balance.ts` for pure balance aggregation and expense-over-balance checks.
- Create `frontend/src/lib/pettyCash/receipt.ts` for image resizing/WebP conversion and PocketBase receipt URL/token construction.
- Create `frontend/src/lib/pettyCash/report.ts` for jsPDF report rendering from supplied petty cash and entry data.
- Create `frontend/src/hooks/usePettyCash.ts` for list/detail/entry queries, mutations, and query invalidation.
- Create `frontend/src/pages/pettyCash/PettyCashPage.tsx` for the list screen and period creation dialog composition.
- Create `frontend/src/pages/pettyCash/PettyCashDetailPage.tsx` for summary, transaction list, status lifecycle, and action composition.
- Create focused components under `frontend/src/pages/pettyCash/components/`: `PettyCashTable.tsx`, `PettyCashSummary.tsx`, `PettyCashEntryTable.tsx`, `CreatePettyCashDialog.tsx`, `PettyCashEntryDialog.tsx`, `ReceiptPreviewDialog.tsx`, and `ClosePettyCashDialog.tsx` (dialog should support close/reopen action state or be renamed to `PettyCashStatusDialog.tsx`). Keep each component below 200 lines.
- Add tests beside pure utilities and components using the configured test setup; if there is no configured test runner, first add minimal Vitest configuration and scripts.

## PocketBase Contract

Use these exact collection/field names, subject to confirmation against the user's PocketBase instance:

- `petty_cash`: `name` (text), `initial_balance` (number), `status` (select: `open|closed`), system `created` date.
- `petty_cash_entry`: `petty_cash_id` (relation to `petty_cash`), `type` (select: `expense|topup`), `person_name` (text), `amount` (number), `purpose` (text), `notes` (text), `receipt` (file), system `created` date.
- Detail query filters entries by `petty_cash_id = <id>` and sorts by `created` ascending.
- Create/update/delete entry rules must reject changes unless related `petty_cash.status = "open"`; reopening sets status to `open` and permits entry mutations again. UI checks complement but do not replace PocketBase rules.

## Task 1: Establish test runner and balance behavior (TDD)

**Files:**
- Create/modify `frontend/vite.config.ts` or test setup only if Vitest is not already configured.
- Modify `frontend/package.json` only if test scripts/dependencies are missing.
- Create `frontend/src/lib/pettyCash/balance.test.ts`.
- Create `frontend/src/lib/pettyCash/balance.ts`.

- [ ] **Step 1: Write tests for balance aggregation**

```ts
import { describe, expect, it } from 'vitest'
import { calculatePettyCashBalance } from './balance'

describe('calculatePettyCashBalance', () => {
  it('adds topups and subtracts expenses from the initial balance', () => {
    expect(
      calculatePettyCashBalance(5_000_000, [
        { type: 'expense', amount: 250_000 },
        { type: 'topup', amount: 1_000_000 },
      ])
    ).toEqual({ totalTopup: 1_000_000, totalSpent: 250_000, balance: 5_750_000 })
  })
})
```

- [ ] **Step 2: Run the focused test and confirm it fails because the utility is missing**

Run: `npm test -- --run src/lib/pettyCash/balance.test.ts`

Expected: FAIL with unresolved `./balance` (or missing test script/setup, which must be configured before continuing).

- [ ] **Step 3: Implement the minimal pure balance utility**

```ts
export interface BalanceEntry {
  type: 'expense' | 'topup'
  amount: number
}

export interface PettyCashBalance {
  totalTopup: number
  totalSpent: number
  balance: number
}

export function calculatePettyCashBalance(
  initialBalance: number,
  entries: BalanceEntry[]
): PettyCashBalance {
  const totalTopup = entries.reduce(
    (total, entry) => total + (entry.type === 'topup' ? entry.amount : 0),
    0
  )
  const totalSpent = entries.reduce(
    (total, entry) => total + (entry.type === 'expense' ? entry.amount : 0),
    0
  )
  return { totalTopup, totalSpent, balance: initialBalance + totalTopup - totalSpent }
}
```

- [ ] **Step 4: Re-run focused test and confirm PASS**

Run: `npm test -- --run src/lib/pettyCash/balance.test.ts`

Expected: 1 test passes.

## Task 2: Define PocketBase types and validation schemas (TDD)

**Files:**
- Create `frontend/src/types/pettyCash.ts`.
- Modify `frontend/src/lib/constant.ts`.
- Create `frontend/src/lib/validations/pettyCash.ts`.
- Create `frontend/src/lib/validations/pettyCash.test.ts`.

- [ ] **Step 1: Add failing validation tests** for required period name, positive initial balance, positive transaction amount, and expense-specific person/purpose requirements.
- [ ] **Step 2: Run focused tests and confirm the schemas are missing.**
- [ ] **Step 3: Define record types using PocketBase `RecordModel`, literal unions for status/type, constants, and Zod schemas**. Topup permits blank person/purpose/receipt; expense requires person and purpose; receipt validation accepts PDF and image MIME types.
- [ ] **Step 4: Re-run validation tests and confirm PASS.**

## Task 3: Add petty cash queries and mutations (TDD)

**Files:**
- Create `frontend/src/hooks/usePettyCash.ts`.
- Create `frontend/src/hooks/usePettyCash.test.ts` using the existing test conventions and mocked PB SDK only at the API boundary.

- [ ] **Step 1: Add tests for queries/mutations**: list sorted newest-first, entries filtered by parent, create/update status, add entry with FormData for file receipt, delete entry, and invalidate relevant `['petty-cash', ...]` query keys.
- [ ] **Step 2: Run tests and confirm the hook is absent.**
- [ ] **Step 3: Implement hooks** with `useQuery` and `useMutation`; handle file upload via FormData, and expose stable mutation state/error data. Show errors in consuming UI with informative toasts.
- [ ] **Step 4: Run hook tests and confirm PASS.**

## Task 4: Build petty cash list and creation flow (TDD)

**Files:**
- Create `frontend/src/pages/pettyCash/PettyCashPage.tsx`.
- Create `frontend/src/pages/pettyCash/components/PettyCashTable.tsx`.
- Create `frontend/src/pages/pettyCash/components/CreatePettyCashDialog.tsx`.
- Add component tests for default form values and create callback/navigation.

- [ ] **Step 1: Add failing tests** for rendering list columns, empty/loading states, and creation defaults (initial balance 5,000,000; name formatted `DD-MM-YYYY`; status open).
- [ ] **Step 2: Run tests and confirm expected missing screen/components.**
- [ ] **Step 3: Implement the list screen and create dialog**, route to detail after successful creation, format currency/dates with existing project utilities, and use the shared form/dialog patterns.
- [ ] **Step 4: Run focused component tests and confirm PASS.**

## Task 5: Implement detail, balance summary, entries, and status lifecycle (TDD)

**Files:**
- Create `frontend/src/pages/pettyCash/PettyCashDetailPage.tsx`.
- Create `frontend/src/pages/pettyCash/components/PettyCashSummary.tsx`.
- Create `frontend/src/pages/pettyCash/components/PettyCashEntryTable.tsx`.
- Create `frontend/src/pages/pettyCash/components/PettyCashEntryDialog.tsx`.
- Create `frontend/src/pages/pettyCash/components/PettyCashStatusDialog.tsx`.
- Add focused tests for balance rendering, entry type labels, insufficient balance warning/override, and status toggle UI.

- [ ] **Step 1: Write failing tests** for summary totals, expense/topup rows, warning on an expense above current balance with explicit continue/cancel, and closed status hiding/disabling entry mutations while allowing reopen.
- [ ] **Step 2: Run tests and confirm expected failures.**
- [ ] **Step 3: Implement details and dialogs**. Mutations are offered only when open. Status can be toggled both directions with confirmation; closed periods remain readable and exportable. No entry changes are offered while closed.
- [ ] **Step 4: Run focused tests and confirm PASS.**

## Task 6: Receipt image processing and secure preview (TDD)

**Files:**
- Create `frontend/src/lib/pettyCash/receipt.ts`.
- Create `frontend/src/lib/pettyCash/receipt.test.ts`.
- Create `frontend/src/pages/pettyCash/components/ReceiptPreviewDialog.tsx`.

- [ ] **Step 1: Write tests** for PDF unchanged, image transformed to WebP, long edge capped at 1920, thumb parameter only for images, and token inclusion in PocketBase file URL.
- [ ] **Step 2: Run tests and confirm utility is missing.**
- [ ] **Step 3: Implement browser canvas resizing/conversion** and file URL generation using `pb.files.getToken()` plus PocketBase `getURL` or `pb.baseURL` as supported by installed SDK. Preview images via `<img>` with `thumb=400x400`; PDFs via iframe/embed without thumbnail. Restrict accepted formats to image and PDF.
- [ ] **Step 4: Run tests and confirm PASS.**

## Task 7: Export report to PDF (TDD)

**Files:**
- Create `frontend/src/lib/pettyCash/report.ts`.
- Create `frontend/src/lib/pettyCash/report.test.ts`.
- Modify `frontend/src/pages/pettyCash/PettyCashDetailPage.tsx` to wire the export action.

- [ ] **Step 1: Write tests** confirming report contains period name/status, initial/topup/spent/remaining totals, all entry rows, and receipt references where available.
- [ ] **Step 2: Run tests and confirm expected missing report implementation.**
- [ ] **Step 3: Implement jsPDF export** with a readable summary and paginated transaction table; include receipt links using tokenized PocketBase URLs generated at export time. Add export button for open and closed periods.
- [ ] **Step 4: Run tests and confirm PASS.**

## Task 8: Route, navigation, and end-to-end verification

**Files:**
- Modify `frontend/src/App.tsx`.
- Modify `frontend/src/components/layout/Sidebar/SidebarNav.tsx`.
- Validate PocketBase collection rules/settings with the user-provided schema.

- [ ] **Step 1: Add route/navigation tests or a route smoke test** proving list and detail routes render under protected layout and sidebar links to `/petty-cash`.
- [ ] **Step 2: Run the test and confirm route is currently absent.**
- [ ] **Step 3: Register routes and navigation**, using an icon from lucide-react and project conventions.
- [ ] **Step 4: Run route tests, `npm run build`, and `npm run lint`** in `frontend/`.
- [ ] **Step 5: Validate PocketBase API rules** for create/update/delete entries against parent status, and confirm private file storage is enabled for B2. Document any manual rule or storage setup still needed.

## Self-review

- PRD coverage: period list/create, detail totals, expense/top-up entry creation, insufficient-balance override, receipt conversion/upload/preview, open/closed lock and reopen, PDF export, private PocketBase/B2 storage, and navigation are mapped to Tasks 1–8.
- Lifecycle consistency: `closed` blocks entry mutations; status can be switched back to `open`; UI and server rule responsibilities are separately covered.
- Naming consistency: collections/fields use `petty_cash`, `petty_cash_entry`, `petty_cash_id`, and English `receipt`.
- Risk to confirm before implementation: exact PocketBase API rules and actual collection schema are only available from the running PocketBase instance, not repository files. Verify schema before relying on optional/null field behavior and file constraints.
