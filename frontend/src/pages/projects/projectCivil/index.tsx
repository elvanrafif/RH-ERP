import { useState, useMemo } from 'react'
import type { Project } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/hooks/useRole'
import { useUsers } from '@/hooks/useUsers'
import { useVendors } from '@/hooks/useVendors'
import { useProjects } from '@/hooks/useProjects'
import type { ProjectStatusFilter } from '@/hooks/useProjects'
import { useProjectFilters } from '@/hooks/useProjectFilters'
import { useProjectInvoiceStats } from '@/hooks/useProjectInvoiceStats'
import { useAutoOpenProject } from '@/hooks/useAutoOpenProject'
import { usePagination } from '@/hooks/usePagination'
import { DEADLINE_WARNING_DAYS } from '@/lib/constant'
import { formatRupiah } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Plus, Banknote, Activity, AlertTriangle } from 'lucide-react'
import { ProjectFilterBar } from '@/components/projects/ProjectFilterBar'
import { ProjectStatCard } from '@/components/shared/ProjectStatCard'
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

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
    resultCount,
    hasActiveFilters,
    resetFilters,
  } = useProjectFilters({
    projects,
    projectType: 'civil',
    deadlineWarningDays: DEADLINE_DAYS,
  })

  const { potentialRevenue, realizationRevenue } =
    useProjectInvoiceStats('civil')

  const {
    page,
    setPage,
    totalItems,
    totalPages,
    paginatedData: paginatedProjects,
  } = usePagination(filteredProjects, [
    searchQuery,
    filterPic,
    filterManagedBy,
    filterDeadline,
    statusFilter,
  ])

  const { projectToView: autoOpenProject, setProjectToView: setAutoOpenProject } =
    useAutoOpenProject(projects, isLoading)

  const openProject = viewingProject ?? autoOpenProject

  function handleCreate() {
    setEditingProject(null)
    setIsDialogOpen(true)
  }

  function handleEdit(project: Project) {
    setEditingProject(project)
    setIsDialogOpen(true)
  }

  function handleDelete() {
    if (!deleteId) return
    deleteProject(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  function handleCloseViewModal(open: boolean) {
    if (!open) {
      setViewingProject(null)
      setAutoOpenProject(null)
    }
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2 md:gap-3 mb-4 shrink-0">
        {isSuperAdmin && (
          <ProjectStatCard
            icon={<Banknote />}
            label="Project Revenue"
            color="emerald"
            value={
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between md:justify-start gap-2">
                  <span className="text-xs text-emerald-600 font-medium w-16 shrink-0">
                    Realized
                  </span>
                  <span className="text-sm md:text-base font-bold text-slate-800">
                    {formatRupiah(realizationRevenue)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between md:justify-start gap-2">
                  <span className="text-xs text-slate-400 font-medium w-16 shrink-0">
                    Potential
                  </span>
                  <span className="text-sm md:text-base font-bold text-slate-500">
                    {formatRupiah(potentialRevenue)}
                  </span>
                </div>
              </div>
            }
            description="From linked invoices on active projects."
          />
        )}
        <ProjectStatCard
          icon={<Activity />}
          label="Active Projects"
          color="blue"
          value={
            <p className="text-base md:text-2xl font-bold text-slate-800 leading-tight">
              {stats.activeCount}{' '}
              <span className="text-sm md:text-base font-normal text-slate-400">
                projects
              </span>
            </p>
          }
          description="Projects with active status currently in progress."
        />
        <ProjectStatCard
          icon={<AlertTriangle />}
          label="At-Risk Projects"
          color="amber"
          className="sm:col-span-2 md:col-span-1"
          value={
            <div className="flex items-baseline gap-3 md:gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-base md:text-2xl font-bold text-red-500 leading-tight">
                  {stats.overdueCount}
                </span>
                <span className="text-xs md:text-sm text-slate-400">overdue</span>
              </div>
              <span className="text-slate-200 font-light select-none">/</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base md:text-2xl font-bold text-amber-500 leading-tight">
                  {stats.nearDeadlineCount}
                </span>
                <span className="text-xs md:text-sm text-slate-400">near deadline</span>
              </div>
            </div>
          }
          description={`Overdue or within ${DEADLINE_DAYS} days of deadline. Needs immediate follow-up.`}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <ProjectFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterPic={filterPic}
            onFilterPicChange={setFilterPic}
            filterVendor="all"
            onFilterVendorChange={() => {}}
            filterManagedBy={filterManagedBy}
            onFilterManagedByChange={setFilterManagedBy}
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
            isCivil={true}
            isInterior={false}
            users={users}
            civilVendors={civilVendors}
            projectType="civil"
            className="flex flex-1 gap-2 items-center"
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
