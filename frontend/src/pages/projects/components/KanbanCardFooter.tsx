import type { User } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CalendarClock } from 'lucide-react'
import {
  formatDateShort,
  getAvatarUrl,
  getInitials,
  getRemainingTime,
} from '@/lib/helpers'

interface KanbanCardFooterProps {
  assignee: User | undefined
  deadline?: string | null
  avatarFallbackClass: string
  vendorName?: string
}

export function KanbanCardFooter({
  assignee,
  deadline,
  avatarFallbackClass,
  vendorName,
}: KanbanCardFooterProps) {
  return (
    <div className="pt-2 border-t flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Deadline">
        <CalendarClock className="h-3 w-3 shrink-0" />
        <span>{formatDateShort(deadline)}</span>
        {deadline && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded uppercase leading-none">
            {getRemainingTime(deadline)}
          </span>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger>
          <Avatar className="h-6 w-6 border border-white shadow-sm cursor-pointer">
            <AvatarImage src={getAvatarUrl(assignee) || ''} />
            <AvatarFallback className={`text-[10px] ${avatarFallbackClass}`}>
              {getInitials(assignee?.name)}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>PIC: {assignee?.name || 'Unassigned'}</p>
          {vendorName && (
            <p className="text-[10px] text-slate-300">Vendor: {vendorName}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
