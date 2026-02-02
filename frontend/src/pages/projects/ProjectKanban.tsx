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
import { MoreHorizontal, CalendarClock, Pencil, Trash2, MapPin, Ruler } from "lucide-react"

// --- TYPES & INTERFACES ---
export type KanbanColumnDefinition = {
    id: string;
    title: string;
    colorClass?: string;
};

interface KanbanProps {
    data: Project[];
    columnsConfig: KanbanColumnDefinition[]; // PROP BARU: Config Kolom
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
    onStatusChange: (id: string, status: string) => void;
}

interface KanbanState {
  tasks: Record<string, Project>;
  columns: Record<string, { id: string; title: string; taskIds: string[] }>;
  columnOrder: string[];
}

// --- HELPERS ---
const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', maximumFractionDigits: 0
    }).format(val);
}

const getInitials = (name?: string) => name ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "??";
const getAvatarUrl = (user?: any) => user?.avatar ? pb.files.getUrl(user, user.avatar) : null;

// --- COMPONENT ---
export default function ProjectKanban({ data, columnsConfig, onEdit, onDelete, onStatusChange }: KanbanProps) {
  
  const [boardData, setBoardData] = useState<KanbanState>({
    tasks: {}, columns: {}, columnOrder: []
  });

  useEffect(() => {
    if (data && columnsConfig) {
      const newTasks: Record<string, Project> = {};
      const newColumns: Record<string, any> = {};
      const newColumnOrder = columnsConfig.map(c => c.id);

      // Setup Columns Structure
      columnsConfig.forEach(col => {
          newColumns[col.id] = { id: col.id, title: col.title, taskIds: [] };
      });

      // Distribute Projects to Columns
      data.forEach((project) => {
        newTasks[project.id] = project;
        // Fallback: Jika status project tidak dikenali di config halaman ini, masuk ke kolom pertama
        const statusKey = (project.status && newColumns[project.status]) ? project.status : newColumnOrder[0];
        if (newColumns[statusKey]) {
            newColumns[statusKey].taskIds.push(project.id);
        }
      });

      setBoardData({
        tasks: newTasks,
        columns: newColumns,
        columnOrder: newColumnOrder
      });
    }
  }, [data, columnsConfig]);

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
        <div className="flex h-full gap-4 overflow-x-auto pb-4 pt-2 px-1">
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId];
            if (!column) return null;
            const tasksInColumn = column.taskIds.map((taskId) => boardData.tasks[taskId]);

            return (
              <div key={column.id} className="flex flex-col w-[300px] min-w-[300px] bg-slate-50/80 rounded-xl border h-full max-h-full shadow-sm">
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
                        snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                      }`}
                    >
                      {tasksInColumn.map((task, index) => {
                         if (!task) return null;
                         const assignee = task.expand?.assignee;
                         const clientName = task.expand?.client?.company_name || "Unknown Client"; // Perhatikan expand.client
                         
                         // Logic tampilan khusus per tipe di Card
                         const showAreaScope = task.type === 'interior' && task.meta_data?.area_scope;
                         const showLtLb = (task.type === 'arsitektur' || task.type === 'sipil') && task.meta_data?.luas_bangunan;

                         return (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                                <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all group border-l-4 ${
                                    task.type === 'interior' ? 'border-l-emerald-400' : 
                                    task.type === 'sipil' ? 'border-l-amber-400' : 'border-l-blue-400'
                                } ${snapshot.isDragging ? "rotate-2 shadow-xl ring-2 ring-primary/20 z-50" : ""}`}
                                >
                                <CardContent className="p-3 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal text-slate-500">
                                            {task.type.toUpperCase()}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(task)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(task)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold text-sm leading-snug mb-1 text-slate-800">
                                            {/* Nama Client jadi Judul Utama */}
                                            {clientName}
                                        </h4>
                                        {/* Meta Data Info Display */}
                                        {showAreaScope && (
                                            <div className="flex items-center text-xs text-emerald-600 mt-1 font-medium bg-emerald-50 w-fit px-1.5 rounded">
                                                <MapPin className="h-3 w-3 mr-1" /> {task.meta_data.area_scope}
                                            </div>
                                        )}
                                        {showLtLb && (
                                            <div className="flex items-center text-[10px] text-slate-500 mt-1">
                                                <Ruler className="h-3 w-3 mr-1" /> LB: {task.meta_data.luas_bangunan}m²
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 border-t flex items-center justify-between mt-1">
                                        <div className="flex flex-col">
                                            <div className="flex items-center text-[10px] text-slate-400">
                                                <CalendarClock className="h-3 w-3 mr-1" />
                                                {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'}) : '-'}
                                            </div>
                                        </div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Avatar className="h-6 w-6 border border-white shadow-sm">
                                                        <AvatarImage src={getAvatarUrl(assignee) || ""} />
                                                        <AvatarFallback className="text-[9px] bg-slate-100 text-slate-600">
                                                            {getInitials(assignee?.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </TooltipTrigger>
                                                <TooltipContent><p>{assignee?.name || "Unassigned"}</p></TooltipContent>
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