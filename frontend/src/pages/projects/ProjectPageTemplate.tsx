import { useState } from 'react'
import { useAutoOpenProject } from '@/hooks/useAutoOpenProject'
import type { Project } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/hooks/useRole'
import { useUsers } from '@/hooks/useUsers'
import { useProjects } from '@/hooks/useProjects'
import { useVendors } from '@/hooks/useVendors'
import type { ProjectStatusFilter } from '@/hooks/useProjects'
import { useProjectFilters } from '@/hooks/useProjectFilters'
import { TypeProjectsBoolean } from '@/lib/booleans'
import { formatRupiah } from '@/lib/helpers'

import { Button } from '@/components/ui/button'
import { Plus, Banknote, Activity, AlertCircle } from 'lucide-react'
import { ProjectFilterBar } from '@/components/projects/ProjectFilterBar'
import type { KanbanColumnDefinition } from './ProjectKanban'
import ProjectKanban from './ProjectKanban'
import { ProjectTable } from './ProjectTable'
import { ProjectForm } from './ProjectForm'
import { ProjectDetailsModal } from './ProjectDetailsModal'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { PageTableSkeleton } from '@/components/shared/TableSkeleton'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { cn } from '@/lib/utils'

interface TemplateProps {
  pageTitle: string
  projectType: 'architecture' | 'civil' | 'interior'
  kanbanColumns: KanbanColumnDefinition[]
  statusOptions: { value: string; label: string }[]
  enableKanban?: boolean
}

export default function ProjectPageTemplate({
  pageTitle,
  projectType,
  kanbanColumns,
  statusOptions,
  enableKanban = true,
}: TemplateProps) {
  const { can } = useAuth()
  const { isSuperAdmin } = useRole()
  const { isCivil, isInterior } = TypeProjectsBoolean(projectType)

  // UI state
  const [statusFilter, setStatusFilter] =
    useState<ProjectStatusFilter>('active')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  // Data hooks
  const { users } = useUsers()
  const { vendors: civilVendors } = useVendors(
    isCivil ? { projectType: 'civil' } : {}
  )
  const { vendors: interiorVendors } = useVendors(
    isInterior ? { projectType: 'interior' } : {}
  )
  const { projects, isLoading, updateStatus, deleteProject } = useProjects({
    projectType,
    statusFilter,
  })
  const {
    searchQuery,
    setSearchQuery,
    filterPic,
    setFilterPic,
    filterVendor,
    setFilterVendor,
    filteredProjects,
    stats,
    hasActiveFilters,
    resetFilters,
  } = useProjectFilters({ projects, projectType })

  const { projectToView, setProjectToView } = useAutoOpenProject(
    projects,
    isLoading
  )

  const handleCreate = () => {
    setEditingProject(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteProject(deleteId, {
      onSuccess: () => setDeleteId(null),
    })
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        title={pageTitle}
        description={`Monitoring ${projectType} projects.`}
        action={
          can(`manage_${projectType}`) ? (
            <Button
              onClick={handleCreate}
              className="bg-primary shadow-sm h-9 text-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> New
            </Button>
          ) : undefined
        }
      />

      {/* STATS BAR */}
      <div className="flex flex-col md:flex-row bg-white border rounded-xl shadow-sm mb-4 shrink-0 overflow-hidden divide-y md:divide-y-0 md:divide-x text-sm">
        {isSuperAdmin && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 flex-1">
            <Banknote className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-slate-400 text-xs whitespace-nowrap">
              Potential Revenue
            </span>
            <span className="font-semibold text-slate-800 ml-auto">
              {formatRupiah(stats.totalValue)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2.5 px-4 py-2.5 flex-1">
          <Activity className="h-4 w-4 text-blue-500 shrink-0" />
          <span className="text-slate-400 text-xs whitespace-nowrap">
            Active Projects
          </span>
          <span className="font-semibold text-slate-800 ml-auto">
            {stats.activeCount}{' '}
            <span className="font-normal text-slate-400 text-xs">units</span>
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-2.5 px-4 py-2.5 flex-1',
            stats.urgentCount > 0 ? 'bg-red-50/40' : ''
          )}
        >
          <AlertCircle
            className={cn(
              'h-4 w-4 shrink-0',
              stats.urgentCount > 0 ? 'text-red-500' : 'text-slate-300'
            )}
          />
          <span
            className={cn(
              'text-xs whitespace-nowrap',
              stats.urgentCount > 0 ? 'text-red-400' : 'text-slate-400'
            )}
          >
            Deadline &lt; 7 days
          </span>
          <span
            className={cn(
              'font-semibold ml-auto',
              stats.urgentCount > 0 ? 'text-red-600' : 'text-slate-800'
            )}
          >
            {stats.urgentCount}{' '}
            <span
              className={cn(
                'font-normal text-xs',
                stats.urgentCount > 0 ? 'text-red-400' : 'text-slate-400'
              )}
            >
              projects
            </span>
          </span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        {/* INTEGRATED TOOLBAR */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <ProjectFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterPic={filterPic}
            onFilterPicChange={setFilterPic}
            filterVendor={filterVendor}
            onFilterVendorChange={setFilterVendor}
            filterStatus={statusFilter}
            onFilterStatusChange={setStatusFilter}
            hasActiveFilters={hasActiveFilters || statusFilter !== 'active'}
            onResetFilters={() => {
              resetFilters()
              setStatusFilter('active')
            }}
            isCivil={isCivil}
            isInterior={isInterior}
            users={users}
            civilVendors={civilVendors}
            interiorVendors={interiorVendors}
            projectType={projectType}
            className="flex flex-1 gap-2 items-center"
          />
        </div>

        {isLoading ? (
          <div className="p-4">
            <PageTableSkeleton rows={6} />
          </div>
        ) : enableKanban ? (
          <div className="flex-1 overflow-hidden h-full p-2">
            <ProjectKanban
              data={filteredProjects}
              columnsConfig={kanbanColumns}
              onEdit={handleEdit}
              onDelete={(p) => setDeleteId(p.id)}
              onStatusChange={(id, status) => updateStatus({ id, status })}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto h-full">
            <ProjectTable
              projectType={projectType}
              onView={(project) => setProjectToView(project)}
              data={filteredProjects}
              onEdit={handleEdit}
              onDelete={(p) => setDeleteId(p.id)}
            />
          </div>
        )}
      </div>

      {/* MODALS */}
      <ProjectDetailsModal
        project={projectToView}
        open={!!projectToView}
        onOpenChange={(open) => !open && setProjectToView(null)}
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        maxWidth="sm:max-w-[600px]"
        scrollable
      >
        <ProjectForm
          key={editingProject ? editingProject.id : 'new'}
          initialData={editingProject}
          fixedType={projectType}
          statusOptions={statusOptions}
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
