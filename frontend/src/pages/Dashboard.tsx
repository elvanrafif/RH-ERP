import { useAuth } from '@/contexts/AuthContext'
import { DIVISION } from '@/lib/constant'
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard'
import { MyProjectsDashboard } from '@/components/dashboard/MyProjectsDashboard'
import { CivilTeamDashboard } from '@/components/dashboard/CivilTeamDashboard'

export default function Dashboard() {
  const { isSuperAdmin, user } = useAuth()
  if (isSuperAdmin) return <ExecutiveDashboard />
  if (user?.division === DIVISION.CIVIL) return <CivilTeamDashboard />
  return <MyProjectsDashboard />
}
