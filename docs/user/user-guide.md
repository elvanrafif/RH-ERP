# Panduan Pengguna RH-ERP

Sistem manajemen internal RH Studio Arsitek — untuk tim Arsitektur, Sipil, dan Interior.

---

## Daftar Isi

1. [Masuk dan Keluar Sistem](#1-masuk-dan-keluar-sistem)
2. [Catatan Penting: Sesi Otomatis Keluar](#2-catatan-penting-sesi-otomatis-keluar)
3. [Dashboard](#3-dashboard)
4. [Notifikasi Deadline](#4-notifikasi-deadline)
5. [Proyek](#5-proyek)
   - [Tampilan Kanban](#tampilan-kanban)
   - [Tampilan Tabel](#tampilan-tabel)
   - [Menambah dan Mengedit Proyek](#menambah-dan-mengedit-proyek)
6. [Penawaran (Quotation)](#6-penawaran-quotation)
7. [Invoice (Tagihan)](#7-invoice-tagihan)
8. [Klien](#8-klien)
9. [Prospek](#9-prospek)
10. [Build Conversion](#10-build-conversion)
11. [Manajemen Pengguna](#11-manajemen-pengguna)
12. [Manajemen Peran (Role)](#12-manajemen-peran-role)
13. [Profil Saya](#13-profil-saya)
14. [Pencarian dan Filter di Semua Halaman](#14-pencarian-dan-filter-di-semua-halaman)

---

## 1. Masuk dan Keluar Sistem

### Masuk

1. Buka aplikasi RH-ERP di browser.
2. Masukkan **email** dan **kata sandi** akun Anda.
3. Klik tombol **Masuk**.

Setelah berhasil masuk, Anda akan diarahkan ke halaman **Dashboard**.

### Keluar

1. Klik nama atau foto profil Anda di sudut kanan atas.
2. Pilih **Keluar**.

> **Perhatian:** Jika Anda membuka sistem di beberapa tab browser sekaligus, keluar dari salah satu tab akan **menutup sesi di semua tab** secara otomatis.

---

## 2. Catatan Penting: Sesi Otomatis Keluar

Sistem akan otomatis keluar jika Anda **tidak aktif selama 1 jam**.

Sebelum itu terjadi, sistem akan memberikan **peringatan**. Anda bisa klik tombol yang muncul untuk tetap masuk.

> **Tips:** Jika Anda sedang mengisi form panjang atau menulis penawaran, simpan pekerjaan Anda secara berkala agar tidak hilang jika sesi berakhir.

---

## 3. Dashboard

Dashboard adalah halaman pertama yang muncul setelah masuk. Tampilan dashboard berbeda tergantung peran (role) Anda:

### Dashboard Admin (Executive Overview)

Khusus pengguna dengan peran Administrator/Superadmin. Menampilkan:

- **Ringkasan Proyek** — jumlah proyek aktif per divisi (Arsitektur, Sipil, Interior).
- **Grafik Pendapatan** — perbandingan pendapatan dari invoice dan penawaran per periode.
- **Beban Kerja Tim** — seberapa banyak proyek yang ditangani setiap anggota tim.
- **Pelacakan Klien** — rekap proyek per klien berdasarkan semester dan tahun.

### Dashboard Karyawan (My Projects)

Untuk karyawan umum. Menampilkan proyek-proyek yang sedang ditangani oleh Anda sendiri:

- Jumlah proyek aktif per divisi yang Anda pegang.
- Proyek mendekati tenggat atau sudah lewat tenggat — dikelompokkan per divisi dengan indikator warna.

### Dashboard Tim Sipil (Civil Team Dashboard)

Khusus pengguna dengan peran Civil/Sipil. Menampilkan:

- **Statistik ringkas** — total proyek aktif, mendekati tenggat, dan overdue.
- **Gantt Chart per Vendor** — timeline proyek sipil dikelompokkan per vendor, dengan rentang tampilan 1–3 bulan yang bisa digeser. Vendor dengan proyek overdue muncul paling atas.
- Setiap bar proyek berwarna sesuai status: merah (overdue), kuning (mendekati tenggat), biru (normal).

Dashboard tidak bisa diedit — hanya untuk melihat informasi.

---

## 4. Notifikasi Deadline

Ikon lonceng di sidebar menampilkan daftar proyek yang mendekati atau sudah melewati tenggat waktu.

- **Tab Overdue** — proyek yang sudah melewati deadline.
- **Tab Upcoming** — proyek yang tenggat waktunya dalam waktu dekat.

Untuk pengguna Civil, notifikasi menampilkan semua proyek sipil (PIC = vendor). Untuk pengguna lain, notifikasi hanya menampilkan proyek yang di-assign ke Anda.

---

## 5. Proyek

Menu **Proyek** terbagi menjadi tiga divisi: **Arsitektur**, **Sipil**, dan **Interior**. Masing-masing bisa diakses dari menu di sidebar.

Setiap divisi memiliki tahapan status yang berbeda:

| Divisi | Alur Status |
|---|---|
| Arsitektur | Denah Lantai → Fasad → Gambar Detail → Selesai |
| Interior | Konsep Awal → Gambar Detail → Selesai |
| Sipil | Hanya tampilan tabel |

### Tampilan Kanban

Proyek Arsitektur dan Interior memiliki tampilan **Kanban** — berupa papan dengan kolom status.

**Memindahkan status proyek:**
1. Temukan kartu proyek yang ingin dipindahkan.
2. Klik dan tahan kartu tersebut.
3. Seret (drag) ke kolom status yang baru.
4. Lepaskan — status proyek akan langsung diperbarui.

> **Tips:** Gunakan tampilan Kanban untuk melihat gambaran besar progres semua proyek sekaligus.

### Tampilan Tabel

Klik ikon tabel di pojok kanan halaman untuk beralih ke tampilan daftar. Tampilan tabel lebih cocok untuk mencari proyek tertentu atau melihat informasi detail seperti nama klien, nilai proyek, dan tanggal.

Proyek **Sipil** hanya tersedia dalam tampilan tabel.

### Menambah dan Mengedit Proyek

**Menambah proyek baru:**
1. Klik tombol **+ Tambah Proyek** di bagian atas halaman.
2. Isi form: nama proyek, klien, tanggal mulai, tenggat, nilai proyek, dan anggota tim.
3. Klik **Simpan**.

**Mengedit proyek:**
1. Klik kartu atau baris proyek yang ingin diubah.
2. Klik tombol **Edit** (ikon pensil).
3. Ubah informasi yang diperlukan.
4. Klik **Simpan**.

**Menghapus proyek:**
1. Buka detail proyek.
2. Klik tombol **Hapus** (ikon tempat sampah).
3. Konfirmasi penghapusan di dialog yang muncul.

> **Perhatian:** Penghapusan proyek tidak bisa dibatalkan.

---

## 6. Penawaran (Quotation)

Menu **Penawaran** digunakan untuk membuat dokumen penawaran harga kepada klien.

### Membuat Penawaran Baru

1. Klik tombol **+ Buat Penawaran**.
2. Pilih klien dari daftar atau ketik nama untuk mencari.
3. Isi detail penawaran: nama proyek, deskripsi pekerjaan, dan rincian harga.
4. Dokumen otomatis tersimpan saat Anda mengedit.

### Editor Dokumen A4

Penawaran ditampilkan dalam format **dokumen A4** yang siap cetak. Anda bisa mengedit teks, angka, dan item langsung di dalam dokumen.

### Bagikan via WhatsApp

1. Buka penawaran yang ingin dibagikan.
2. Klik tombol **Bagikan via WhatsApp**.
3. Sistem akan membuka WhatsApp dengan pesan yang sudah disiapkan, lengkap dengan nomor klien.
4. Kirim pesan dari WhatsApp seperti biasa.

### Unduh sebagai Gambar

1. Buka penawaran.
2. Klik tombol **Unduh**.
3. Dokumen akan tersimpan sebagai file gambar (JPG) ke perangkat Anda.

---

## 7. Invoice (Tagihan)

Menu **Invoice** digunakan untuk membuat tagihan resmi kepada klien setelah pekerjaan selesai atau sesuai kesepakatan.

### Membuat Invoice Baru

1. Klik tombol **+ Buat Invoice**.
2. Pilih klien dan isi detail proyek.
3. Tentukan **termin pembayaran** — misalnya: DP 30% di awal, sisanya setelah selesai.
4. Klik **Simpan**.

### Status Pembayaran

Setiap invoice memiliki salah satu dari dua status:

- **Belum Dibayar** — tagihan sudah dikirim, pembayaran belum diterima.
- **Sudah Dibayar** — pembayaran sudah diterima.

Untuk mengubah status:
1. Buka invoice yang ingin diperbarui.
2. Klik tombol **Tandai Sudah Dibayar** (atau sebaliknya).

### Unduh dan Bagikan

Sama seperti Penawaran, Invoice juga bisa diunduh sebagai gambar atau dibagikan via WhatsApp menggunakan tombol yang tersedia di halaman detail invoice.

---

## 8. Klien

Menu **Klien** menyimpan data semua klien atau perusahaan yang bekerja sama dengan RH Studio.

### Menambah Klien Baru

1. Klik tombol **+ Tambah Klien**.
2. Isi form: nama perusahaan, email, nomor telepon, dan alamat.
3. Klik **Simpan**.

### Mengedit atau Menghapus Klien

1. Klik nama klien di daftar.
2. Klik **Edit** untuk mengubah data, atau **Hapus** untuk menghapus.

> **Perhatian:** Hapus klien hanya jika klien tersebut tidak memiliki proyek, penawaran, atau invoice yang masih aktif.

---

## 9. Prospek

Menu **Prospek** digunakan untuk mencatat calon klien yang sedang dalam tahap penjajakan atau negosiasi, sebelum resmi menjadi klien.

### Menambah Prospek Baru

1. Klik tombol **+ Tambah Prospek**.
2. Isi form yang terbagi menjadi tiga bagian:
   - **Kontak** — nama, email, nomor telepon.
   - **Properti** — lokasi dan jenis proyek yang diminati.
   - **Jadwal** — tanggal follow-up atau pertemuan.
3. Klik **Simpan**.

### Mengedit atau Menghapus Prospek

1. Klik baris prospek di daftar untuk melihat detail.
2. Klik **Edit** untuk memperbarui data, atau **Hapus** untuk menghapus.

---

## 10. Build Conversion

> **Khusus Admin.** Menu ini hanya bisa diakses oleh Administrator.

Menu **Build Conversion** menampilkan laporan konversi proyek Arsitektur yang berlanjut menjadi proyek Sipil (pembangunan). Berguna untuk memantau seberapa banyak desain yang benar-benar dieksekusi.

Yang bisa dilihat di halaman ini:

- **Daftar proyek arsitektur** beserta status konversinya — sudah dikonversi, berpotensi dikonversi, atau belum dikonversi.
- **Conversion rate per PIC** — persentase konversi per anggota tim.
- **Badge konversi** di detail proyek sipil — bisa diklik untuk membuka detail proyek arsitektur sumbernya.

Relasi antara proyek arsitektur dan sipil ditentukan oleh field **Source Architecture** yang dipilih saat membuat atau mengedit proyek sipil.

---

## 11. Manajemen Pengguna

> **Khusus Admin.** Menu ini hanya bisa diakses oleh pengguna dengan peran Administrator.

### Menambah Akun Karyawan Baru

1. Buka menu **Manajemen Pengguna**.
2. Klik **+ Tambah Pengguna**.
3. Isi nama lengkap, email, dan kata sandi awal.
4. Pilih **peran (role)** dan **divisi** yang sesuai.
5. Klik **Simpan**.

Karyawan bisa masuk menggunakan email dan kata sandi yang ditetapkan, lalu mengubah kata sandi dari halaman Profil.

### Mengedit atau Menonaktifkan Pengguna

1. Klik nama pengguna di daftar.
2. Ubah informasi yang diperlukan, termasuk peran atau divisi.
3. Klik **Simpan**.

---

## 12. Manajemen Peran (Role)

> **Khusus Admin.** Menu ini hanya bisa diakses oleh Administrator.

Peran menentukan fitur apa saja yang bisa diakses oleh setiap karyawan. Misalnya, staf biasa mungkin tidak bisa melihat halaman Invoice, sementara manajer bisa melihat dan mengedit semua data.

### Mengatur Hak Akses Peran

1. Buka menu **Manajemen Peran**.
2. Klik peran yang ingin diubah.
3. Centang atau hapus centang izin yang sesuai.
4. Klik **Simpan**.

> **Tips:** Pastikan setiap peran hanya memiliki akses ke fitur yang memang perlu. Ini menjaga keamanan data perusahaan.

---

## 13. Profil Saya

Setiap pengguna bisa memperbarui data dirinya sendiri.

### Mengubah Informasi Profil

1. Klik nama atau foto Anda di sudut kanan atas.
2. Pilih **Profil**.
3. Ubah nama lengkap atau nomor telepon.
4. Klik **Simpan**.

### Mengganti Foto Profil

1. Di halaman Profil, klik foto profil yang ada (atau area foto jika belum ada).
2. Pilih file gambar dari perangkat Anda.
3. Foto akan langsung diperbarui setelah diunggah.

### Mengganti Kata Sandi

1. Di halaman Profil, gulir ke bagian **Ganti Kata Sandi**.
2. Masukkan kata sandi lama, lalu kata sandi baru sebanyak dua kali.
3. Klik **Simpan**.

> **Tips:** Gunakan kata sandi yang kuat — kombinasi huruf besar, huruf kecil, angka, dan simbol.

---

## 14. Pencarian dan Filter di Semua Halaman

Hampir semua halaman daftar (Proyek, Penawaran, Invoice, Klien) memiliki fitur pencarian dan filter.

**Cara menggunakan:**

- **Kotak Pencarian** — ketik nama proyek, klien, atau nomor invoice untuk langsung menyaring hasil.
- **Filter Klien** — pilih nama klien tertentu untuk melihat data milik klien tersebut saja.
- **Filter Tanggal** — tentukan rentang tanggal untuk mempersempit hasil.
- **Filter Tipe** — pada halaman Invoice, pilih status (Belum Dibayar / Sudah Dibayar) untuk menyaring.

**Menghapus filter:**

Klik tombol **Reset Filter** (biasanya berupa ikon X atau teks "Hapus Filter") untuk kembali menampilkan semua data.

---

*Panduan ini disiapkan untuk penggunaan internal RH Studio Arsitek.*
*Jika ada pertanyaan atau kendala, hubungi administrator sistem.*
