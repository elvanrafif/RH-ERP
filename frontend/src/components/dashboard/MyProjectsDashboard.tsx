import { useState } from 'react'
import { Briefcase, AlertTriangle, Activity } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useMyProjects } from '@/hooks/useMyProjects'
import { ProjectDetailsModal } from '@/pages/projects/ProjectDetailsModal'
import {
  getProjectDeadlineDate,
  getDaysRemaining,
} from '@/lib/projects/deadline'
import { PROJECT_STATUS, DEADLINE_WARNING_DAYS } from '@/lib/constant'
import type { Project } from '@/types'

const TYPE_LABEL: Record<Project['type'], string> = {
  architecture: 'Architecture',
  civil: 'Civil',
  interior: 'Interior',
}

const TYPE_CLASS: Record<Project['type'], string> = {
  architecture: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  civil: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  interior:
    'bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-100',
}

const STATUS_LABEL: Record<string, string> = {
  // Architecture
  denah: 'Floor Plan',
  fasad: 'Facade',
  detail_drawing: 'Detail Drawing',
  // Interior
  draft_skematik: 'Schematic Draft',
  // Civil
  active: 'Active',
  // Legacy fallback
  [PROJECT_STATUS.DESIGN]: 'Design',
  [PROJECT_STATUS.PROGRESS]: 'In Progress',
}

const STATUS_CLASS: Record<string, string> = {
  denah: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50',
  fasad: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50',
  detail_drawing:
    'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50',
  draft_skematik: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50',
  active:
    'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
  [PROJECT_STATUS.DESIGN]:
    'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50',
  [PROJECT_STATUS.PROGRESS]:
    'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
}

function getDeadlineBadge(
  days: number | null,
  type: Project['type']
): { label: string; className: string } | null {
  if (days === null) return null
  const threshold = DEADLINE_WARNING_DAYS[type]
  if (days < 0)
    return {
      label: `${Math.abs(days)}d overdue`,
      className: 'bg-red-50 text-red-700 border-red-200',
    }
  if (days === 0)
    return {
      label: 'Due today',
      className: 'bg-red-50 text-red-700 border-red-200',
    }
  if (days <= threshold)
    return {
      label: `${days}d left`,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    }
  return {
    label: `${days}d left`,
    className: 'bg-slate-50 text-slate-600 border-slate-200',
  }
}

function formatDeadlineDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface ProjectRowProps {
  project: Project
  index: number
  onClick: (project: Project) => void
}

function ProjectRow({ project, index, onClick }: ProjectRowProps) {
  const date = getProjectDeadlineDate(project)
  const days = date ? getDaysRemaining(date) : null
  const deadlineBadge = getDeadlineBadge(days, project.type)
  const clientName = project.expand?.client?.company_name ?? '—'

  return (
    <TableRow onClick={() => onClick(project)} className="cursor-pointer h-14">
      <TableCell className="text-slate-400 text-xs tabular-nums w-[40px]">
        {index + 1}
      </TableCell>
      <TableCell className="font-medium text-slate-900">{clientName}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`uppercase text-[10px] ${TYPE_CLASS[project.type]}`}
        >
          {TYPE_LABEL[project.type]}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`uppercase text-[10px] ${STATUS_CLASS[project.status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}
        >
          {STATUS_LABEL[project.status] ?? project.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">
            {date ? formatDeadlineDate(date) : '—'}
          </span>
          {deadlineBadge && (
            <Badge
              variant="outline"
              className={`uppercase text-[9px] h-5 px-1.5 w-fit ${deadlineBadge.className}`}
            >
              {deadlineBadge.label}
            </Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
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
          My Projects
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {projects.length} active project{projects.length !== 1 ? 's' : ''} in
          progress
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<Briefcase className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
              label="Total Active"
              value={projects.length}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-100"
              label="Near Deadline"
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
              label="In Progress"
              value={inProgressCount}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[700px]">
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-60">
                    <EmptyState
                      title="No active projects"
                      description="You have no active projects assigned to you."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project, index) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    index={index}
                    onClick={setSelectedProject}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
