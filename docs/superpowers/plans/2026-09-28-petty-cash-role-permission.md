# Petty Cash Role Permission Implementation Record

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one full-access `access_petty_cash` role permission and enforce it in Petty Cash navigation and routes.

**Architecture:** Extend the existing Role Management permission list with the Petty Cash permission. Reuse the existing `Guard` in the sidebar and `PermissionGuard` for both Petty Cash routes; the AuthContext already grants permissions to superadmins.

**Tech Stack:** React 19, TypeScript, React Router, existing auth/permission components, Vite.

---

### Task 1: Add Petty Cash permission to role configuration

**Files:**
- Modify: `frontend/src/pages/settings/roleManagement/roleForm.tsx`

- [x] Add a `Petty Cash` group to `PERMISSION_GROUPS` with `{ id: 'access_petty_cash', label: 'Access Petty Cash' }`.
- [x] Confirm the permission renders through the existing generic checkbox loop and is submitted in the `permissions` array.

### Task 2: Enforce permission in navigation and routes

**Files:**
- Modify: `frontend/src/components/layout/Sidebar/SidebarNav.tsx`
- Modify: `frontend/src/App.tsx`

- [x] Wrap the Petty Cash `NavItem` in `<Guard require="access_petty_cash">`.
- [x] Put both `petty-cash` and `petty-cash/:id` routes under a shared `<Route element={<PermissionGuard require="access_petty_cash" />}>`.
- [x] Keep route paths, page components, icons, and labels unchanged.

### Task 3: Verify implementation

**Files:**
- Verify: `frontend/src/pages/settings/roleManagement/roleForm.tsx`
- Verify: `frontend/src/components/layout/Sidebar/SidebarNav.tsx`
- Verify: `frontend/src/App.tsx`

- [x] Run `npm run build` from `frontend`.
- [x] Inspect the diff and verify the same permission ID is used by the form, sidebar, and both guarded routes.

Implementation verified on 2026-09-28. The permission is enforced in frontend navigation/routes; PocketBase collection API authorization remains a separate server-side configuration concern.
