# Petty Cash Implementation Record

**Status:** Implemented

**Goal:** Provide an internal workspace for petty cash periods, expenses, top-ups, receipts, balances, period status, and PDF reports.

**Architecture:** React pages use dedicated TanStack Query hooks for PocketBase reads/writes. Balance, money, receipt, and report logic live in `frontend/src/lib/pettyCash/`. PocketBase handles private file delivery and S3-compatible storage.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, PocketBase, React Hook Form, Zod, Tailwind/shadcn UI, jsPDF.

---

## Delivered Features

- List periods with initial and remaining balance, status, and created date; create a period with today's `DD-MM-YYYY` name and default initial balance Rp5.000.000.
- View period summary and transactions ordered by transaction date. The table columns are number, date (English weekday above the formatted date), type, person, amount, purpose/notes, receipt, and actions when open.
- Add, edit, and delete expense/top-up entries while a period is open. Expenses require person and purpose; over-balance expenses show a continue/cancel warning.
- Edit the period name while open; close and reopen periods with confirmation. Closed periods hide transaction mutation actions.
- Process image receipts to WebP with a maximum 1920px long edge; upload PDFs unchanged. Preview private files through PocketBase file tokens.
- Calculate remaining balance from initial balance + top-ups − expenses; export a PDF report for open or closed periods.
- Use the single full-access role permission `access_petty_cash` for the sidebar item and both `/petty-cash` and `/petty-cash/:id` routes. Superadmins bypass permission checks through existing AuthContext behavior.

## PocketBase Data and Storage

- `petty_cash`: `name`, `initial_balance`, `status` (`open | closed`), PocketBase `created`/`updated` timestamps.
- `petty_cash_entry`: `petty_cash_id`, `type` (`expense | topup`), `transaction_date`, `person_name`, `amount`, `purpose`, `notes`, `receipt`, PocketBase `created`/`updated` timestamps.
- Balance is computed in the frontend and is not stored as a mutable field.
- Receipt files use PocketBase native S3-compatible storage configured to private Backblaze B2 bucket `pettycash-rh`, endpoint `s3.us-east-005.backblazeb2.com`. S3 credentials belong only in PocketBase settings, never in frontend configuration or source control.
- Frontend guards and closed-period UI state do not replace PocketBase API rules. Verify server-side authorization and closed-period mutation rules independently.

## Verification Record

- `npm run build` in `frontend` passed after the Petty Cash pages and role permission changes.
- `git diff --check` passed for the role permission changes.
- No Petty Cash automated test suite is recorded here; add meaningful tests when test infrastructure and scope are addressed.
