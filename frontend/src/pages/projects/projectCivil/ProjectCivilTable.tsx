import { useMemo } from 'react'
import type { Project } from '@/types'
import { DataTable } from '@/components/ui/data-table'
import { useAuth } from '@/contexts/AuthContext'
import { getSipilColumns } from './columnsSipil'

interface ProjectCivilTableProps {
  data: Project[]
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCivilTable({
  data,
  onView,
  onEdit,
  onDelete,
}: ProjectCivilTableProps) {
  const { isSuperAdmin } = useAuth()

  const columns = useMemo(
    () => getSipilColumns(onView, onEdit, onDelete, isSuperAdmin),
    [onView, onEdit, onDelete, isSuperAdmin]
  )

  return (
    <div className="bg-white rounded-md">
      <DataTable columns={columns} data={data} onRowClick={onView} />
    </div>
  )
}
