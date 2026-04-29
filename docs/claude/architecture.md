# Arsitektur & Struktur File

## Struktur Direktori

```
frontend/src/
├── components/
│   ├── ui/                    # shadcn/ui — jangan diubah
│   │   ├── PermissionGuard    # Guard route berbasis permission (require / requireAny)
│   │   ├── SuperAdminGuard    # Guard khusus isSuperAdmin
│   │   └── guard.tsx          # Primitive guard wrapper
│   ├── auth/
│   │   └── route.tsx          # ProtectedRoute, PublicRoute, FallbackDecider
│   ├── layout/                # AppLayout, Sidebar, SplashScreen
│   │   └── Sidebar/           # SidebarNav, NavItem, DeadlineNotificationBell/Item/Popover
│   ├── editors/               # DocumentEditorLayout
│   ├── dialogs/               # CreateDocumentDialog
│   ├── filters/               # DocumentToolbar
│   ├── forms/                 # ClientComboboxField
│   ├── projects/              # ProjectFilterBar
│   ├── shared/                # EmptyState, FormDialog, LoadingSpinner, PageHeader,
│   │                          # StatCard, TablePagination, DeleteConfirmDialog,
│   │                          # NumberInput, RowActions, TableSkeleton, ChartSkeleton,
│   │                          # SearchInput, FormSubmitButton, EntityAvatar,
│   │                          # ActiveBadge, DetailField, CrudPageShell, MonthYearPicker
│   └── dashboard/             # ExecutiveDashboard (superadmin), MyProjectsDashboard (employee),
│                              # CivilTeamDashboard (civil role) — Gantt chart per vendor,
│                              # CivilGanttChart, CivilGanttBar, CivilVendorSection
│       └── tabs/              # OverviewTab, ResourceMonitoringTab, DocumentRevenueTab,
│                              # ClientTrackingTab, SemesterCard,
│                              # WorkloadChart, RevenuePieChart, InvoiceRevenue,
│                              # QuotationRevenue, TopInvoicesList, TopQuotationsList
├── hooks/                     # Custom hooks — satu hook satu tanggung jawab
├── lib/
│   ├── helpers.ts             # Format tanggal, rupiah, avatar, formatDateTime, formatDateLongEn, getRemainingTime
│   ├── constant.ts            # Semua konstanta global
│   ├── booleans.ts            # Boolean utility helpers
│   ├── masking.ts             # Display label helpers: MaskingTextByDivision, MaskingTextByInvoiceType, MaskingTextByArchitectureStatus
│   ├── validations/           # Zod schemas: client, user, project, role, vendor, prospect
│   ├── invoicing/             # dateFilter, termCalculation, revenueStats, quotationStats
│   ├── projects/              # statistics, permissions, deadline, status
│   └── formatting/            # currency
└── pages/                     # Halaman — hanya render, tidak ada business logic
    ├── clients/               # ClientsPage, ClientTable, ClientForm, ClientDetailDialog
    ├── vendors/               # VendorsPage, VendorTable, VendorForm, VendorDetailDialog
    ├── prospects/             # ProspectsPage, ProspectTable, ProspectForm,
    │                          # ProspectDetailDialog, ProspectContactFields,
    │                          # ProspectPropertyFields, ProspectScheduleFields
    ├── projects/              # ArsitekturPage, SipilPage, InteriorPage,
    │                          # ProjectPageTemplate, ProjectForm, ProjectTable,
    │                          # ProjectDetailsModal, ProjectKanban
    │   └── components/        # ProjectClientCard, ProjectPicTimelineCard,
    │                          # ProjectSpecsCard, ProjectConversionBadge,
    │                          # ProjectTypeFields, AdditionalLinksField
    ├── buildConversion/       # BuildConversionPage (superadmin only)
    ├── quotations/            # QuotationsPage, QuotationEditor, QuotationPaper,
    │                          # QuotationTable, QuotationCreateDialog, QuotationToolbar
    ├── invoices/              # InvoicesPage, InvoiceDetailPage, InvoicePaper,
    │                          # InvoiceTable, InvoiceCreateDialog, InvoiceToolbar,
    │                          # InvoiceEditorSettings, PaymentTermsEditor
    ├── settings/
    │   ├── users/             # UserManagement
    │   │   └── components/    # UserForm, UserList, PasswordSection
    │   ├── profile/           # ProfilePage
    │   │   └── components/    # ProfileAvatar, ProfileEditForm, SecurityForm
    │   └── roleManagement/    # roleManagement, roleForm
    ├── verification/          # PublicVerificationPage
    └── Dashboard.tsx
```

## Custom Hooks

Satu hook = satu tanggung jawab. Return object (bukan array) kecuali state sederhana.

| Hook | Tanggung Jawab |
|---|---|
| `useInvoices` | Fetch & mutate invoices |
| `useQuotations` | Fetch & mutate quotations |
| `useProjects` | Fetch & mutate projects |
| `useClients` | Fetch & mutate clients |
| `useVendors` | Fetch & mutate vendors |
| `useProspects` | Fetch prospects |
| `useProspectMutation` | Create/update/delete prospect |
| `useUsers` | Fetch users |
| `useUserManagement` | CRUD user + role assign |
| `useUserFormMutation` | Form mutation untuk user |
| `useRoles` | Fetch roles |
| `useRole` | Fetch single role |
| `useProfile` | Fetch & update profil sendiri |
| `useProjectFilters` | Filter state untuk project table |
| `useInvoiceFilters` | Filter state untuk invoice table |
| `useQuotationFilters` | Filter state untuk quotation table |
| `useDateRangeFilter` | Filter state range tanggal |
| `useInvoiceRevenue` | Kalkulasi revenue dari invoices |
| `useQuotationRevenue` | Kalkulasi revenue dari quotations |
| `useWorkloadData` | Data workload per PIC |
| `useDashboard` | Agregasi data dashboard |
| `useDeadlineProjects` | Proyek yang mendekati deadline |
| `useAutoOpenProject` | Auto-open project detail dari URL param |
| `useProjectCivilByClient` | Query civil projects by client ID |
| `useProjectArchitectureByClient` | Query architecture projects by client ID, dengan expand `client,assignee` |
| `useArchitectureToBuildConversion` | Cross-reference arsitektur vs civil via `source_architecture` field — return converted/potential/notConverted + stats, optional filter by PIC |
| `useDocumentScaling` | A4 ResizeObserver scaling |
| `useDocumentExport` | Export dokumen ke JPEG |
| `useWhatsAppShare` | Format nomor & buka link WhatsApp |
| `usePublicDocument` | Fetch dokumen untuk halaman verifikasi publik |
| `useUnsavedChanges` | Deteksi form dirty state |
| `useDebounce` | Debounce nilai input |
| `useSessionTimeout` | Auto logout setelah idle 1 jam |
| `useTableState` | Generic CRUD page state: open dialog, editing/viewing entity, search term |
| `useFormMutation` | Generic PocketBase create/update mutation dengan query invalidation dan toast error |
| `useClientTracking` | Fetch semua project, group ke S1/S2 per tahun berdasarkan date field per tipe (civil→end_date, architecture/interior→deadline) — return s1, s2, availableYears |
| `useMyProjects` | Fetch active projects assigned to current user (excludes done/finish/cancelled), compute nearDeadlineCount per type threshold + inProgressCount |
| `useCivilTeamProjects` | Fetch semua civil project aktif, group by vendor, compute hasOverdue/hasNearDeadline per vendor group + aggregated counts — data source untuk CivilTeamDashboard |
| `usePagination` | Client-side pagination generic: slice `data` array by page, reset ke page 1 otomatis saat `resetDeps` berubah |

## Validasi Schema

Semua Zod schema di `lib/validations/`. Schema yang tersedia: `client.ts`, `user.ts`, `project.ts`, `role.ts`, `vendor.ts`, `prospect.ts`
