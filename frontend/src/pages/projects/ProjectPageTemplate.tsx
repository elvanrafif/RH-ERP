import { useState } from 'react'
import type { Project } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/hooks/useRole'
import { useUsers } from '@/hooks/useUsers'
import { useProjects } from '@/hooks/useProjects'
import { useProjectFilters } from '@/hooks/useProjectFilters'
import { TypeProjectsBoolean } from '@/lib/booleans'
import { SipilPic } from '@/lib/constant'
import { formatRupiah } from '@/lib/helpers'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Banknote,
  Activity,
  AlertCircle,
  Search,
  X,
  Filter,
} from 'lucide-react'
import type { KanbanColumnDefinition } from './ProjectKanban'
import ProjectKanban from './ProjectKanban'
import { ProjectTable } from './ProjectTable'
import { ProjectForm } from './ProjectForm'
import { ProjectDetailsModal } from './ProjectDetailsModal'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { StatCard } from '@/components/shared/StatCard'

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
  const { isCivil } = TypeProjectsBoolean(projectType)

  // UI state
  const [showDone, setShowDone] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [projectToView, setProjectToView] = useState<Project | null>(null)

  // Data hooks
  const { users } = useUsers()
  const { projects, isLoading, updateStatus, deleteProject } = useProjects({
    projectType,
    showDone,
  })
  const {
    searchQuery,
    setSearchQuery,
    filterPic,
    setFilterPic,
    filteredProjects,
    stats,
    hasActiveFilters,
    resetFilters,
  } = useProjectFilters({ projects, projectType })

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
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-slate-50/30">
      <PageHeader
        title={
          <>
            {pageTitle}
            <span className="text-xs font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full border">
              {filteredProjects.length} Projects
            </span>
          </>
        }
        description={`Monitoring ${projectType} projects.`}
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 bg-white p-1.5 rounded-lg border shadow-sm px-3">
              <Switch
                id="show-done"
                checked={showDone}
                onCheckedChange={setShowDone}
              />
              <Label htmlFor="show-done" className="text-xs cursor-pointer">
                Show History
              </Label>
            </div>
            {can(`manage_${projectType}`) && (
              <Button
                onClick={handleCreate}
                className="bg-primary shadow-sm h-9 text-sm"
              >
                <Plus className="mr-2 h-4 w-4" /> New
              </Button>
            )}
          </div>
        }
      />

      {/* STATS BAR */}
      <div className="bg-white border rounded-xl shadow-sm flex flex-col sm:flex-row items-center divide-y sm:divide-y-0 sm:divide-x mb-5 shrink-0 overflow-hidden">
        {isSuperAdmin && (
          <StatCard
            icon={<Banknote className="h-5 w-5" />}
            iconBg="bg-emerald-100/80 text-emerald-600"
            label="Potential Revenue"
            value={formatRupiah(stats.totalValue)}
          />
        )}
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          iconBg="bg-blue-100/80 text-blue-600"
          label="Active Projects"
          value={
            <>
              {stats.activeCount}{' '}
              <span className="text-sm font-medium text-slate-500">Units</span>
            </>
          }
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          iconBg={
            stats.urgentCount > 0
              ? 'bg-red-100 text-red-600'
              : 'bg-slate-100 text-slate-400'
          }
          label="Deadline < 7 Days"
          value={
            <>
              {stats.urgentCount}{' '}
              <span className="text-sm font-medium opacity-70">Projects</span>
            </>
          }
          urgent={stats.urgentCount > 0}
        />
      </div>

      {/* FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3 items-start sm:items-center justify-between shrink-0">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client"
              className="pl-8 h-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-[180px]">
            <Select value={filterPic} onValueChange={setFilterPic}>
              <SelectTrigger className="h-9 bg-white">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter PIC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PICs</SelectItem>
                <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                {isCivil
                  ? SipilPic.map((pic: string) => (
                      <SelectItem key={pic} value={pic}>
                        {pic}
                      </SelectItem>
                    ))
                  : users
                      .filter((u) => u.division?.toLowerCase() === projectType)
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name || u.email}
                        </SelectItem>
                      ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={resetFilters}
              title="Reset Filter"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden relative bg-white/50 rounded-lg border border-slate-200/60 shadow-inner">
        <Tabs
          defaultValue={enableKanban ? 'kanban' : 'table'}
          className="flex flex-col h-full"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {enableKanban && (
                <TabsContent
                  value="kanban"
                  className="flex-1 overflow-hidden mt-0 h-full p-2"
                >
                  <ProjectKanban
                    data={filteredProjects}
                    columnsConfig={kanbanColumns}
                    onEdit={handleEdit}
                    onDelete={(p) => setDeleteId(p.id)}
                    onStatusChange={(id, status) =>
                      updateStatus({ id, status })
                    }
                  />
                </TabsContent>
              )}
              <TabsContent
                value="table"
                className="flex-1 overflow-auto mt-0 h-full p-0"
              >
                <ProjectTable
                  projectType={projectType}
                  onView={(project) => setProjectToView(project)}
                  data={filteredProjects}
                  onEdit={handleEdit}
                  onDelete={(p) => setDeleteId(p.id)}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
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
