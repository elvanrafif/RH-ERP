import type { Project } from '@/types'
import { Separator } from '@/components/ui/separator'
import { HardHat, PencilRuler } from 'lucide-react'
import { useProjectCivilByClient } from '@/hooks/useProjectCivilByClient'
import { useProjectArchitectureByClient } from '@/hooks/useProjectArchitectureByClient'
import { TypeProjectsBoolean } from '@/lib/booleans'

interface ProjectConversionBadgeProps {
  project: Project
}

export function ProjectConversionBadge({ project }: ProjectConversionBadgeProps) {
  const { isCivil, isArchitecture } = TypeProjectsBoolean(project.type)

  const { civilProjects, hasCivil } = useProjectCivilByClient(
    isArchitecture ? project.client : undefined
  )
  const { architectureProjects, hasArchitecture } = useProjectArchitectureByClient(
    isCivil ? project.client : undefined
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
            {hasCivil ? (
              <div className="flex flex-wrap gap-2">
                {civilProjects.map((cp) => (
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
                Belum ada project Civil
              </div>
            )}
          </div>
        </>
      )}

      {isCivil && hasArchitecture && (
        <>
          <Separator />
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-foreground mb-3">
              Asal Design
            </p>
            <div className="flex flex-wrap gap-2">
              {architectureProjects.map((ap) => (
                <div
                  key={ap.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 text-xs font-semibold"
                >
                  <PencilRuler className="h-3 w-3" />
                  Architecture: {ap.status.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
