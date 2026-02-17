import {
  createContext,
  useContext,
  type ReactNode,
  useMemo,
  useState,
  useEffect,
} from 'react' // Tambahkan useState & useEffect
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
  // 1. UBAH INI JADI STATE REACT:
  const [authModel, setAuthModel] = useState(pb.authStore.model)

  // 2. TAMBAHKAN LISTENER INI:
  // Ini akan otomatis ter-trigger detik itu juga saat user berhasil login
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setAuthModel(model)
    })
    return () => {
      unsubscribe() // Bersihkan memori saat komponen mati
    }
  }, [])

  // 3. QUERY TETAP SAMA
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
    staleTime: Infinity,
  })

  // Ekstrak permissions dari JSON di PocketBase
  const permissions = useMemo(() => {
    return userData?.expand?.roleId?.permissions || []
  }, [userData])

  // Fungsi utama pengecekan izin
  const can = (permission: string) => {
    if (
      authModel?.email === 'elvanrafif@gmail.com' ||
      authModel?.isSuperAdmin
    ) {
      return true
    }
    return permissions.includes(permission)
  }

  // Tampilkan loading HANYA JIKA sedang mencari data role
  if (isLoading && authModel) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50/50 backdrop-blur-sm z-50 fixed inset-0">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium animate-pulse">
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

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
