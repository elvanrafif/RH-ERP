# Module Status

Daftar semua modul dalam RH-ERP beserta status pengembangannya.

> Legend: ✅ Selesai · 🚧 Dalam pengembangan · ⬜ Belum dimulai

---

## Core

| Modul | Status | Catatan |
|---|---|---|
| Login / Auth | ✅ | Session timeout 1 jam, auto logout, show/hide password toggle |
| RBAC (Role & Permission) | ✅ | Custom roles dengan permission granular via PocketBase |
| Dashboard | ✅ | Role-based: superadmin → Executive Overview (workload, revenue, client tracking); employee → My Projects (active assigned projects, deadline stats); civil role → Civil Team Dashboard (Gantt chart per vendor, responsive 1–3 month window, Today label, color-coded deadlines) |
| Profile & Security | ✅ | Edit profil, ganti password, upload avatar |

---

## Proyek

| Modul | Status | Catatan |
|---|---|---|
| Arsitektur | ✅ | Table + Kanban, detail modal, filter status |
| Sipil | ✅ | Table, filter status (All/Building/Finishing/Finished); status diambil langsung dari field `status` PocketBase (building/finishing/finish) |
| Interior | ✅ | Table, detail modal dengan info vendor |
| Form Proyek | ✅ | Field berbeda per tipe proyek (arsitektur/sipil/interior); civil status pakai Select (building/finishing/finish); additional links (1–5 link, disimpan di `meta_data.additional_links`) berlaku untuk semua tipe |
| Build Conversion | ✅ | Hanya superadmin — cross-reference arsitektur → sipil via relasi eksplisit `source_architecture` (dipilih saat buat/edit project sipil), conversion rate per PIC, badge di project detail modal civil (clickable → buka detail arsitektur) |

---

## Klien & Prospek

| Modul | Status | Catatan |
|---|---|---|
| Clients | ✅ | Table, search, detail dialog, form CRUD |
| Prospects | ✅ | Table, search, status filter (7 values), form multi-section (contact, property, schedule); status kolom dihapus dari table — filter via dropdown; status badge berwarna di detail dialog; meeting schedule bisa diedit semua user; quotation options: design · civil · civil + design |
| Vendors | ✅ | Table, search, filter project type, hanya superadmin |

---

## Dokumen

| Modul | Status | Catatan |
|---|---|---|
| Quotations | ✅ | Table, editor A4, print/download, WhatsApp share |
| Quotation — Restricted Access | ✅ | Role socmed: bisa buat quotation tapi field finansial disembunyikan |
| Invoices | ✅ | Table, editor A4, payment terms, print/download, WhatsApp share |
| Public Verification | ✅ | Halaman publik untuk verifikasi dokumen via QR/link |

---

## Settings

| Modul | Status | Catatan |
|---|---|---|
| User Management | ✅ | CRUD user, assign role, hanya superadmin |
| Role Management | ✅ | CRUD role + permission checklist, hanya superadmin |

---

## Backlog / Planned

| Modul | Status | Catatan |
|---|---|---|
| Laporan / Reporting | ⬜ | Export rekap per periode |
| Notifikasi | ✅ | Sidebar bell — overdue & upcoming tabs; civil projects tampil ke semua user (PIC = vendor), arsitektur/interior filter by assignee; label tipe dalam English |
