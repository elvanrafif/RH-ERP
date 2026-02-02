import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import type { Project, User } from "@/types"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, LayoutGrid, Table as TableIcon, Loader2, Banknote, Activity, AlertCircle, Search, X, FolderOpen } from "lucide-react"
import type { KanbanColumnDefinition } from "./ProjectKanban"
import ProjectKanban from "./ProjectKanban"
import { ProjectTable } from "./ProjectTable"
import { ProjectForm } from "./ProjectForm"

// Import Components

// Helper Rupiah
const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

interface TemplateProps {
    pageTitle: string;
    projectType: 'arsitektur' | 'sipil' | 'interior';
    kanbanColumns: KanbanColumnDefinition[];
    statusOptions: { value: string, label: string }[];
    enableKanban?: boolean;
}

export default function ProjectPageTemplate({ 
    pageTitle, projectType, kanbanColumns, statusOptions, enableKanban = true 
}: TemplateProps) {
  
  const queryClient = useQueryClient();
  const user = pb.authStore.model;
  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'elvanrafif@gmail.com';

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDone, setShowDone] = useState(false);

  // 1. FETCH DATA KHUSUS TIPE INI
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', projectType, showDone],
    queryFn: async () => {
      // Filter dasar: Tipe harus sesuai halaman ini
      let filterRule = `type = '${projectType}'`;
      if (!showDone) filterRule += ` && status != 'done' && status != 'finish'`; 
      
      return await pb.collection('projects').getFullList<Project>({
        sort: '-created',
        expand: 'client,assignee', 
        filter: filterRule,
      });
    }
  });

  // 2. STATS & FILTERING LOGIC
  const stats = useMemo(() => {
    if (!projects) return { totalValue: 0, activeCount: 0, urgentCount: 0 };
    let totalValue = 0, activeCount = 0, urgentCount = 0;
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    projects.forEach(p => {
        totalValue += p.value || 0;
        activeCount++;
        if (p.deadline) {
            const d = new Date(p.deadline);
            if (d <= nextWeek && d >= today) urgentCount++;
        }
    });
    return { totalValue, activeCount, urgentCount };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let result = [...projects];
    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(p => 
            p.expand?.client?.company_name?.toLowerCase().includes(lower) ||
            p.meta_data?.area_scope?.toLowerCase().includes(lower) ||
            p.meta_data?.pic_lapangan?.toLowerCase().includes(lower)
        );
    }
    return result;
  }, [projects, searchQuery]);

  // --- MUTATIONS ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return await pb.collection('projects').update(id, { status });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast.success("Status diperbarui");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        return await pb.collection('projects').delete(id);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast.success("Project dihapus");
        setDeleteId(null);
    }
  });

  // HANDLERS
  const handleCreate = () => { setEditingProject(null); setIsDialogOpen(true); }
  const handleEdit = (project: Project) => { setEditingProject(project); setIsDialogOpen(true); }
  const handleStatusChange = (id: string, status: string) => updateStatusMutation.mutate({ id, status });

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{pageTitle}</h2>
                <p className="text-muted-foreground">Monitoring project tipe {projectType}.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                    <Switch id="show-done" checked={showDone} onCheckedChange={setShowDone} />
                    <Label htmlFor="show-done">Show History</Label>
                </div>
                {/* Employee / Admin boleh create */}
                <Button onClick={handleCreate} className="bg-primary"><Plus className="mr-2 h-4 w-4" /> Baru</Button>
            </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mb-6">
            <Card className="relative overflow-hidden shadow-sm hover:shadow transition-shadow">
                <div className="p-4 flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600">
                        <Banknote className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Total Omzet</p>
                        <div className="text-xl font-bold">
                            {isSuperAdmin ? formatRupiah(stats.totalValue) : "Confidential"}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500/20" />
            </Card>
            {/* ... Tambahkan card Activity & Deadline seperti sebelumnya ... */}
        </div>

        {/* FILTER BAR */}
        <div className="flex gap-3 mb-4 items-center bg-white p-3 rounded-lg border shadow-sm">
            <div className="relative w-full md:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari client, area scope, atau PIC..." className="pl-8" 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {searchQuery && (
                <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}><X className="h-4 w-4" /></Button>
            )}
        </div>

        {/* VIEW TABS */}
        <Tabs defaultValue={enableKanban ? "kanban" : "table"} className="flex-1 flex flex-col overflow-hidden">
            <div className="mb-2">
                <TabsList>
                    {enableKanban && <TabsTrigger value="kanban"><LayoutGrid className="mr-2 h-4 w-4" /> Board</TabsTrigger>}
                    <TabsTrigger value="table"><TableIcon className="mr-2 h-4 w-4" /> List View</TabsTrigger>
                </TabsList>
            </div>

            {isLoading ? <Loader2 className="animate-spin mx-auto mt-10" /> : (
                <>
                    {enableKanban && (
                        <TabsContent value="kanban" className="flex-1 overflow-hidden mt-0 border-0 h-full">
                            <ProjectKanban 
                                data={filteredProjects}
                                columnsConfig={kanbanColumns} // Config Kolom Dinamis
                                onEdit={handleEdit} 
                                onDelete={(p) => setDeleteId(p.id)} 
                                onStatusChange={handleStatusChange} 
                            />
                        </TabsContent>
                    )}
                    <TabsContent value="table" className="flex-1 overflow-auto mt-0 border-0">
                        {/* Gunakan ProjectTable yang lama, atau buat baru jika ingin kolom spesifik */}
                        <ProjectTable data={filteredProjects} onEdit={handleEdit} onDelete={(p) => setDeleteId(p.id)} />
                    </TabsContent>
                </>
            )}
        </Tabs>

        {/* FORM DIALOG */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingProject ? "Edit Project" : "Buat Project Baru"}</DialogTitle>
                </DialogHeader>
                <ProjectForm 
                    key={editingProject ? editingProject.id : "new"}
                    initialData={editingProject}
                    fixedType={projectType} // PASS TIPE
                    statusOptions={statusOptions} // PASS OPSI STATUS
                    onSuccess={() => setIsDialogOpen(false)}
                />
            </DialogContent>
        </Dialog>

        {/* DELETE ALERT */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Project?</AlertDialogTitle>
                    <AlertDialogDescription>Data tidak bisa dikembalikan.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-red-600">
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}