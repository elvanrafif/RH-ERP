import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import AppLayout from '@/components/layout/AppLayout'
import Login from '@/pages/Login'

// Hooks
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { AuthProvider } from './contexts/AuthContext'
import { PermissionGuard } from './components/ui/PermissionGuard'
import { SuperAdminGuard } from './components/ui/SuperAdminGuard'
import {
  FallbackDecider,
  ProtectedRoute,
  PublicRoute,
} from './components/auth/route'

// Halaman di-lazy-load agar tidak semua ikut ke bundle awal.
const Dashboard = lazy(() => import('./pages/Dashboard'))

const ArsitekturPage = lazy(() => import('./pages/projects/projectArchitecture'))
const SipilPage = lazy(() => import('./pages/projects/projectCivil'))
const InteriorPage = lazy(() => import('./pages/projects/projectInterior'))

const ClientsPage = lazy(() => import('./pages/clients/ClientsPage'))
const QuotationsPage = lazy(() => import('./pages/quotations/QuotationsPage'))
const QuotationEditor = lazy(() => import('./pages/quotations/QuotationEditor'))

const UserManagementPage = lazy(
  () => import('./pages/settings/users/UserManagement'),
)
const ProfilePage = lazy(() => import('./pages/settings/profile/ProfilePage'))
const RoleManagementPage = lazy(
  () => import('./pages/settings/roleManagement/roleManagement'),
)

const InvoicesPage = lazy(() => import('./pages/invoices/InvoicesPage'))
const InvoiceDetailPage = lazy(
  () => import('./pages/invoices/InvoiceDetailPage'),
)
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'))
const ClientTrackingPage = lazy(
  () => import('./pages/clientTracking/ClientTrackingPage'),
)
const PublicVerificationPage = lazy(
  () => import('./pages/verification/PublicVerificationPage'),
)
const VendorsPage = lazy(() => import('./pages/vendors/VendorsPage'))
const BuildConversionPage = lazy(
  () => import('./pages/buildConversion/BuildConversionPage'),
)
const ProspectsPage = lazy(() => import('./pages/prospects/ProspectsPage'))
const SurveyPage = lazy(() => import('./pages/survey/SurveyPage'))
const PettyCashPage = lazy(() => import('./pages/pettyCash/PettyCashPage'))
const PettyCashDetailPage = lazy(
  () => import('./pages/pettyCash/PettyCashDetailPage'),
)

// Fallback ringan saat chunk halaman sedang di-download.
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
    </div>
  )
}

const queryClient = new QueryClient()

function AppRoutes() {
  useSessionTimeout()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/verify/:docType/:id" element={<PublicVerificationPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* --- PROJECTS ROUTING --- */}
        <Route path="projects">
          <Route index element={<Navigate to="architecture" replace />} />

          <Route
            element={
              <PermissionGuard require="view_index_project_architecture" />
            }
          >
            <Route path="architecture" element={<ArsitekturPage />} />
          </Route>

          <Route
            element={<PermissionGuard require="view_index_project_civil" />}
          >
            <Route path="civil" element={<SipilPage />} />
          </Route>

          <Route
            element={<PermissionGuard require="view_index_project_interior" />}
          >
            <Route path="interior" element={<InteriorPage />} />
          </Route>
        </Route>

        {/* --- COMMERCIAL (Quotations & Invoices) --- */}
        <Route
          element={
            <PermissionGuard
              requireAny={['manage_quotations', 'manage_quotations_restricted']}
            />
          }
        >
          <Route path="quotations" element={<QuotationsPage />} />
          <Route path="quotations/:id" element={<QuotationEditor />} />
        </Route>

        <Route element={<PermissionGuard require="view_revenue" />}>
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        </Route>

        <Route element={<PermissionGuard require="view_revenue" />}>
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        <Route path="clients" element={<ClientsPage />} />

        <Route element={<PermissionGuard require="access_petty_cash" />}>
          <Route path="petty-cash" element={<PettyCashPage />} />
          <Route path="petty-cash/:id" element={<PettyCashDetailPage />} />
        </Route>

        <Route element={<SuperAdminGuard />}>
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="build-conversion" element={<BuildConversionPage />} />
          <Route path="client-tracking" element={<ClientTrackingPage />} />
        </Route>

        <Route element={<PermissionGuard require="manage_prospects" />}>
          <Route path="prospects" element={<ProspectsPage />} />
        </Route>

        <Route
          element={
            <PermissionGuard requireAny={['view_surveys', 'manage_surveys']} />
          }
        >
          <Route path="survey" element={<SurveyPage />} />
        </Route>

        {/* --- SETTINGS (Only for those who can manage users) --- */}
        <Route element={<PermissionGuard require="manage_users" />}>
          <Route path="settings/users" element={<UserManagementPage />} />
          <Route path="settings/roles" element={<RoleManagementPage />} />
        </Route>

        <Route path="settings/profile" element={<ProfilePage />} />

        {/* FALLBACK LEVEL 1: Jika user mengetik URL ngawur tapi masih di dalam layout Dashboard */}
        <Route path="*" element={<FallbackDecider />} />
      </Route>

      {/* FALLBACK LEVEL 2: Jika user mengetik URL ngawur di root (di luar AppLayout) */}
      <Route path="*" element={<FallbackDecider />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>

        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
export default App
