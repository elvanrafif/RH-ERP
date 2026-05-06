# Invoice Payment Terms — Improvement Todos

> Dicatat: 2026-05-06
> Terakhir diupdate: 2026-05-06
> Status: ✅ Selesai semua

Hasil review dan diskusi terhadap sistem payment terms di invoice editor. Dibagi per kategori, masing-masing dengan keputusan yang sudah disepakati.

---

## A. UX Editor

### ✅ A1. Dead prop `grandTotal` di `PaymentTermsEditor`
**File:** `frontend/src/pages/invoices/components/PaymentTermsEditor.tsx`
**Fix:** Dihapus dari `PaymentTermsEditorProps` interface. *(done: a645e25)*

### ✅ A2. Term name editable tapi tidak obvious
**File:** `frontend/src/pages/invoices/components/PaymentTermsEditor.tsx`
**Fix:** Hover border dashed + ikon `<Pencil>` yang muncul saat hover. *(done: a645e25)*

### ✅ A3. "Active Term" selector terpisah secara visual dari PaymentTermsEditor
**File:** `frontend/src/pages/invoices/components/InvoiceEditorSettings.tsx`
**Fix:** Selector dihapus dari InvoiceEditorSettings. Kontrol activeTermin dipindah ke tombol "Set Active" per term card di PaymentTermsEditor. *(done: a645e25)*

### ✅ A4. Label "Desc / %" ambigu
**File:** `frontend/src/pages/invoices/components/PaymentTermsEditor.tsx`
**Fix:** Diganti Select (Percentage/Fixed DP/Settlement/Custom Amount) + conditional number input. *(done: a645e25)*

---

## B. Logika Kalkulasi

### ✅ B1. Magic strings yang fragile
**File:** `frontend/src/lib/invoicing/termCalculation.ts`
**Fix:** Dieliminasi — UI sekarang pakai Select typed, bukan free text. *(done: a645e25)*

### ✅ B2. Tidak ada validasi total 100%
**Fix:** Toast warning muncul sekali saat total % baru melewati 100. Hanya menghitung term bertipe `percentage`, bukan Fixed DP/Settlement/Custom. *(done: c571b93)*

### ✅ B3. DP hardcoded ke `DEFAULT_DP_AMOUNT`
**File:** `frontend/src/lib/invoicing/termCalculation.ts`
**Fix:** `newAmount = Math.min(DEFAULT_DP_AMOUNT, grandTotal)` *(done: sesi ini)*

### ~~B4. `item.status === 'Success'` ditampilkan mentah di invoice paper~~
*Skipped — tidak diprioritaskan.*

---

## C. Konsistensi Data

### ✅ C1. activeTermin dan item.status terpisah tapi bisa konflik
**File:** `InvoiceDetailPage.tsx`, `PaymentTermsEditor`
**Fix yang diimplementasi:**
- `activeTermin` tetap sebagai manual state (tidak di-derive otomatis) karena ada kebutuhan bisnis: marking Paid tidak harus langsung advance active term
- Kontrol activeTermin dipindah ke tombol "Set Active" per card — user memutuskan kapan advance
- `active_termin` tetap disimpan ke DB (dipakai InvoiceTable), nilai yang disimpan adalah state manual ini
*(done: a645e25)*

### ✅ C2. Invoice-level `status` tidak sync
**File:** `InvoiceDetailPage.tsx`
**Fix:** Derive otomatis saat save — `status = 'paid'` jika semua item Paid, sebaliknya `'unpaid'`. Tidak perlu user set manual. *(done: a645e25)*

---

## D. Fleksibilitas

### ✅ D1. Tidak bisa tambah/hapus term
**Fix:** Tombol "+ Add Term" (dashed, full-width) di bawah list. Tombol × per card (hidden kalau term hanya 1). Saat hapus term yang active, `activeTermin` auto-adjust ke term terdekat. *(done: sesi ini)*

### ~~D2. Template menggunakan nama Indonesia~~
*Skipped — tidak diprioritaskan.*

### D4. Ganti free-text percent dengan Select + conditional input
**Masalah:** Free-text ("DP", "50%", "Pelunasan") fragile dan tidak discoverable.
**Fix yang disepakati:**

| Select option | Input tambahan | Kalkulasi |
|---|---|---|
| `percentage` *(default)* | number input "%" | `grandTotal × n / 100` |
| `fixed_dp` | — | `Math.min(DEFAULT_DP_AMOUNT, grandTotal)` |
| `settlement` | — | `grandTotal - runningTotal` |
| `custom_amount` | amount input | manual, tidak auto |

**Backward compatibility:** Saat load invoice lama, parse `percent` string lama → map ke format baru:
- `"DP"` → `fixed_dp`
- `"Pelunasan"` / `"Settlement"` → `settlement`
- `"50%"`, `"20%"`, dll → `percentage`, value: 50/20
- Kosong / lainnya → `percentage`, value kosong

Template existing (`template.ts`) default ke `percentage` sesuai nilai yang sudah ada.

---

## Checklist Pengerjaan

- [x] C1 — pisahkan activeTermin dari item.status, tombol "Set Active" per card
- [x] C2 — derive invoice status otomatis saat save
- [x] A4 + D4 — Select typed (Percentage/Fixed DP/Settlement/Custom Amount)
- [x] B1 — eliminasi magic strings
- [x] A1 — hapus dead prop `grandTotal`
- [x] A2 — term name editable indicator (hover border + pencil icon)
- [x] A3 — hapus "Active Term" selector dari InvoiceEditorSettings
- [x] B2 — toast warning jika total % > 100
- [x] B3 — cap DP amount: `Math.min(DEFAULT_DP_AMOUNT, grandTotal)`
- [x] D1 — add/remove term di PaymentTermsEditor
- ~~B4~~ — skipped
- ~~D2~~ — skipped

> Semua item selesai dikerjakan.
