# Security Guide — RH-ERP

> Terakhir diaudit: 2026-04-28
> Setiap fitur baru wajib cek checklist di bawah sebelum merge.

---

## Status Temuan Audit

Legend: 🔴 Open · 🟡 In Progress · ✅ Fixed

### HIGH

| ID | Isu | File | Status |
|---|---|---|---|
| H1 | Client-side only authorization — backend rules belum dikonfigurasi | `AuthContext.tsx`, PocketBase collections | ✅ |
| H2 | Nomor rekening bank hardcoded di source code | `QuotationEditor.tsx:62`, `useInvoices.ts:74` | ✅ |
| H3 | Filter query injection — user input langsung di-concat ke PocketBase filter | `useInvoices.ts:38-48`, `useQuotations.ts:33-34` | 🔴 |
| H4 | Public verification page expose data klien tanpa token | `PublicVerificationPage.tsx` | 🔴 |
| H5 | Restricted user bisa bypass field `disabled` via DevTools | `QuotationEditor.tsx:261,292` | 🔴 |

### MEDIUM

| ID | Isu | File | Status |
|---|---|---|---|
| M1 | Session timeout timestamp disimpan di localStorage — bisa dimanipulasi | `useSessionTimeout.ts` | 🔴 |
| M2 | Auth token PocketBase tersimpan di localStorage (rentan XSS) | `pocketbase.ts` | 🔴 |
| M3 | Invoice & quotation number predictable — rentan enumeration | `useInvoices.ts:61`, `useQuotations.ts:58` | 🔴 |
| M4 | Raw PocketBase error dikirim ke user — expose schema backend | `useUserFormMutation.ts:74` | 🔴 |
| M5 | `console.error` aktif di production — expose stack trace | `Login.tsx`, `SecurityForm.tsx`, `PublicVerificationPage.tsx` | 🔴 |
| M6 | Tidak ada rate limiting di login endpoint | `Login.tsx`, PocketBase config | 🔴 |
| M7 | Tidak ada Content Security Policy (CSP) headers | `vite.config.ts`, web server | 🔴 |

### LOW

| ID | Isu | File | Status |
|---|---|---|---|
| L1 | `user: any` di AuthContext — lemah type safety | `AuthContext.tsx:14` | 🔴 |
| L2 | Nomor telepon klien visible di browser history saat WhatsApp share | `useWhatsAppShare.ts` | 🔴 |
| L3 | Tidak ada jadwal `npm audit` reguler | `package.json`, CI | 🔴 |
| L4 | CSRF protection belum diverifikasi di PocketBase config | PocketBase config | 🔴 |

---

## Detail Temuan & Cara Fix

### H1 — Backend Authorization (PALING KRITIS)

**Masalah:** `can()` dan `PermissionGuard` hanya block UI. Attacker dengan token valid bisa langsung kirim request ke PocketBase API dan bypass semua permission check.

```bash
# Contoh attack: user biasa akses semua invoice
curl https://pb-rh.elvanrff.com/api/collections/invoices/records \
  -H "Authorization: <token_user_biasa>"
```

**Fix:** Konfigurasi Collection Rules di PocketBase dashboard untuk setiap collection:

```
# Collection: invoices
List/View Rule:   @request.auth.id != "" && (@request.auth.isSuperAdmin = true || @request.auth.id = assignee)
Create Rule:      @request.auth.id != ""
Update Rule:      @request.auth.isSuperAdmin = true
Delete Rule:      @request.auth.isSuperAdmin = true

# Collection: users
List/View Rule:   @request.auth.isSuperAdmin = true
Update Rule:      @request.auth.id = id || @request.auth.isSuperAdmin = true
```

Frontend guard tetap dipakai untuk UX, bukan security.

**Status (2026-04-28):** Level 1 selesai — semua collection dikonfigurasi di PocketBase. Rules yang diterapkan:
- `clients`, `projects`, `prospects`, `vendors`: List/View/Create/Update = `@request.auth.id != ""`, Delete = `@request.auth.isSuperAdmin = true`
- `roles`: List/View = `@request.auth.id != ""`, Create/Update/Delete = `@request.auth.isSuperAdmin = true`
- `users`: List = `@request.auth.id != ""`, View/Update = `@request.auth.id = id || @request.auth.isSuperAdmin = true`, Create/Delete = `@request.auth.isSuperAdmin = true`
- `invoices`, `quotations`: List/Create/Update = `@request.auth.id != ""`, View = kosong (dibutuhkan public verification), Delete = `@request.auth.isSuperAdmin = true`

Level 2 (full permission parity) dan H4 (public verification token) belum dikerjakan.

---

### H2 — Hardcoded Bank Details

**Masalah:** Nomor rekening hardcoded di dua tempat:

```tsx
// useInvoices.ts:74
bank_details: 'BNI - 0717571663\nIsmail Deyrian Anugrah'

// QuotationEditor.tsx:62
useState('Name : Ismail Deyrian Anugrah\nAccount Number : BNI 0717571663')
```

**Fix:** Nomor rekening dipindah ke environment variable `VITE_BANK_ACCOUNT_NUMBER`. Nama bank dan nama pemilik tetap hardcoded karena bukan data sensitif.

```tsx
// useInvoices.ts
bank_details: `BNI - ${import.meta.env.VITE_BANK_ACCOUNT_NUMBER}\nIsmail Deyrian Anugrah`

// QuotationEditor.tsx
useState(`Name : Ismail Deyrian Anugrah\nAccount Number : BNI ${import.meta.env.VITE_BANK_ACCOUNT_NUMBER}`)
```

Set `VITE_BANK_ACCOUNT_NUMBER` di environment variables server (Coolify). Jangan commit ke `.env.local`.

---

### H3 — Filter Query Injection

**Masalah:** String concatenation langsung dari user input:

```tsx
// BERBAHAYA
filterParts.push(`(title ~ "${filters.debouncedSearch}")`)

// Input attacker: " || 1=1 || title ~ "
// Hasil: (title ~ "" || 1=1 || title ~ "")  → return semua records
```

**Fix:** Escape karakter khusus sebelum inject ke filter:

```tsx
function escapePbFilter(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

// Penggunaan
filterParts.push(`(title ~ "${escapePbFilter(filters.debouncedSearch)}")`)
```

Atau gunakan PocketBase filter builder jika tersedia.

---

### H4 — Public Verification Tanpa Token

**Masalah:** URL `/verify/invoices/{id}` publik, ID bisa di-enumerate, data klien ter-expose.

**Fix:** Generate signed token saat buat dokumen:

```tsx
// Backend: simpan verification_token = crypto.randomUUID() di setiap record
// URL: /verify/invoices/{id}?token={verification_token}

// PublicVerificationPage.tsx — validate token
const { id, token } = useParams()
const doc = await pb.collection(docType).getOne(id, {
  filter: `verification_token = "${token}"`,  // Harus cocok
})

// Return hanya field yang diperlukan publik, exclude data sensitif klien
```

---

### H5 — Restricted User Field Bypass

**Masalah:** `disabled={isRestricted}` hanya block UI, bukan validasi server.

**Fix:** Tambahkan guard di mutation handler dan verifikasi di backend:

```tsx
// Sebelum submit di QuotationEditor
const handleSave = async (data: QuotationFormValues) => {
  if (isRestricted) {
    // Strip financial fields sebelum kirim
    const { area, price, bank_details, ...safeData } = data
    await save(safeData)
  } else {
    await save(data)
  }
}
```

Backend PocketBase collection rule untuk quotations juga harus block update field finansial dari non-full-access user.

---

### M1 — Session Timeout di localStorage

**Masalah:** User bisa set `lastActivity` ke masa depan:

```js
localStorage.setItem('rh_last_activity', String(Date.now() + 999999999))
```

**Fix Jangka Pendek:** Tambahkan server timestamp validation:

```tsx
// useSessionTimeout.ts — bandingkan dengan server time, bukan hanya localStorage
const validateSession = async () => {
  const token = pb.authStore.token
  if (!token) return logout()
  
  // Refresh auth — PocketBase akan reject jika token expired di server
  try {
    await pb.collection('users').authRefresh()
  } catch {
    logout()
  }
}
```

**Fix Jangka Panjang:** Rely sepenuhnya pada PocketBase token expiry (konfigurasikan di PocketBase settings).

---

### M3 — Predictable Document Numbers

**Masalah:** `INV-${prefix}-${Date.now().toString().slice(-6)}` — 6 digit timestamp mudah di-brute force.

**Fix:** Tambahkan random suffix:

```tsx
function generateDocNumber(prefix: string): string {
  const date = new Date().toISOString().slice(0, 7).replace('-', '')
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${prefix}-${date}-${random}`
}
// Hasil: INV-202604-K7M2X
```

---

### M4 — Error Message Sanitization

**Masalah:**

```tsx
errorMsg = `${firstKey}: ${pbErr.data.data[firstKey].message}`
// Contoh output ke user: "email: The email is invalid or already in use"
```

**Fix:**

```tsx
const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  username: 'Username',
  password: 'Password',
}

const fieldLabel = FIELD_LABELS[firstKey] ?? 'Field'
errorMsg = `${fieldLabel} tidak valid. Silakan periksa kembali.`
```

---

### M5 — Console Logs di Production

**Fix:** Gunakan wrapper yang strip di production:

```tsx
// lib/logger.ts
const isDev = import.meta.env.DEV

export const logger = {
  error: isDev ? console.error : () => {},
  warn:  isDev ? console.warn  : () => {},
  log:   isDev ? console.log   : () => {},
}

// Penggunaan — ganti semua console.error dengan:
import { logger } from '@/lib/logger'
logger.error('Failed to generate document image:', err)
```

---

### M7 — Content Security Policy

**Fix:** Tambahkan di Nginx/Caddy config untuk production:

```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://pb-rh.elvanrff.com;
  connect-src 'self' https://pb-rh.elvanrff.com;
  frame-ancestors 'none';
" always;

add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## Security Checklist — Sebelum Merge Fitur Baru

Wajib di-check untuk setiap PR yang menyentuh auth, data, atau form:

### Auth & Permission
- [ ] Komponen baru yang tampilkan data sensitif sudah pakai `PermissionGuard` atau `SuperAdminGuard`
- [ ] Mutation baru tidak mengirim data lebih dari yang dibutuhkan
- [ ] Tidak ada `pb.collection().getFullList()` tanpa filter yang proper

### Input & Query
- [ ] User input yang masuk ke PocketBase filter di-escape via `escapePbFilter()`
- [ ] Form validation pakai Zod schema di `lib/validations/`
- [ ] Tidak ada string concatenation langsung dari user input ke query/filter

### Data Exposure
- [ ] Tidak ada data sensitif (token, password, nomor rekening) di `console.log/error`
- [ ] Error yang ditampilkan ke user menggunakan pesan generik
- [ ] Field yang expand di query hanya yang benar-benar dibutuhkan UI

### Kode Baru
- [ ] Tidak ada hardcoded credentials, nomor rekening, atau data sensitif
- [ ] Gunakan `logger.*` bukan `console.*`
- [ ] Environment variable diakses via `import.meta.env.VITE_*`, tidak di-hardcode

---

## Hal yang Sudah Aman (Jangan Diubah)

- Protected routes menggunakan `ProtectedRoute` wrapper — sudah benar
- `.env.local` sudah ada di `.gitignore`
- Tidak ada `dangerouslySetInnerHTML` di seluruh codebase
- Password field menggunakan `type="password"`
- Logout sudah clear PocketBase authStore via `pb.authStore.clear()`
- Zod validation di semua form sudah ada

---

## Referensi

- [PocketBase Collection Rules](https://pocketbase.io/docs/manage-collections/#rules-filters-syntax)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PocketBase Security](https://pocketbase.io/docs/security/)
