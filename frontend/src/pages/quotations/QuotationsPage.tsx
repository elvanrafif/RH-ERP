import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/useDebounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, FileText, Loader2, ArrowRight, Search, X, FolderOpen } from "lucide-react"

// Helper Format Rupiah
const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // STATE SEARCH & FILTER
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  
  // Debounce Search agar tidak spam API saat mengetik
  const debouncedSearch = useDebounce(searchTerm, 500);

  // STATE FORM CREATE
  const [newTitle, setNewTitle] = useState("");
  const [selectedClient, setSelectedClient] = useState("");

  // 1. FETCH CLIENTS (Untuk Filter & Dropdown Create)
  const { data: clients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => await pb.collection('clients').getFullList({ sort: 'company_name' }),
  });

  // 2. FETCH QUOTATIONS (Dengan Logic Filter)
  const { data: quotations, isLoading } = useQuery({
    queryKey: ['quotations', debouncedSearch, filterClient],
    queryFn: async () => {
      // Logic Filter PocketBase
      const filters = [];
      
      // Filter Judul (Search)
      if (debouncedSearch) {
        filters.push(`title ~ "${debouncedSearch}"`);
      }
      
      // Filter Klien (Select)
      if (filterClient && filterClient !== "all") {
        filters.push(`client_id = "${filterClient}"`);
      }

      // Gabungkan filter dengan "&&"
      const filterString = filters.length > 0 ? filters.join(" && ") : "";

      return await pb.collection('quotations').getFullList({
        sort: '-created',
        expand: 'client_id',
        filter: filterString
      });
    }
  });

  // 3. CREATE MUTATION
  const createMutation = useMutation({
    mutationFn: async () => {
      return await pb.collection('quotations').create({
        title: newTitle,
        client_id: selectedClient,
        date: new Date(),
        status: 'draft',
        items: [],
        total_amount: 0
      });
    },
    onSuccess: (data) => {
      toast.success("Quotation dibuat!");
      setIsDialogOpen(false);
      // Reset Form
      setNewTitle("");
      setSelectedClient("");
      // Redirect ke Editor
      navigate(`/quotations/${data.id}`);
    },
    onError: () => toast.error("Gagal membuat quotation")
  });

  const handleCreateSubmit = () => {
      if(!newTitle || !selectedClient) {
          toast.error("Mohon isi judul dan pilih klien");
          return;
      }
      createMutation.mutate();
  }
  
  const handleResetFilter = () => {
    setSearchTerm("");
    setFilterClient("all");
  }

  return (
    <div className="p-8 pt-6 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
            <p className="text-muted-foreground">Kelola penawaran harga untuk klien.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Buat Quotation Baru
        </Button>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-white p-3 rounded-lg border shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Cari judul quotation..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Filter Client Select */}
        <div className="w-full md:w-56">
            <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger>
                    <SelectValue placeholder="Semua Klien" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Klien</SelectItem>
                    {clients?.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                            {client.company_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* Reset Button (Muncul jika filter aktif) */}
        {(searchTerm || filterClient !== "all") && (
            <Button variant="ghost" size="icon" onClick={handleResetFilter} title="Reset Filter">
                <X className="h-4 w-4" />
            </Button>
        )}
      </div>

      {/* TABLE LIST (Responsive Fix) */}
      <div className="rounded-md border bg-white w-full overflow-x-auto shadow-sm">
        
        {/* Container Inner dengan Lebar Tetap (Min 1000px) */}
        {/* Ini mencegah tabel menjadi 'gepeng' di layar HP. User harus scroll horizontal. */}
        <div className="min-w-[1000px]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Judul</TableHead>
                        <TableHead>Klien</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground"/></TableCell></TableRow>
                    ) : quotations?.length === 0 ? (
                        // Empty State
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-60">
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                                        <FolderOpen className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p>Tidak ada data quotation ditemukan.</p>
                                    {(searchTerm || filterClient !== "all") && (
                                        <Button variant="link" onClick={handleResetFilter} className="mt-2">
                                            Reset Filter
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        quotations?.map((q: any) => (
                            <TableRow key={q.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        {q.title}
                                    </div>
                                </TableCell>
                                <TableCell>{q.expand?.client_id?.company_name || "-"}</TableCell>
                                <TableCell>
                                    {new Date(q.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                </TableCell>
                                <TableCell className="text-right font-bold text-slate-700">
                                    {formatRupiah(q.total_amount || 0)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link to={`/quotations/${q.id}`}>
                                            Edit <ArrowRight className="ml-2 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      </div>

      {/* MODAL CREATE */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Buat Quotation Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label>Judul Penawaran</Label>
                      <Input 
                        placeholder="Contoh: Penawaran Renovasi Ruko" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                  </div>
                  <div className="space-y-2">
                      <Label>Pilih Klien</Label>
                      <Select onValueChange={setSelectedClient} value={selectedClient}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Klien..." />
                        </SelectTrigger>
                        <SelectContent>
                            {clients?.map((client: any) => (
                                <SelectItem key={client.id} value={client.id}>
                                    {client.company_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                  </div>
                  <Button className="w-full" onClick={handleCreateSubmit} disabled={createMutation.isPending}>
                      {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Buat & Buka Editor
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  )
}