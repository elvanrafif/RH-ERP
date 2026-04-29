import { useMemo } from 'react'
import type { Project } from '@/types'
import { DataTable } from '@/components/ui/data-table'
import { getSipilColumns } from './columnsSipil'
import { getColumns } from './columns'
import { TypeProjectsBoolean } from '@/lib/booleans'
import { useAuth } from '@/contexts/AuthContext'

interface ProjectTableProps {
  data: Project[]
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  projectType: string
}

export function ProjectTable({
  data,
  onView,
  onEdit,
  onDelete,
  projectType,
}: ProjectTableProps) {
  let columns
  const { isCivil } = TypeProjectsBoolean(projectType)
  const { isSuperAdmin } = useAuth()
  if (isCivil) {
    columns = useMemo(
      () => getSipilColumns(onView, onEdit, onDelete, isSuperAdmin),
      [onView, onEdit, onDelete, isSuperAdmin]
    )
  } else {
    columns = useMemo(
      () => getColumns(onView, onEdit, onDelete),
      [onView, onEdit, onDelete]
    )
  }

  return (
    <div className="bg-white rounded-md">
      <DataTable
        columns={columns}
        data={data}
        onRowClick={isCivil ? onView : undefined}
      />
    </div>
  )
}
