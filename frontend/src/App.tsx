import { useState, useEffect } from "react" // Import useState
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { pb } from "@/lib/pocketbase"
import { AnimatePresence } from "framer-motion" // Import ini

// Components
import AppLayout from "@/components/layout/AppLayout"
import Login from "@/pages/Login"
import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/projects/ProjectPage"
import ClientsPage from "./pages/clients/ClientsPage"
import QuotationsPage from "./pages/quotations/QuotationsPage"
import QuotationEditor from "./pages/quotations/QuotationEditor"
import SplashScreen from "@/components/layout/SplashScreen" // Import SplashScreen

// Hooks
import { useSessionTimeout } from "@/hooks/useSessionTimeout"

const queryClient = new QueryClient();

// ... (Code ProtectedRoute, PublicRoute, ComingSoon tetap sama, tidak perlu diubah) ...
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
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="quotations/:id" element={<QuotationEditor />} />
        <Route path="invoices" element={<ComingSoon title="Invoice Generator" />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="settings" element={<ComingSoon title="Settings" />} />
      </Route>
    </Routes>
  )
}

function App() {
  // STATE LOADING
  const [isLoading, setIsLoading] = useState(true);

  // Jika Anda ingin loading hanya muncul SEKALI saat refresh (bukan tiap navigasi),
  // logic ini sudah benar karena App.tsx hanya mount sekali.
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* AnimatePresence memungkinkan animasi Exit berjalan sebelum komponen hilang */}
        <AnimatePresence >
        {/* <AnimatePresence mode="wait"> */}
            {isLoading ? (
                // Tampilkan Splash Screen
                <SplashScreen key="splash" onComplete={() => setIsLoading(false)} />
            ) : (
                // Tampilkan Aplikasi Utama (Router)
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