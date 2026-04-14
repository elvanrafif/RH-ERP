# ADR-002: RBAC menggunakan custom roles collection di PocketBase

**Tanggal:** 2026-04-13
**Status:** Aktif

---

## Konteks

Aplikasi membutuhkan kontrol akses berbasis peran (RBAC) untuk membedakan hak akses antara:
- Superadmin
- Management
- Arsitektur, Sipil, Interior (divisi proyek)
- Socmed

Ada dua opsi pendekatan:

**A — Hardcode roles di frontend**
Enum role di kode (`ADMIN`, `STAFF`, dsb.), logika akses berupa `if (role === 'admin')`.

**B — Dynamic roles via PocketBase collection**
Buat collection `roles` di PocketBase dengan field `permissions: JSON`. Role dan permission bisa diubah dari UI tanpa deploy ulang.

---

## Keputusan

Pilih **Pendekatan B** — dynamic roles via collection `roles` di PocketBase.

---

## Alasan

1. **Fleksibel tanpa deploy.** Permission baru bisa ditambah dari halaman Role Management di UI, tanpa mengubah kode frontend.

2. **Granular per fitur.** Setiap fitur punya permission string sendiri (contoh: `view_index_project_architecture`, `manage_quotations_restricted`). Ini memungkinkan kombinasi akses yang sangat spesifik per role.

3. **Superadmin tetap special case.** PocketBase punya flag `isSuperAdmin` bawaan yang dipakai untuk akses penuh tanpa cek permission — tidak perlu role khusus.

---

## Implementasi

- Collection `roles` di PocketBase dengan field `name` (string) dan `permissions` (JSON array of strings).
- `AuthContext` fetch user → expand `roleId` → ekstrak array `permissions`.
- Hook `useAuth()` expose fungsi `can(permission: string)` untuk cek permission di mana saja.
- Komponen `PermissionGuard` dan `SuperAdminGuard` untuk proteksi di level route.
- Permission string didefinisikan secara konsisten, contoh: `view_index_project_*`, `manage_*`, `view_revenue`.

---

## Konsekuensi

- Menambah fitur baru = tambah permission string baru di `roleForm.tsx` (checklist) + pakai `can()` di komponen.
- Tidak ada single source of truth untuk daftar permission selain kode — perlu dijaga konsistensinya.
- Role harus di-assign ulang kalau ada permission baru yang ingin diberikan ke role lama.
