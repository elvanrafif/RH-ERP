import type {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from '@hello-pangea/dnd'
import type { Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RowActions } from '@/components/shared/RowActions'
import { ClientName } from '@/components/shared/ClientName'
import { KanbanNotesSection } from '../components/KanbanNotesSection'
import { KanbanCardFooter } from '../components/KanbanCardFooter'
import { Pencil, Trash2, Ruler, Maximize2 } from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'

export interface ArchKanbanCardProps {
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

export function ArchKanbanCard({
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
}: ArchKanbanCardProps) {
  const contractValue = task.expand?.invoice_id?.total_amount
  const notes = task.notes

  return (
    <Card
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={onView}
      className={`shadow-sm hover:shadow-md transition-all duration-200 group border-l-4
        ${canEdit && !task.is_on_hold ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${task.is_on_hold ? 'border-l-orange-300 border-dashed opacity-70' : 'border-l-blue-400'}
        ${isDragging ? 'rotate-2 shadow-xl ring-2 ring-primary/20 z-50' : ''}`}
    >
      <CardContent className="p-3 space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 font-medium uppercase border bg-blue-50 text-blue-700 border-blue-200"
            >
              architecture
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

        {(Number(task.luas_tanah) > 0 || Number(task.luas_bangunan) > 0) && (
          <div className="flex justify-center gap-2 flex-wrap text-xs text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
            {Number(task.luas_tanah) > 0 && (
              <span className="flex items-center gap-1" title="Land Area">
                <Maximize2 className="h-3 w-3 text-slate-400" />
                Land: <span className="font-medium">{task.luas_tanah}m²</span>
              </span>
            )}
            {Number(task.luas_tanah) > 0 && Number(task.luas_bangunan) > 0 && (
              <span className="text-slate-300">|</span>
            )}
            {Number(task.luas_bangunan) > 0 && (
              <span className="flex items-center gap-1" title="Building Area">
                <Ruler className="h-3 w-3 text-slate-400" />
                Building: <span className="font-medium">{task.luas_bangunan}m²</span>
              </span>
            )}
          </div>
        )}

        {notes && <KanbanNotesSection notes={notes} />}

        <KanbanCardFooter
          assignee={task.expand?.assignee}
          deadline={task.deadline}
          avatarFallbackClass="bg-blue-100 text-blue-700"
        />
      </CardContent>
    </Card>
  )
}
