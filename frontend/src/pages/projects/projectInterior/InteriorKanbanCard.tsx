import type {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from '@hello-pangea/dnd'
import type { Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RowActions } from '@/components/shared/RowActions'
import { ClientName } from '@/components/shared/ClientName'
import { KanbanNotesSection } from '../components/KanbanNotesSection'
import {
  CalendarClock,
  Pencil,
  Trash2,
  MapPin,
} from 'lucide-react'
import {
  formatDateShort,
  formatRupiah,
  getAvatarUrl,
  getInitials,
  getRemainingTime,
} from '@/lib/helpers'

export interface InteriorKanbanCardProps {
  task: Project
  canEdit: boolean
  isSuperAdmin: boolean
  isDragging: boolean
  draggableProps: DraggableProvidedDraggableProps
  dragHandleProps: DraggableProvidedDragHandleProps | null
  innerRef: (el: HTMLElement | null) => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function InteriorKanbanCard({
  task,
  canEdit,
  isSuperAdmin,
  isDragging,
  draggableProps,
  dragHandleProps,
  innerRef,
  onView,
  onEdit,
  onDelete,
}: InteriorKanbanCardProps) {
  const assignee = task.expand?.assignee
  const contractValue = task.expand?.invoice_id?.total_amount
  const meta = task.meta_data || {}
  const notes = task.notes

  return (
    <Card
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={onView}
      className={`shadow-sm hover:shadow-md transition-all duration-200 group border-l-4
        ${canEdit && !task.is_on_hold ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${task.is_on_hold ? 'border-l-orange-300 border-dashed opacity-70' : 'border-l-violet-400'}
        ${isDragging ? 'rotate-2 shadow-xl ring-2 ring-primary/20 z-50' : ''}`}
    >
      <CardContent className="p-3 space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 font-medium uppercase border bg-violet-50 text-violet-700 border-violet-200"
            >
              interior
            </Badge>
            {task.is_on_hold && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-5 font-medium uppercase border bg-orange-50 text-orange-700 border-orange-200"
              >
                ⏸ On Hold
              </Badge>
            )}
          </div>
          <RowActions
            stopPropagation
            actions={
              canEdit
                ? [
                    { label: 'Edit', icon: Pencil, onClick: onEdit },
                    {
                      label: 'Delete',
                      icon: Trash2,
                      onClick: onDelete,
                      variant: 'destructive',
                      separator: true,
                    },
                  ]
                : []
            }
          />
        </div>

        <div>
          <h4
            className="font-semibold text-sm leading-snug text-slate-900 line-clamp-2"
            title={
              task.expand?.client
                ? `${task.expand.client.salutation ? task.expand.client.salutation + ' ' : ''}${task.expand.client.company_name}`
                : 'Unknown Client'
            }
          >
            {task.expand?.client ? (
              <ClientName
                name={task.expand.client.company_name}
                salutation={task.expand.client.salutation}
              />
            ) : (
              'Unknown Client'
            )}
          </h4>
          {isSuperAdmin && contractValue != null && contractValue > 0 && (
            <p className="text-xs text-slate-400 mt-0.5 font-normal">
              {formatRupiah(contractValue)}
            </p>
          )}
        </div>

        {meta.area_scope && (
          <div className="flex items-start text-xs text-violet-700 bg-violet-50 px-2 py-1.5 rounded-md border border-violet-100">
            <MapPin className="h-3 w-3 mr-1.5 mt-0.5 shrink-0" />
            <span className="line-clamp-2 font-medium">{meta.area_scope}</span>
          </div>
        )}

        {notes && <KanbanNotesSection notes={notes} />}

        <div className="pt-2 border-t flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Deadline">
            <CalendarClock className="h-3 w-3 shrink-0" />
            <span>{formatDateShort(task.deadline)}</span>
            {task.deadline && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded uppercase leading-none">
                {getRemainingTime(task.deadline)}
              </span>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="h-6 w-6 border border-white shadow-sm cursor-pointer">
                <AvatarImage src={getAvatarUrl(assignee) || ''} />
                <AvatarFallback className="text-[10px] bg-violet-100 text-violet-700">
                  {getInitials(assignee?.name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>PIC: {assignee?.name || 'Unassigned'}</p>
              {task.expand?.vendor && (
                <p className="text-[10px] text-slate-300">
                  Vendor: {task.expand.vendor.name}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}
