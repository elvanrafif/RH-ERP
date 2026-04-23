// frontend/src/components/dashboard/tabs/SemesterCard.tsx
import type { Project } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { formatDate } from '@/lib/helpers'

const TYPE_LABELS: Record<Project['type'], string> = {
  architecture: 'Architecture',
  civil: 'Civil',
  interior: 'Interior',
}

const DATE_FIELD_BY_TYPE: Record<Project['type'], keyof Project> = {
  civil: 'end_date',
  architecture: 'deadline',
  interior: 'deadline',
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
          <span className="text-sm font-semibold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            {isLoading ? '...' : `${projects.length} clients`}
          </span>
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
            Tidak ada project di semester ini
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
                    Tipe
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">
                    Status
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-slate-600">
                    Kontrak
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const dateField = DATE_FIELD_BY_TYPE[project.type]
                  const dateValue = project[dateField] as string | undefined
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-slate-800 font-medium max-w-[160px] truncate">
                        {project.expand?.client?.company_name ?? '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-xs capitalize">
                          {TYPE_LABELS[project.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 capitalize">
                        {project.status}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700 tabular-nums">
                        {formatCompactCurrency(project.contract_value)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {formatDate(dateValue)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
