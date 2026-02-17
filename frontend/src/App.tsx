import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { pb } from '@/lib/pocketbase'
import { AnimatePresence } from 'framer-motion'

// Components
import AppLayout from '@/components/layout/AppLayout'
import SplashScreen from '@/components/layout/SplashScreen'
import Login from '@/pages/Login'
import Dashboard from './pages/Dashboard'
import { Button } from '@/components/ui/button' // Tambahkan import Button untuk fallback

// --- NEW PAGES IMPORTS ---
import ArsitekturPage from './pages/projects/ArsitekturPage'
import SipilPage from './pages/projects/SipilPage'
import InteriorPage from './pages/projects/InteriorPage'

import ClientsPage from './pages/clients/ClientsPage'
import QuotationsPage from './pages/quotations/QuotationsPage'
import QuotationEditor from './pages/quotations/QuotationEditor'

// Hooks
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import UserManagementPage from './pages/settings/users/UserManagement'
import ProfilePage from './pages/settings/profile/ProfilePage'

// --- IMPORT ROLE MANAGEMENT PAGE ---
import RoleManagementPage from './pages/settings/roleManagement/roleManagement'

import InvoicesPage from './pages/invoices/InvoicesPage'
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage'
import PublicVerificationPage from './pages/verification/PublicVerificationPage'
import { AuthProvider } from './contexts/AuthContext'
import { PermissionGuard } from './components/ui/PermissionGuard'
import {
  FallbackDecider,
  ProtectedRoute,
  PublicRoute,
} from './components/auth/route'

const queryClient = new QueryClient()

function AppRoutes() {
  useSessionTimeout()

  return (
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
        <Route element={<PermissionGuard require="view_revenue" />}>
          <Route path="quotations" element={<QuotationsPage />} />
          <Route path="quotations/:id" element={<QuotationEditor />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        </Route>

        <Route path="clients" element={<ClientsPage />} />

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
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <SplashScreen key="splash" onComplete={() => setIsLoading(false)} />
          ) : (
            <AuthProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AuthProvider>
          )}
        </AnimatePresence>

        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
export default App
