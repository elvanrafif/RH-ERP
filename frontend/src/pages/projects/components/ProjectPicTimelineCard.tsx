import type { Project } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, CalendarClock, CalendarRange, ArrowRight } from 'lucide-react'
import { formatDateLong, getInitials, getRemainingTime } from '@/lib/helpers'

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
    <div className="space-y-3">
      {/* PIC */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Person In Charge
        </p>
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {getInitials(picData)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-foreground">
            {picData || 'Unassigned'}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          {isCivil ? 'Contract Timeline' : 'Target Deadline'}
        </p>

        {isCivil ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-foreground">
                <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatDateLong(project.start_date)}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span>{formatDateLong(project.end_date)}</span>
              </div>
              <Badge
                variant="secondary"
                className="text-[9px] font-bold uppercase bg-red-100 text-red-700 border-red-200"
              >
                {getRemainingTime(project.end_date)}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-foreground">
              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{formatDateLong(project.deadline) || '—'}</span>
            </div>
            <Badge
              variant="secondary"
              className="text-[9px] font-bold uppercase bg-red-100 text-red-700 border-red-200"
            >
              {getRemainingTime(project.deadline)}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
