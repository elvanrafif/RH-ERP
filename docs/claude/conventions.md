# Konvensi Koding

## Aturan Umum

- **Reusable components** — wajib jika pola sama muncul 2+ kali. Props selalu eksplisit, tidak pakai `any`.
- **Struktur file** — urutan: imports → types/interfaces lokal → konstanta lokal → komponen utama (hooks di atas, JSX di bawah) → sub-komponen kecil.
- **Magic numbers** — tidak boleh tersebar. Semua konstanta dan status string ke `lib/constant.ts`.
- **Zod schema** — selalu di `lib/validations/`, tidak boleh inline di komponen.
- **Error handling** — selalu `try/catch` dengan `toast.success` / `toast.error` dan pesan informatif.
- **TypeScript** — tidak ada `any`. Gunakan `import type` untuk import yang hanya dipakai sebagai tipe.

## Checklist Sebelum Commit

- [ ] **S** — File tidak melebihi batas baris (komponen 200, hook 150, util 100)
- [ ] **S** — Tidak ada business logic di dalam komponen React
- [ ] **O** — Fitur baru ditambah lewat props/komposisi, bukan modifikasi komponen lama
- [ ] **L** — Props interface jujur — tidak ada akses field yang tidak dideklarasikan
- [ ] **I** — Props hanya berisi field yang benar-benar dipakai komponen itu
- [ ] **D** — Komponen tidak memanggil `pb.collection()` langsung — lewat hook
- [ ] Zod schema ada di `lib/validations/`
- [ ] Tidak ada magic number — semua ada di `lib/constant.ts`
- [ ] Props interface eksplisit, tidak ada `any`
- [ ] Error handling dengan toast dan pesan informatif
- [ ] `import type` untuk import yang hanya dipakai sebagai tipe
