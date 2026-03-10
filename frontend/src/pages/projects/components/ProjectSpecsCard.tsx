import type { Project } from '@/types'
import { Maximize2, Building2 } from 'lucide-react'

interface ProjectSpecsCardProps {
  meta: Project['meta_data']
  notes: string | undefined
  isInterior: boolean
}

export function ProjectSpecsCard({
  meta,
  notes,
  isInterior,
}: ProjectSpecsCardProps) {
  const hasAreaData = !isInterior && (meta.luas_tanah || meta.luas_bangunan)

  return (
    <div className="space-y-4">
      {/* Area specs — Architecture & Civil only */}
      {hasAreaData && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground font-medium mb-1">
              <Maximize2 className="h-3 w-3" /> Land Area
            </div>
            <p className="text-xl font-bold text-foreground">
              {meta.luas_tanah || '—'}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                m²
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground font-medium mb-1">
              <Building2 className="h-3 w-3" /> Building Area
            </div>
            <p className="text-xl font-bold text-foreground">
              {meta.luas_bangunan || '—'}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                m²
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Scope area — Interior only */}
      {meta.area_scope && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs font-semibold text-foreground mb-1">
            Scope Area
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {meta.area_scope}
          </p>
        </div>
      )}

      {/* Notes */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Notes</p>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {notes || 'No notes for this project.'}
        </p>
      </div>
    </div>
  )
}
