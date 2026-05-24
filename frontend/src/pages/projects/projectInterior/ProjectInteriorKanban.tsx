import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import type { Project } from '@/types'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FolderOpen } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { canEditProject } from '@/lib/projects/permissions'
import { buildKanbanState, type KanbanColumnDefinition, type KanbanState } from '../components/kanbanUtils'
import { InteriorKanbanCard } from './InteriorKanbanCard'

interface ProjectInteriorKanbanProps {
  data: Project[]
  columnsConfig: KanbanColumnDefinition[]
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onStatusChange: (id: string, status: string) => void
}

export default function ProjectInteriorKanban({
  data,
  columnsConfig,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: ProjectInteriorKanbanProps) {
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
                      className={`flex-1 p-2 space-y-3 overflow-y-auto min-h-[100px] transition-colors ${snapshot.isDraggingOver ? 'bg-violet-50/50' : ''}`}
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
                              <InteriorKanbanCard
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

export type { KanbanColumnDefinition }
