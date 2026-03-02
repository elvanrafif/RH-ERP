import type { Project } from '@/types'
import { Ruler, StickyNote, Building2, Maximize2, Banknote } from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'

interface ProjectSpecsCardProps {
  meta: Project['meta_data']
  notes: string | undefined
  isSuperAdmin: boolean
  contractValue: number
  isInterior: boolean
}

export function ProjectSpecsCard({
  meta,
  notes,
  isSuperAdmin,
  contractValue,
  isInterior,
}: ProjectSpecsCardProps) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-slate-50/80 px-4 py-2 border-b flex items-center justify-between">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
          <Ruler className="h-3 w-3 mr-1.5" /> Specifications & Details
        </h4>
        {isSuperAdmin && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Contract Value:</span>
            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border shadow-sm">
              {formatRupiah(contractValue || 0)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 space-y-3 border-r-0 md:border-r border-slate-100 pr-0 md:pr-4 pb-4 md:pb-0 border-b md:border-b-0">
          {!isInterior && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                <span className="flex items-center justify-center text-[10px] text-muted-foreground uppercase mb-1">
                  <Maximize2 className="h-3 w-3 mr-2" /> Land Area
                </span>
                <span className="font-bold text-slate-700 text-lg">
                  {meta.luas_tanah || '-'}{' '}
                  <span className="text-[14px] font-normal">m²</span>
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                <span className="flex items-center justify-center text-[10px] text-muted-foreground uppercase mb-1">
                  <Building2 className="h-3 w-3 mr-2" /> Building Area
                </span>
                <span className="font-bold text-slate-700 text-lg">
                  {meta.luas_bangunan || '-'}{' '}
                  <span className="text-[14px] font-normal">m²</span>
                </span>
              </div>
            </div>
          )}

          {meta.area_scope && (
            <div className="bg-emerald-50/50 p-3 rounded border border-emerald-100">
              <span className="block text-[10px] text-emerald-600 font-bold uppercase mb-1">
                Scope Area
              </span>
              <p className="text-xs font-medium leading-relaxed text-emerald-900">
                {meta.area_scope}
              </p>
            </div>
          )}
        </div>

        <div className="md:col-span-7 relative">
          <span className="absolute -top-1 left-0 text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            <StickyNote className="h-3 w-3 mr-1" /> Notes
          </span>
          <div className="mt-5 h-full min-h-[80px] text-xs leading-relaxed text-slate-600 whitespace-pre-line p-1">
            {notes || 'No specific notes for this project.'}
          </div>
        </div>
      </div>
    </div>
  )
}
