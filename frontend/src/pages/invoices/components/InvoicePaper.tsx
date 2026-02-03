import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Building2 } from "lucide-react"

// Helper Rupiah
const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

interface InvoicePaperProps {
    data: any; // Data Invoice Lengkap
    client: any; // Data Client
}

export function InvoicePaper({ data, client }: InvoicePaperProps) {
    if (!data) return null;

    // Hitung Grand Total
    const subtotal = data.items?.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0) || 0;
    
    return (
        <div 
            id="invoice-print-area"
            className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-lg text-sm text-slate-900 relative mx-auto"
            style={{ fontFamily: 'Roboto, sans-serif' }}
        >
            {/* --- HEADER --- */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                <div>
                    {/* Ganti dengan Logo Perusahaan Anda */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-10 w-10 bg-slate-900 text-white flex items-center justify-center rounded">
                            <Building2 size={24} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">RH STUDIO</h1>
                    </div>
                    <p className="text-slate-500 text-xs max-w-[200px]">
                        Jalan Arsitektur No. 88<br/>
                        Jakarta Selatan, 12345<br/>
                        +62 812 3456 7890
                    </p>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-light text-slate-300 tracking-widest uppercase mb-1">Invoice</h2>
                    <p className="font-mono font-bold text-lg text-slate-700">{data.invoice_number}</p>
                    
                    {/* Status Badge (Hanya tampil di layar, tidak di print jika css print diatur) */}
                    <div className="mt-2 print:hidden">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            data.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {data.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- INFO CLIENT & PROYEK --- */}
            <div className="flex justify-between mb-8">
                <div className="w-1/2">
                    <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Bill To:</h3>
                    <p className="font-bold text-lg">{client?.company_name || "Nama Klien"}</p>
                    <p className="text-slate-600 whitespace-pre-line">{client?.address || "Alamat belum diisi"}</p>
                    <p className="text-slate-600 mt-1">{client?.phone}</p>
                </div>
                <div className="w-1/2 text-right">
                    <div className="space-y-1">
                        <div className="flex justify-end gap-4">
                            <span className="text-slate-500">Invoice Date:</span>
                            <span className="font-medium">{data.date ? format(new Date(data.date), "dd MMMM yyyy", { locale: id }) : "-"}</span>
                        </div>
                        <div className="flex justify-end gap-4">
                            <span className="text-slate-500">Due Date:</span>
                            <span className="font-medium">{data.due_date ? format(new Date(data.due_date), "dd MMMM yyyy", { locale: id }) : "-"}</span>
                        </div>
                        
                        {/* Jika Design, Tampilkan Luas */}
                        {data.type === 'design' && data.project_area > 0 && (
                             <div className="flex justify-end gap-4 mt-2 pt-2 border-t border-dashed">
                                <span className="text-slate-500">Project Area:</span>
                                <span className="font-bold">{data.project_area} m²</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- PROJECT TITLE --- */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">{data.title}</h3>
            </div>

            {/* --- TABLE ITEMS --- */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-slate-800">
                        <th className="text-left py-3 font-bold uppercase text-xs w-[60%]">Description</th>
                        <th className="text-right py-3 font-bold uppercase text-xs">Amount (IDR)</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items?.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-200">
                            <td className="py-4">
                                <p className="font-bold text-slate-800">{item.name}</p>
                                {item.note && <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>}
                            </td>
                            <td className="text-right py-4 font-medium text-slate-700">
                                {formatRupiah(item.amount)}
                            </td>
                        </tr>
                    ))}
                    {(!data.items || data.items.length === 0) && (
                        <tr>
                            <td colSpan={2} className="py-8 text-center text-slate-400 italic">Belum ada item detail</td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td className="pt-4 text-right font-bold text-slate-500 pr-8">TOTAL</td>
                        <td className="pt-4 text-right font-bold text-2xl text-slate-900">
                            {formatRupiah(subtotal)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* --- FOOTER (BANK & SIGNATURE) --- */}
            <div className="grid grid-cols-2 gap-8 mt-12 break-inside-avoid">
                <div>
                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Payment Details</h3>
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                        <p className="whitespace-pre-line text-slate-700 font-medium">{data.bank_details || "Belum ada info bank"}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">
                        * Mohon cantumkan No. Invoice saat melakukan pembayaran.
                    </p>
                </div>
                <div className="text-center mt-4">
                    <p className="text-slate-500 mb-16">Regards,</p>
                    <p className="font-bold underline">Elvan Rafif</p>
                    <p className="text-xs text-slate-500">Principal Architect</p>
                </div>
            </div>

            {/* PRINT FOOTER */}
            <div className="absolute bottom-12 left-0 w-full text-center print:block hidden">
                <p className="text-[10px] text-slate-400">Thank you for your business.</p>
            </div>
        </div>
    )
}