import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project, User } from '@/types' // Ensure User import exists
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Loader2,
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
import { SipilPic } from '@/lib/constant'

// Currency formatter
const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)

interface TemplateProps {
  pageTitle: string
  projectType: 'arsitektur' | 'sipil' | 'interior'
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
  const queryClient = useQueryClient()
  const user = pb.authStore.model
  const isSuperAdmin =
    user?.isSuperAdmin || user?.email === 'elvanrafif@gmail.com'

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [projectToView, setProjectToView] = useState<Project | null>(null)

  // --- STATE FILTERS ---
  const [searchQuery, setSearchQuery] = useState('')
  const [showDone, setShowDone] = useState(false)
  const [filterPic, setFilterPic] = useState('all') // PIC Filter State

  // 1. FETCH PROJECTS
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', projectType, showDone],
    queryFn: async () => {
      let filterRule = `type = '${projectType}'`
      if (!showDone) filterRule += ` && status != 'done' && status != 'finish'`

      return await pb.collection('projects').getFullList<Project>({
        sort: '-created',
        expand: 'client,assignee',
        filter: filterRule,
      })
    },
  })

  // 2. FETCH USERS (For PIC Filter Dropdown)
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () =>
      await pb.collection('users').getFullList<User>({ sort: 'name' }),
  })

  // 3. FILTERING LOGIC (Moved above Stats so Stats can use it)
  const filteredProjects = useMemo(() => {
    if (!projects) return []
    let result = [...projects]

    // A. Filter by Search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.expand?.client?.company_name?.toLowerCase().includes(lower) ||
          p.meta_data?.area_scope?.toLowerCase().includes(lower) ||
          p.meta_data?.pic_lapangan?.toLowerCase().includes(lower)
      )
    }

    // B. Filter by PIC
    if (filterPic !== 'all') {
      if (projectType === 'sipil') {
        // Logika filter untuk Sipil (menggunakan pic_lapangan di meta_data)
        if (filterPic === 'unassigned') {
          result = result.filter((p) => !p.meta_data?.pic_lapangan)
        } else {
          result = result.filter((p) => p.meta_data?.pic_lapangan === filterPic)
        }
      } else {
        // Logika filter untuk Arsitektur & Interior (menggunakan assignee)
        if (filterPic === 'unassigned') {
          result = result.filter((p) => !p.assignee)
        } else {
          result = result.filter((p) => p.assignee === filterPic)
        }
      }
    }

    return result
  }, [projects, searchQuery, filterPic, projectType])

  // 4. STATS LOGIC (Now calculating from filteredProjects)
  const stats = useMemo(() => {
    // Default values
    let totalValue = 0,
      activeCount = 0,
      urgentCount = 0

    // Use filteredProjects, not raw projects
    // So the widgets update according to the PIC filter
    const sourceData = filteredProjects

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    sourceData.forEach((p) => {
      // Only calculate stats for unfinished projects
      // if(p.status !== 'done' && p.status !== 'finish') {
      totalValue += p.contract_value || 0
      activeCount++

      // Calculate Urgent Deadlines
      if (p.deadline) {
        const d = new Date(p.deadline)
        if (d <= nextWeek && d >= today) {
          urgentCount++
        }
      }
      // }
    })

    return { totalValue, activeCount, urgentCount }
  }, [filteredProjects]) // Dependency to filteredProjects

  // --- MUTATIONS ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await pb.collection('projects').update(id, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Status updated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await pb.collection('projects').delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
      setDeleteId(null)
    },
  })

  // HANDLERS
  const handleCreate = () => {
    setEditingProject(null)
    setIsDialogOpen(true)
  }
  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsDialogOpen(true)
  }
  const handleStatusChange = (id: string, status: string) =>
    updateStatusMutation.mutate({ id, status })

  // Reset Filter Button
  const hasActiveFilters = searchQuery !== '' || filterPic !== 'all'
  const resetFilters = () => {
    setSearchQuery('')
    setFilterPic('all')
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-slate-50/30">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {pageTitle}
            <span className="text-xs font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full border">
              {filteredProjects.length} Projects
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitoring {projectType} projects.
          </p>
        </div>
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
          <Button
            onClick={handleCreate}
            className="bg-primary shadow-sm h-9 text-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        </div>
      </div>

      {/* COMPACT STATS WIDGETS (Data Dynamic based on Filter) */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mb-4 shrink-0">
        {/* Widget 1: Revenue */}
        <Card className="relative overflow-hidden shadow-sm border-l-4 border-l-emerald-500 p-3 flex items-center gap-4 bg-white">
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Banknote className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              Potential Revenue (Active Projects)
            </p>
            <div className="text-lg font-bold text-slate-800 truncate">
              {isSuperAdmin ? formatRupiah(stats.totalValue) : 'Confidential'}
            </div>
          </div>
        </Card>

        {/* Widget 2: Active Projects */}
        <Card className="relative overflow-hidden shadow-sm border-l-4 border-l-blue-500 p-3 flex items-center gap-4 bg-white">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Active Projects
            </p>
            <div className="text-lg font-bold text-slate-800 flex items-baseline gap-1">
              {stats.activeCount}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                Units
              </span>
            </div>
          </div>
        </Card>

        {/* Widget 3: Urgent Deadline (< 7 Days) */}
        <Card
          className={`relative overflow-hidden shadow-sm border-l-4 p-3 flex items-center gap-4 transition-colors ${
            stats.urgentCount > 0
              ? 'border-l-red-500 bg-red-50/50'
              : 'border-l-slate-300 bg-white'
          }`}
        >
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              stats.urgentCount > 0
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p
              className={`text-[10px] font-bold uppercase tracking-wider ${
                stats.urgentCount > 0 ? 'text-red-600' : 'text-muted-foreground'
              }`}
            >
              Deadline &lt; 7 Days
            </p>
            <div
              className={`text-lg font-bold flex items-baseline gap-1 ${
                stats.urgentCount > 0 ? 'text-red-700' : 'text-slate-800'
              }`}
            >
              {stats.urgentCount}{' '}
              <span className="text-xs font-normal opacity-70">Projects</span>
            </div>
          </div>
        </Card>
      </div>

      {/* FILTER & TABS TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3 items-start sm:items-center justify-between shrink-0">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          {/* SEARCH BAR */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client"
              className="pl-8 h-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* PIC FILTER DROPDOWN */}
          <div className="w-[180px]">
            <Select value={filterPic} onValueChange={setFilterPic}>
              <SelectTrigger className="h-9 bg-white">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter PIC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PICs</SelectItem>
                <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                {projectType === 'sipil'
                  ? SipilPic.map((pic: string) => (
                      <SelectItem key={pic} value={pic}>
                        {pic}
                      </SelectItem>
                    ))
                  : users
                      ?.filter(
                        (u: any) =>
                          u.divisi?.toLowerCase() === projectType ||
                          u.division?.toLowerCase() === projectType
                      )
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name || u.email}
                        </SelectItem>
                      ))}
              </SelectContent>
            </Select>
          </div>

          {/* RESET BUTTON */}
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

        {/* <Tabs defaultValue={enableKanban ? "kanban" : "table"} className="w-full sm:w-auto mt-2 sm:mt-0">
                <TabsList className="grid w-full grid-cols-2 sm:w-[200px]">
                    {enableKanban && <TabsTrigger value="kanban"><LayoutGrid className="mr-2 h-4 w-4" /> Board</TabsTrigger>}
                    <TabsTrigger value="table"><TableIcon className="mr-2 h-4 w-4" /> List</TabsTrigger>
                </TabsList>
            </Tabs> */}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative bg-white/50 rounded-lg border border-slate-200/60 shadow-inner">
        {/* WRAP TABS CONTENT HERE */}
        <Tabs
          defaultValue={enableKanban ? 'kanban' : 'table'}
          className="flex flex-col h-full"
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
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
                    onStatusChange={handleStatusChange}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm
            key={editingProject ? editingProject.id : 'new'}
            initialData={editingProject}
            fixedType={projectType}
            statusOptions={statusOptions}
            onSuccess={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
