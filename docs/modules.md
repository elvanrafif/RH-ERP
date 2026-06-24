# Module Status

Daftar semua modul dalam RH-ERP beserta status pengembangannya.

> Legend: ✅ Selesai · 🚧 Dalam pengembangan · ⬜ Belum dimulai

---

## Core

| Modul | Status | Catatan |
|---|---|---|
| Login / Auth | ✅ | Session timeout 1 jam, auto logout, show/hide password toggle |
| RBAC (Role & Permission) | ✅ | Custom roles dengan permission granular via PocketBase |
| Dashboard | ✅ | Role-based routing via `Dashboard.tsx`: **superadmin** → `ExecutiveDashboard` (2 tabs: Overview — stat cards, **Team Calendar** dengan `useDashboardCalendarEvents` semua event, top invoices/quotations; Resource Monitoring — workload per PIC); **civil division** (`user.division === DIVISION.CIVIL`) → `CivilTeamDashboard` (Gantt chart per vendor, responsive 1–3 month window, Today label, color-coded deadlines); **employee** → `MyProjectsDashboard` (2 tabs: Calendar — `useMyCalendarEvents` difilter by current user; My Projects — active assigned projects + deadline stats). Client Tracking dipindah ke halaman standalone `/client-tracking` (superadmin only). Calendar: responsive mobile → listMonth + bottom sheet, desktop → dayGrid + floating popover. |
| Profile & Security | ✅ | Edit profil, ganti password, upload avatar |

---

## Proyek

| Modul | Status | Catatan |
|---|---|---|
| Arsitektur | ✅ | Table + Kanban, detail modal, filter status; Hold Project (superadmin/assignee): banner orange di modal + badge "On Hold" di kanban card + tombol Hold/Resume di footer modal |
| Sipil | ✅ | Table, klik baris → buka detail modal; filter status (Active/Building/Finishing/Finished/All) — "Active" adalah frontend alias untuk building + finishing, default view; status diambil langsung dari field `status` PocketBase (building/finishing/finish); kolom "Contract Info" sortable by deadline (end_date) — klik header untuk sort asc/desc/reset; Hold Project (superadmin/assignee): banner orange di modal + tombol Hold/Resume di footer modal |
| Interior | ✅ | Table + Kanban, detail modal dengan info vendor; Hold Project (superadmin/assignee): banner orange di modal + badge "On Hold" di kanban card + tombol Hold/Resume di footer modal |
| Form Proyek | ✅ | Field berbeda per tipe proyek (arsitektur/sipil/interior); civil status pakai Select (building/finishing/finish); additional links (1–5 link, disimpan di `meta_data.additional_links` sebagai `{ label?, url }[]`) berlaku untuk semua tipe — label opsional, backward-compatible dengan format lama `string[]`; shared field components: `ProjectNotesField`, `ProjectStatusSelectField`, `ProjectDeadlineField`, `ProjectVendorSelectField` |
| Build Conversion | ✅ | Hanya superadmin — cross-reference arsitektur → sipil via relasi eksplisit `source_architecture` (dipilih saat buat/edit project sipil), conversion rate per PIC, badge di project detail modal civil (clickable → buka detail arsitektur) |

---

## Klien & Prospek

| Modul | Status | Catatan |
|---|---|---|
| Clients | ✅ | Table, search, detail dialog, form CRUD; klik baris → detail dialog; email opsional, phone minimal 8 digit |
| Prospects | ✅ | Table, search, status filter (7 values), month filter (created date via MonthYearPicker), form multi-section (contact, property, schedule); status kolom dihapus dari table — filter via dropdown; status badge berwarna di detail dialog; meeting schedule bisa diedit semua user; quotation options: design · civil · civil + design; kolom client menampilkan Instagram handle (`@handle`) jika tersedia; kolom survey schedule tampil di table |
| Vendors | ✅ | Table, search, filter project type, hanya superadmin; klik baris → detail dialog |

---

## Dokumen

| Modul | Status | Catatan |
|---|---|---|
| Quotations | ✅ | Table, editor A4, print/download, WhatsApp share (pesan formal profesional); QR code di paper dilabeli "Scan to Verify"; area m² mendukung decimal; file name format: `QUOTATION_<SALUTATION>_<CLIENT>_<AREA>m2`; delete (superadmin only) dari editor dengan konfirmasi dialog; `paid_date` field di editor (di samping status); filter status (All/Paid/Draft); filter payment month via `MonthYearPicker` (filter by `paid_date`); sort: Newest First / Oldest First / Largest Area / Smallest Area (server-side) |
| Quotation — Restricted Access | ✅ | Role socmed: bisa buat quotation tapi field finansial disembunyikan |
| Invoices | ✅ | Table, editor A4, payment terms, print/download, WhatsApp share (pesan formal profesional); QR code di paper dilabeli "Scan to Verify"; filter active termin (1–6) di table; payment terms editor: term name editable, Set Active per card, Select term type (Percentage/Fixed DP/Settlement/Custom Amount), toast warning jika total % > 100; area m² mendukung decimal; file name format: `INVOICE_<TYPE>_TERMIN<N>_<SALUTATION>_<CLIENT>` (prefix `INVOICE_UPDATE` jika termin sudah paid); delete (superadmin only) dari editor dengan konfirmasi dialog; `is_fully_paid` field (auto-computed saat semua termin paid, disync on save); badge Settled/Ongoing di tabel berdasarkan `is_fully_paid`; FULLY PAID stamp di atas invoice paper saat `is_fully_paid = true`; filter Settled/Ongoing di toolbar; filter payment month via `MonthYearPicker` (filter by `payment_dates` field — array tanggal pembayaran per termin, disync on save); sort: Newest First / Oldest First (server-side) |
| Public Verification | ✅ | Halaman publik untuk verifikasi dokumen via QR/link |

---

## Settings

| Modul | Status | Catatan |
|---|---|---|
| User Management | ✅ | CRUD user, assign role, hanya superadmin; klik baris → form edit |
| Role Management | ✅ | CRUD role + permission checklist, hanya superadmin; klik baris → form edit |

---

## Survey

| Modul | Status | Catatan |
|---|---|---|
| Survey & Measurement | ✅ | Table, search by client name, filter PIC & status; kolom Surveyor/Schedule/Status rata kanan, Schedule tampil 2 baris (datetime + remaining days); form CRUD (client, surveyor, schedule, status, notes); status: `pending` \| `done`; klik baris → detail dialog (client name, status, phone, email, address, maps; surveyor + phone, schedule + remaining; notes section terpisah di bawah); RBAC: `view_surveys` (read-only, no create/edit/delete) \| `manage_surveys` (full access) |

---

## Laporan

| Modul | Status | Catatan |
|---|---|---|
| Financial Reporting | ✅ | `/reports` (requires `view_revenue`) — stat cards (Total Revenue, Invoice Revenue, Quotation Paid) dengan % change vs periode sebelumnya; bar chart per bulan/kuartal/tahun dengan highlight periode aktif; tabel detail dua tab Invoice + Quotation dengan row total; filter granularitas (Monthly/Quarterly/Yearly), tahun, bulan/kuartal, tipe proyek — semua di-sync ke URL params; Export PDF via jsPDF + html-to-image; sidebar nav item "Reports" |

---

## Client Tracking

| Modul | Status | Catatan |
|---|---|---|
| Client Tracking | ✅ | Halaman standalone di sidebar (`/client-tracking`) — menampilkan daftar proyek per client dikelompokkan per semester (S1: Jan–Jun, S2: Jul–Des) dan tahun; data dari semua tipe proyek (architecture/interior by `deadline`, civil by `end_date`); filter year; reuses `ClientTrackingTab` component; hanya tampil di sidebar untuk `isSuperAdmin` |

---

## Backlog / Planned

| Modul | Status | Catatan |
|---|---|---|
| Notifikasi | ✅ | Sidebar bell — overdue & upcoming tabs; civil projects tampil ke user divisi civil saja (bukan semua user); arsitektur/interior filter by assignee; label tipe dalam English |
