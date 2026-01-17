import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import type { DropResult } from "@hello-pangea/dnd"
import { pb } from "@/lib/pocketbase"
import type { Project } from "@/types"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CalendarClock, Pencil, Trash2 } from "lucide-react"

interface KanbanProps {
    data: Project[];
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
    onStatusChange: (id: string, status: string) => void;
}

interface KanbanState {
  tasks: Record<string, Project>;
  columns: Record<string, { id: string; title: string; taskIds: string[] }>;
  columnOrder: string[];
}

const initialColumns = {
  'todo': { id: 'todo', title: 'To Do / Baru', taskIds: [] },
  'doing': { id: 'doing', title: 'In Progress', taskIds: [] },
  'review': { id: 'review', title: 'QC / Review', taskIds: [] },
  'done': { id: 'done', title: 'Selesai', taskIds: [] },
};

const getBadgeColor = (type: string) => {
    switch (type) {
      case 'design': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'sipil': return "bg-amber-100 text-amber-800 border-amber-200";
      case 'others': return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-gray-100";
    }
}

const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val);
}

const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

const getAvatarUrl = (user?: any) => {
    if (!user || !user.avatar) return null;
    return pb.files.getUrl(user, user.avatar);
}

export default function ProjectKanban({ data, onEdit, onDelete, onStatusChange }: KanbanProps) {
  
  const [boardData, setBoardData] = useState<KanbanState>({
    tasks: {},
    columns: initialColumns,
    columnOrder: ['todo', 'doing', 'review', 'done']
  });

  useEffect(() => {
    if (data) {
      const newTasks: Record<string, Project> = {};
      const newColumns: Record<string, { id: string; title: string; taskIds: string[] }> = {
        'todo': { id: 'todo', title: 'To Do / Baru', taskIds: [] },
        'doing': { id: 'doing', title: 'In Progress', taskIds: [] },
        'review': { id: 'review', title: 'QC / Review', taskIds: [] },
        'done': { id: 'done', title: 'Selesai', taskIds: [] },
      };

      data.forEach((project) => {
        newTasks[project.id] = project;
        const statusKey = (project.status && newColumns[project.status]) ? project.status : 'todo';
        newColumns[statusKey].taskIds.push(project.id);
      });

      setBoardData({
        tasks: newTasks,
        columns: newColumns,
        columnOrder: ['todo', 'doing', 'review', 'done']
      });
    }
  }, [data]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startCol = boardData.columns[source.droppableId];
    const finishCol = boardData.columns[destination.droppableId];

    if (startCol === finishCol) {
      const newTaskIds = Array.from(startCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...startCol, taskIds: newTaskIds };
      setBoardData(prev => ({ ...prev, columns: { ...prev.columns, [newColumn.id]: newColumn } }));
    } else {
      const startTaskIds = Array.from(startCol.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = { ...startCol, taskIds: startTaskIds };

      const finishTaskIds = Array.from(finishCol.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = { ...finishCol, taskIds: finishTaskIds };

      setBoardData(prev => ({
        ...prev,
        columns: { ...prev.columns, [newStart.id]: newStart, [newFinish.id]: newFinish }
      }));

      onStatusChange(draggableId, destination.droppableId);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full gap-6 overflow-x-auto pb-4 pt-2">
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId];
            const tasksInColumn = column.taskIds.map((taskId) => boardData.tasks[taskId]);

            return (
              <div key={column.id} className="flex flex-col w-[320px] min-w-[320px] bg-slate-50/50 rounded-xl border h-full max-h-full">
                <div className="p-4 font-semibold text-sm flex items-center justify-between border-b bg-white rounded-t-xl sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        {column.title}
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs border">
                            {tasksInColumn.length}
                        </span>
                    </div>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-3 space-y-3 overflow-y-auto min-h-[100px] transition-colors ${
                        snapshot.isDraggingOver ? "bg-slate-100/50" : ""
                      }`}
                    >
                      {tasksInColumn.map((task, index) => {
                         if (!task) return null;
                         const assignee = task.expand?.assignee;
                         const clientName = task.expand?.client_id?.company_name || "Unknown Client";

                         return (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                                <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all group ${
                                    snapshot.isDragging ? "rotate-2 shadow-xl ring-2 ring-primary/20 z-50" : ""
                                }`}
                                >
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className={`${getBadgeColor(task.type)} text-[10px] px-2 py-0.5`}>
                                            {(task.type || 'others').toUpperCase()}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(task)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Detail
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(task)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus Project
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">{task.name}</h4>
                                        <p className="text-xs text-muted-foreground truncate">{clientName}</p>
                                    </div>
                                    <div className="pt-3 border-t flex items-center justify-between mt-2">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center text-[10px] text-slate-500">
                                                <CalendarClock className="h-3 w-3 mr-1" />
                                                {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'}) : '-'}
                                            </div>
                                            <span className="text-xs font-medium text-slate-700">{formatRupiah(task.value)}</span>
                                        </div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Avatar className="h-7 w-7 border-2 border-white shadow-sm cursor-help">
                                                        <AvatarImage src={getAvatarUrl(assignee) || ""} />
                                                        <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                                                            {getInitials(assignee?.name || "??")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{assignee?.name || "Belum ada PIC"}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </CardContent>
                                </Card>
                            )}
                            </Draggable>
                         );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
    </DragDropContext>
  )
}