import type { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Banknote } from 'lucide-react'
import { TypeProjectsBoolean } from '@/lib/booleans'
import { useRole } from '@/hooks/useRole'
import { formatRupiah } from '@/lib/helpers'
import { ProjectClientCard } from './components/ProjectClientCard'
import { ProjectPicTimelineCard } from './components/ProjectPicTimelineCard'
import { ProjectSpecsCard } from './components/ProjectSpecsCard'
import { ProjectConversionBadge } from './components/ProjectConversionBadge'

const TYPE_LABEL: Record<Project['type'], string> = {
  architecture: 'Architecture',
  civil: 'Civil Construction',
  interior: 'Interior',
}

const STATUS_COLORS: Record<string, string> = {
  finish: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

interface ProjectDetailsModalProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectDetailsModal({
  project,
  open,
  onOpenChange,
}: ProjectDetailsModalProps) {
  const { isSuperAdmin } = useRole()

  const { isCivil, isInterior } = TypeProjectsBoolean(
    project?.type ?? 'architecture'
  )

  if (!project) return null

  const meta = project.meta_data || {}
  const notes = project.notes
  const client = project.expand?.client

  const picData = isCivil
    ? project.expand?.vendor?.name
    : project.expand?.assignee?.name

  const vendorData = isInterior ? project.expand?.vendor?.name : undefined

  const statusColor =
    STATUS_COLORS[project.status] ??
    'bg-secondary text-secondary-foreground border-border'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
        {/* ── HERO ─────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-5 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wide font-semibold h-5 px-2"
            >
              {TYPE_LABEL[project.type]}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-wide font-semibold h-5 px-2 ${statusColor}`}
            >
              {project.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          <h2 className="text-xl font-bold text-foreground leading-tight">
            {client?.company_name || 'Unknown Client'}
          </h2>

          {isSuperAdmin && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
              <Banknote className="h-3.5 w-3.5 shrink-0" />
              <span>Contract value:</span>
              <span className="font-semibold text-foreground">
                {formatRupiah(project.contract_value || 0)}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* ── BODY ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* Contact + PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="px-6 py-5">
              <ProjectClientCard client={client} />
            </div>
            <div className="px-6 py-5">
              <ProjectPicTimelineCard
                picData={picData}
                isCivil={isCivil}
                isInterior={isInterior}
                vendorData={vendorData}
                project={project}
              />
            </div>
          </div>

          <Separator />

          {/* Specs + Notes */}
          <div className="px-6 py-5">
            <p className="text-xs font-semibold text-foreground mb-4">
              Specifications
            </p>
            <ProjectSpecsCard
              luasTanah={project.luas_tanah}
              luasBangunan={project.luas_bangunan}
              areaScope={meta.area_scope}
              notes={notes}
              isInterior={isInterior}
            />
          </div>

          {/* ── CONVERSION BADGE (superadmin only) ─────── */}
          {isSuperAdmin && <ProjectConversionBadge project={project} />}
        </div>

        <Separator />

        {/* ── FOOTER ───────────────────────────────────── */}
        <div className="px-6 py-4 shrink-0 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
