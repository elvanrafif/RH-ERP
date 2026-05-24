import { useState } from 'react'
import type { Project } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/hooks/useRole'
import { useUsers } from '@/hooks/useUsers'
import { useVendors } from '@/hooks/useVendors'
import { useProjects } from '@/hooks/useProjects'
import type { ProjectStatusFilter } from '@/hooks/useProjects'
import { useProjectFilters } from '@/hooks/useProjectFilters'
import { useProjectInvoiceStats } from '@/hooks/useProjectInvoiceStats'
import { useProjectPageState } from '@/hooks/useProjectPageState'
import { DEADLINE_WARNING_DAYS } from '@/lib/constant'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ProjectFilterBar } from '@/components/projects/ProjectFilterBar'
import { ProjectStatsSection } from '../components/ProjectStatsSection'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { PageTableSkeleton } from '@/components/shared/TableSkeleton'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { ProjectInteriorForm } from './ProjectInteriorForm'
import { ProjectInteriorDetailsModal } from './ProjectInteriorDetailsModal'
import ProjectInteriorKanban from './ProjectInteriorKanban'

const KANBAN_COLUMNS = [
  { id: 'draft_skematik', title: 'Schematic Draft' },
  { id: 'detail_drawing', title: 'Detail Drawing' },
  { id: 'finish', title: 'Finish' },
]

const DEADLINE_DAYS = DEADLINE_WARNING_DAYS['interior']

export default function InteriorPage() {
  const { can } = useAuth()
  const { isSuperAdmin } = useRole()
  const { users } = useUsers()
  const { vendors: interiorVendors } = useVendors({ projectType: 'interior' })

  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('active')
  const { projects, isLoading, updateStatus, deleteProject } = useProjects({
    projectType: 'interior',
    statusFilter,
  })

  const {
    searchQuery,
    setSearchQuery,
    filterPic,
    setFilterPic,
    filterVendor,
    setFilterVendor,
    filterDeadline,
    setFilterDeadline,
    filteredProjects,
    stats,
    resultCount,
    hasActiveFilters,
    resetFilters,
  } = useProjectFilters({
    projects,
    projectType: 'interior',
    deadlineWarningDays: DEADLINE_DAYS,
  })

  const { potentialRevenue, realizationRevenue } =
    useProjectInvoiceStats('interior')

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
        title="Interior Project"
        description="Monitoring interior projects."
        action={
          can('manage_interior') ? (
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
          <ProjectFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterPic={filterPic}
            onFilterPicChange={setFilterPic}
            filterVendor={filterVendor}
            onFilterVendorChange={setFilterVendor}
            filterManagedBy="all"
            onFilterManagedByChange={() => {}}
            filterStatus={statusFilter}
            onFilterStatusChange={setStatusFilter}
            filterDeadline={filterDeadline}
            onFilterDeadlineChange={setFilterDeadline}
            deadlineWarningDays={DEADLINE_DAYS}
            resultCount={resultCount}
            hasActiveFilters={hasActiveFilters || statusFilter !== 'active'}
            onResetFilters={() => {
              resetFilters()
              setStatusFilter('active')
            }}
            isCivil={false}
            isInterior={true}
            users={users}
            civilVendors={[]}
            interiorVendors={interiorVendors}
            projectType="interior"
            className="flex flex-1 gap-2 items-center"
          />
        </div>

        {isLoading ? (
          <div className="p-4">
            <PageTableSkeleton rows={6} />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden h-full p-2">
            <ProjectInteriorKanban
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

      {/* MODALS */}
      <ProjectInteriorDetailsModal
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
        <ProjectInteriorForm
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
