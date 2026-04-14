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
│   │                          # NumberInput, RowActions, TableSkeleton, ChartSkeleton
│   └── dashboard/             # MainDashboard, Overview
│       └── tabs/              # OverviewTab, ResourceMonitoringTab, DocumentRevenueTab,
│                              # WorkloadChart, RevenuePieChart, InvoiceRevenue,
│                              # QuotationRevenue, TopInvoicesList, TopQuotationsList
├── hooks/                     # Custom hooks — satu hook satu tanggung jawab
├── lib/
│   ├── helpers.ts             # Format tanggal, rupiah, avatar, formatDateTime
│   ├── constant.ts            # Semua konstanta global
│   ├── booleans.ts            # Boolean utility helpers
│   ├── masking.ts             # Input masking helpers
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
    ├── quotations/            # QuotationsPage, QuotationEditor, QuotationPaper,
    │                          # QuotationTable, QuotationCreateDialog, QuotationToolbar
    ├── invoices/              # InvoicesPage, InvoiceDetailPage, InvoicePaper,
    │                          # InvoiceTable, InvoiceCreateDialog, InvoiceToolbar,
    │                          # InvoiceEditorSettings, PaymentTermsEditor
    ├── settings/              # UserManagement, ProfilePage, RoleManagement
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
| `useDocumentScaling` | A4 ResizeObserver scaling |
| `useDocumentExport` | Export dokumen ke JPEG |
| `useWhatsAppShare` | Format nomor & buka link WhatsApp |
| `usePublicDocument` | Fetch dokumen untuk halaman verifikasi publik |
| `useUnsavedChanges` | Deteksi form dirty state |
| `useDebounce` | Debounce nilai input |
| `useSessionTimeout` | Auto logout setelah idle 1 jam |

## Validasi Schema

Semua Zod schema di `lib/validations/`. Schema yang tersedia: `client.ts`, `user.ts`, `project.ts`, `role.ts`, `vendor.ts`, `prospect.ts`
