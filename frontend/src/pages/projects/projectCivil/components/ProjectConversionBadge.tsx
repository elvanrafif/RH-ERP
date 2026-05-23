import { useState } from 'react'
import type { Project } from '@/types'
import { Separator } from '@/components/ui/separator'
import { HardHat, PencilRuler, ArrowRight, User, Ruler } from 'lucide-react'
import { useProjectCivilByClient } from '../hooks/useProjectCivilByClient'
import { useProjectArchitectureByClient } from '../../projectArchitecture/hooks/useProjectArchitectureByClient'
import { TypeProjectsBoolean } from '@/lib/booleans'
import { MaskingTextByArchitectureStatus } from '@/lib/masking'
import { ProjectArchitectureDetailsModal } from '../../projectArchitecture/ProjectArchitectureDetailsModal'

interface ProjectConversionBadgeProps {
  project: Project
}

export function ProjectConversionBadge({
  project,
}: ProjectConversionBadgeProps) {
  const [viewingArch, setViewingArch] = useState<Project | null>(null)
  const { isCivil, isArchitecture } = TypeProjectsBoolean(project.type)

  const { civilProjects } = useProjectCivilByClient(
    isArchitecture ? project.client : undefined
  )
  const { architectureProjects } = useProjectArchitectureByClient(
    isCivil ? project.client : undefined
  )

  const linkedCivil = civilProjects.filter(
    (cp) => cp.source_architecture === project.id
  )
  const linkedArch = architectureProjects.filter(
    (ap) => ap.id === project.source_architecture
  )

  if (!isArchitecture && !isCivil) return null

  return (
    <>
      {isArchitecture && (
        <>
          <Separator />
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-foreground mb-3">
              Design → Build
            </p>

            {linkedCivil.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {linkedCivil.map((cp) => (
                  <div
                    key={cp.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-semibold"
                  >
                    <HardHat className="h-3 w-3" />
                    Civil: {cp.status.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-3 py-1 text-xs font-semibold">
                <HardHat className="h-3 w-3" />
                No Civil project yet
              </div>
            )}
          </div>
        </>
      )}

      {isCivil && linkedArch.length > 0 && (
        <>
          <Separator />
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-foreground mb-3">
              Design Origin
            </p>
            <div className="flex flex-col gap-2">
              {linkedArch.map((ap) => (
                <button
                  key={ap.id}
                  type="button"
                  onClick={() => setViewingArch(ap)}
                  className="w-full text-left rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors px-4 py-3 group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 mb-2">
                      <PencilRuler className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span className="text-xs font-semibold text-blue-800">
                        {ap.expand?.client?.company_name ?? '—'}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-blue-400 group-hover:text-blue-600 shrink-0 mt-0.5 transition-colors" />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-700">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-blue-400" />
                      {ap.expand?.assignee?.name ?? 'Unassigned'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-200 px-2 py-0.5 font-medium text-[10px]">
                      {MaskingTextByArchitectureStatus(ap.status)}
                    </span>
                    {(ap.luas_tanah || ap.luas_bangunan) && (
                      <span className="flex items-center gap-1 text-blue-500">
                        <Ruler className="h-3 w-3" />
                        L:{ap.luas_tanah ?? 0}m² | B:{ap.luas_bangunan ?? 0}m²
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <ProjectArchitectureDetailsModal
            project={viewingArch}
            open={!!viewingArch}
            onOpenChange={(open) => !open && setViewingArch(null)}
          />
        </>
      )}
    </>
  )
}
