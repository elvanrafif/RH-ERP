# Design Spec: Laporan Keuangan

**Date:** 2026-04-30
**Branch:** feat/financial-reporting
**Status:** Approved — ready for implementation

---

## Overview

Halaman `/reports` khusus laporan keuangan dengan layout Summary-First: stat cards → bar chart → tabel detail. Menampilkan revenue dari dua sumber: termin invoice aktif dan quotation berstatus `paid`.

---

## Access Control

- Superadmin only **atau** user dengan permission `view_revenue`
- Konsisten dengan pola yang sudah ada di Executive Dashboard
- Sidebar navigasi: tambah item "Laporan" dengan ikon `BarChart2` (lucide-react)

---

## Filter

| Field | Opsi | Default |
|---|---|---|
| Granularitas | Bulanan \| Kuartalan \| Tahunan | Bulanan |
| Periode | Bulan/kuartal/tahun picker | Bulan ini |
| Tipe Proyek | Semua \| Arsitektur \| Sipil \| Interior | Semua |

Filter disimpan di URL params agar bisa di-share/bookmark.

---

## Stat Cards (3 cards, grid 3 kolom)

| Card | Nilai | Keterangan |
|---|---|---|
| Total Revenue | Invoice aktif + Quotation paid | Gabungan dua sumber |
| Invoice Aktif | Sum nilai termin yang aktif di periode | Bukan total invoice, tapi per-termin |
| Quotation Paid | Sum nilai quotation status `paid` | Penawaran yang sudah lunas |

Setiap card tampilkan persentase perubahan vs periode sebelumnya (▲/▼).

---

## Bar Chart

- Library: **Recharts** (sudah dipakai di project)
- X-axis: bulan Jan–Des (jika granularitas bulanan), atau Q1–Q4 (kuartalan)
- Y-axis: nilai dalam jutaan rupiah
- Bar bulan yang belum ada data: placeholder abu dengan border dashed
- Bar bulan aktif: warna primary (charcoal)
- Tooltip: tampil nilai invoice + quotation terpisah saat hover

---

## Tabel Detail

Dua tab: **Invoice** dan **Quotation**.

**Tab Invoice** — kolom:
- Nomor Invoice
- Client
- Tipe Proyek (Arsitektur / Sipil / Interior)
- Nilai Termin (termin yang aktif di periode)
- Status (Lunas / Belum Bayar)

**Tab Quotation** — kolom:
- Nomor Quotation
- Client
- Tipe Proyek
- Nilai Total
- Tanggal Paid

Tabel sortable. Row footer: total nilai per tab.

---

## Export PDF

- Tombol "Export PDF" di kanan atas header
- Generate PDF landscape 1 halaman: stat cards + chart + ringkasan tabel
- Pakai library `jspdf` + `html-to-image` (sudah ada di project)

---

## Data Sources & Logic

### Invoice Revenue
```
Filter: payment_terms yang memiliki tanggal aktif dalam periode yang dipilih
Nilai: sum(payment_term.amount) per termin aktif
```

### Quotation Revenue
```
Filter: quotations dengan status = "paid" dan updated/paid_at dalam periode
Nilai: sum(quotation.total_amount)
```

### Perbandingan vs Periode Sebelumnya
- Bulanan: bandingkan bulan ini vs bulan lalu
- Kuartalan: Q ini vs Q sebelumnya
- Tahunan: tahun ini vs tahun lalu

---

## Komponen Baru

| Komponen | Lokasi | Tanggung Jawab |
|---|---|---|
| `ReportsPage` | `pages/reports/ReportsPage.tsx` | Page container, filter state |
| `RevenueStatCards` | `pages/reports/components/RevenueStatCards.tsx` | 3 stat cards |
| `RevenueBarChart` | `pages/reports/components/RevenueBarChart.tsx` | Bar chart per periode |
| `RevenueDetailTable` | `pages/reports/components/RevenueDetailTable.tsx` | Tabs + tabel invoice/quotation |
| `ReportExportButton` | `pages/reports/components/ReportExportButton.tsx` | Tombol export PDF |
| `useRevenueReport` | `hooks/useRevenueReport.ts` | Fetch + kalkulasi data laporan |
| `useReportFilters` | `hooks/useReportFilters.ts` | Filter state + URL params sync |

---

## Route

```tsx
// App.tsx atau router config
<Route path="/reports" element={
  <PermissionGuard requireAny={['view_revenue']} superAdminAlwaysAllowed>
    <ReportsPage />
  </PermissionGuard>
} />
```

---

## SOLID Compliance

- **S**: Setiap komponen satu tanggung jawab — chart terpisah dari tabel, filter terpisah dari display
- **D**: `ReportsPage` tidak panggil `pb.collection()` langsung — semua via `useRevenueReport`
- **I**: Setiap komponen hanya terima props yang benar-benar ia butuhkan

---

## Out of Scope (untuk iterasi berikutnya)

- Filter per PIC/assignee
- Breakdown profitabilitas per proyek
- AR Aging report (invoice yang sudah berapa lama belum dibayar)
- Export Excel/CSV
- Cash flow projection
