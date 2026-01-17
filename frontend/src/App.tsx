import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query" // <--- 1. Import ini
import AppLayout from "@/components/layout/AppLayout"
import Login from "@/pages/Login"
import { pb } from "@/lib/pocketbase"
import Dashboard from "./pages/Dashboard";
import ClientsPage from "./pages/clients/ClientsPage"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import ProjectsPage from "./pages/projects/ProjectPage"

// 2. Inisialisasi Client
const queryClient = new QueryClient();

// Komponen Pembungkus (Guard)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = pb.authStore.isValid;
  return isAuth ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = pb.authStore.isValid;
  return isAuth ? <Navigate to="/" /> : children;
};

const ComingSoon = ({ title }: { title: string }) => (
  <div className="p-10 border-2 border-dashed rounded-lg text-center">
    <h2 className="text-2xl font-bold text-slate-400">{title}</h2>
    <p>Sedang dalam pengembangan...</p>
  </div>
)

function App() {
  return (
    // 3. Bungkus Router dengan QueryClientProvider
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
      <BrowserRouter>
        <Routes>
          
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            <Route path="projects" element={<ProjectsPage />} />

            <Route path="documents/quotes" element={<ComingSoon title="Quotation Generator" />} />
            <Route path="documents/invoices" element={<ComingSoon title="Invoice Generator" />} />

            <Route path="clients" element={<ClientsPage />} />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
          </Route>

        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App