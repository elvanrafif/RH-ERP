import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type {
  DropResult,
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from '@hello-pangea/dnd'
import type { Project } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RowActions } from '@/components/shared/RowActions'
import { ClientName } from '@/components/shared/ClientName'
import {
  CalendarClock,
  Pencil,
  Trash2,
  Ruler,
  Maximize2,
  StickyNote,
  ChevronDown,
  ChevronUp,
  FolderOpen,
} from 'lucide-react'
import {
  formatDateShort,
  formatRupiah,
  getAvatarUrl,
  getInitials,
  getRemainingTime,
} from '@/lib/helpers'
import { useRole } from '@/hooks/useRole'
import { canEditProject } from '@/lib/projects/permissions'

export type KanbanColumnDefinition = {
  id: string
  title: string
}

interface KanbanState {
  tasks: Record<string, Project>
  columns: Record<string, { id: string; title: string; taskIds: string[] }>
  columnOrder: string[]
}

function buildKanbanState(
  data: Project[],
  columnsConfig: KanbanColumnDefinition[]
): KanbanState {
  const tasks: Record<string, Project> = {}
  const columns: Record<
    string,
    { id: string; title: string; taskIds: string[] }
  > = {}
  const columnOrder = columnsConfig.map((c) => c.id)

  columnsConfig.forEach((col) => {
    columns[col.id] = { id: col.id, title: col.title, taskIds: [] }
  })

  data.forEach((project) => {
    tasks[project.id] = project
    const statusKey =
      project.status && columns[project.status]
        ? project.status
        : columnOrder[0]
    if (columns[statusKey]) columns[statusKey].taskIds.push(project.id)
  })

  return { tasks, columns, columnOrder }
}

interface ProjectArchitectureKanbanProps {
  data: Project[]
  columnsConfig: KanbanColumnDefinition[]
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onStatusChange: (id: string, status: string) => void
}

export default function ProjectArchitectureKanban({
  data,
  columnsConfig,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: ProjectArchitectureKanbanProps) {
  const { isSuperAdmin, user } = useRole()
  const [boardData, setBoardData] = useState<KanbanState>({
    tasks: {},
    columns: {},
    columnOrder: [],
  })

  useEffect(() => {
    if (data && columnsConfig)
      setBoardData(buildKanbanState(data, columnsConfig))
  }, [data, columnsConfig])

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result
      if (!destination) return
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return

      const draggedTask = boardData.tasks[draggableId]
      if (!canEditProject(draggedTask, user, isSuperAdmin)) return

      const startCol = boardData.columns[source.droppableId]
      const finishCol = boardData.columns[destination.droppableId]

      if (startCol === finishCol) {
        const newTaskIds = Array.from(startCol.taskIds)
        newTaskIds.splice(source.index, 1)
        newTaskIds.splice(destination.index, 0, draggableId)
        setBoardData((prev) => ({
          ...prev,
          columns: {
            ...prev.columns,
            [startCol.id]: { ...startCol, taskIds: newTaskIds },
          },
        }))
      } else {
        const startTaskIds = Array.from(startCol.taskIds)
        startTaskIds.splice(source.index, 1)
        const finishTaskIds = Array.from(finishCol.taskIds)
        finishTaskIds.splice(destination.index, 0, draggableId)
        setBoardData((prev) => ({
          ...prev,
          columns: {
            ...prev.columns,
            [startCol.id]: { ...startCol, taskIds: startTaskIds },
            [finishCol.id]: { ...finishCol, taskIds: finishTaskIds },
          },
        }))
        onStatusChange(draggableId, destination.droppableId)
      }
    },
    [boardData, user, isSuperAdmin, onStatusChange]
  )

  return (
    <TooltipProvider>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full gap-4 overflow-x-auto pb-4 pt-2 px-1">
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId]
            if (!column) return null
            const tasksInColumn = column.taskIds.map((id) => boardData.tasks[id])

            return (
              <div
                key={column.id}
                className="flex flex-col w-[320px] min-w-[320px] bg-slate-50/80 rounded-xl border h-full max-h-full shadow-sm"
              >
                <div className="p-3 font-semibold text-sm flex items-center justify-between border-b bg-white/50 backdrop-blur-sm rounded-t-xl sticky top-0 z-10">
                  <div className="flex items-center gap-2 text-slate-700">
                    {column.title}
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] border">
                      {tasksInColumn.length}
                    </span>
                  </div>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-2 space-y-3 overflow-y-auto min-h-[100px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                    >
                      {tasksInColumn.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-300 border-2 border-dashed border-slate-200 rounded-lg mx-0.5">
                          <FolderOpen className="h-5 w-5" />
                          <p className="text-xs">No projects</p>
                        </div>
                      )}
                      {tasksInColumn.map((task, index) => {
                        if (!task) return null
                        const canEdit = canEditProject(task, user, isSuperAdmin)
                        return (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                            isDragDisabled={!canEdit || !!task.is_on_hold}
                          >
                            {(provided, snapshot) => (
                              <KanbanCard
                                task={task}
                                canEdit={canEdit}
                                isSuperAdmin={isSuperAdmin ?? false}
                                isDragging={snapshot.isDragging}
                                draggableProps={provided.draggableProps}
                                dragHandleProps={provided.dragHandleProps}
                                innerRef={provided.innerRef}
                                onView={() => onView(task)}
                                onEdit={() => onEdit(task)}
                                onDelete={() => onDelete(task)}
                              />
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </TooltipProvider>
  )
}

interface KanbanCardProps {
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

function KanbanCard({
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
}: KanbanCardProps) {
  const [showNotes, setShowNotes] = useState(false)
  const assignee = task.expand?.assignee
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
                Building:{' '}
                <span className="font-medium">{task.luas_bangunan}m²</span>
              </span>
            )}
          </div>
        )}

        {notes && (
          <div className="rounded border border-yellow-100 overflow-hidden bg-yellow-50/40">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowNotes((v) => !v)
              }}
              className="flex items-center justify-between w-full px-2 py-1.5 text-left cursor-pointer hover:bg-yellow-50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <StickyNote className="h-3 w-3 text-yellow-500 shrink-0" />
                <span className="text-xs text-yellow-600 font-medium">Notes</span>
              </div>
              {showNotes ? (
                <ChevronUp className="h-3 w-3 text-yellow-500" />
              ) : (
                <ChevronDown className="h-3 w-3 text-yellow-500" />
              )}
            </button>
            {showNotes && (
              <p className="px-2 pb-2 text-xs text-slate-500 italic leading-relaxed">
                {notes}
              </p>
            )}
          </div>
        )}

        <div className="pt-2 border-t flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 text-xs text-slate-400"
            title="Deadline"
          >
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
                <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                  {getInitials(assignee?.name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>PIC: {assignee?.name || 'Unassigned'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}
