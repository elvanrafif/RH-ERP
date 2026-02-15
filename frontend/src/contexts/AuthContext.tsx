import { createContext, useContext, type ReactNode, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { Loader2 } from 'lucide-react'

interface AuthContextType {
  user: any
  permissions: string[]
  can: (permission: string) => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Ambil data user yang sedang login dari local store PocketBase
  const authModel = pb.authStore.model

  const { data: userData, isLoading } = useQuery({
    queryKey: ['current-user', authModel?.id],
    queryFn: async () => {
      if (!authModel?.id) return null

      // Expand 'roleId' untuk menarik array permissions dari collection 'roles'
      return await pb.collection('users').getOne(authModel.id, {
        expand: 'roleId',
      })
    },
    enabled: !!authModel?.id,
    staleTime: Infinity, // Simpan di cache selamanya selama sesi aktif
  })

  // Ekstrak permissions dari JSON di PocketBase
  const permissions = useMemo(() => {
    return userData?.expand?.roleId?.permissions || []
  }, [userData])

  // Fungsi utama pengecekan izin
  const can = (permission: string) => {
    // 👑 OVERRIDE KHUSUS DEVELOPER / SUPERADMIN
    // Email Bapak dan role superadmin otomatis bypass semua rule
    if (
      authModel?.email === 'elvanrafif@gmail.com' ||
      authModel?.isSuperAdmin
    ) {
      return true
    }

    // Cek apakah permission yang diminta ada di dalam array milik user
    return permissions.includes(permission)
  }

  // Tampilkan loading screen saat pertama kali sistem mengecek hak akses
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50/50 backdrop-blur-sm z-50 fixed inset-0">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium animate-pulse">
            {' '}
            Memverifikasi hak akses...
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{ user: userData, permissions, can, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook agar memanggilnya semudah: const { can } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
