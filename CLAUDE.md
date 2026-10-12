# CLAUDE.md — RH-ERP Codebase Guide

> Panduan ini wajib dibaca sebelum membuat atau memodifikasi kode.
> Terakhir diperbarui: 2026-10-12

---

## Ringkasan Proyek

**Stack:** React 19 + TypeScript + Vite | PocketBase | TanStack Query | Radix UI + Tailwind CSS 4 | React Hook Form + Zod | Recharts

**Entry point:** `frontend/src/main.tsx`
**Auth:** `frontend/src/contexts/AuthContext.tsx` — RBAC penuh via `useAuth()`
**DB Client:** `frontend/src/lib/pocketbase.ts`
**Types:** `frontend/src/types.ts`

> **Performa:** halaman di-`App.tsx` di-lazy-load (`React.lazy` + `Suspense`); library berat (`jspdf`, `html-to-image`) di-dynamic import. Vendor chunk dipisah di `vite.config.ts`, nginx memakai gzip. Jangan kembalikan ke import statis. Detail: `docs/claude/architecture.md` → Routing & Code-Splitting.

---

## Panduan Lengkap

@docs/claude/architecture.md
@docs/claude/design-system.md
@docs/claude/rbac.md
@docs/claude/solid.md
@docs/claude/conventions.md
@docs/claude/branching.md
@docs/claude/sort.md
@docs/modules.md
@docs/decisions/
@docs/security.md
