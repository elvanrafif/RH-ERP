# Module Status

Daftar semua modul dalam RH-ERP beserta status pengembangannya.

> Legend: ✅ Selesai · 🚧 Dalam pengembangan · ⬜ Belum dimulai

---

## Core

| Modul | Status | Catatan |
|---|---|---|
| Login / Auth | ✅ | Session timeout 1 jam, auto logout, show/hide password toggle |
| RBAC (Role & Permission) | ✅ | Custom roles dengan permission granular via PocketBase |
| Dashboard | ✅ | Role-based: superadmin → Executive Overview (workload, client tracking, **Team Calendar** — deadline project civil/architecture/interior, jadwal meeting prospect & survey, monthly/weekly view, color-coded events, day-detail popover; responsive: mobile → list view + bottom sheet, desktop → grid + floating popover); employee → My Projects (active assigned projects, deadline stats); civil role → Civil Team Dashboard (Gantt chart per vendor, responsive 1–3 month window, Today label, color-coded deadlines) |
| Profile & Security | ✅ | Edit profil, ganti password, upload avatar |

---

## Proyek

| Modul | Status | Catatan |
|---|---|---|
| Arsitektur | ✅ | Table + Kanban, detail modal, filter status |
| Sipil | ✅ | Table, klik baris → buka detail modal; filter status (Active/Building/Finishing/Finished/All) — "Active" adalah frontend alias untuk building + finishing, default view; status diambil langsung dari field `status` PocketBase (building/finishing/finish); kolom "Contract Info" sortable by deadline (end_date) — klik header untuk sort asc/desc/reset |
| Interior | ✅ | Table, detail modal dengan info vendor |
| Form Proyek | ✅ | Field berbeda per tipe proyek (arsitektur/sipil/interior); civil status pakai Select (building/finishing/finish); additional links (1–5 link, disimpan di `meta_data.additional_links` sebagai `{ label?, url }[]`) berlaku untuk semua tipe — label opsional, backward-compatible dengan format lama `string[]` |
| Build Conversion | ✅ | Hanya superadmin — cross-reference arsitektur → sipil via relasi eksplisit `source_architecture` (dipilih saat buat/edit project sipil), conversion rate per PIC, badge di project detail modal civil (clickable → buka detail arsitektur) |

---

## Klien & Prospek

| Modul | Status | Catatan |
|---|---|---|
| Clients | ✅ | Table, search, detail dialog, form CRUD; klik baris → detail dialog |
| Prospects | ✅ | Table, search, status filter (7 values), month filter (created date via MonthYearPicker), form multi-section (contact, property, schedule); status kolom dihapus dari table — filter via dropdown; status badge berwarna di detail dialog; meeting schedule bisa diedit semua user; quotation options: design · civil · civil + design |
| Vendors | ✅ | Table, search, filter project type, hanya superadmin; klik baris → detail dialog |

---

## Dokumen

| Modul | Status | Catatan |
|---|---|---|
| Quotations | ✅ | Table, editor A4, print/download, WhatsApp share (pesan formal profesional); QR code di paper dilabeli "Scan to Verify" |
| Quotation — Restricted Access | ✅ | Role socmed: bisa buat quotation tapi field finansial disembunyikan |
| Invoices | ✅ | Table, editor A4, payment terms, print/download, WhatsApp share (pesan formal profesional); QR code di paper dilabeli "Scan to Verify" |
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

## Backlog / Planned

| Modul | Status | Catatan |
|---|---|---|
| Notifikasi | ✅ | Sidebar bell — overdue & upcoming tabs; civil projects tampil ke user divisi civil saja (bukan semua user); arsitektur/interior filter by assignee; label tipe dalam English |
