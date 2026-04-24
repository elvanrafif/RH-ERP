// frontend/src/components/dashboard/tabs/SemesterCard.tsx
import type { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/helpers'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  const totalValue = projects.reduce(
    (sum, p) => sum + (p.contract_value ?? 0),
    0
  )
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
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No projects this semester
          </div>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">
                    Client
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">
                    Status
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-slate-600">
                    Contract
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() =>
                      navigate(
                        `${PROJECT_TYPE_ROUTES[project.type]}?open=${project.id}`
                      )
                    }
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2.5 text-slate-800 font-medium">
                      {project.expand?.client?.company_name ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 w-px whitespace-nowrap">
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${TYPE_BADGE_CLASS[project.type]}`}
                        >
                          {TYPE_LABELS[project.type]}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {project.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700 tabular-nums w-px whitespace-nowrap">
                      {formatRupiah(project.contract_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
