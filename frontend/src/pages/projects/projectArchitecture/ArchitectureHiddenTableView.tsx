import { useMemo } from 'react'
import type { Project } from '@/types'
import { usePagination } from '@/hooks/usePagination'
import { DataTable } from '@/components/ui/data-table'
import { TablePagination } from '@/components/shared/TablePagination'
import { getArchitectureColumns } from './columns'

interface ArchitectureHiddenTableViewProps {
  filteredProjects: Project[]
  searchQuery: string
  filterPic: string
  filterDeadline: string
  statusFilter: string
  isSuperAdmin: boolean
  onView: (p: Project) => void
  onEdit: (p: Project) => void
  onDelete: (p: Project) => void
}

export function ArchitectureHiddenTableView({
  filteredProjects,
  searchQuery,
  filterPic,
  filterDeadline,
  statusFilter,
  isSuperAdmin,
  onView,
  onEdit,
  onDelete,
}: ArchitectureHiddenTableViewProps) {
  const { page, setPage, totalItems, totalPages, paginatedData } = usePagination(
    filteredProjects,
    [searchQuery, filterPic, filterDeadline, statusFilter]
  )

  const columns = useMemo(
    () => getArchitectureColumns(onView, onEdit, (p) => onDelete(p), isSuperAdmin),
    [isSuperAdmin, onView, onEdit, onDelete]
  )

  return (
    <div className="hidden">
      <DataTable columns={columns} data={paginatedData} />
      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemCount={paginatedData.length}
        isLoading={false}
        onPageChange={setPage}
      />
    </div>
  )
}
