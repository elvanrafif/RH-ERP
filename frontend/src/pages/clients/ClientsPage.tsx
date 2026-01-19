import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import type { Client } from "@/types"
import { getColumns } from "./columns" 
import { DataTable } from "@/components/ui/data-table"
import { ClientForm } from "./ClientForm"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Loader2, FolderOpen } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { 
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog"

export default function ClientsPage() {
  const queryClient = useQueryClient()
  
  // STATE
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const debouncedSearch = useDebounce(searchTerm, 500)

  // 1. FETCH DATA
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', debouncedSearch],
    queryFn: async () => {
      const filterRule = debouncedSearch 
        ? `company_name ~ "${debouncedSearch}" || email ~ "${debouncedSearch}" || phone ~ "${debouncedSearch}" || address ~ "${debouncedSearch}"`
        : "";

      return await pb.collection('clients').getFullList<Client>({
        sort: '-created',
        filter: filterRule,
      })
    }
  })

  // 2. DELETE MUTATION
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        return await pb.collection('clients').delete(id);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        toast.success("Data klien berhasil dihapus");
        setDeleteId(null);
    },
    onError: () => toast.error("Gagal menghapus data klien")
  });

  // HANDLERS
  const handleCreate = () => {
    setEditingClient(null); 
    setOpen(true);
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client); 
    setOpen(true);
  }

  const handleDeleteClick = (client: Client) => {
    setDeleteId(client.id);
  }

  const handleConfirmDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  }

  const columns = useMemo(() => getColumns(handleEdit, handleDeleteClick), [handleEdit, handleDeleteClick])

  if (error) return <div className="p-8 text-red-500">Error memuat data: {error.message}</div>

  return (
    // WRAPPER UTAMA: Menangani Scroll Horizontal
    <div className="w-full overflow-x-auto bg-slate-50/50">
      
      {/* CONTAINER FIX WIDTH: 
          min-w-[1024px] artinya lebar minimal akan selalu 1024px (seukuran Tablet Landscape/Laptop Kecil).
          Jika layar HP cuma 360px, maka user harus scroll ke kanan untuk melihat sisa 664px-nya.
      */}
      <div className="min-w-[1024px] space-y-4 p-8 pt-6">
        
        {/* HEADER */}
        <div className="flex flex-row items-center justify-between gap-4">
          <div>
              <h2 className="text-3xl font-bold tracking-tight">Database Clients</h2>
              <p className="text-muted-foreground">Kelola data pelanggan dan informasi kontak.</p>
          </div>
          
          {/* MODAL FORM */}
          <Dialog open={open} onOpenChange={setOpen}>
              <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" /> Tambah Client
              </Button>
              <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                      <DialogTitle>{editingClient ? "Edit Data Klien" : "Tambah Klien Baru"}</DialogTitle>
                      <DialogDescription>
                          {editingClient ? "Perbarui informasi klien di bawah ini." : "Isi data klien lengkap di bawah ini."}
                      </DialogDescription>
                  </DialogHeader>
                  
                  <ClientForm 
                    key={editingClient ? editingClient.id : "new-client"}
                    initialData={editingClient} 
                    onSuccess={() => setOpen(false)} 
                  />
              </DialogContent>
          </Dialog>
        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center space-x-2 bg-white p-1 rounded-md border w-[400px]">
          <Search className="h-4 w-4 ml-2 text-gray-500" />
          <Input 
            placeholder="Cari nama, email, atau telepon..." 
            className="border-none focus-visible:ring-0 shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* CONTENT AREA */}
        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data?.length === 0 ? (
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center h-60 border rounded-lg bg-slate-50/50 dashed border-2 border-dashed text-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <FolderOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Tidak ada klien ditemukan</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                  Coba ubah kata kunci pencarian atau tambah klien baru.
              </p>
          </div>
        ) : (
          // DATA TABLE
          <div className="bg-white rounded-md border">
              <DataTable columns={columns} data={data || []} />
          </div>
        )}

        {/* ALERT DIALOG DELETE */}
        <AlertDialog open={!!deleteId} onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Data Klien?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Tindakan ini permanen. Semua project yang berhubungan dengan klien ini mungkin akan kehilangan referensi nama klien.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                      {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ya, Hapus"}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  )
}