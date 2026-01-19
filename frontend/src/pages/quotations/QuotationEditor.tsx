import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useReactToPrint } from "react-to-print"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Printer, Save, Loader2, ArrowLeft } from "lucide-react"

// Helper
const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

export default function QuotationEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const componentRef = useRef<HTMLDivElement>(null);
    
    // 1. FETCH DATA QUOTATION BY ID
    const { data: quotation, isLoading } = useQuery({
        queryKey: ['quotation', id],
        queryFn: async () => {
            return await pb.collection('quotations').getOne(id as string, {
                expand: 'client_id'
            });
        }
    });

    // STATE ITEMS
    // Kita set state setelah data ter-load (via useEffect)
    const [items, setItems] = useState<any[]>([{ description: "", quantity: 1, price: 0 }]);

    useEffect(() => {
        if (quotation?.items && quotation.items.length > 0) {
            setItems(quotation.items);
        }
    }, [quotation]);

    // HITUNG TOTAL
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // SAVE MUTATION
    const saveMutation = useMutation({
        mutationFn: async () => {
            return await pb.collection('quotations').update(id as string, {
                items: items,
                total_amount: totalAmount
            });
        },
        onSuccess: () => toast.success("Perubahan tersimpan"),
        onError: () => toast.error("Gagal menyimpan")
    });

    // PRINT HANDLER    
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Quotation-${quotation?.title || 'Draft'}`,
    });

    // ITEM HANDLERS
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };
    const addItem = () => setItems([...items, { description: "", quantity: 1, price: 0 }]);
    const removeItem = (index: number) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const client = quotation?.expand?.client_id;

    return (
        <div className="flex h-screen flex-col bg-slate-100 overflow-hidden">
            
            {/* HEADER BAR */}
            <div className="h-14 border-b bg-white flex items-center justify-between px-4 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/quotations')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Button>
                    <div className="h-6 w-px bg-slate-200" />
                    <span className="font-semibold text-sm">{quotation?.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="mr-4 text-sm font-medium text-slate-600">
                        Total: <span className="text-primary">{formatRupiah(totalAmount)}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" /> Simpan
                    </Button>
                    <Button size="sm" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                </div>
            </div>

            {/* CONTENT AREA (SPLIT VIEW) */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* KIRI: EDITOR FORM */}
                <div className="w-[450px] bg-white border-r flex flex-col h-full overflow-hidden shadow-lg z-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-500">Item Pekerjaan</h3>
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="p-3 rounded-lg border bg-slate-50 space-y-3 relative group hover:border-blue-300 transition-colors">
                                        <div>
                                            <Label className="text-xs text-slate-500">Deskripsi</Label>
                                            <Input 
                                                value={item.description} 
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                className="bg-white h-8 text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs text-slate-500">Qty</Label>
                                                <Input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                    className="bg-white h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-500">Harga Satuan</Label>
                                                <Input 
                                                    type="number" 
                                                    value={item.price} 
                                                    onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                                                    className="bg-white h-8 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" size="icon" 
                                            className="absolute top-1 right-1 h-6 w-6 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addItem} className="w-full border-dashed">
                                    <Plus className="h-4 w-4 mr-2" /> Tambah Baris
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KANAN: PREVIEW A4 */}
                <div className="flex-1 overflow-y-auto bg-slate-200/50 p-8 flex justify-center">
                    <div className="scale-[0.85] origin-top">
                        <div 
                            ref={componentRef} 
                            className="bg-white shadow-xl mx-auto p-[15mm]"
                            style={{ width: '210mm', minHeight: '297mm', color: 'black' }} 
                        >
                            {/* --- ISI KERTAS PDF --- */}
                            
                            {/* Header */}
                            <div className="flex justify-between items-start mb-10 border-b pb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">QUOTATION</h1>
                                    <p className="text-sm text-slate-500 mt-1">ID: {quotation?.id?.substring(0,8).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="font-bold text-lg">Perusahaan Anda</h2>
                                    <p className="text-sm text-slate-600">Jl. Teknologi No. 123</p>
                                    <p className="text-sm text-slate-600">Jakarta Selatan</p>
                                </div>
                            </div>

                            {/* Info Klien */}
                            <div className="flex justify-between mb-12">
                                <div className="w-1/2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Kepada Yth:</h3>
                                    <p className="font-bold text-lg text-slate-800">{client?.company_name || "Nama Klien"}</p>
                                    <p className="text-slate-600">{client?.address}</p>
                                    <p className="text-slate-600">{client?.phone}</p>
                                </div>
                                <div className="w-1/3 text-right">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Detail:</h3>
                                    <p className="font-bold text-slate-800">{quotation?.title}</p>
                                    <p className="text-sm text-slate-600">
                                        Tgl: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'})}
                                    </p>
                                </div>
                            </div>

                            {/* Tabel */}
                            <table className="w-full text-sm mb-8">
                                <thead>
                                    <tr className="border-b-2 border-slate-800">
                                        <th className="text-left py-3 font-bold w-[50%]">DESKRIPSI</th>
                                        <th className="text-center py-3 font-bold">QTY</th>
                                        <th className="text-right py-3 font-bold">HARGA</th>
                                        <th className="text-right py-3 font-bold">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, i) => (
                                        <tr key={i} className="border-b border-slate-100">
                                            <td className="py-4 text-slate-700">{item.description}</td>
                                            <td className="py-4 text-center text-slate-700">{item.quantity}</td>
                                            <td className="py-4 text-right text-slate-700">{formatRupiah(item.price)}</td>
                                            <td className="py-4 text-right font-bold text-slate-800">{formatRupiah(item.quantity * item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Total */}
                            <div className="flex justify-end mb-20">
                                <div className="w-1/2 border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-slate-800">Total Tagihan</span>
                                        <span className="text-xl font-bold text-primary">{formatRupiah(totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between text-sm text-slate-600 mt-auto pt-10 border-t">
                                <div className="w-2/3 pr-10">
                                    <p className="font-bold mb-2">Syarat & Ketentuan:</p>
                                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-500">
                                        <li>Harga belum termasuk PPN 11%.</li>
                                        <li>Penawaran berlaku 14 hari sejak tanggal terbit.</li>
                                    </ul>
                                </div>
                                <div className="text-center w-1/3">
                                    <p className="mb-16">Hormat Kami,</p>
                                    <div className="border-b border-slate-300 w-2/3 mx-auto mb-2"></div>
                                    <p className="font-bold text-slate-800">Elvan Rafif</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}