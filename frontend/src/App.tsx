import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { pb } from "@/lib/pocketbase"
import { AnimatePresence } from "framer-motion"

// Components
import AppLayout from "@/components/layout/AppLayout"
import SplashScreen from "@/components/layout/SplashScreen"
import Login from "@/pages/Login"
import Dashboard from "./pages/Dashboard"

// --- NEW PAGES IMPORTS ---
import ArsitekturPage from "./pages/projects/ArsitekturPage"
import SipilPage from "./pages/projects/SipilPage"
import InteriorPage from "./pages/projects/InteriorPage"

import ClientsPage from "./pages/clients/ClientsPage"
import QuotationsPage from "./pages/quotations/QuotationsPage"
import QuotationEditor from "./pages/quotations/QuotationEditor"

// Hooks
import { useSessionTimeout } from "@/hooks/useSessionTimeout"
import UserManagementPage from "./pages/settings/users/UserManagement"
import ProfilePage from "./pages/settings/profile/ProfilePage"

const queryClient = new QueryClient();

// Auth Wrappers
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = pb.authStore.isValid;
  return isAuth ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = pb.authStore.isValid;
  return isAuth ? <Navigate to="/" /> : children;
};

const ComingSoon = ({ title }: { title: string }) => (
    <div className="p-10 border-2 border-dashed rounded-lg text-center flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold text-slate-400">{title}</h2>
      <p className="text-muted-foreground mt-2">Sedang dalam pengembangan...</p>
    </div>
)

function AppRoutes() {
  useSessionTimeout();

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        
        {/* --- PROJECTS ROUTING BARU --- */}
        <Route path="projects">
            {/* Redirect default ke Arsitektur jika buka /projects */}
            <Route index element={<Navigate to="arsitektur" replace />} />
            
            <Route path="arsitektur" element={<ArsitekturPage />} />
            <Route path="sipil" element={<SipilPage />} />
            <Route path="interior" element={<InteriorPage />} />
        </Route>

        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="quotations/:id" element={<QuotationEditor />} />
        <Route path="invoices" element={<ComingSoon title="Invoice Generator" />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="settings/users" element={<UserManagementPage />} />
        <Route path="settings/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimatePresence mode="wait">
            {isLoading ? (
                <SplashScreen key="splash" onComplete={() => setIsLoading(false)} />
            ) : (
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            )}
        </AnimatePresence>
        
        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App