// frontend/src/components/dashboard/MyProjectsDashboard.tsx
import { useState } from 'react'
import { Briefcase, AlertTriangle, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatCard } from '@/components/shared/StatCard'
import { useMyProjects } from '@/hooks/useMyProjects'
import { ProjectDetailsModal } from '@/pages/projects/ProjectDetailsModal'
import {
  getProjectDeadlineDate,
  getDaysRemaining,
} from '@/lib/projects/deadline'
import { PROJECT_STATUS, DEADLINE_WARNING_DAYS } from '@/lib/constant'
import type { Project } from '@/types'

const TYPE_LABEL: Record<Project['type'], string> = {
  architecture: 'Arsitektur',
  civil: 'Sipil',
  interior: 'Interior',
}

const TYPE_CLASS: Record<Project['type'], string> = {
  architecture: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  civil: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  interior: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
}

const STATUS_LABEL: Record<string, string> = {
  [PROJECT_STATUS.DESIGN]: 'Design',
  [PROJECT_STATUS.PROGRESS]: 'Progress',
}

const STATUS_CLASS: Record<string, string> = {
  [PROJECT_STATUS.DESIGN]: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  [PROJECT_STATUS.PROGRESS]: 'bg-green-100 text-green-700 hover:bg-green-100',
}

function formatDeadlineLabel(days: number | null): string {
  if (days === null) return '—'
  if (days < 0) return `Terlambat ${Math.abs(days)} hari`
  if (days === 0) return 'Hari ini'
  return `${days} hari lagi`
}

interface ProjectRowProps {
  project: Project
  onClick: (project: Project) => void
}

function ProjectRow({ project, onClick }: ProjectRowProps) {
  const date = getProjectDeadlineDate(project)
  const days = date ? getDaysRemaining(date) : null
  const threshold = DEADLINE_WARNING_DAYS[project.type]
  const isUrgent = days !== null && days <= threshold
  const clientName = project.expand?.client?.company_name ?? '—'

  return (
    <div
      onClick={() => onClick(project)}
      className={`grid grid-cols-[110px_1fr_100px_120px] gap-3 px-4 py-3.5 items-center cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors ${isUrgent ? 'bg-red-50/50' : ''}`}
    >
      <div>
        <Badge className={TYPE_CLASS[project.type]}>
          {TYPE_LABEL[project.type]}
        </Badge>
      </div>
      <div className="text-sm font-medium text-foreground truncate">
        {clientName}
      </div>
      <div>
        <Badge
          className={
            STATUS_CLASS[project.status] ?? 'bg-slate-100 text-slate-600'
          }
        >
          {STATUS_LABEL[project.status] ?? project.status}
        </Badge>
      </div>
      <div
        className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`}
      >
        {isUrgent && days !== null && days >= 0 && (
          <span className="mr-1">⚠</span>
        )}
        {formatDeadlineLabel(days)}
      </div>
    </div>
  )
}

export function MyProjectsDashboard() {
  const { data, isLoading } = useMyProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  if (isLoading) return <LoadingSpinner className="min-h-screen" />

  const { projects, nearDeadlineCount, inProgressCount } = data ?? {
    projects: [],
    nearDeadlineCount: 0,
    inProgressCount: 0,
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Proyek Saya
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {projects.length} project aktif sedang berjalan
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<Briefcase className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
              label="Total Aktif"
              value={projects.length}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-100"
              label="Mendekati Deadline"
              value={nearDeadlineCount}
              urgent={nearDeadlineCount > 0}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<Activity className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
              label="Dalam Proses"
              value={inProgressCount}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="grid grid-cols-[110px_1fr_100px_120px] gap-3 px-4 py-2.5 border-b border-border bg-muted/30 rounded-t-lg">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tipe
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Client
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Deadline
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Briefcase className="h-10 w-10 opacity-20" />
            <p className="text-sm">Tidak ada project aktif</p>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onClick={setSelectedProject}
            />
          ))
        )}
      </Card>

      <ProjectDetailsModal
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null)
        }}
      />
    </div>
  )
}
