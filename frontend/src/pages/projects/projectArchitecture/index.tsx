import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/hooks/useRole'
import { useUsers } from '@/hooks/useUsers'
import { useProjects } from '@/hooks/useProjects'
import type { ProjectStatusFilter } from '@/hooks/useProjects'
import { useProjectFilters } from '@/hooks/useProjectFilters'
import { useProjectInvoiceStats } from '@/hooks/useProjectInvoiceStats'
import { useProjectPageState } from '@/hooks/useProjectPageState'
import { DEADLINE_WARNING_DAYS } from '@/lib/constant'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ArchitectureFilterBar } from '@/components/projects/ArchitectureFilterBar'
import { ProjectStatsSection } from '../components/ProjectStatsSection'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { PageTableSkeleton } from '@/components/shared/TableSkeleton'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { ProjectArchitectureForm } from './ProjectArchitectureForm'
import { ProjectArchitectureDetailsModal } from './ProjectArchitectureDetailsModal'
import ProjectArchitectureKanban from './ProjectArchitectureKanban'
import { ArchitectureHiddenTableView } from './ArchitectureHiddenTableView'

const KANBAN_COLUMNS = [
  { id: 'denah', title: 'Floor Plan' },
  { id: 'fasad', title: 'Facade' },
  { id: 'detail_drawing', title: 'Detail Drawing' },
  { id: 'finish', title: 'Finish' },
]

const DEADLINE_DAYS = DEADLINE_WARNING_DAYS['architecture']

export default function ArsitekturPage() {
  const { can } = useAuth()
  const { isSuperAdmin } = useRole()
  const { users } = useUsers()

  const [statusFilter, setStatusFilter] =
    useState<ProjectStatusFilter>('active')
  const { projects, isLoading, updateStatus, deleteProject } = useProjects({
    projectType: 'architecture',
    statusFilter,
  })

  const {
    searchQuery,
    setSearchQuery,
    filterPic,
    setFilterPic,
    filterDeadline,
    setFilterDeadline,
    filteredProjects,
    stats,
    hasActiveFilters,
    resetFilters,
  } = useProjectFilters({
    projects,
    projectType: 'architecture',
    deadlineWarningDays: DEADLINE_DAYS,
  })

  const { potentialRevenue, realizationRevenue } =
    useProjectInvoiceStats('architecture')

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
        title="Architecture & Design"
        description="Monitoring architecture projects."
        action={
          can('manage_architecture') ? (
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
          <ArchitectureFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterPic={filterPic}
            onFilterPicChange={setFilterPic}
            filterStatus={statusFilter}
            onFilterStatusChange={setStatusFilter}
            filterDeadline={filterDeadline}
            onFilterDeadlineChange={setFilterDeadline}
            deadlineWarningDays={DEADLINE_DAYS}
            hasActiveFilters={hasActiveFilters || statusFilter !== 'active'}
            onResetFilters={() => { resetFilters(); setStatusFilter('active') }}
            users={users}
            className="flex flex-1 gap-2 items-center"
          />
        </div>

        {isLoading ? (
          <div className="p-4">
            <PageTableSkeleton rows={6} />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden h-full p-2">
            <ProjectArchitectureKanban
              data={filteredProjects}
              columnsConfig={KANBAN_COLUMNS}
              onView={(p) => setViewingProject(p)}
              onEdit={handleEdit}
              onDelete={(p) => setDeleteId(p.id)}
              onStatusChange={(id, status) => updateStatus({ id, status })}
            />
          </div>
        )}
      </div>

      {/* TABLE VIEW (hidden — accessible via future toggle) */}
      <ArchitectureHiddenTableView
        filteredProjects={filteredProjects}
        searchQuery={searchQuery}
        filterPic={filterPic}
        filterDeadline={filterDeadline}
        statusFilter={statusFilter}
        isSuperAdmin={isSuperAdmin ?? false}
        onView={(p) => setViewingProject(p)}
        onEdit={handleEdit}
        onDelete={(p) => setDeleteId(p.id)}
      />

      {/* MODALS */}
      <ProjectArchitectureDetailsModal
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
        <ProjectArchitectureForm
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
