import { useState, useMemo } from 'react'
import type { ReactNode } from 'react'
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
import { DEADLINE_WARNING_DAYS } from '@/lib/constant'
import {
  getDaysRemaining,
  getProjectDeadlineDate,
} from '@/lib/projects/deadline'

import { Button } from '@/components/ui/button'
import { Plus, Banknote, Activity, AlertTriangle } from 'lucide-react'
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
import { TablePagination } from '@/components/shared/TablePagination'
import { usePagination } from '@/hooks/usePagination'

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
  const deadlineWarningDays = DEADLINE_WARNING_DAYS[projectType]

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
    filterDeadline,
    setFilterDeadline,
    filteredProjects,
    stats,
    resultCount,
    hasActiveFilters,
    resetFilters,
  } = useProjectFilters({ projects, projectType, deadlineWarningDays })

  const atRiskStats = useMemo(() => {
    let overdueCount = 0
    let nearDeadlineCount = 0
    for (const p of projects) {
      const date = getProjectDeadlineDate(p)
      if (!date) continue
      const days = getDaysRemaining(date)
      if (days < 0) overdueCount++
      else if (days <= deadlineWarningDays) nearDeadlineCount++
    }
    return { overdueCount, nearDeadlineCount }
  }, [projects, deadlineWarningDays])

  const {
    page,
    setPage,
    totalItems,
    totalPages,
    paginatedData: paginatedProjects,
  } = usePagination(filteredProjects, [
    searchQuery,
    filterPic,
    filterVendor,
    filterDeadline,
    statusFilter,
  ])

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2 md:gap-3 mb-4 shrink-0">
        {isSuperAdmin && (
          <ProjectStatCard
            icon={<Banknote />}
            label="Potential Revenue"
            color="emerald"
            value={
              <p className="text-base md:text-2xl font-bold text-slate-800 leading-tight text-right md:text-left">
                {formatRupiah(stats.totalValue)}
              </p>
            }
            description="Combined contract value of all active projects — the total income expected upon full completion."
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
          description="Projects with active status currently in progress. Count stays fixed regardless of search or filter."
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
                  {atRiskStats.overdueCount}
                </span>
                <span className="text-xs md:text-sm text-slate-400">
                  overdue
                </span>
              </div>
              <span className="text-slate-200 font-light select-none">/</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base md:text-2xl font-bold text-amber-500 leading-tight">
                  {atRiskStats.nearDeadlineCount}
                </span>
                <span className="text-xs md:text-sm text-slate-400">
                  near deadline
                </span>
              </div>
            </div>
          }
          description={`Overdue projects plus those within ${deadlineWarningDays} days of their deadline. Needs immediate follow-up.`}
        />
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
            filterDeadline={filterDeadline}
            onFilterDeadlineChange={setFilterDeadline}
            deadlineWarningDays={deadlineWarningDays}
            resultCount={resultCount}
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
          <>
            <div className="flex-1 overflow-auto h-full">
              <ProjectTable
                projectType={projectType}
                onView={(project) => setProjectToView(project)}
                data={paginatedProjects}
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

const colorMap = {
  emerald: {
    border: 'border-emerald-100',
    icon: 'text-emerald-500',
    label: 'text-emerald-600',
  },
  blue: {
    border: 'border-blue-100',
    icon: 'text-blue-500',
    label: 'text-blue-600',
  },
  amber: {
    border: 'border-amber-100',
    icon: 'text-amber-500',
    label: 'text-amber-600',
  },
}

interface ProjectStatCardProps {
  icon: ReactNode
  label: string
  color: keyof typeof colorMap
  value: ReactNode
  description: string
  className?: string
}

function ProjectStatCard({
  icon,
  label,
  color,
  value,
  description,
  className,
}: ProjectStatCardProps) {
  const c = colorMap[color]
  return (
    <div
      className={`bg-white border ${c.border} rounded-xl shadow-sm px-4 py-3 md:px-5 md:py-4 flex-1 min-w-0 flex flex-row items-center gap-3 md:flex-col md:items-stretch md:gap-0 ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 md:mb-3 shrink-0">
        <span className={`${c.icon} shrink-0 [&>svg]:h-4 [&>svg]:w-4`}>
          {icon}
        </span>
        <span
          className={`text-xs font-semibold ${c.label} uppercase tracking-wider`}
        >
          {label}
        </span>
      </div>
      <div
        className="md:mb-3 ml-auto md:ml-0"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {value}
      </div>
      <div className="hidden md:block border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
