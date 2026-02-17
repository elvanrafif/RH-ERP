import { pb } from '@/lib/pocketbase'
import { Navigate } from 'react-router-dom'
import { Button } from '../ui/button'

export const FallbackDecider = () => {
  const isAuth = pb.authStore.isValid
  const user = pb.authStore.model

  // 1. Jika belum login, paksa lempar ke halaman login
  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  // 2. Jika sudah login, Bapak bisa taruh logic ROLE di sini nanti.
  // Contoh:
  // if (user?.division === 'architecture') return <Navigate to="/projects/architecture" replace />
  // if (user?.division === 'civil') return <Navigate to="/projects/civil" replace />

  // 3. Fallback visual sementara jika URL benar-benar tidak ditemukan / tidak punya akses
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 w-full">
      <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-slate-600 mb-2">
        Halaman Tidak Ditemukan
      </h2>
      <p className="text-slate-500 mb-8 max-w-md text-center">
        URL yang Anda tuju tidak ada, atau Anda tidak memiliki izin untuk
        mengakses halaman tersebut.
      </p>
      <Button onClick={() => (window.location.href = '/')}>
        Kembali ke Dashboard
      </Button>
    </div>
  )
}

// Auth Wrappers
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = pb.authStore.isValid
  // Tambahkan 'replace' agar tidak merusak history back browser
  return isAuth ? children : <Navigate to="/login" replace />
}

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = pb.authStore.isValid
  return isAuth ? <Navigate to="/" replace /> : children
}
