# Branching Strategy — RH-ERP

> Terakhir diperbarui: 2026-05-07

---

## Struktur Branch

```
main          ← production (deploy otomatis ke Coolify)
  └── staging ← integrasi sebelum ke production
        └── feat/*, fix/*, refactor/* ← branch development
```

### `main`
- Branch produksi. Selalu dalam keadaan **deployable**.
- Deploy otomatis ke server via Coolify ketika ada push.
- Tidak boleh push langsung — harus lewat merge dari `staging`.

### `staging`
- Branch integrasi. Tempat fitur dikumpulkan sebelum naik ke `main`.
- Semua fitur baru dikerjakan dari `staging`, bukan dari `main`.
- Biasanya sudah merepresentasikan state terbaru yang siap QA.

### Feature / Fix / Refactor Branches
Dibuat dari `staging`, di-merge kembali ke `staging` setelah selesai.

| Prefix | Kapan |
|---|---|
| `feat/` | Fitur baru |
| `fix/` | Bug fix |
| `refactor/` | Refactor tanpa perubahan perilaku |
| `improvement/` | Peningkatan minor (UX, performa) |

---

## Alur Kerja

### Mengerjakan Fitur Baru

```bash
# 1. Pastikan staging up to date
git checkout staging
git pull

# 2. Buat branch dari staging
git checkout -b feat/nama-fitur

# 3. Kerjakan, commit
git commit -m "feat(area): deskripsi singkat"

# 4. Merge kembali ke staging
git checkout staging
git merge feat/nama-fitur

# 5. Push staging
git push

# 6. Hapus branch lokal (opsional)
git branch -d feat/nama-fitur
```

### Naik ke Production

```bash
# Setelah QA di staging selesai
git checkout main
git merge staging
git push
# → Coolify auto-deploy
```

---

## Konvensi Commit Message

Format: `type(scope): deskripsi singkat`

| Type | Kapan |
|---|---|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `refactor` | Perubahan kode tanpa perubahan perilaku |
| `docs` | Update dokumentasi saja |
| `style` | Perubahan styling / UI tanpa logika baru |
| `chore` | Maintenance (update deps, config) |

**Scope** — nama modul atau area: `invoice`, `quotation`, `dashboard`, `auth`, dsb.

Contoh:
```
feat(invoice): add active termin filter to table
fix(auth): handle expired token on refresh
refactor(client-combobox): replace getFullList with server-side search
docs(modules): update invoice status
```

---

## Branch Utama

| Branch | Keterangan |
|---|---|
| `main` | Production |
| `staging` | Integrasi aktif |

> Branch `feat/*`, `fix/*`, `refactor/*` bersifat sementara — hapus setelah di-merge ke `staging`.

---

## Environment URLs

### Production (`main`)
| Service | URL |
|---|---|
| Frontend | https://dashboard.rhstudioarsitek.my.id |
| PocketBase | https://pb.rhstudioarsitek.my.id |

### Staging (`staging`)
| Service | URL |
|---|---|
| Frontend | https://dashboard-staging.rhstudioarsitek.my.id |
| PocketBase | https://pb-staging.rhstudioarsitek.my.id |

---

## Hal yang Perlu Diperhatikan

- **Jangan rebase branch yang sudah di-push** ke remote — gunakan merge.
- **Jangan force push ke `main` atau `staging`** — risiko hilang history.
- Setiap fitur yang menyentuh data sensitif (auth, payment, permission) wajib review `docs/security.md` sebelum merge.
- Setelah merge fitur baru, update `docs/modules.md` jika ada status modul yang berubah.
