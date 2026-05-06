# Invoice Payment Terms — Improvement Todos

> Dicatat: 2026-05-06
> Status: Backlog — belum dikerjakan

Hasil review dan diskusi terhadap sistem payment terms di invoice editor. Dibagi per kategori, masing-masing dengan keputusan yang sudah disepakati.

---

## A. UX Editor

### A1. Dead prop `grandTotal` di `PaymentTermsEditor`
**File:** `frontend/src/pages/invoices/components/PaymentTermsEditor.tsx:21`
**Masalah:** `grandTotal` ada di interface tapi tidak pernah di-destructure atau dipakai di dalam komponen. Recalculation sudah ditangani di parent.
**Fix:** Hapus dari `PaymentTermsEditorProps` interface.

### A2. Term name editable tapi tidak obvious
**File:** `frontend/src/pages/invoices/components/PaymentTermsEditor.tsx:52-56`
**Masalah:** Input `name` di-style `border-none bg-transparent shadow-none` — kelihatan seperti teks biasa, bukan input yang bisa diedit.
**Fix yang disepakati:** Tambah `hover:border-dashed hover:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-400` + ikon `<Pencil>` kecil yang muncul saat hover (opacity-0 → opacity-40).

### A3. "Active Term" selector terpisah secara visual dari PaymentTermsEditor
**File:** `frontend/src/pages/invoices/components/InvoiceEditorSettings.tsx:69` vs `PaymentTermsEditor`
**Masalah:** Selector "Active Term:" ada di bagian atas (InvoiceEditorSettings), efeknya terlihat di bagian bawah (PaymentTermsEditor). Jauh secara visual, membingungkan.
**Fix:** Lihat C1 — setelah `activeTermin` di-derive otomatis dari item status, selector ini tidak diperlukan lagi dan bisa dihapus.

### A4. Label "Desc / %" ambigu
**File:** `frontend/src/pages/invoices/components/PaymentTermsEditor.tsx:95`
**Masalah:** Free-text input untuk hal yang sebenarnya punya tipe terbatas (DP, persentase, pelunasan). User baru tidak tahu keyword yang valid.
**Fix yang disepakati:** Ganti dengan Select + conditional input. Lihat detail di D4.

---

## B. Logika Kalkulasi

### B1. Magic strings yang fragile
**File:** `frontend/src/lib/invoicing/termCalculation.ts:36-38`
**Masalah:** Keyword "dp", "pelunasan", "settlement" di-parse dari free text. Typo → amount 0 tanpa warning.
**Fix:** Dieliminasi setelah A4/D4 diimplementasi — type payment term akan jadi enum, bukan free text.

### B2. Tidak ada validasi total 100%
**File:** `frontend/src/lib/invoicing/termCalculation.ts`
**Masalah:** Tidak ada warning jika total persentase semua term tidak sama dengan 100%.
**Fix:** Tambah warning indicator di PaymentTermsEditor saat total % ≠ 100 (dan bukan tipe "settlement" yang menghitung sisa otomatis).

### B3. DP hardcoded ke `DEFAULT_DP_AMOUNT`
**File:** `frontend/src/lib/invoicing/termCalculation.ts:36-37`, `frontend/src/lib/constant.ts`
**Masalah:** Jika grand total < DEFAULT_DP_AMOUNT, term pertama melebihi total — hasil aneh.
**Fix:** Setelah tipe "fixed_dp" diimplementasi, cap amount di `Math.min(DEFAULT_DP_AMOUNT, grandTotal)`.

### B4. `item.status === 'Success'` ditampilkan mentah di invoice paper
**File:** `frontend/src/pages/invoices/components/InvoicePaper.tsx:214`
**Masalah:** Kolom STATUS di invoice paper menampilkan "Success" — tidak proper untuk dokumen resmi.
**Fix:** Map display value: `'Success' → 'Paid'`, kosong → `'Unpaid'` atau `-`.

---

## C. Konsistensi Data

### C1. Dua sistem tracking progress yang tidak terhubung *(paling kritis)*
**File:** `InvoiceDetailPage.tsx:49` (`activeTermin` state) + `PaymentTermsEditor` (`item.status`)
**Masalah:**
- `activeTermin` (string "1"/"2"/...) dan `item.status` per-term bisa out of sync
- `Remaining Payment` dihitung dari `item.status`, invoice paper bergantung pada `activeTermin`
- Hasilnya bisa kontradiktif tanpa user sadar

**Fix yang disepakati:**
- Hapus `activeTermin` sebagai state yang dikontrol manual
- Derive otomatis: `activeTermin = items.findIndex(i => i.status !== 'Success') + 1`
- Jika semua paid → activeTermin = items.length
- Field `active_termin` di DB bisa deprecated (tidak perlu disimpan, dihitung ulang dari `items` tiap load)
- Selector "Active Term:" di InvoiceEditorSettings dihapus

### C2. Invoice-level `status` tidak sync
**File:** `InvoiceDetailPage.tsx:50`
**Masalah:** Ada `status` di level invoice (`unpaid`/`paid`) terpisah dari per-item status.
**Fix:** Derive otomatis — invoice `status = 'paid'` jika semua item.status === 'Success', sebaliknya `'unpaid'`. Tidak perlu user set manual.

---

## D. Fleksibilitas

### D1. Tidak bisa tambah/hapus term
**Masalah:** Jumlah term dikunci oleh template (`template.ts`). Proyek custom dengan lebih/kurang term tidak bisa diakomodasi.
**Fix:** Tambah tombol "+ Add Term" dan "×" per term di PaymentTermsEditor.

### D2. Template menggunakan nama Indonesia
**File:** `frontend/src/pages/invoices/template.ts`
**Masalah:** "Termin 1", "Pelunasan" — conventions.md menyatakan semua UI harus English.
**Fix:** Rename ke "Term 1", "Term 2", dll. Keyword "Pelunasan" dieliminasi setelah D4 diimplementasi.

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

## Urutan Pengerjaan yang Disarankan

1. **C1 + C2** — derive `activeTermin` & invoice status (menghilangkan root cause banyak bug)
2. **A4 + D4** — ganti free-text dengan Select (eliminasi magic strings + B1)
3. **A1** — hapus dead prop (trivial, 1 menit)
4. **A2** — term name editable indicator (polish)
5. **B4** — fix display "Success" di invoice paper
6. **B2 + B3** — validasi total % + cap DP amount
7. **D1** — add/remove term
8. **A3 + D2** — cleanup setelah C1 done (hapus selector, rename template)
