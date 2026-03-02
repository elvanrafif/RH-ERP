import type { Project } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, CalendarRange, CalendarClock, ArrowRight } from 'lucide-react'
import { formatDateLong, getAvatarUrl, getInitials, getRemainingTime } from '@/lib/helpers'

interface ProjectPicTimelineCardProps {
  picData: string | undefined
  isCivil: boolean
  project: Project
}

export function ProjectPicTimelineCard({
  picData,
  isCivil,
  project,
}: ProjectPicTimelineCardProps) {
  return (
    <div className="bg-white p-0 rounded-xl border shadow-sm relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />

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
            <p className="text-sm font-bold text-slate-900">{picData || 'Unassigned'}</p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50/40 p-5 border-t border-indigo-100 flex-1 flex flex-col justify-center">
        {isCivil ? (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs font-bold text-indigo-900/70 uppercase tracking-wider flex items-center">
                <CalendarRange className="h-4 w-4 mr-1.5" /> Contract Timeline
              </span>
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
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-900/70 uppercase tracking-wider flex items-center">
              <CalendarClock className="h-4 w-4 mr-1.5" /> Target Deadline
            </span>
            <div className="bg-white px-3 py-1.5 rounded-md border border-indigo-100 shadow-sm flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-indigo-700">
                {formatDateLong(project.deadline)}
              </span>
              <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase">
                {getRemainingTime(project.deadline)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
