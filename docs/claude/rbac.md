# RBAC & Auth

## Struktur

- `AuthContext` di `frontend/src/contexts/AuthContext.tsx`
- Expose: `can(permission)`, `isSuperAdmin`, `user`, `permissions`
- `useAuth()` — hook utama, gunakan ini di semua komponen yang butuh cek akses
- Superadmin selalu lolos semua `can()` tanpa cek permission

## Route Guards

```typescript
// Proteksi route — user harus login
<ProtectedRoute>...</ProtectedRoute>

// Redirect ke dashboard jika sudah login
<PublicRoute>...</PublicRoute>

// Proteksi dengan satu permission (AND)
<PermissionGuard require="manage_clients" />

// Proteksi dengan salah satu permission (OR)
<PermissionGuard requireAny={['manage_quotations', 'manage_quotations_restricted']} />

// Proteksi khusus superadmin
<SuperAdminGuard />
```

## Daftar Permission

| Permission | Akses |
|---|---|
| `view_index_project_architecture` | Halaman proyek arsitektur |
| `view_index_project_civil` | Halaman proyek sipil |
| `view_index_project_interior` | Halaman proyek interior |
| `manage_clients` | Edit & buat client |
| `manage_prospects` | Kelola data prospek |
| `manage_quotations` | Buat & edit quotation penuh |
| `manage_quotations_restricted` | Buat quotation tapi field finansial disembunyikan |
| `view_revenue` | Lihat data revenue di dashboard & invoice |

> Superadmin (`isSuperAdmin: true`) selalu punya akses ke semua fitur tanpa permission.

## Menambah Permission Baru

1. Tambah string permission di checklist `pages/settings/roleManagement/roleForm.tsx`
2. Pakai `can('nama_permission')` atau `<PermissionGuard require="nama_permission" />` di komponen
3. Update tabel di atas
