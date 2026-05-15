import { Maximize2, Building2, ExternalLink } from 'lucide-react'

interface ProjectSpecsCardProps {
  luasTanah?: number
  luasBangunan?: number
  areaScope?: string
  notes: string | undefined
  isInterior: boolean
  additionalLinks?: Array<{ label?: string; url: string } | string>
}

type LinkEntry = { label?: string; url: string }

function normalizeLink(v: { label?: string; url: string } | string): LinkEntry {
  return typeof v === 'string' ? { url: v } : v
}

export function ProjectSpecsCard({
  luasTanah,
  luasBangunan,
  areaScope,
  notes,
  isInterior,
  additionalLinks,
}: ProjectSpecsCardProps) {
  return (
    <div className="space-y-4">
      {/* Area specs — Architecture & Civil only */}
      {!isInterior && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground font-medium mb-1">
              <Maximize2 className="h-3 w-3" /> Land Area
            </div>
            <p className="text-xl font-bold text-foreground">
              {(luasTanah ?? 0) > 0 ? luasTanah : '—'}
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
              {(luasBangunan ?? 0) > 0 ? luasBangunan : '—'}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                m²
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Scope area — Interior only */}
      {areaScope && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs font-semibold text-foreground mb-1">
            Scope Area
          </p>
          <p className="text-sm text-foreground leading-relaxed">{areaScope}</p>
        </div>
      )}

      {/* Additional Links */}
      {additionalLinks && additionalLinks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">
            Additional Links
          </p>
          <div className="space-y-1.5">
            {additionalLinks.map((raw, i) => {
              const { label, url } = normalizeLink(raw)
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-primary hover:bg-muted/60 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  {label ? (
                    <>
                      <span className="shrink-0 font-medium text-foreground">
                        {label}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="truncate text-primary">{url}</span>
                    </>
                  ) : (
                    <span className="truncate">{url}</span>
                  )}
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Notes</p>
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {notes || 'No notes for this project.'}
          </p>
        </div>
      </div>
    </div>
  )
}
