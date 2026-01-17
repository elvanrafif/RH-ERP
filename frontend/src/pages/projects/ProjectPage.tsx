import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import type { Project, User } from "@/types"
import { toast } from "sonner"

// Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { 
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { 
    Plus, LayoutGrid, Table as TableIcon, Loader2, Banknote, Activity, AlertCircle, 
    Search, Filter, X, FolderOpen 
} from "lucide-react"

// Sub-Pages
import ProjectKanban from "./ProjectKanban"
import { ProjectTable } from "./ProjectTable"
import { ProjectForm } from "./ProjectForm"

// Helper
const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val);
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const currentUserId = pb.authStore.model?.id;

  // --- STATE ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null); // ID yg mau dihapus

  // --- STATE FILTERS ---
  const [showDone, setShowDone] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPic, setFilterPic] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // 1. FETCH PROJECTS
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', showDone],
    queryFn: async () => {
      const filterRule = showDone ? "" : "status != 'done'";
      return await pb.collection('projects').getFullList<Project>({
        sort: '-created',
        expand: 'client_id,assignee', 
        filter: filterRule,
      });
    }
  });

  // 2. FETCH USERS (Untuk Filter)
  const { data: users } = useQuery({
    queryKey: ['users-filter'],
    queryFn: async () => await pb.collection('users').getFullList<User>(),
  });

  // 3. STATISTIK LOGIC
  const stats = useMemo(() => {
    if (!projects) return { totalValue: 0, activeCount: 0, urgentCount: 0 };
    let totalValue = 0, activeCount = 0, urgentCount = 0;
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    projects.forEach(p => {
        if (p.status !== 'done') {
            totalValue += p.value || 0;
            activeCount++;
            if (p.deadline) {
                const d = new Date(p.deadline);
                if (d <= nextWeek && d >= today) urgentCount++;
            }
        }
    });
    return { totalValue, activeCount, urgentCount };
  }, [projects]);

  // 4. FILTERING & SORTING LOGIC
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let result = [...projects];

    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(p => 
            p.name.toLowerCase().includes(lower) || 
            p.expand?.client_id?.company_name?.toLowerCase().includes(lower)
        );
    }
    if (filterType !== 'all') result = result.filter(p => p.type === filterType);
    if (filterPic === 'my') result = result.filter(p => p.assignee === currentUserId);
    else if (filterPic !== 'all') result = result.filter(p => p.assignee === filterPic);

    result.sort((a, b) => {
        switch (sortBy) {
            case 'value_high': return (b.value || 0) - (a.value || 0);
            case 'value_low': return (a.value || 0) - (b.value || 0);
            case 'deadline_near': 
                if (!a.deadline) return 1; 
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            case 'newest': default:
                return new Date(b.created).getTime() - new Date(a.created).getTime();
        }
    });
    return result;
  }, [projects, searchQuery, filterType, filterPic, sortBy, currentUserId]);

  // --- MUTATIONS ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return await pb.collection('projects').update(id, { status });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast.success("Status project diperbarui");
    },
    onError: () => toast.error("Gagal update status")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        return await pb.collection('projects').delete(id);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast.success("Project berhasil dihapus");
        setDeleteId(null);
    },
    onError: () => toast.error("Gagal menghapus project")
  });

  // HANDLERS
  const handleCreate = () => { setEditingProject(null); setIsDialogOpen(true); }
  const handleEdit = (project: Project) => { setEditingProject(project); setIsDialogOpen(true); }
  const handleDeleteClick = (project: Project) => { setDeleteId(project.id); } // Buka Dialog Hapus
  const handleConfirmDelete = () => { if (deleteId) deleteMutation.mutate(deleteId); }
  const handleStatusChange = (id: string, status: string) => updateStatusMutation.mutate({ id, status });
  
  const handleResetFilter = () => {
    setSearchQuery(""); setFilterType("all"); setFilterPic("all"); setSortBy("newest");
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground">Kelola semua proyek Design & Sipil.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
                <Switch id="show-done" checked={showDone} onCheckedChange={setShowDone} />
                <Label htmlFor="show-done">Tampilkan Selesai</Label>
            </div>
            <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" /> Project Baru
            </Button>
        </div>
      </div>

       {/* STAT CARDS */}
       <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Potensi Omzet (Aktif)</CardTitle>
                <Banknote className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatRupiah(stats.totalValue)}</div>
                <p className="text-xs text-muted-foreground">Dari {stats.activeCount} proyek berjalan</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyek Berjalan</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.activeCount}</div>
                <p className="text-xs text-muted-foreground">Sedang dikerjakan</p>
            </CardContent>
        </Card>
        <Card className={stats.urgentCount > 0 ? "border-red-200 bg-red-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Deadline &lt; 7 Hari</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-700">{stats.urgentCount}</div>
                <p className="text-xs text-red-600/80">Butuh perhatian segera!</p>
            </CardContent>
        </Card>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-end md:items-center bg-white p-3 rounded-lg border shadow-sm">
        <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Cari project / klien..." className="pl-8" 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tipe" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="sipil">Sipil</SelectItem>
                <SelectItem value="others">Others</SelectItem>
            </SelectContent>
        </Select>
        <Select value={filterPic} onValueChange={setFilterPic}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="PIC / Assignee" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Semua PIC</SelectItem>
                <SelectItem value="my">⭐ Proyek Saya</SelectItem>
                {users?.map(u => (<SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>))}
            </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Urutkan" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">Terbaru Dibuat</SelectItem>
                <SelectItem value="deadline_near">Deadline Terdekat</SelectItem>
                <SelectItem value="value_high">Nilai Tertinggi</SelectItem>
                <SelectItem value="value_low">Nilai Terendah</SelectItem>
            </SelectContent>
        </Select>
        {(searchQuery || filterType !== 'all' || filterPic !== 'all' || sortBy !== 'newest') && (
            <Button variant="ghost" size="icon" onClick={handleResetFilter} title="Reset Filter"><X className="h-4 w-4" /></Button>
        )}
      </div>

      {/* TABS VIEW SWITCHER */}
      <Tabs defaultValue="kanban" className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-2">
            <TabsList>
                <TabsTrigger value="kanban"><LayoutGrid className="mr-2 h-4 w-4" /> Board</TabsTrigger>
                <TabsTrigger value="table"><TableIcon className="mr-2 h-4 w-4" /> List View</TabsTrigger>
            </TabsList>
        </div>

        {isLoading ? (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : filteredProjects.length === 0 ? (
            // EMPTY STATE
            <div className="flex flex-col items-center justify-center h-full border rounded-lg bg-slate-50/50 dashed border-2 border-dashed p-10 text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <FolderOpen className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Tidak ada project ditemukan</h3>
                <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                    Coba ubah kata kunci pencarian atau filter Anda.
                </p>
                <Button onClick={handleResetFilter} variant="outline">Reset Filter</Button>
            </div>
        ) : (
            <>
                <TabsContent value="kanban" className="flex-1 overflow-hidden h-full mt-0 border-0">
                    <ProjectKanban 
                        data={filteredProjects}
                        onEdit={handleEdit} 
                        onDelete={handleDeleteClick} 
                        onStatusChange={handleStatusChange} 
                    />
                </TabsContent>

                <TabsContent value="table" className="flex-1 overflow-auto mt-0 border-0">
                    <ProjectTable 
                        data={filteredProjects}
                        onEdit={handleEdit} 
                        onDelete={handleDeleteClick}
                    />
                </TabsContent>
            </>
        )}
      </Tabs>

      {/* FORM MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{editingProject ? "Edit Project" : "Project Baru"}</DialogTitle>
            </DialogHeader>
            <ProjectForm 
                key={editingProject ? editingProject.id : "new"} 
                initialData={editingProject} 
                onSuccess={() => setIsDialogOpen(false)} 
            />
         </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Hapus Project ini?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tindakan ini permanen. Data yang dihapus tidak dapat dikembalikan.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                    {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}