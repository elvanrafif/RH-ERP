import { useState } from 'react'
import type { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/helpers'
import { formatClientName } from '@/components/shared/ClientName'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const TYPE_LABELS: Record<Project['type'], string> = {
  architecture: 'Architecture',
  civil: 'Civil',
  interior: 'Interior',
}

const TYPE_BADGE_CLASS: Record<Project['type'], string> = {
  architecture: 'bg-blue-100 text-blue-800 border-blue-200',
  civil: 'bg-amber-100 text-amber-800 border-amber-200',
  interior: 'bg-violet-100 text-violet-800 border-violet-200',
}

const PROJECT_TYPE_ROUTES: Record<Project['type'], string> = {
  architecture: '/projects/architecture',
  civil: '/projects/civil',
  interior: '/projects/interior',
}

interface ClientGroup {
  clientId: string
  clientName: string
  projects: Project[]
  totalValue: number
}

function groupByClient(projects: Project[]): ClientGroup[] {
  const map = new Map<string, ClientGroup>()
  for (const p of projects) {
    const clientId = p.client ?? 'unknown'
    const clientName = p.expand?.client
      ? formatClientName(p.expand.client)
      : '—'
    if (!map.has(clientId)) {
      map.set(clientId, { clientId, clientName, projects: [], totalValue: 0 })
    }
    const group = map.get(clientId)!
    group.projects.push(p)
    group.totalValue += p.contract_value ?? 0
  }
  return Array.from(map.values()).sort((a, b) => b.totalValue - a.totalValue)
}

interface ClientRowProps {
  group: ClientGroup
}

function ClientRow({ group }: ClientRowProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="border-b border-slate-100 last:border-0">
      {/* Client header — clickable to toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <ChevronRight
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
        <span className="flex-1 font-medium text-slate-800 text-sm">
          {group.clientName}
        </span>
        <span className="text-xs text-muted-foreground mr-2">
          {group.projects.length}{' '}
          {group.projects.length === 1 ? 'project' : 'projects'}
        </span>
        <span className="text-sm font-semibold text-slate-700 tabular-nums">
          {formatRupiah(group.totalValue)}
        </span>
      </button>

      {/* Project rows — shown when open */}
      {open && (
        <div className="bg-slate-50/50">
          {group.projects.map((project) => (
            <div
              key={project.id}
              onClick={() =>
                navigate(
                  `${PROJECT_TYPE_ROUTES[project.type]}?open=${project.id}`
                )
              }
              className="flex items-center gap-3 pl-11 pr-4 py-2.5 border-t border-slate-100 hover:bg-slate-100/60 transition-colors cursor-pointer"
            >
              <Badge
                variant="outline"
                className={`text-xs shrink-0 ${TYPE_BADGE_CLASS[project.type]}`}
              >
                {TYPE_LABELS[project.type]}
              </Badge>
              <Badge
                variant="secondary"
                className="text-xs capitalize shrink-0"
              >
                {project.status.replace(/_/g, ' ')}
              </Badge>
              <span className="flex-1" />
              <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
                {formatRupiah(project.contract_value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface SemesterCardProps {
  title: string
  dateRange: string
  projects: Project[]
  isLoading: boolean
}

export function SemesterCard({
  title,
  dateRange,
  projects,
  isLoading,
}: SemesterCardProps) {
  const totalValue = projects.reduce(
    (sum, p) => sum + (p.contract_value ?? 0),
    0
  )
  const groups = groupByClient(projects)

  return (
    <Card className="border-slate-200/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              {title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{dateRange}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              {isLoading ? '...' : `${projects.length} projects`}
            </span>
            <span className="text-sm font-semibold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              {isLoading ? '...' : formatRupiah(totalValue)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No projects this semester
          </div>
        ) : (
          <div className="overflow-auto max-h-96 divide-y divide-slate-100">
            {groups.map((group) => (
              <ClientRow key={group.clientId} group={group} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
