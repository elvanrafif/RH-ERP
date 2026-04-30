import {
  createContext,
  useContext,
  type ReactNode,
  useMemo,
  useState,
  useEffect,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { motion } from 'framer-motion'
import Logo from '@/assets/rh-studio-transparent.png'

interface AuthContextType {
  user: any
  permissions: string[]
  can: (permission: string) => boolean
  isSuperAdmin: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1. UBAH INI JADI STATE REACT:
  const [authModel, setAuthModel] = useState(pb.authStore.model)
  const isSuperAdmin = !!authModel?.isSuperAdmin

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
    if (authModel?.isSuperAdmin) {
      return true
    }
    return permissions.includes(permission)
  }

  if (isLoading && authModel) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <motion.img
            src={Logo}
            alt="RH Studio"
            className="w-36 md:w-48 object-contain"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <motion.div
            className="mt-8 h-0.5 w-40 overflow-hidden rounded-full bg-slate-100 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="absolute h-full w-14 bg-primary rounded-full"
              animate={{ x: [-56, 160] }}
              transition={{
                duration: 1.1,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            />
          </motion.div>
          <motion.p
            className="mt-4 text-xs text-slate-400 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Verifying access...
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{ user: userData, permissions, can, isSuperAdmin, isLoading }}
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
