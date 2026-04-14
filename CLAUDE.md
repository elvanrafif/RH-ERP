# CLAUDE.md — RH-ERP Codebase Guide

> Panduan ini wajib dibaca sebelum membuat atau memodifikasi kode.
> Terakhir diperbarui: 2026-04-14

---

## Ringkasan Proyek

**Stack:** React 19 + TypeScript + Vite | PocketBase | TanStack Query | Radix UI + Tailwind CSS 4 | React Hook Form + Zod | Recharts

**Entry point:** `frontend/src/main.tsx`
**Auth:** `frontend/src/contexts/AuthContext.tsx` — RBAC penuh via `useAuth()`
**DB Client:** `frontend/src/lib/pocketbase.ts`
**Types:** `frontend/src/types.ts`

---

## Panduan Lengkap

@docs/claude/architecture.md
@docs/claude/rbac.md
@docs/claude/solid.md
@docs/claude/conventions.md
