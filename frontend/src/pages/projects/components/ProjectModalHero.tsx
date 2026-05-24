import type { Project } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Banknote, Link2, Link2Off } from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'
import { ClientName } from '@/components/shared/ClientName'

interface ProjectModalHeroProps {
  project: Project
  projectTypeName: string
  statusColor: string
  isSuperAdmin: boolean | null
}

export function ProjectModalHero({
  project,
  projectTypeName,
  statusColor,
  isSuperAdmin,
}: ProjectModalHeroProps) {
  const client = project.expand?.client

  return (
    <div className="px-6 pt-6 pb-5 shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <Badge
          variant="outline"
          className="text-[10px] uppercase tracking-wide font-semibold h-5 px-2"
        >
          {projectTypeName}
        </Badge>
        <Badge
          variant="outline"
          className={`text-[10px] uppercase tracking-wide font-semibold h-5 px-2 ${statusColor}`}
        >
          {project.status.replace(/_/g, ' ')}
        </Badge>
        {project.is_on_hold && (
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wide font-semibold h-5 px-2 bg-orange-50 text-orange-700 border-orange-200"
          >
            ⏸ On Hold
          </Badge>
        )}
      </div>

      <h2 className="text-xl font-bold text-foreground leading-tight">
        {client ? (
          <ClientName name={client.company_name} salutation={client.salutation} />
        ) : (
          'Unknown Client'
        )}
      </h2>

      {isSuperAdmin && (
        <div className="flex items-center gap-1.5 mt-2 text-sm">
          {project.expand?.invoice_id ? (
            <>
              <Link2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="text-emerald-700 font-medium">
                {project.expand.invoice_id.invoice_number}
              </span>
              <span className="text-muted-foreground">·</span>
              <Banknote className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {formatRupiah(project.expand.invoice_id.total_amount || 0)}
              </span>
            </>
          ) : (
            <>
              <Link2Off className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="text-amber-600">No invoice linked</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
