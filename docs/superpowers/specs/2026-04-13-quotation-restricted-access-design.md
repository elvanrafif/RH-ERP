# Design: Quotation Restricted Access (Sosmed Role)

**Date:** 2026-04-13  
**Status:** Approved

---

## Background

Quotations saat ini hanya bisa diakses oleh superadmin. Akan ditambahkan akses terbatas untuk divisi sosmed: mereka bisa membuat dan mengedit quotation, namun tidak boleh melihat atau mengubah data finansial (nominal, area m2, rekening, status).

---

## Permission Baru

Tambah group **"Quotations"** di `roleForm.tsx` dengan 2 permission:

| Permission ID | Label | Deskripsi |
|---|---|---|
| `manage_quotations` | Create/Edit Quotation (Full Access) | Akses penuh — bisa lihat & edit semua field |
| `manage_quotations_restricted` | Create/Edit Quotation (Restricted) | Bisa create & edit, tapi field & kolom finansial disembunyikan/disabled |

**Superadmin:** bypass semua (tidak berubah).  
**Sosmed role:** assign `manage_quotations_restricted`.  
**Admin/management:** assign `manage_quotations`.

---

## Pembatasan: QuotationTable (List Page)

Ketika user memiliki `manage_quotations_restricted` **dan tidak** memiliki `manage_quotations`:

- Kolom **Project Area** → tidak dirender
- Kolom **Total Amount** → tidak dirender

User dengan `manage_quotations` melihat semua kolom seperti biasa.

---

## Pembatasan: QuotationEditor (Detail/Edit Page)

Ketika user restricted:

| Field | Behaviour |
|---|---|
| `quotation_number` | Editable |
| `client` | Editable |
| `address` | Editable |
| `price_per_meter` | Editable |
| `project_area` | **Disabled** |
| `status` | **Disabled** |
| `bank_details` (rekening) | **Disabled** |

---

## Bug Fix: Address Tidak Update Saat Ganti Client

**Masalah:** Saat user mengganti client di editor, textarea `address` tidak otomatis terisi dengan alamat client baru.

**Fix:** Di handler `onValueChange` client selector, setelah set `selectedClientId` dan `selectedClientData`, tambahkan `setAddress(client.address || '')` untuk update address ke alamat client yang baru dipilih (tetap bisa di-override manual).

---

## Komponen yang Diubah

| File | Perubahan |
|---|---|
| `pages/settings/roleManagement/roleForm.tsx` | Tambah group "Quotations" dengan 2 permission baru |
| `pages/quotations/components/QuotationTable.tsx` | Sembunyikan kolom Project Area & Total Amount untuk restricted user |
| `pages/quotations/QuotationEditor.tsx` | Disable field area, status, bank_details untuk restricted user; fix bug address |
| `pages/quotations/QuotationsPage.tsx` | Guard akses halaman — hanya user dengan salah satu quotation permission yang bisa masuk |

---

## Catatan Implementasi

- Gunakan `useAuth()` untuk akses `can()` di semua komponen yang diubah
- Restricted check: `can('manage_quotations_restricted') && !can('manage_quotations')`
- Tidak perlu perubahan di PocketBase schema atau hook `useQuotations`
- Guard di `QuotationsPage` cukup cek `can('manage_quotations') || can('manage_quotations_restricted')` — superadmin sudah di-bypass otomatis oleh `can()`
