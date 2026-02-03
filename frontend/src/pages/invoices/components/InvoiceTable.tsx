import { Link } from "react-router-dom"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, FolderOpen, FileText, ArrowRight, Ruler } from "lucide-react"

// Helper internal
const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const getTypeBadge = (type: string) => {
    switch(type) {
        case 'design': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Design</Badge>;
        case 'sipil': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Sipil</Badge>;
        case 'interior': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Interior</Badge>;
        default: return <Badge variant="outline">General</Badge>;
    }
}

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'paid': return <Badge className="bg-green-600">Lunas</Badge>;
        case 'unpaid': return <Badge variant="secondary" className="text-slate-600">Belum Bayar</Badge>;
        case 'overdue': return <Badge variant="destructive">Jatuh Tempo</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

interface InvoiceTableProps {
    invoices: any[]; 
    isLoading: boolean;
}

export function InvoiceTable({ invoices, isLoading }: InvoiceTableProps) {
    return (
        <div className="rounded-md border bg-white w-full overflow-x-auto shadow-sm">
            <div className="min-w-[1000px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">No. Invoice</TableHead>
                            <TableHead className="w-[300px]">Judul</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead>Klien</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={7} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground"/></TableCell></TableRow>
                        ) : invoices?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-60">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                                            <FolderOpen className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p>Tidak ada invoice ditemukan.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices?.map((inv: any) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-mono text-xs text-slate-500">{inv.invoice_number}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center mr-3">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[250px]" title={inv.title}>{inv.title}</span>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <span>Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('id-ID') : '-'}</span>
                                                    {/* Tampilkan m2 jika Design */}
                                                    {inv.type === 'design' && inv.project_area > 0 && (
                                                        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-1 rounded">
                                                            <Ruler className="h-3 w-3" /> {inv.project_area} m²
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getTypeBadge(inv.type)}</TableCell>
                                    <TableCell>{inv.expand?.client_id?.company_name || "-"}</TableCell>
                                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-700">
                                        {formatRupiah(inv.total_amount || 0)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to={`/invoices/${inv.id}`}>
                                                Detail <ArrowRight className="ml-2 h-3 w-3" />
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
    )
}