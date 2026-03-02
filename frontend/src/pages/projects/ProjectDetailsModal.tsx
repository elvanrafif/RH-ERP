import type { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog'
import { TypeProjectsBoolean } from '@/lib/booleans'
import { useRole } from '@/hooks/useRole'
import { ProjectClientCard } from './components/ProjectClientCard'
import { ProjectPicTimelineCard } from './components/ProjectPicTimelineCard'
import { ProjectSpecsCard } from './components/ProjectSpecsCard'

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

  if (!project) return null

  const meta = project.meta_data || {}
  const notes = meta.notes || (project as any).notes
  const client = project.expand?.client

  const { isCivil, isInterior } = TypeProjectsBoolean(project.type)

  const picData = (() => {
    if (isCivil) return project.meta_data.pic_lapangan
    if (isInterior) return project.meta_data.pic_interior
    return project.expand?.assignee?.name
  })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[750px] max-h-[90vh] flex flex-col p-0 bg-white gap-0">
        {/* HEADER */}
        <div className="p-6 pb-2 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="uppercase bg-white border-primary/20 text-primary shadow-sm tracking-wide text-[10px] h-6 px-3"
              >
                {project.type}
              </Badge>
              <Badge
                variant="secondary"
                className="uppercase text-[10px] h-6 px-3 bg-slate-200 text-slate-700 hover:bg-slate-300"
              >
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProjectClientCard client={client} />
              <ProjectPicTimelineCard
                picData={picData}
                isCivil={isCivil}
                project={project}
              />
            </div>

            <ProjectSpecsCard
              meta={meta}
              notes={notes}
              isSuperAdmin={isSuperAdmin}
              contractValue={project.contract_value || 0}
              isInterior={isInterior}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 shrink-0 flex justify-end bg-white/50 backdrop-blur-sm mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
