import { useState } from 'react'
import type { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useRole } from '@/hooks/useRole'
import { ProjectClientCard } from '../components/ProjectClientCard'
import { ProjectPicTimelineCard } from '../components/ProjectPicTimelineCard'
import { ProjectSpecsCard } from '../components/ProjectSpecsCard'
import { ProjectModalHero } from '../components/ProjectModalHero'
import { ProjectHoldBanner } from '../components/ProjectHoldBanner'
import { HoldProjectDialog } from '@/components/dialogs/HoldProjectDialog'
import { canHoldProject } from '@/lib/projects/permissions'
import { useProjectHold } from '@/hooks/useProjectHold'

const STATUS_COLORS: Record<string, string> = {
  finish: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

interface ProjectInteriorDetailsModalProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectInteriorDetailsModal({
  project,
  open,
  onOpenChange,
}: ProjectInteriorDetailsModalProps) {
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
  const vendorName = project.expand?.vendor?.name
  const canHold = canHoldProject(project, user ?? null, isSuperAdmin ?? false)
  const statusColor =
    STATUS_COLORS[project.status] ??
    'bg-secondary text-secondary-foreground border-border'

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
          {/* ── HERO ─────────────────────────────────────── */}
          <ProjectModalHero
            project={project}
            projectTypeName="Interior"
            statusColor={statusColor}
            isSuperAdmin={isSuperAdmin}
          />

          <Separator />

          {/* ── BODY ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {project.is_on_hold && (
              <ProjectHoldBanner
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
                  isInterior={true}
                  vendorData={vendorName}
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
                areaScope={meta.area_scope}
                notes={project.notes}
                isInterior={true}
                additionalLinks={
                  meta.additional_links as
                    | Array<{ label?: string; url: string } | string>
                    | undefined
                }
              />
            </div>
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

