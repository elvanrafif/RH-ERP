# Prinsip SOLID

Semua kode baru dan perubahan wajib mengikuti kelima prinsip ini.

## S — Single Responsibility
Setiap file hanya satu tanggung jawab. Batas ukuran: komponen **200 baris**, hook **150 baris**, util **100 baris**. Melebihi batas → wajib dipecah.

## O — Open/Closed
Tambah fitur lewat **props opsional atau komposisi** — jangan modifikasi komponen yang sudah jalan. Hindari `if (isXxx)` untuk variasi perilaku; gunakan props opsional.

## L — Liskov Substitution
Props interface harus jujur dengan field yang benar-benar dipakai. Gunakan `Pick<T, 'field'>` untuk props yang hanya butuh sebagian field. Jangan `as any`.

## I — Interface Segregation
Kirim hanya field yang dibutuhkan komponen, bukan seluruh object. Jangan buat god hook yang return banyak domain sekaligus — pisah per concern.

## D — Dependency Inversion
Komponen UI tidak boleh panggil `pb.collection()` langsung — harus lewat hook. Data masuk via props, callback (`onSave`, `onDelete`) di-inject dari parent. Lapisan: `Page → Hook → lib/`.
