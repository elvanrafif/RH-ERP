import type { Project } from '@/types'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CalendarClock,
  User,
  Ruler,
  StickyNote,
  Building2,
  Phone,
  Mail,
  MapPin,
  Maximize2,
  Banknote,
  CalendarRange,
  ArrowRight,
} from 'lucide-react'
import {
  calculateDuration,
  formatDateLong,
  formatRupiah,
  getAvatarUrl,
  getInitials,
  getRemainingTime,
} from '@/lib/helpers'
import { TypeProjectsBoolean } from '@/lib/booleans'
import { useRole } from '@/hooks/useRole'

// --- PROPS ---
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
  if (!project) return null

  const { isSuperAdmin } = useRole()

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
      {/* FIX RESPONSIVE:
               1. max-h-[90vh]: Limits modal height to 90% of screen.
               2. flex flex-col: Allows header, body, footer arrangement.
               3. p-0: Manual padding per section for neat scrollbar.
            */}
      <DialogContent className="w-[95vw] sm:max-w-[750px] max-h-[90vh] flex flex-col p-0 bg-white gap-0">
        {/* --- HEADER (Fixed at Top) --- */}
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

        {/* --- SCROLLABLE BODY --- */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <div className="space-y-6">
            {/* === ROW 1: CLIENT & (PIC + TIMELINE) === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: CLIENT INFO */}
              <div className="bg-white p-4 rounded-xl border shadow-sm relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center">
                  <Building2 className="h-3 w-3 mr-1.5" /> Client Information
                </h4>

                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      {client?.company_name || 'No Company Name'}
                    </h3>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-start text-xs text-slate-600">
                      <MapPin className="h-3.5 w-3.5 mr-2 mt-0.5 text-slate-400 shrink-0" />
                      <span className="leading-tight">
                        {(client as any)?.address || 'Address not available.'}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-slate-600">
                      <Phone className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                      <span>{client?.phone || '-'}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-600">
                      <Mail className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                      <span>{client?.email || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: PIC & TIMELINE (MERGED) */}
              <div className="bg-white p-0 rounded-xl border shadow-sm relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />

                {/* Top Section: PIC */}
                <div className="p-4 pb-3">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center">
                    <User className="h-3 w-3 mr-1.5" /> Person In Charge
                  </h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-100">
                      <AvatarImage src={getAvatarUrl(picData) || ''} />
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-xs">
                        {getInitials(picData)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {picData || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Timeline (Different Background) */}
                <div className="bg-indigo-50/40 p-5 border-t border-indigo-100 flex-1 flex flex-col justify-center">
                  {isCivil ? (
                    // TAMPILAN KHUSUS SIPIL (CONTRACT TIMELINE & COUNTDOWN)
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-indigo-900/70 uppercase tracking-wider flex items-center">
                          <CalendarRange className="h-4 w-4 mr-1.5" /> Contract
                          Timeline
                        </span>
                        {/* BADGE SISA WAKTU (Warna Amber/Orange agar menjadi pusat perhatian) */}
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 font-bold text-[9px] shadow-sm uppercase tracking-wide"
                        >
                          {getRemainingTime(project.end_date)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 shadow-sm relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400" />

                        <div className="flex flex-col pl-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            Start Date
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {formatDateLong(project.start_date)}
                          </span>
                        </div>

                        <ArrowRight className="h-4 w-4 text-indigo-200 shrink-0 mx-2" />

                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            End Date
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {formatDateLong(project.end_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // TAMPILAN STANDAR (HANYA DEADLINE)
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-900/70 uppercase tracking-wider flex items-center">
                        <CalendarClock className="h-4 w-4 mr-1.5" /> Target
                        Deadline
                      </span>
                      <div className="bg-white px-3 py-1.5 rounded-md border border-indigo-100 shadow-sm flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-indigo-700">
                          {formatDateLong(project.deadline)}
                        </span>
                        {/* Opsional: Tambahkan sisa waktu kecil juga untuk tipe non-sipil */}
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase">
                          {getRemainingTime(project.deadline)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* === ROW 2: SPECIFICATIONS & NOTES (MERGED CARD) === */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {/* Header Section */}
              <div className="bg-slate-50/80 px-4 py-2 border-b flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <Ruler className="h-3 w-3 mr-1.5" /> Specifications & Details
                </h4>
                {isSuperAdmin && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      Contract Value:
                    </span>
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border shadow-sm">
                      {formatRupiah(project.contract_value || 0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* LEFT COLUMN (1/3): TECHNICAL DATA */}
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

                {/* RIGHT COLUMN (2/3): NOTES */}
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
          </div>
        </div>

        {/* --- FOOTER (Fixed at Bottom) --- */}
        <div className="p-6 shrink-0 flex justify-end bg-white/50 backdrop-blur-sm mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
