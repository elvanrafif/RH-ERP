# Petty Cash — Multi-Receipt per Entry

## Goal

Satu `petty_cash_entry` bisa punya **banyak receipt** (1..N file). Input bisa 1 file atau sekaligus banyak. Saat edit: bisa **tambah file baru**, **hapus satu per satu**, atau **hapus semua**. Tiap receipt bisa di-**preview** sendiri-sendiri.

## Keputusan yang sudah disetujui

- **Struktur data:** ubah field PB `petty_cash_entry.receipt` dari file `maxSelect: 1` → **file `maxSelect: 5`** (multi).
- **Admin PB terjangkau** oleh user → perubahan schema dilakukan manual di admin (koleksi petty cash dibuat manual, bukan via migration).
- **1 entry = banyak file** (bukan bulk-add beberapa entry).

## Data model

- PB: `receipt` file field, `maxSelect: 5`. Nilai record menjadi `string[]` (array nama file). Kosong = `[]` (bukan `null`).
- Frontend type: `PettyCashEntry.receipt?: string[]`.
- Key: buat menjaga kompatibilitas data lama (string tunggal), akses baca harus dinormalisasi via helper `normalizeReceipts(value)` → `string[]`.

## Perilaku PocketBase update (PENTING)

Saat `update`, PB memperlakukan field file sebagai **replace**: file yang tidak disertakan dalam multipart dianggap dihapus. Untuk mempertahankan file lama, frontend harus mengirim:

- Semua **nama file lama yang dipertahankan** sebagai part `receipt` (string nama, bukan file), DAN
- Semua **file baru** sebagai part `receipt` (File).

Kalau hanya kirim file baru tanpa nama lama → file lama hilang. Ini yang bikin UI "hapus per file" bekerja: cukup tidak menyertakan nama file yang dihapus.

## Perubahan backend (manual di admin PB)

- Field `receipt` pada koleksi `petty_cash_entry`: set **Max select = 5**.- Pastikan max file size koleksi cukup (biarkan default; gambar sudah di-resize ke ≤1920px WebP).
- Tidak ada migration file (koleksi manual). Dokumentasikan langkah ini di spec.

## Perubahan frontend (semua di `frontend/src/`)

### 1. `types/pettyCash.ts`
- `PettyCashEntry.receipt?: string[]`
- `PettyCashEntryInput.receipt?: File[]` (file baru) + `keep_receipts?: string[]` (nama file lama yang dipertahankan).

### 2. `lib/validations/pettyCash.ts`
- Schema expense `receipt`: array of File, max 5, tiap item image/PDF. Optional (boleh 0).
- Tambah konstanta `PETTY_CASH_RECEIPT_MAX_COUNT = 5` di `lib/constant.ts`.

### 3. `lib/pettyCash/receipt.ts`
- `processReceipt(file)` tetap (per-file).
- Tambah `processReceipts(files: File[]): Promise<File[]>` (loop + jaga urutan).
- `getReceiptUrl(record, filename, isImage)` — terima nama file eksplisit (bukan `record.receipt`).
- Tambah `isImageReceipt(name)` / `isPdfReceipt(name)` helper (dipakai dialog + preview).
- `normalizeReceipts(value: string[] | string | undefined): string[]`.

### 4. `hooks/usePettyCash.ts`
- `useCreatePettyCashEntry`: append tiap file baru → `receipt` part.
- `useUpdatePettyCashEntry`: append `keep_receipts` (string) lalu tiap file baru. Ini menghasilkan list final yang benar.
- Tidak mengubah query keys / invalidation.

### 5. `PettyCashEntryDialog.tsx` (perubahan utama)
- State receipts:
  ```ts
  type ReceiptItem =
    | { id: string; kind: 'existing'; name: string }
    | { id: string; kind: 'new'; file: File; previewUrl: string }
  ```
- File input `multiple` + tombol "Add files" (reset `input.value` supaya bisa pilih file sama lagi).
- Grid/list thumbnail tiap receipt dengan tombol ✕ remove.
- Tombol "Remove all".
- Existing receipts dirender dari `getReceiptUrl` (thumbnail untuk image, ikon PDF untuk pdf).
- Klik thumbnail existing → buka preview (per-receipt, reuse preview dialog).
- Enforce max 5: disable/notify saat lewat.
- Saat submit: `keep_receipts` = nama existing yang masih ada; `receipt` = file baru yang sudah di-`processReceipt`.
- Reset state setelah sukses (existing behavior).

### 6. `ReceiptPreviewDialog.tsx`
- Dari single `entry` → terima **daftar receipt** + index aktif, atau entry + `initialIndex`.
- Navigasi prev/next antar receipt; tampilkan "x / n".
- Tetap pakai `getReceiptUrl` per file (token PB).

### 7. `PettyCashEntryTable.tsx`
- Kolom Receipt: tampil tombol kalau `normalizeReceipts(entry.receipt).length > 0`, dengan label jumlah (mis. ikon + "2") atau "Preview".
- `onPreview` tetap kirim `entry`; index awal default 0.

### 8. `PettyCashDetailPage.tsx`
- `previewEntry` tetap; `ReceiptPreviewDialog` menerima entry + index.

## Testing

- Update `receipt.test.ts`: `normalizeReceipts` (string→array, undefined→[], array→array), `processReceipts` urutan & tipe.
- Test baru untuk logika "hapus per file" (build keep_receipts + new files) bila diekstrak jadi helper murni.
- Verifikasi manual: add 1, add 3, edit nambah, edit hapus satu, edit hapus semua, preview per receipt, expense over-balance tetap jalan.
- `npm run build` + `npm run lint` di `frontend`.

## Out of scope

- Approval workflow.
- Reorder receipt (bisa ditambah nanti).
- Preview di PDF report (report tidak menampilkan receipt saat ini).

## Langkah upgrade data (setelah deploy)

- Data lama: `receipt` string tunggal → setelah field diubah jadi multi, PB otomatis menampilkannya sebagai array 1 elemen. `normalizeReceipts` menangani keduanya.
- Tidak perlu script migrasi.

## Status implementasi

Selesai (frontend) + verifikasi:
- `npx tsc -b` — bersih
- `eslint` (scoped, file petty cash) — bersih
- `vitest run src/lib/pettyCash` — 17 tes lulus; `npm test` — lulus
- `npm run build` — sukses

## Hardening receipt (jenis + ukuran)

Sumber kebenaran tunggal di `lib/pettyCash/receipt.ts`:
- `ALLOWED_RECEIPT_MIME_TYPES` = jpeg, png, webp, gif, pdf. **SVG ditolak** (rawan XSS), **HEIC ditolak** (tidak bisa di-decode browser desktop).
- `PETTY_CASH_RECEIPT_MAX_SIZE_BYTES` = 3 MB per file.
- Dipakai di 3 tempat: validasi Zod, filter `addFiles` (feedback instan saat pilih file), dan `processReceipt()` (jaring terakhir sebelum upload).

## Aksi manual di admin PocketBase

Field `receipt` pada koleksi `petty_cash_entry`:
- **Max select = 5**
- **Max file size = 3 MB** (samakan dengan frontend)
- **Allowed MIME types** = `image/jpeg,image/png,image/webp,image/gif,application/pdf`
- **Protected = ON** (receipt privat via file token)

Ini boundary keamanan sebenarnya — validasi frontend hanya UX.

