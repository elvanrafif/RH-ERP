# Petty Cash — Feature Design

## Goal

Provide internal staff with a straightforward way to manage petty cash periods, track expenses and top-ups, see balances, lock/unlock a period, view private receipts, and export a shareable PDF report.

## Scope

Included:
- List all petty cash periods with name, initial balance, remaining balance, status, and creation date.
- Create a period with an initial balance defaulting to 5,000,000 and a name defaulting to today's date in `DD-MM-YYYY` format.
- View period summary and chronological combined expense/top-up transactions.
- Add expense and top-up transactions while the period is open.
- Edit the period name and edit/delete transactions while the period is open.
- Authorize module access with `access_petty_cash` on navigation and routes; Superadmins retain access through the existing permission helper.
- Warn when an expense exceeds available balance; allow the user to cancel or continue.
- Upload image/PDF receipts, convert images to WebP and resize their longest dimension to at most 1920px in the browser, preserve PDFs unchanged, and preview files through PocketBase's authenticated file endpoint.
- Close and reopen a period. A closed period is read-only for its transactions; reopening allows transactions to be changed again.
- Export a PDF summary and transaction list with receipt references.

Excluded: approval workflows and top-up amount limits.

## UX and Visual Design

Use the existing RH-ERP page patterns and design system. Reuse established page headers, table styles, status badges, form controls, modal/dialog conventions, spacing, currency formatting, loading/empty states, and toast behavior. Do not introduce a new visual language or one-off component styling system.

### List page

Route: `/petty-cash`.

Show a page title and primary “Create Petty Cash” action. The table contains Name, Initial Balance, Remaining Balance, Status, and Created Date. Clicking a row opens its detail page. Provide loading and empty states consistent with other list pages.

### Create period dialog

Fields: Name (pre-filled with today's `DD-MM-YYYY`) and Initial Balance (pre-filled with 5,000,000). On success create the record with `status = open` and navigate to `/petty-cash/:id`.

### Detail page

Route: `/petty-cash/:id`; both list and detail routes require the `access_petty_cash` permission. Superadmins bypass permission checks through the existing AuthContext behavior.

The summary shows Initial Balance, Total Top-up, Total Spent, Remaining Balance, and Status. The transaction table combines expenses and top-ups and displays row number, date, type, person, amount, purpose/notes, receipt action, and optional actions. The date cell shows the weekday in small muted English text above the formatted date. Expenses use the established red treatment and top-ups the established green treatment.

When open, allow editing the period name and show “Add Expense”, “Top Up”, and “Close Petty Cash” actions. Transactions can be edited or deleted while the period is open. When closed, hide/disable transaction mutations and provide “Reopen Petty Cash”. Keep “Export Report” available for either status. Confirm close/reopen and deletion before changing data.

### Entry forms and receipt preview

Expense fields: Person Name, Amount, Purpose, Notes, Receipt. Top-up fields: Amount and optional Notes. For over-balance expenses, show a warning with explicit cancel/continue actions. Receipt preview uses an image element for images and an embedded PDF viewer for PDFs, inside the existing dialog pattern.

## Data Model

Use two PocketBase collections. Receipt files are stored through PocketBase's native S3-compatible file storage configured for a private Backblaze B2 bucket; credentials remain server-side in PocketBase settings.

### `petty_cash`
- `name`: text, required.
- `initial_balance`: number, required.
- `status`: single select `open | closed`, default `open`.
- PocketBase system `created` timestamp.

### `petty_cash_entry`
- `petty_cash_id`: required relation to `petty_cash`.
- `type`: single select `expense | topup`.
- `person_name`: text; required for expenses, blank/optional for top-ups.
- `amount`: number, required and positive.
- `purpose`: text; required for expenses, optional for top-ups.
- `notes`: text, optional.
- `receipt`: file; optional for top-ups and supplied for expenses when available.
- `transaction_date`: transaction date used for display and report rows.
- PocketBase system `created` timestamp.

Remaining balance is calculated as initial balance + sum(top-ups) − sum(expenses); it is not stored as a separately mutable field.

## Data Access and Locking

All PocketBase reads/writes go through dedicated TanStack Query hooks, not directly from React page/components. Query keys distinguish list, detail, and entries; successful mutations invalidate affected keys.

The frontend omits transaction mutation actions for closed periods. The parent status remains changeable in either direction; changing it back to `open` permits entry mutations. Read/list access remains available for reports and historical review. PocketBase collection API rules must independently enforce intended access and closed-period restrictions; frontend guards alone are not a security boundary.

File storage is configured as private S3-compatible Backblaze B2 through PocketBase native file storage. The configured bucket is `pettycash-rh` at endpoint `s3.us-east-005.backblazeb2.com`. Frontend uses PocketBase's file token and file endpoint; no public permanent links or custom presigned-URL flow are introduced. S3 credentials are configured only in PocketBase and must not be added to frontend environment variables or source control.

## Receipt Handling

Accept image MIME types and `application/pdf`. Images are loaded in the browser, scaled down only when the longest edge exceeds 1920px, and encoded as WebP before upload. PDFs are uploaded unchanged. Image previews use PocketBase thumbnail support (`400x400`); PDF previews use the original file endpoint. Both require a PocketBase file token.

## PDF Report

Generate client-side PDF using the existing `jspdf` dependency. Include period name, status, initial balance, total top-ups, total expenses, remaining balance, and a paginated transaction table. Include receipt references as authenticated links where available. Export works for both open and closed periods.

## Validation and Error Handling

Use Zod schemas under `frontend/src/lib/validations/`. Period name and balances are required; amounts must be positive. Expense person and purpose are required. Display mutation failures and successes through informative English toast messages. If PocketBase rejects a mutation because the period was closed elsewhere, show the server error and refresh relevant period/entry queries.

## Testing and Verification

- Unit-test balance aggregation, over-balance detection, validation, receipt transformations/URL creation, and report data generation.
- Component-test list/create, transaction flows, status lock/reopen behavior, receipt preview selection, and report action.
- Verify PocketBase API rules for role access, closed parent records, private file access, and actual collection field names against the running PocketBase instance.
- Run frontend build and lint.

## Decisions and Assumptions

- UI visual treatment follows existing RH-ERP pages and components.
- Status is reversible: `open ↔ closed`; entries can only change while the parent is open.
- PocketBase collections use the field names above, including English `receipt` and system `created` timestamp.
- PocketBase private S3-compatible file storage is configured for Backblaze B2 bucket `pettycash-rh`; private receipt URLs are served through PocketBase file tokens.
- Role access uses the single full-access permission `access_petty_cash`; it is enforced on the sidebar item and both routes.
