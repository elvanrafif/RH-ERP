# Petty Cash Role Permission Design

## Goal

Add a role permission that controls access to the Petty Cash module, following
the existing permission-based role management pattern.

## Design

- Add one permission with ID `access_petty_cash` and label `Access Petty Cash`
  to the Role Management permission groups.
- Gate the Petty Cash navigation item with that permission.
- Gate both `/petty-cash` and `/petty-cash/:id` routes using the existing
  `PermissionGuard`.
- Keep this as a single full-access permission; no separate read/manage split.
- Superadmins continue to have access through the existing `can()` behavior.

## Verification

- Run the frontend TypeScript/build check.
- Review route and navigation wiring to confirm both Petty Cash paths and the
  sidebar entry use `access_petty_cash`.
