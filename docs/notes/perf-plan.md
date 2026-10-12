# Rencana: Perbaikan Performa Load RH-ERP

## Root cause (terbukti)
- TIDAK ADA code-splitting → semua 22 halaman + library berat (recharts, jspdf, fullcalendar, dnd, framer-motion) dalam 1 bundle.
- Baseline: `index.js` = 2,379.75 kB (gzip 714 kB).
- `vite.config.ts` tidak punya manualChunks.
- nginx production TIDAK punya gzip/brotli → 2.3MB dikirim mentah.

## Todo
- [x] 1. Ubah App.tsx: 22 import statis → React.lazy + Suspense
- [x] 2. Tambah manualChunks di vite.config.ts (vendor split)
- [x] 3. Tambah gzip di nginx.conf (+ no-cache index.html)
- [x] 4. Build ulang, ukur before/after
- [x] 5. Verifikasi: tsc lulus, test 10/10 lulus, build sukses

## Hasil terukur
| | Sebelum | Sesudah |
|---|---|---|
| Entry JS | index 2,379 kB (gzip 714 kB) | index 445 kB (gzip 136 kB) |
| Chart (348 kB) | di dalam bundle awal | chunk terpisah, on-demand |
| PDF jsPDF (386 kB) | di dalam bundle awal | dynamic import, hanya saat klik export |
| html2canvas (201 kB) | di dalam bundle awal | on-demand |
| nginx gzip | TIDAK ada | aktif |

Entry turun ~81% (714 kB → 136 kB gzip).

## Sisa (opsional, belum dikerjakan)
- framer-motion (118 kB) ikut preload karena dipakai di AuthContext (splash).
- vendor-charts (348 kB) di-preload karena Dashboard reachable dari `/`.
- Analytics pihak ketiga di index.html.

