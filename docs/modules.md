# Module Status

Daftar semua modul dalam RH-ERP beserta status pengembangannya.

> Legend: ✅ Selesai · 🚧 Dalam pengembangan · ⬜ Belum dimulai

---

## Core

| Modul | Status | Catatan |
|---|---|---|
| Login / Auth | ✅ | Session timeout 1 jam, auto logout |
| RBAC (Role & Permission) | ✅ | Custom roles dengan permission granular via PocketBase |
| Dashboard | ✅ | Workload chart, revenue stats, top invoices & quotations |
| Profile & Security | ✅ | Edit profil, ganti password, upload avatar |

---

## Proyek

| Modul | Status | Catatan |
|---|---|---|
| Arsitektur | ✅ | Table + Kanban, detail modal, filter status |
| Sipil | ✅ | Table, filter, computed status berdasarkan tanggal |
| Interior | ✅ | Table, detail modal dengan info vendor |
| Form Proyek | ✅ | Field berbeda per tipe proyek (arsitektur/sipil/interior) |

---

## Klien & Prospek

| Modul | Status | Catatan |
|---|---|---|
| Clients | ✅ | Table, search, detail dialog, form CRUD |
| Prospects | ✅ | Table, search, form multi-section (contact, property, schedule) |
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
| Notifikasi | ⬜ | Reminder deadline proyek |
