import { useMemo } from "react"
import type { Project } from "@/types"
import { getColumns } from "./columns"
import { DataTable } from "@/components/ui/data-table"

interface ProjectTableProps {
    data: Project[];
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}

export function ProjectTable({ data, onEdit, onDelete }: ProjectTableProps) {
    const columns = useMemo(() => getColumns(onEdit, onDelete), [onEdit, onDelete]);

    return (
        <div className="bg-white rounded-md border">
            <DataTable columns={columns} data={data} />
        </div>
    )
}