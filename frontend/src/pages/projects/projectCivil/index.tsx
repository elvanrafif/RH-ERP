import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/hooks/useRole'
import { useUsers } from '@/hooks/useUsers'
import { useVendors } from '@/hooks/useVendors'
import { useProjects } from '@/hooks/useProjects'
import type { ProjectStatusFilter } from '@/hooks/useProjects'
import { useProjectFilters } from '@/hooks/useProjectFilters'
import { useProjectInvoiceStats } from '@/hooks/useProjectInvoiceStats'
import { usePagination } from '@/hooks/usePagination'
import { useProjectPageState } from '@/hooks/useProjectPageState'
import { useSort } from '@/hooks/useSort'
import { DEADLINE_WARNING_DAYS } from '@/lib/constant'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CivilFilterBar } from '@/components/projects/CivilFilterBar'
import { SortPopover } from '@/components/shared/SortPopover'
import { CIVIL_SORT_OPTIONS } from './civilSortOptions'
import { ProjectStatsSection } from '../components/ProjectStatsSection'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { PageTableSkeleton } from '@/components/shared/TableSkeleton'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { TablePagination } from '@/components/shared/TablePagination'
import { ProjectCivilForm } from './ProjectCivilForm'
import { ProjectCivilDetailsModal } from './ProjectCivilDetailsModal'
import { ProjectCivilTable } from './ProjectCivilTable'

const DEADLINE_DAYS = DEADLINE_WARNING_DAYS['civil']

export default function SipilPage() {
  const { can } = useAuth()
  const { isSuperAdmin } = useRole()
  const { users } = useUsers()
  const { vendors: civilVendors } = useVendors({ projectType: 'civil' })

  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('active')
  const { projects, isLoading, deleteProject } = useProjects({
    projectType: 'civil',
    statusFilter,
  })

  const {
    searchQuery,
    setSearchQuery,
    filterPic,
    setFilterPic,
    filterManagedBy,
    setFilterManagedBy,
    filterDeadline,
    setFilterDeadline,
    filteredProjects,
    stats,
    hasActiveFilters,
    resetFilters,
  } = useProjectFilters({
    projects,
    projectType: 'civil',
    deadlineWarningDays: DEADLINE_DAYS,
  })

  const { potentialRevenue, realizationRevenue } =
    useProjectInvoiceStats('civil')

  const { sortedData: sortedProjects, sortValue, setSortValue } =
    useSort(filteredProjects, CIVIL_SORT_OPTIONS)

  const {
    page,
    setPage,
    totalItems,
    totalPages,
    paginatedData: paginatedProjects,
  } = usePagination(sortedProjects, [
    searchQuery,
    filterPic,
    filterManagedBy,
    filterDeadline,
    statusFilter,
    sortValue,
  ])

  const {
    isDialogOpen, setIsDialogOpen,
    editingProject, setEditingProject,
    deleteId, setDeleteId,
    setViewingProject,
    openProject,
    handleCreate, handleEdit, handleDelete, handleCloseViewModal,
  } = useProjectPageState({ projects, isLoading, deleteProject })

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        title="Civil Construction"
        description="Monitoring civil construction projects."
        action={
          can('manage_civil') ? (
            <Button
              onClick={handleCreate}
              className="bg-primary shadow-sm h-9 text-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> New
            </Button>
          ) : undefined
        }
      />

      {/* STATS */}
      <ProjectStatsSection
        isSuperAdmin={isSuperAdmin}
        stats={stats}
        realizationRevenue={realizationRevenue}
        potentialRevenue={potentialRevenue}
        deadlineWarningDays={DEADLINE_DAYS}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <CivilFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterPic={filterPic}
            onFilterPicChange={setFilterPic}
            filterManagedBy={filterManagedBy}
            onFilterManagedByChange={setFilterManagedBy}
            filterStatus={statusFilter}
            onFilterStatusChange={setStatusFilter}
            filterDeadline={filterDeadline}
            onFilterDeadlineChange={setFilterDeadline}
            deadlineWarningDays={DEADLINE_DAYS}
            hasActiveFilters={hasActiveFilters || statusFilter !== 'active'}
            onResetFilters={() => { resetFilters(); setStatusFilter('active') }}
            vendors={civilVendors}
            users={users}
            className="flex flex-1 gap-2 items-center"
          />
          <SortPopover
            options={CIVIL_SORT_OPTIONS}
            value={sortValue}
            onChange={setSortValue}
          />
        </div>

        {isLoading ? (
          <div className="p-4">
            <PageTableSkeleton rows={6} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto h-full">
              <ProjectCivilTable
                data={paginatedProjects}
                onView={(p) => setViewingProject(p)}
                onEdit={handleEdit}
                onDelete={(p) => setDeleteId(p.id)}
              />
            </div>
            <TablePagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemCount={paginatedProjects.length}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* MODALS */}
      <ProjectCivilDetailsModal
        project={openProject}
        open={!!openProject}
        onOpenChange={handleCloseViewModal}
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        maxWidth="sm:max-w-[600px]"
        scrollable
      >
        <ProjectCivilForm
          key={editingProject ? editingProject.id : 'new'}
          initialData={editingProject}
          onSuccess={() => setIsDialogOpen(false)}
        />
      </FormDialog>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Project?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
}
