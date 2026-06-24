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

Permission dikelompokkan sesuai `PERMISSION_GROUPS` di `roleForm.tsx`.

### Dashboard & Finance
| Permission | Akses |
|---|---|
| `view_dashboard` | Akses halaman dashboard (defined in roleForm, belum dipakai sebagai guard UI) |
| `view_revenue` | Lihat data revenue di dashboard & reports; gates sidebar Reports + Invoices |

### Projects
| Permission | Akses |
|---|---|
| `view_index_project_architecture` | Halaman daftar proyek arsitektur (sidebar + route guard) |
| `view_detail_project_architecture` | Lihat detail modal proyek arsitektur (defined, belum dipakai sebagai guard UI) |
| `manage_architecture` | Gates tombol Create/Edit di halaman arsitektur |
| `view_index_project_civil` | Halaman daftar proyek sipil (sidebar + route guard) |
| `view_detail_project_civil` | Lihat detail modal proyek sipil (defined, belum dipakai sebagai guard UI) |
| `manage_civil` | Gates tombol Create/Edit di halaman sipil |
| `view_index_project_interior` | Halaman daftar proyek interior (sidebar + route guard) |
| `view_detail_project_interior` | Lihat detail modal proyek interior (defined, belum dipakai sebagai guard UI) |
| `manage_interior` | Gates tombol Create/Edit di halaman interior |

### Clients & Prospects
| Permission | Akses |
|---|---|
| `manage_clients` | Edit & buat client |
| `manage_prospects` | Kelola data prospek (sidebar + CRUD) |

### Survey
| Permission | Akses |
|---|---|
| `view_surveys` | Lihat halaman & daftar survey (read-only) |
| `manage_surveys` | Buat, edit & hapus survey (include view) |

### Quotations
| Permission | Akses |
|---|---|
| `manage_quotations` | Buat & edit quotation penuh |
| `manage_quotations_restricted` | Buat quotation tapi field finansial disembunyikan |

### Settings
| Permission | Akses |
|---|---|
| `manage_users` | Gates route Settings > User Management dan Role Management; sidebar item |

> Superadmin (`isSuperAdmin: true`) selalu punya akses ke semua fitur tanpa permission.

## Menambah Permission Baru

1. Tambah string permission di checklist `pages/settings/roleManagement/roleForm.tsx`
2. Pakai `can('nama_permission')` atau `<PermissionGuard require="nama_permission" />` di komponen
3. Update tabel di atas
