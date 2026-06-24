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
│   ├── editors/               # DocumentEditorLayout — shared layout untuk quotation & invoice editor; props: onDelete? + isDeleting? untuk tombol delete superadmin (desktop: icon di header kiri, mobile: tombol di action row)
│   ├── dialogs/               # CreateDocumentDialog
│   ├── filters/               # DocumentToolbar
│   ├── forms/                 # ClientCombobox (standalone), ClientComboboxField (RHF wrapper),
│   │                          # AdditionalLinksField, ClientPicMultiSelectField,
│   │                          # PhoneInputField, UserComboboxField
│   ├── projects/              # ArchitectureFilterBar, CivilFilterBar, InteriorFilterBar
│   │                          # (type-specific filter bars — tidak ada shared ProjectFilterBar)
│   ├── shared/                # EmptyState, FormDialog, LoadingSpinner, PageHeader,
│   │                          # StatCard, ProjectStatCard, TablePagination, DeleteConfirmDialog,
│   │                          # NumberInput, RowActions, TableSkeleton, ChartSkeleton,
│   │                          # FormSubmitButton, MonthYearPicker,
│   │                          # ClientName, SortPopover
│   └── dashboard/             # ExecutiveDashboard (superadmin — tabs: Overview, Resource Monitoring),
│                              # MyProjectsDashboard (employee — tabs: Calendar, My Projects),
│                              # CivilTeamDashboard (civil division — Gantt chart per vendor),
│                              # CivilGanttChart, CivilGanttBar, CivilVendorSection,
│                              # DashboardCalendar (responsive: mobile→listMonth+bottom sheet,
│                              #   desktop→dayGrid+floating popover), DashboardCalendarPopover
│       └── tabs/              # OverviewTab (stat cards + DashboardCalendar + top lists),
│                              # ResourceMonitoringTab (WorkloadChart),
│                              # ClientTrackingTab (dipakai di ClientTrackingPage standalone),
│                              # SemesterCard, WorkloadChart, RevenuePieChart,
│                              # InvoiceRevenue, QuotationRevenue,
│                              # TopInvoicesList, TopQuotationsList
├── hooks/                     # Custom hooks — satu hook satu tanggung jawab
├── lib/
│   ├── helpers.ts             # formatRupiah, formatDate, formatDateShort, formatDateLong, formatDateLongEn, formatDateTime,
│   │                          # formatTimeUntil (→ TimeUntilResult), formatClientName, getSalutationLabel,
│   │                          # buildInvoiceFileName, buildQuotationFileName, getRemainingTime, calculateDuration,
│   │                          # getInitials, getAvatarUrl, escapePbFilter, formatPhoneNumber
│   ├── constant.ts            # Semua konstanta global
│   ├── booleans.ts            # Boolean utility helpers
│   ├── masking.ts             # Display label helpers: MaskingTextByDivision, MaskingTextByInvoiceType, MaskingTextByArchitectureStatus
│   ├── validations/           # Zod schemas: client, user, project, role, vendor, prospect, survey
│   ├── invoicing/             # dateFilter, termCalculation, revenueStats, quotationStats
│   ├── projects/              # statistics, permissions, deadline, status
│   └── formatting/            # currency
└── pages/                     # Halaman — hanya render, tidak ada business logic
    ├── clients/               # ClientsPage, ClientTable, ClientForm, ClientDetailDialog
    ├── vendors/               # VendorsPage, VendorTable, VendorForm, VendorDetailDialog
    ├── prospects/             # ProspectsPage, ProspectTable, ProspectForm,
    │                          # ProspectDetailDialog, ProspectContactFields,
    │                          # ProspectPropertyFields, ProspectScheduleFields
    ├── projects/              # ArsitekturPage, SipilPage, InteriorPage
    │   │                      # formHelpers.ts — normalizeAdditionalLinks, buildAdditionalLinksPayload
    │   ├── components/        # Shared across all 3 project types:
    │   │                      # ProjectClientCard, ProjectPicTimelineCard, ProjectSpecsCard,
    │   │                      # ProjectModalHero, ProjectHoldBanner, ProjectStatsSection,
    │   │                      # ProjectNotesField, ProjectStatusSelectField,
    │   │                      # ProjectDeadlineField, ProjectVendorSelectField,
    │   │                      # ProjectPicSelectField, LinkedInvoiceSelectField, AreaFields,
    │   │                      # KanbanNotesSection, KanbanCardFooter
    │   ├── projectArchitecture/ # ProjectArchitectureForm, ProjectArchitectureDetailsModal,
    │   │   │                    # ProjectArchitectureKanban, ArchKanbanCard,
    │   │   │                    # ArchitectureHiddenTableView, columns.tsx,
    │   │   │                    # architectureFormHelpers.ts
    │   │   └── hooks/           # useProjectArchitectureByClient
    │   ├── projectCivil/      # ProjectCivilForm, ProjectCivilDetailsModal,
    │   │   │                  # ProjectCivilTable, columnsSipil.tsx, civilFormHelpers.ts
    │   │   └── components/    # CivilContractDatesField, SourceArchitectureSelectField,
    │   │                      # ContractInfoCell, ProjectConversionBadge
    │   └── projectInterior/   # ProjectInteriorForm, ProjectInteriorDetailsModal,
    │       │                  # ProjectInteriorKanban, InteriorKanbanCard,
    │       │                  # columns.tsx, interiorFormHelpers.ts
    │       └── hooks/         # (reserved)
    ├── buildConversion/       # BuildConversionPage (superadmin only)
    ├── quotations/            # QuotationsPage, QuotationEditor, QuotationPaper,
    │                          # QuotationTable, QuotationCreateDialog, QuotationToolbar,
    │                          # quotationSortOptions
    ├── clientTracking/        # ClientTrackingPage — proyek per client dikelompokkan S1/S2
    ├── invoices/              # InvoicesPage, InvoiceDetailPage, InvoicePaper,
    │                          # InvoiceTable, InvoiceCreateDialog, InvoiceToolbar,
    │                          # InvoiceEditorSettings, PaymentTermsEditor, invoiceSortOptions
    ├── reports/               # ReportsPage
    │   └── components/        # RevenueStatCards, RevenueBarChart, RevenueDetailTable,
    │                          # ReportExportButton
    ├── settings/
    │   ├── users/             # UserManagement
    │   │   └── components/    # UserForm, UserList, PasswordSection
    │   ├── profile/           # ProfilePage
    │   │   └── components/    # ProfileAvatar, ProfileEditForm, SecurityForm
    │   └── roleManagement/    # roleManagement, roleForm
    ├── survey/                # SurveyPage, SurveyTable, SurveyForm, SurveyDetailDialog
    ├── verification/          # PublicVerificationPage
    └── Dashboard.tsx
```

## Custom Hooks

Satu hook = satu tanggung jawab. Return object (bukan array) kecuali state sederhana.

| Hook | Tanggung Jawab |
|---|---|
| `useInvoices` | Fetch & mutate invoices |
| `useQuotations` | Fetch & mutate quotations |
| `useSurveys` | Fetch surveys dengan filter searchTerm (by client name), filterPic (surveyor ID), filterStatus (`all`\|`pending`\|`done`), expand `client,surveyor` |
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
| `useRevenueReport` | Fetch semua invoices + quotations (expand `client_id`), jalankan `buildRevenueReportData` — return `{ reportData, isLoading }` untuk halaman `/reports` |
| `useReportFilters` | Filter state halaman `/reports` (granularity, year, month, quarter, projectType) di-sync ke URL params via `useSearchParams` |
| `useWorkloadData` | Data workload per PIC |
| `useDashboard` | Agregasi data dashboard |
| `useDeadlineProjects` | Proyek yang mendekati deadline |
| `useAutoOpenProject` | Auto-open project detail dari URL param |
| `useProjectPageState` | Modal/edit state shared untuk semua 3 project index pages: `isDialogOpen`, `editingProject`, `deleteId`, `viewingProject`, handlers `handleCreate/Edit/Delete/CloseViewModal`, internally calls `useAutoOpenProject` |
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
| `useDashboardCalendarEvents` | Agregasi deadline project (arch/civil/interior), jadwal survey, dan `meeting_schedule` prospect ke format `CalendarEvent[]` untuk FullCalendar — filter `DONE_STATUSES`, extract date/time lokal |
| `useMyProjects` | Fetch active projects assigned to current user (excludes done/finish/cancelled), compute nearDeadlineCount per type threshold + inProgressCount |
| `useCivilTeamProjects` | Fetch semua civil project aktif, group by vendor, compute hasOverdue/hasNearDeadline per vendor group + aggregated counts — data source untuk CivilTeamDashboard |
| `usePagination` | Client-side pagination generic: slice `data` array by page, reset ke page 1 otomatis saat `resetDeps` berubah |
| `useClientSearch` | Server-side search client dengan debounce 300ms — aktif hanya jika query ≥ 2 karakter, return `{ clients, isSearching }` |
| `useInvoiceEditor` | Fetch + mutate single invoice by ID — dipakai di `InvoiceDetailPage`; return `{ invoice, isLoading, updateInvoice, isPending }` |
| `useQuotationEditor` | Fetch + mutate single quotation by ID — dipakai di `QuotationEditor`; return `{ quotation, isLoading, updateQuotation, isPending }` |
| `useInvoiceRevenue` | Fetch invoices dengan filter date range, jalankan `buildInvoiceRevenueData` — dipakai di halaman `/reports` tab Invoice |
| `useQuotationRevenue` | Fetch quotations dengan filter date range, jalankan `buildQuotationRevenueData` — dipakai di halaman `/reports` tab Quotation |
| `useMyCalendarEvents` | Agregasi deadline project + prospect + survey ke `CalendarEvent[]` difilter by current user — dipakai di `MyProjectsDashboard` Calendar tab (bukan Executive dashboard) |
| `useProjectHold` | Mutation hold/resume project — update field `is_on_hold`; options: `onHoldSuccess`, `onResumeSuccess` |
| `useProjectInvoiceStats` | Fetch invoice stats per project type (architecture/civil/interior) — dipakai di dashboard stats cards |
| `useSort` | Generic client-side sort: state `sortValue` + compute `sortedData` via `compareFn`; lihat `docs/claude/sort.md` untuk detail |

## Validasi Schema

Semua Zod schema di `lib/validations/`. Schema yang tersedia: `client.ts`, `user.ts`, `project.ts`, `role.ts`, `vendor.ts`, `prospect.ts`, `survey.ts`
