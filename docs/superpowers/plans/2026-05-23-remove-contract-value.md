# Perombakan Contract Value — Analisis Dampak & Rencana

> **Status:** Pending — menunggu implementasi
> **Dibuat:** 2026-05-23
> **Konteks:** Setelah fitur Project–Invoice Link selesai, `contract_value` di project form menjadi redundant karena nilai kontrak seharusnya datang dari invoice yang ter-link. Dokumen ini merangkum dampak penghapusan dan rencana migrasinya.

---

## Latar Belakang

Sebelumnya, setiap project menyimpan field `contract_value` yang diinput manual oleh user. Sekarang setelah ada fitur Project–Invoice Link, nilai kontrak yang akurat sudah tersedia dari `invoice.total_amount` melalui relasi `invoice_id` di project. Menyimpan `contract_value` secara terpisah berarti dua sumber kebenaran yang bisa tidak sinkron.

---

## Dampak Penghapusan `contract_value`

### 1. Form & Input — Dihapus
| File | Lokasi | Tindakan |
|---|---|---|
| `pages/projects/components/ProjectTypeFields.tsx` | Baris 261, 357, 481 — field input di form architecture/civil/interior | Hapus field |
| `pages/projects/ProjectForm.tsx` | defaultValues + mutation payload | Hapus `contract_value` |
| `lib/validations/project.ts` | Zod schema | Hapus field |
| `types.ts` | `Project.contract_value: number` | Ubah ke `contract_value?: number` (soft deprecated) atau hapus |

### 2. Display — Perlu Migrasi Sumber Data

#### a. Stats bar halaman project — **Sudah aman**
Widget "Project Revenue" (Realized + Potential) sudah pakai `useProjectInvoiceStats` yang baca dari `invoice.total_amount`. Tidak terdampak.

#### b. Project Detail Modal — **Perlu update**
`pages/projects/ProjectDetailsModal.tsx:121` menampilkan `formatRupiah(project.contract_value || 0)`.
- **Rencana:** Ganti dengan `invoice.total_amount` dari expand `invoice_id`. Jika tidak ada invoice ter-link, tampilkan `—` bukan Rp 0.

#### c. Tabel Civil — **Perlu update**
`pages/projects/columnsSipil.tsx:122` menampilkan `contract_value` di kolom.
- **Rencana:** Ganti dengan nilai dari expand `invoice_id.total_amount`. Perlu tambah `expand: 'invoice_id'` di query `useProjects` untuk civil.

#### d. Kanban Card — **Perlu update**
`pages/projects/ProjectKanban.tsx:277,360` — menampilkan `task.contract_value || task.value` (superadmin only).
- **Rencana:** Ganti dengan `task.expand?.invoice_id?.total_amount`. Jika tidak ada invoice, sembunyikan saja.

#### e. Executive Dashboard — **Dampak terbesar**
Dua komponen di Executive Dashboard terdampak signifikan:

**SemesterCard** (`components/dashboard/tabs/SemesterCard.tsx:48,111,135`)
- Menghitung `totalValue` per client group dari `p.contract_value`
- Menampilkan nilai kontrak per project dan total per client
- **Rencana:** Ganti sumber data ke `p.expand?.invoice_id?.total_amount ?? 0`. Perlu pastikan query yang feed ke SemesterCard juga expand `invoice_id`.

**ResourceMonitoringTab** (`components/dashboard/tabs/ResourceMonitoringTab.tsx:132`)
- Menampilkan `totalValue` dari workload data yang dihitung di `lib/projects/statistics.ts:108`
- `statistics.ts` sudah punya fallback: `p.contract_value || p.value || p.total_amount || 0`
- **Rencana:** Tambah `invoice_total_amount` ke `StatProject` interface, prioritaskan nilai dari sana.

---

## Ringkasan Tindakan per File

| File | Tindakan |
|---|---|
| `lib/validations/project.ts` | Hapus `contract_value` dari schema |
| `pages/projects/ProjectForm.tsx` | Hapus dari defaultValues & payload |
| `pages/projects/components/ProjectTypeFields.tsx` | Hapus 3 field input |
| `types.ts` | Soft-deprecate `contract_value` (optional) |
| `hooks/useProjects.ts` | Tambah `invoice_id` ke expand untuk semua query |
| `pages/projects/ProjectDetailsModal.tsx` | Tampilkan `invoice_id.total_amount` atau `—` |
| `pages/projects/columnsSipil.tsx` | Ganti kolom nilai kontrak ke invoice amount |
| `pages/projects/ProjectKanban.tsx` | Ganti ke `invoice_id.total_amount`, hide jika null |
| `lib/projects/statistics.ts` | Update `StatProject` interface, prioritaskan invoice amount |
| `components/dashboard/tabs/SemesterCard.tsx` | Ganti sumber `totalValue` ke invoice amount |
| `hooks/useProjectFilters.ts` | `stats.totalValue` sudah tidak dipakai di widget, bisa dihapus atau dibiarkan |

---

## Hal yang TIDAK Terdampak

- `InvoiceDetailPage.tsx` — `contractValue` di sana = `area × pricePerMeter` (konsep invoice, bukan project field)
- `QuotationEditor.tsx`, `QuotationPaper.tsx`, `InvoicePaper.tsx` — sama, konsep berbeda
- `PublicVerificationPage.tsx` — idem
- `lib/invoicing/reportCalculations.ts` — mengacu `quotation.total_price`, bukan project
- `useProjectInvoiceStats` — sudah baca dari `invoice.total_amount`

---

## Risiko & Catatan

1. **Data lama:** Project yang belum punya `invoice_id` akan menampilkan `—` atau Rp 0 di semua display. Admin perlu mengisi link invoice secara bertahap.
2. **Dashboard akurasi:** Executive Dashboard akan menunjukkan Rp 0 untuk project tanpa linked invoice sampai semua data ter-assign.
3. **PocketBase field:** Field `contract_value` di collection PocketBase tidak perlu dihapus — cukup tidak dipakai lagi dari frontend. Data lama tetap aman.
4. **useProjects expand:** Saat ini query `useProjects` expand `client,assignee,vendor`. Perlu tambah `invoice_id` agar nilai invoice tersedia di semua komponen yang consume projects. Ini ada performance tradeoff — setiap project load akan expand invoice juga.

---

## Urutan Implementasi yang Disarankan

1. Update `useProjects` — tambah `invoice_id` ke expand (fondasi semua langkah berikutnya)
2. Hapus form field — `ProjectTypeFields`, `ProjectForm`, validasi schema
3. Update display — `ProjectDetailsModal`, `columnsSipil`, `ProjectKanban`
4. Update dashboard — `statistics.ts`, `SemesterCard`, `ResourceMonitoringTab`
5. Cleanup — hapus `stats.totalValue` dari `useProjectFilters` jika sudah tidak ada yang pakai
