# ADR-001: Quotation disimpan di dalam editor, bukan di dialog awal

**Tanggal:** 2026-04-13
**Status:** Aktif

---

## Konteks

Saat membuat quotation baru, ada dua pendekatan yang mungkin:

**A — Save di dialog awal (Create Dialog)**
User isi data minimal (client, area, harga) → submit → record tersimpan → buka editor.

**B — Save di dalam editor**
User isi data minimal → dialog hanya navigasi ke editor → semua data disimpan dari dalam editor itu sendiri.

---

## Keputusan

Pilih **Pendekatan B** — data quotation disimpan dari dalam editor, bukan dari dialog awal.

---

## Alasan

1. **Quotation bersifat iteratif.** Isi quotation (area, harga, bank details, catatan) sering diubah berkali-kali sebelum dikirim ke klien. Lebih masuk akal kalau semua perubahan dikelola di satu tempat (editor), bukan tersebar antara dialog dan editor.

2. **Editor sudah punya full context.** Editor bisa validasi field secara menyeluruh dan memberi feedback langsung. Dialog awal hanya punya sebagian field sehingga validasi tidak lengkap.

3. **Konsistensi UX dengan Invoice.** Invoice juga menggunakan pola yang sama — semua save dilakukan dari detail page/editor. Menyamakan pola mengurangi kebingungan user.

4. **Menghindari half-saved state.** Kalau dialog simpan dulu lalu gagal buka editor, record quotation sudah terbuat tapi kosong dan tidak terkelola.

---

## Konsekuensi

- Dialog `QuotationCreateDialog` hanya bertanggung jawab mengumpulkan data awal (client, nomor, tanggal) untuk navigasi — bukan untuk persist ke DB.
- `QuotationEditor` memiliki satu tanggung jawab besar: render form + simpan ke PocketBase.
- Jika user menutup browser setelah dialog tapi sebelum editor disimpan, tidak ada record yang tertinggal di DB.
