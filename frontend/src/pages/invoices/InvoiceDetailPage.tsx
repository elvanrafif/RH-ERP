import { useState, useRef, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useReactToPrint } from "react-to-print"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Printer, Save, Loader2, ArrowLeft, CalendarDays } from "lucide-react"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import RHStudioKopImg from '@/assets/rh-studio-kop.jpg'

// Helper Format Rupiah
const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

// --- CONFIG TEMPLATE ---
const getTemplateByType = (type: string) => {
    switch(type) {
        case 'design':
            return [
                { name: "Termin 1", percent: "DP", amount: 2500000, status: "", paymentDate: "" },
                { name: "Termin 2", percent: "50%", amount: 0, status: "", paymentDate: "" },
                { name: "Termin 3", percent: "30%", amount: 0, status: "", paymentDate: "" },
                { name: "Termin 4", percent: "Pelunasan", amount: 0, status: "", paymentDate: "" },
            ];
        case 'sipil':
             // Contoh Template Sipil
             return [
                { name: "Termin 1", percent: "30%", amount: 0, status: "", paymentDate: "" },
                { name: "Termin 2", percent: "30%", amount: 0, status: "", paymentDate: "" },
                { name: "Termin 3", percent: "30%", amount: 0, status: "", paymentDate: "" },
                { name: "Termin 4", percent: "10%", amount: 0, status: "", paymentDate: "" },
            ];
        default:
            return [
                { name: "Termin 1", percent: "", amount: 0, status: "", paymentDate: "" },
                { name: "Termin 2", percent: "", amount: 0, status: "", paymentDate: "" },
                { name: "Termin 3", percent: "", amount: 0, status: "", paymentDate: "" },
                { name: "Termin 4", percent: "", amount: 0, status: "", paymentDate: "" },
            ];
    }
}

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const componentRef = useRef<HTMLDivElement>(null);
    
    // FETCH DATA
    const { data: invoice, isLoading } = useQuery({
        queryKey: ['invoice', id],
        queryFn: async () => {
            return await pb.collection('invoices').getOne(id as string, { expand: 'client_id' });
        }
    });

    // STATE
    const [items, setItems] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [activeTermin, setActiveTermin] = useState("1"); 
    const [status, setStatus] = useState("unpaid");
    const [bankDetails, setBankDetails] = useState("");
    
    // Header Data
    const [projectArea, setProjectArea] = useState(0); 
    const [pricePerMeter, setPricePerMeter] = useState(200000);

    // Hitung Grand Total (Kontrak)
    const grandTotal = projectArea > 0 
        ? projectArea * pricePerMeter 
        : items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // --- LOGIC RE-CALCULATE ALL ITEMS ---
    const recalculateAllItems = useCallback((currentItems: any[], currentTotal: number) => {
        let runningTotal = 0; 

        return currentItems.map((item) => {
            let newAmount = 0;
            const val = item.percent || "";
            const cleanVal = val.toString().replace('%', '').trim().toLowerCase();

            if (cleanVal === "dp") {
                newAmount = 2500000;
            }
            else if (cleanVal === "pelunasan") {
                newAmount = Math.max(0, currentTotal - runningTotal);
            }
            else {
                const numericVal = parseFloat(cleanVal);
                if (!isNaN(numericVal) && currentTotal > 0) {
                    newAmount = (currentTotal * numericVal) / 100;
                } else {
                    newAmount = Number(item.amount) || 0;
                }
            }

            runningTotal += newAmount;
            return { ...item, amount: newAmount };
        });
    }, []);

    // --- EFFECT: INITIAL LOAD ---
    useEffect(() => {
        if (invoice) {
            let loadedItems = [];
            if (invoice.items && invoice.items.length > 0) {
                loadedItems = invoice.items;
            } else {
                loadedItems = getTemplateByType(invoice.type);
            }
            
            setTitle(invoice.title || "");
            setDate(invoice.date ? invoice.date.substring(0, 10) : "");
            setActiveTermin(invoice.active_termin || "1");
            setStatus(invoice.status || "unpaid");
            setBankDetails(invoice.bank_details || "");
            
            const area = invoice.project_area || 0;
            const price = invoice.price_per_meter || 200000;
            setProjectArea(area);
            setPricePerMeter(price);

            const total = area > 0 ? area * price : 0;
            if (total > 0) {
                setItems(prev => recalculateAllItems(loadedItems, total));
            } else {
                setItems(loadedItems);
            }
        }
    }, [invoice, recalculateAllItems]);

    // --- EFFECT: AUTO-CALC WHEN INPUT CHANGES ---
    useEffect(() => {
        if (projectArea > 0 && pricePerMeter > 0 && items.length > 0) {
            const newTotal = projectArea * pricePerMeter;
            setItems(prevItems => recalculateAllItems(prevItems, newTotal));
        }
    }, [projectArea, pricePerMeter, recalculateAllItems]); 

    // --- HANDLERS ---
    const handlePercentChange = (index: number, val: string) => {
        const newItems = [...items];
        newItems[index].percent = val;
        const recalculated = recalculateAllItems(newItems, grandTotal);
        setItems(recalculated);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    // --- REMAINING PAYMENT LOGIC ---
    const paidAmount = items
        .filter(i => i.status === 'Success')
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    
    const remainingPayment = grandTotal - paidAmount;

    // SAVE
    const saveMutation = useMutation({
        mutationFn: async () => {
            return await pb.collection('invoices').update(id as string, {
                title,
                date: new Date(date),
                status,
                items: items,
                bank_details: bankDetails,
                total_amount: grandTotal,
                project_area: projectArea,
                price_per_meter: pricePerMeter,
                active_termin: activeTermin
            });
        },
        onSuccess: () => {
            toast.success("Invoice tersimpan");
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: () => toast.error("Gagal menyimpan")
    });

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Invoice-${invoice?.invoice_number || 'Draft'}`,
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    const client = invoice?.expand?.client_id;

    return (
        <div className="flex h-screen flex-col bg-slate-100 overflow-hidden">
            
            {/* HEADER BAR */}
            <div className="h-14 border-b bg-white flex items-center justify-between px-4 shadow-sm z-10 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Button>
                    <div className="h-6 w-px bg-slate-200" />
                    <span className="font-semibold text-sm font-mono">{invoice?.invoice_number}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="mr-4 text-sm font-medium text-slate-600">
                        Total: <span className="text-blue-600 font-bold">{formatRupiah(grandTotal)}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" /> Simpan
                    </Button>
                    <Button size="sm" onClick={() => handlePrint()}>
                        <Printer className="mr-2 h-4 w-4" /> Print PDF
                    </Button>
                </div>
            </div>

            {/* SPLIT VIEW */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* KIRI: EDITOR FORM */}
                <div className="w-[450px] bg-white border-r flex flex-col h-full overflow-hidden shadow-lg z-0 print:hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        
                        {/* SETTINGS UTAMA (Compact) */}
                        <div className="space-y-4 border-b pb-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-xs uppercase tracking-wide text-slate-500">Pengaturan</h3>
                                <div className="flex items-center gap-2">
                                     <Label className="text-[10px] uppercase font-bold text-yellow-700">Termin Aktif:</Label>
                                     <Select value={activeTermin} onValueChange={setActiveTermin}>
                                        <SelectTrigger className="h-6 w-24 text-xs bg-yellow-50 border-yellow-200 text-yellow-800"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {items.map((_, i) => (
                                                <SelectItem key={i} value={String(i + 1)}>Termin {i + 1}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-500">Invoice Date</Label>
                                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-7 text-xs" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-500">Judul (Optional)</Label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-7 text-xs" placeholder="Judul..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-500">Luas (m2)</Label>
                                    <Input 
                                        type="number" value={projectArea} 
                                        onChange={(e) => setProjectArea(Number(e.target.value))} className="h-7 text-xs" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-500">Harga / m2</Label>
                                    <Input 
                                        type="number" value={pricePerMeter} 
                                        onChange={(e) => setPricePerMeter(Number(e.target.value))} className="h-7 text-xs" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ITEMS EDITOR (Compact Layout) */}
                        <div>
                            <h3 className="font-semibold mb-3 text-xs uppercase tracking-wide text-slate-500">Detail Termin</h3>
                            <div className="space-y-3">
                                {items.map((item, index) => {
                                    const isActive = activeTermin === String(index + 1);
                                    
                                    return (
                                        <div key={index} className={`p-3 rounded border text-xs shadow-sm transition-all ${isActive ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                            
                                            {/* BARIS 1: Nama Termin & Status (Header) */}
                                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-dashed border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    {/* Nama Termin (Editable tapi look like text) */}
                                                    <Input 
                                                        value={item.name} 
                                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                        className={`h-6 w-32 px-1 text-xs font-bold border-none bg-transparent shadow-none focus-visible:ring-0 ${isActive ? 'text-blue-700' : 'text-slate-700'}`}
                                                    />
                                                    {isActive && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Aktif</span>}
                                                </div>
                                                
                                                {/* Status Select (Compact) */}
                                                <div className="w-24">
                                                    <Select value={item.status || "empty"} onValueChange={(val) => updateItem(index, 'status', val === "empty" ? "" : val)}>
                                                        <SelectTrigger className={`h-6 text-[10px] ${item.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white'}`}>
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="empty"><span className="text-slate-400">Belum Bayar</span></SelectItem>
                                                            <SelectItem value="Success"><span className="font-bold text-green-600">Lunas</span></SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            
                                            {/* BARIS 2: Inputs Grid */}
                                            <div className="grid grid-cols-7 gap-2 items-center">
                                                
                                                {/* Kolom 1: Persen (2 col) */}
                                                <div className="col-span-2 space-y-0.5">
                                                    <Label className="text-[9px] text-slate-400 uppercase">Keterangan / %</Label>
                                                    <Input 
                                                        value={item.percent} 
                                                        onChange={(e) => handlePercentChange(index, e.target.value)}
                                                        placeholder="DP / 50%"
                                                        className="h-7 text-xs bg-white"
                                                    />
                                                </div>

                                                {/* Kolom 2: Price (3 col) */}
                                                <div className="col-span-3 space-y-0.5">
                                                    <Label className="text-[9px] text-slate-400 uppercase">Nominal (Auto)</Label>
                                                    <Input 
                                                        value={formatRupiah(Number(item.amount) || 0)} 
                                                        readOnly disabled
                                                        className="h-7 text-xs font-mono bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                                    />
                                                </div>

                                                {/* Kolom 3: Date (2 col) */}
                                                <div className="col-span-2 space-y-0.5">
                                                    <Label className="text-[9px] text-slate-400 uppercase">Tgl Bayar</Label>
                                                    <div className="relative">
                                                        <Input 
                                                            type="date"
                                                            value={item.paymentDate || ""} 
                                                            onChange={(e) => updateItem(index, 'paymentDate', e.target.value)}
                                                            className="h-7 text-[10px] px-1 bg-white"
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* BANK DETAILS */}
                        <div className="border-t pt-4">
                            <Label className="text-xs mb-2 block font-semibold text-slate-500">Info Rekening</Label>
                            <Textarea 
                                value={bankDetails}
                                onChange={(e) => setBankDetails(e.target.value)}
                                className="text-xs min-h-[60px] resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* KANAN: PREVIEW A4 */}
                <div className="flex-1 overflow-y-auto bg-slate-200/50 p-8 flex justify-center print:p-0 print:bg-white print:overflow-visible">
                    <div className="scale-[0.85] origin-top print:scale-100">
                        <div 
                            ref={componentRef} 
                            id="invoice-print-area"
                            className="bg-white shadow-xl mx-auto p-[15mm] print:shadow-none"
                            style={{ 
                                width: '210mm', 
                                minHeight: '297mm', 
                                color: 'black',
                                fontFamily: 'Roboto, sans-serif' 
                            }}
                        >
                            {/* HEADER */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">RH STUDIO ARSITEK</h1>
                                    <p className="text-sm text-gray-600 mt-1">Ruko Puri Aster,<br />
                                    Jl. Boulevard Grand Depok City<br />
                                    (+62) 858 1005 5005</p>
                                </div>
                                <div className="text-right">
                                    <img src={RHStudioKopImg} alt="RH Studio Kop" className="w-28 h-28 object-contain" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="py-2 bg-black text-center mb-1">
                                    <h2 className="text-[#f1c232] text-2xl font-bold uppercase">
                                        INVOICE {title}
                                    </h2>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 mb-6">
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-yellow-600 font-bold text-lg">
                                        Termin {activeTermin}
                                    </p>
                                    <p className="text-yellow-600 font-bold">
                                        Invoice Date: {date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric'}) : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="w-full mb-10">
                                <div className="w-1/2 mb-6">
                                    <h3 className="text-md font-bold">Invoice to:</h3>
                                    <p className="text-slate-600 text-sm font-bold">{client?.company_name || "Nama Klien"}</p>
                                    <p className="text-slate-600 text-sm">{client?.address}</p>
                                    <p className="text-slate-600 text-sm">{client?.phone}</p>
                                </div>
                                <div className="flex items-center justify-between mb-4 border-t border-b border-gray-100 py-3">
                                    <div className="text-center">
                                        <h3 className="text-md font-bold">Design Project:</h3>
                                        <p className="text-slate-600 text-sm pl-0">{projectArea} m²</p>
                                    </div>
                                    <div className="text-center pr-10">
                                        <h3 className="text-md font-bold">Price per m²:</h3>
                                        <p className="text-slate-600 text-sm">{formatRupiah(pricePerMeter)}</p>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-yellow-600 text-lg font-bold">
                                       Total Payment : {formatRupiah(grandTotal)}      
                                    </h2>
                                </div>
                            </div>

                            {/* TABEL TERMIN (VISUAL LOGIC: HIDE FUTURE AMOUNTS) */}
                            <table className="w-full text-sm mb-8">
                                <thead>
                                    <tr className="bg-black">
                                        <th className="font-bold text-md py-2 text-yellow-500 border-r-0 text-center w-[25%]">DESCRIPTION</th>
                                        <th className="font-bold text-md py-2 text-yellow-500 text-center w-[15%]">%</th>
                                        <th className="font-bold text-md py-2 text-yellow-500 text-center w-[25%]">PRICE</th>
                                        <th className="font-bold text-md py-2 text-yellow-500 text-center w-[15%]">STATUS</th>
                                        <th className="font-bold text-md py-2 text-yellow-500 text-center w-[20%]">PAYMENT DATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, i) => {
                                        // Index Logic
                                        const activeIndex = parseInt(activeTermin) - 1;
                                        
                                        // 1. Apakah baris ini Masa Depan?
                                        const isFuture = i > activeIndex;

                                        // 2. Apakah baris ini Aktif saat ini?
                                        const isActiveRow = String(i + 1) === activeTermin;

                                        // Styling Colors
                                        // Aktif/Masa Lalu: Hitam. Masa Depan: Abu.
                                        const textColor = isFuture ? 'text-gray-300' : 'text-slate-900';
                                        const fontWeight = isActiveRow ? 'font-bold' : 'font-normal';
                                        
                                        // LOGIC DISPLAY PRICE:
                                        // Jika Future -> Sembunyikan Price ("-")
                                        // Jika Aktif/Past -> Tampilkan Price
                                        const displayPrice = isFuture ? "-" : formatRupiah(Number(item.amount) || 0);

                                        return (
                                            <tr key={i} className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                                                <td className={`py-4 text-center ${textColor} ${fontWeight}`}>
                                                    {item.name}
                                                </td>
                                                <td className={`py-4 text-center ${textColor} ${fontWeight}`}>
                                                   {item.percent}
                                                </td>
                                                <td className={`py-4 text-center ${textColor} ${fontWeight}`}>
                                                    {displayPrice}
                                                </td>
                                                <td className={`py-4 text-center ${textColor} ${fontWeight}`}>
                                                    {item.status}
                                                </td>
                                                <td className={`py-4 text-center ${textColor} ${fontWeight}`}>
                                                    {item.paymentDate 
                                                        ? new Date(item.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit'}) 
                                                        : ''}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            <div className="mb-10 mr-18">
                                <div className="flex justify-end gap-10 pt-4 border-t border-black">
                                    <span className="text-xl font-bold">Remaining Payment</span>
                                    <span className="text-xl font-bold">{formatRupiah(remainingPayment)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between mt-auto pt-10">
                                <div className="w-2/3 pr-10">
                                    <h2 className="font-bold uppercase text-md">INFORMASI PEMBAYARAN</h2>
                                    <div className="text-gray-700 bg-slate-50 p-2 rounded">
                                        <p className="whitespace-pre-line font-medium text-md">
                                            {bankDetails || "Belum ada info rekening."}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-center w-1/3 flex flex-col justify-end">
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}