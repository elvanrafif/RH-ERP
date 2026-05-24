// frontend/src/components/dashboard/CivilTeamDashboard.tsx
import { useState } from 'react'
import { Briefcase, AlertTriangle, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useCivilTeamProjects } from '@/hooks/useCivilTeamProjects'
import { ProjectCivilDetailsModal } from '@/pages/projects/projectCivil/ProjectCivilDetailsModal'
import { CivilGanttChart } from './CivilGanttChart'
import type { Project } from '@/types'

export function CivilTeamDashboard() {
  const { data, isLoading } = useCivilTeamProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  if (isLoading) return <LoadingSpinner className="min-h-screen" />

  const { vendorGroups, totalProjects, nearDeadlineCount, overdueCount } =
    data ?? {
      vendorGroups: [],
      totalProjects: 0,
      nearDeadlineCount: 0,
      overdueCount: 0,
    }
  const atRiskCount = nearDeadlineCount + overdueCount

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Civil Team
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {totalProjects} active project{totalProjects !== 1 ? 's' : ''} across{' '}
          {vendorGroups.length} vendor{vendorGroups.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<Briefcase className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
              label="Total Active"
              value={totalProjects}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-100"
              label="Near Deadline"
              value={atRiskCount}
              urgent={atRiskCount > 0}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<Users className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
              label="Active Vendors"
              value={vendorGroups.length}
            />
          </CardContent>
        </Card>
      </div>

      {vendorGroups.length === 0 ? (
        <EmptyState
          title="No active civil projects"
          description="There are no active civil projects at the moment."
        />
      ) : (
        <CivilGanttChart
          vendorGroups={vendorGroups}
          onProjectClick={setSelectedProject}
        />
      )}

      <ProjectCivilDetailsModal
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null)
        }}
      />
    </div>
  )
}
