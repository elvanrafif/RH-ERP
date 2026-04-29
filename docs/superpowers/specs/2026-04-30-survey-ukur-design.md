# Survey & Measurement — Feature Spec

**Date:** 2026-04-30
**Branch:** improvement/feedback
**Status:** Approved

---

## Overview

A new module for managing survey and measurement appointments. The sosmed team and superadmin can create, view, edit, and delete survey entries. Each entry links a client to an assigned surveyor (internal RH employee) with a scheduled date/time and optional notes.

---

## Access Control

- **Permission:** `manage_surveys` (new permission string)
- **Who gets it:** sosmed role + superadmin (always has all permissions)
- **Guard:** `<PermissionGuard require="manage_surveys" />` wrapping the sidebar nav item and the route

---

## Routing & Sidebar

| Item | Value |
|---|---|
| Route path | `/survey` |
| Sidebar label | `Survey & Measurement` |
| Sidebar icon | `ClipboardList` (lucide-react) |
| Sidebar section | Under the existing client/prospect section (between Prospects and Vendors) |
| Guard | `manage_surveys` permission |

---

## PocketBase Collection

**Collection name:** `surveys`

| Field | Type | Notes |
|---|---|---|
| `client` | Relation → `clients` | Required |
| `surveyor` | Relation → `users` | Required |
| `schedule` | DateTime | Required |
| `notes` | Text | Optional |

**Collection rules (PocketBase):**
- List/View/Create/Update: `@request.auth.id != ""`
- Delete: `@request.auth.isSuperAdmin = true`

---

## Data Model (TypeScript)

```ts
// types.ts addition
export interface Survey {
  id: string
  client: string       // relation ID
  surveyor: string     // relation ID → users
  schedule: string     // ISO datetime
  notes?: string
  expand?: {
    client?: Client
    surveyor?: User
  }
  created: string
  updated: string
}
```

---

## Page Structure

```
pages/survey/
├── SurveyPage.tsx          # Main page (list + dialogs)
├── SurveyTable.tsx         # DataTable with columns
├── SurveyForm.tsx          # Create/edit form
└── columns.tsx             # ColumnDef array
```

### SurveyPage.tsx

Follows the same pattern as `ProspectsPage`. Uses `CrudPageShell` with:
- `PageHeader` — title "Survey & Measurement", description "Manage survey and measurement appointments", icon `ClipboardList`, action button "New Survey"
- Search input (by client name)
- `SurveyTable` + `TablePagination`
- `FormDialog` for create/edit
- `DeleteConfirmDialog`

State via `useTableState<Survey>()`.

### SurveyTable.tsx

Table with clickable rows — click opens edit dialog (same UX pattern as Clients, Users).

Columns:
| Column | Source | Notes |
|---|---|---|
| Client | `expand.client.company_name` | Sortable |
| Surveyor | `expand.surveyor.name` | — |
| Schedule | `schedule` | Formatted as `dd MMM yyyy, HH:mm` via `formatDateTime` helper |
| Notes | `notes` | Truncated to 60 chars |
| Actions | `RowActions` | Edit · Delete |

### SurveyForm.tsx

Uses React Hook Form + Zod. Fields:

| Field | Component | Validation |
|---|---|---|
| Client | `ClientComboboxField` (existing) | Required |
| Surveyor | New `UserComboboxField` | Required |
| Schedule | `<Input type="datetime-local">` | Required |
| Notes | `<Textarea>` | Optional, max 500 chars |

Submit via `useFormMutation` (collection: `surveys`, queryKey: `['surveys']`).

---

## New Hook: `useSurveys`

**File:** `hooks/useSurveys.ts`

```ts
interface UseSurveysOptions {
  searchTerm?: string
}

// Returns: { surveys, isLoading }
// Query: getFullList with expand=client,surveyor
// Filter: search by client company_name via escapePbFilter
```

---

## New Component: `UserComboboxField`

**File:** `components/forms/UserComboboxField.tsx`

Same pattern as `ClientComboboxField` — `<Popover>` + `<Command>` cmdk search over users list. Props: `value`, `onChange`, `disabled?`.

Uses `useUsers` hook (already exists).

---

## Zod Schema

**File:** `lib/validations/survey.ts`

```ts
export const surveySchema = z.object({
  client:    z.string().min(1, 'Client is required'),
  surveyor:  z.string().min(1, 'Surveyor is required'),
  schedule:  z.string().min(1, 'Schedule is required'),
  notes:     z.string().max(500).optional(),
})

export type SurveyFormValues = z.infer<typeof surveySchema>
```

---

## Permission Registration

In `pages/settings/roleManagement/roleForm.tsx`, add `manage_surveys` to the permissions checklist under the appropriate section (client/prospect permissions group).

---

## Sidebar Update

In `components/layout/Sidebar/SidebarNav.tsx`:
- Import `ClipboardList` from lucide-react
- Add `NavItem` for `/survey` wrapped in `<Guard require="manage_surveys">`
- Position: after the Prospects nav item

---

## Copy (all English)

| Location | Text |
|---|---|
| Page title | `Survey & Measurement` |
| Page description | `Manage survey and measurement appointments` |
| New button | `New Survey` |
| Form title (create) | `New Survey Appointment` |
| Form title (edit) | `Edit Survey Appointment` |
| Client field label | `Client` |
| Surveyor field label | `Surveyor` |
| Schedule field label | `Schedule` |
| Notes field label | `Notes` |
| Notes placeholder | `Add any notes about this survey...` |
| Search placeholder | `Search client...` |
| Empty state title | `No surveys yet` |
| Empty state description | `Create your first survey appointment to get started` |
| Delete confirm title | `Delete Survey` |
| Delete confirm description | `This action cannot be undone.` |
| Toast success create | `Survey appointment created` |
| Toast success update | `Survey appointment updated` |
| Toast success delete | `Survey appointment deleted` |

---

## Out of Scope (v1)

- Status field (Scheduled / Done / Cancelled) — deferred to future iteration
- Notification / reminder for upcoming surveys
- Filter by surveyor or date range
