import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { pb } from '@/lib/pocketbase'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  CalendarClock,
  Pencil,
  Trash2,
  MapPin,
  Ruler,
  Maximize2,
  CalendarRange,
  StickyNote,
  Eye,
} from 'lucide-react'

// Import Komponen Detail Baru
import { ProjectDetailsModal } from './ProjectDetailsModal'
import {
  formatDateShort,
  getAvatarUrl,
  getInitials,
  getRemainingTime,
} from '@/lib/helpers'

// --- TYPES & INTERFACES ---
export type KanbanColumnDefinition = {
  id: string
  title: string
  colorClass?: string
}

interface KanbanProps {
  data: Project[]
  columnsConfig: KanbanColumnDefinition[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onStatusChange: (id: string, status: string) => void
}

interface KanbanState {
  tasks: Record<string, Project>
  columns: Record<string, { id: string; title: string; taskIds: string[] }>
  columnOrder: string[]
}

// --- COMPONENT ---
export default function ProjectKanban({
  data,
  columnsConfig,
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanProps) {
  const [boardData, setBoardData] = useState<KanbanState>({
    tasks: {},
    columns: {},
    columnOrder: [],
  })

  // State Modal Detail
  const [projectToView, setProjectToView] = useState<Project | null>(null)

  useEffect(() => {
    if (data && columnsConfig) {
      const newTasks: Record<string, Project> = {}
      const newColumns: Record<string, any> = {}
      const newColumnOrder = columnsConfig.map((c) => c.id)

      columnsConfig.forEach((col) => {
        newColumns[col.id] = { id: col.id, title: col.title, taskIds: [] }
      })

      data.forEach((project) => {
        newTasks[project.id] = project
        const statusKey =
          project.status && newColumns[project.status]
            ? project.status
            : newColumnOrder[0]
        if (newColumns[statusKey]) {
          newColumns[statusKey].taskIds.push(project.id)
        }
      })

      setBoardData({
        tasks: newTasks,
        columns: newColumns,
        columnOrder: newColumnOrder,
      })
    }
  }, [data, columnsConfig])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return

    const startCol = boardData.columns[source.droppableId]
    const finishCol = boardData.columns[destination.droppableId]

    if (startCol === finishCol) {
      const newTaskIds = Array.from(startCol.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)
      const newColumn = { ...startCol, taskIds: newTaskIds }
      setBoardData((prev) => ({
        ...prev,
        columns: { ...prev.columns, [newColumn.id]: newColumn },
      }))
    } else {
      const startTaskIds = Array.from(startCol.taskIds)
      startTaskIds.splice(source.index, 1)
      const newStart = { ...startCol, taskIds: startTaskIds }

      const finishTaskIds = Array.from(finishCol.taskIds)
      finishTaskIds.splice(destination.index, 0, draggableId)
      const newFinish = { ...finishCol, taskIds: finishTaskIds }

      setBoardData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      }))

      onStatusChange(draggableId, destination.droppableId)
    }
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full gap-4 overflow-x-auto pb-4 pt-2 px-1">
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId]
            if (!column) return null
            const tasksInColumn = column.taskIds.map(
              (taskId) => boardData.tasks[taskId]
            )

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
                      className={`flex-1 p-2 space-y-3 overflow-y-auto min-h-[100px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {tasksInColumn.map((task, index) => {
                        if (!task) return null
                        const assignee = (() => {
                          if (task.type == 'sipil')
                            return task.meta_data.pic_lapangan
                          if (task.type == 'interior')
                            return task.meta_data.pic_interior
                          return task.expand?.assignee?.name
                        })()
                        const clientName =
                          task.expand?.client?.company_name || 'Unknown Client'

                        const meta = task.meta_data || {}
                        const notes = meta.notes || (task as any).notes

                        const isInterior = task.type === 'interior'
                        const isSipil = task.type === 'sipil'
                        const isArsitektur = task.type === 'arsitektur'

                        return (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-grab active:cursor-grabbing shadow-sm hover:shadow-xl transition-all duration-300 group border-l-4 ${
                                  isInterior
                                    ? 'border-l-emerald-400'
                                    : isSipil
                                      ? 'border-l-amber-400'
                                      : 'border-l-blue-400'
                                } ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-primary/20 z-50' : ''}`}
                              >
                                <CardContent className="p-3 space-y-2">
                                  {/* Header */}
                                  <div className="flex justify-between items-start">
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-1.5 py-0 h-5 font-normal text-slate-500 uppercase"
                                    >
                                      {task.type}
                                    </Badge>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 -mr-2 -mt-1 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => setProjectToView(task)}
                                        >
                                          <Eye className="mr-2 h-4 w-4" /> View
                                          Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => onEdit(task)}
                                        >
                                          <Pencil className="mr-2 h-4 w-4" />{' '}
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => onDelete(task)}
                                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />{' '}
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  {/* Client Name */}
                                  <div>
                                    <h4
                                      className="font-semibold text-sm leading-snug text-slate-900 line-clamp-2"
                                      title={clientName}
                                    >
                                      {clientName}
                                    </h4>
                                  </div>

                                  {/* --- INFO KHUSUS --- */}
                                  {isInterior && meta.area_scope && (
                                    <div className="flex items-start text-xs text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded-md border border-emerald-100">
                                      <MapPin className="h-3 w-3 mr-1.5 mt-0.5 shrink-0" />
                                      <span className="line-clamp-2 font-medium">
                                        {meta.area_scope}
                                      </span>
                                    </div>
                                  )}

                                  {(isArsitektur || isSipil) &&
                                    (meta.luas_tanah || meta.luas_bangunan) && (
                                      <div className="flex justify-center gap-2 flex-wrap text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                                        {meta.luas_tanah && (
                                          <span
                                            className="flex items-center gap-1"
                                            title="Land Area"
                                          >
                                            <Maximize2 className="h-3 w-3 text-slate-400" />
                                            Land:{' '}
                                            <span className="font-medium">
                                              {meta.luas_tanah}m²
                                            </span>
                                          </span>
                                        )}
                                        {meta.luas_tanah &&
                                          meta.luas_bangunan && (
                                            <span className="text-slate-300">
                                              |
                                            </span>
                                          )}
                                        {meta.luas_bangunan && (
                                          <span
                                            className="flex items-center gap-1"
                                            title="Building Area"
                                          >
                                            <Ruler className="h-3 w-3 text-slate-400" />
                                            Bldg:{' '}
                                            <span className="font-medium">
                                              {meta.luas_bangunan}m²
                                            </span>
                                          </span>
                                        )}
                                      </div>
                                    )}

                                  {isSipil &&
                                    task.start_date &&
                                    task.end_date && (
                                      <div className="flex items-center text-[10px] text-amber-700 bg-amber-50 px-1.5 py-1 rounded border border-amber-100">
                                        <CalendarRange className="h-3 w-3 mr-1.5 shrink-0" />
                                        <span>
                                          {formatDateShort(task.start_date)} -{' '}
                                          {formatDateShort(task.end_date)}
                                        </span>
                                      </div>
                                    )}

                                  {/* --- NOTES SECTION (SMOOTH EXPAND) --- */}
                                  {notes && (
                                    <div className="bg-yellow-50/50 p-2 rounded border border-yellow-100/50 text-[10px] text-slate-500">
                                      <div className="flex items-start gap-1.5">
                                        <StickyNote className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                                        <div className="max-h-[18px] group-hover:max-h-[200px] overflow-hidden transition-[max-height] duration-500 ease-in-out">
                                          <p className="italic leading-relaxed">
                                            {notes}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Footer */}
                                  <div className="pt-2 border-t flex items-center justify-between mt-1">
                                    <div className="flex flex-col gap-1">
                                      {(!isSipil || !task.end_date) && (
                                        <div
                                          className="flex items-center gap-1.5 text-[10px] text-slate-400"
                                          title="Deadline"
                                        >
                                          <div className="flex items-center">
                                            <CalendarClock className="h-3 w-3 mr-1" />
                                            {formatDateShort(task.deadline)}
                                          </div>
                                          {task.deadline && (
                                            <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded uppercase leading-none">
                                              {getRemainingTime(task.deadline)}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      {isSipil && task.end_date && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                          <span className="italic">
                                            Until{' '}
                                            {formatDateShort(task.end_date)}
                                          </span>
                                          <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded uppercase leading-none">
                                            {getRemainingTime(task.end_date)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Avatar className="h-6 w-6 border border-white shadow-sm">
                                            <AvatarImage
                                              src={getAvatarUrl(assignee) || ''}
                                            />
                                            <AvatarFallback
                                              className={`text-[9px] ${
                                                isInterior
                                                  ? 'bg-emerald-100 text-emerald-700'
                                                  : isSipil
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-blue-100 text-blue-700'
                                              }`}
                                            >
                                              {getInitials(assignee)}
                                            </AvatarFallback>
                                          </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{assignee || 'Unassigned'}</p>
                                          {meta.pic_lapangan && (
                                            <p className="text-[10px] text-slate-300">
                                              Supervisor: {meta.pic_lapangan}
                                            </p>
                                          )}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </CardContent>
                              </Card>
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

      {/* --- RENDER COMPONENT MODAL BARU --- */}
      <ProjectDetailsModal
        project={projectToView}
        open={!!projectToView}
        onOpenChange={(open) => !open && setProjectToView(null)}
      />
    </>
  )
}
