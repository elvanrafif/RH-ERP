import { useState } from 'react'
import type { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Banknote, Link2, Link2Off, PauseCircle } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { formatRupiah, formatDateShort } from '@/lib/helpers'
import { ClientName } from '@/components/shared/ClientName'
import { ProjectClientCard } from '../components/ProjectClientCard'
import { ProjectPicTimelineCard } from '../components/ProjectPicTimelineCard'
import { ProjectSpecsCard } from '../components/ProjectSpecsCard'
import { ProjectConversionBadge } from '../projectCivil/components/ProjectConversionBadge'
import { HoldProjectDialog } from '@/components/dialogs/HoldProjectDialog'
import { canHoldProject } from '@/lib/projects/permissions'
import { useProjectHold } from '@/hooks/useProjectHold'

const STATUS_COLORS: Record<string, string> = {
  finish: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

interface ProjectArchitectureDetailsModalProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectArchitectureDetailsModal({
  project,
  open,
  onOpenChange,
}: ProjectArchitectureDetailsModalProps) {
  const { isSuperAdmin, user } = useRole()
  const [holdDialogOpen, setHoldDialogOpen] = useState(false)

  const { holdMutation, resumeMutation } = useProjectHold(project, {
    onHoldSuccess: () => {
      setHoldDialogOpen(false)
      onOpenChange(false)
    },
    onResumeSuccess: () => onOpenChange(false),
  })

  if (!project) return null

  const meta = project.meta_data || {}
  const client = project.expand?.client
  const picName = project.expand?.assignee?.name
  const canHold = canHoldProject(project, user ?? null, isSuperAdmin ?? false)
  const statusColor =
    STATUS_COLORS[project.status] ??
    'bg-secondary text-secondary-foreground border-border'

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
          {/* ── HERO ─────────────────────────────────────── */}
          <div className="px-6 pt-6 pb-5 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wide font-semibold h-5 px-2"
              >
                Architecture
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
                <ClientName
                  name={client.company_name}
                  salutation={client.salutation}
                />
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
                      {formatRupiah(
                        project.expand.invoice_id.total_amount || 0
                      )}
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

          <Separator />

          {/* ── BODY ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {project.is_on_hold && (
              <HoldBanner
                reason={project.hold_reason}
                heldAt={project.held_at}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="px-6 py-5">
                <ProjectClientCard client={client} />
              </div>
              <div className="px-6 py-5">
                <ProjectPicTimelineCard
                  picData={picName}
                  isCivil={false}
                  isInterior={false}
                  project={project}
                />
              </div>
            </div>

            <Separator />

            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-foreground mb-4">
                Specifications
              </p>
              <ProjectSpecsCard
                luasTanah={project.luas_tanah}
                luasBangunan={project.luas_bangunan}
                notes={project.notes}
                isInterior={false}
                additionalLinks={
                  meta.additional_links as
                    | Array<{ label?: string; url: string } | string>
                    | undefined
                }
              />
            </div>

            {isSuperAdmin && <ProjectConversionBadge project={project} />}
          </div>

          <Separator />

          {/* ── FOOTER ───────────────────────────────────── */}
          <div className="px-6 py-4 shrink-0 flex items-center justify-between gap-2">
            <div>
              {canHold && !project.is_on_hold && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                  onClick={() => setHoldDialogOpen(true)}
                  disabled={holdMutation.isPending || resumeMutation.isPending}
                >
                  ⏸ Hold Project
                </Button>
              )}
              {canHold && project.is_on_hold && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  onClick={() => resumeMutation.mutate()}
                  disabled={resumeMutation.isPending || holdMutation.isPending}
                >
                  ▶ Resume Project
                </Button>
              )}
            </div>
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

      <HoldProjectDialog
        open={holdDialogOpen}
        onOpenChange={setHoldDialogOpen}
        onConfirm={(reason) => holdMutation.mutate(reason)}
        isPending={holdMutation.isPending}
      />
    </>
  )
}

interface HoldBannerProps {
  reason?: string | null
  heldAt?: string | null
}

function HoldBanner({ reason, heldAt }: HoldBannerProps) {
  return (
    <div className="mx-6 mt-5 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
      <PauseCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
          On Hold
        </p>
        {reason && (
          <p className="text-sm text-orange-800 mt-0.5 leading-snug">
            {reason}
          </p>
        )}
        {heldAt && (
          <p className="text-xs text-orange-500 mt-1">
            Since {formatDateShort(heldAt)}
          </p>
        )}
      </div>
    </div>
  )
}
