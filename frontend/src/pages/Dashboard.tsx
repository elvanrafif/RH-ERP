import { useAuth } from '@/contexts/AuthContext'
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard'
import { MyProjectsDashboard } from '@/components/dashboard/MyProjectsDashboard'

export default function Dashboard() {
  const { isSuperAdmin } = useAuth()
  return isSuperAdmin ? <ExecutiveDashboard /> : <MyProjectsDashboard />
}
