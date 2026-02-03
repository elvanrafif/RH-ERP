import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { pb } from "@/lib/pocketbase"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface InvoiceCreateDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    clients: any[];
}

// Template Items Default (Sesuai request Termin 1-4)
const DEFAULT_ITEMS = [
    { name: "Termin 1", percent: "DP", amount: 2500000, status: "", paymentDate: "" }, // Default DP 2.5jt
    { name: "Termin 2", percent: "50%", amount: 0, status: "", paymentDate: "" },
    { name: "Termin 3", percent: "30%", amount: 0, status: "", paymentDate: "" },
    { name: "Termin 4", percent: "Pelunasan", amount: 0, status: "", paymentDate: "" },
];

export function InvoiceCreateDialog({ isOpen, onOpenChange, clients }: InvoiceCreateDialogProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- STATE SIMPLE ---
    const [selectedType, setSelectedType] = useState<"design" | "sipil" | "interior">("design");
    const [newTitle, setNewTitle] = useState("");
    const [selectedClient, setSelectedClient] = useState("");

    const createMutation = useMutation({
        mutationFn: async () => {
            const prefix = selectedType.toUpperCase().substring(0,3);
            const timestamp = Date.now().toString().slice(-6);
            const invoiceNum = `INV-${prefix}-${timestamp}`;
            
            return await pb.collection('invoices').create({
                invoice_number: invoiceNum,
                title: newTitle,
                client_id: selectedClient,
                type: selectedType,
                
                // --- DEFAULT VALUES (PREFILL) ---
                date: new Date(), // Hari ini
                status: 'unpaid',
                active_termin: "1", // Termin 1 Aktif
                price_per_meter: 200000, // Default 200rb
                project_area: 0, // Nanti diisi di editor
                total_amount: 2500000, // Awal cuma hitung DP dulu
                bank_details: "Ismail Deyrian Anugrah\nBNI - 0717571663",
                items: DEFAULT_ITEMS
            });
        },
        onSuccess: (data) => {
            toast.success("Invoice dibuat!");
            // Reset Form
            setNewTitle("");
            setSelectedClient("");
            onOpenChange(false);
            
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            
            // Langsung buka editor
            navigate(`/invoices/${data.id}`);
        },
        onError: () => toast.error("Gagal membuat invoice")
    });

    const handleSubmit = () => {
        if(!newTitle || !selectedClient || !selectedType) {
            toast.error("Mohon lengkapi data invoice");
            return;
        }
        createMutation.mutate();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Buat Invoice Baru</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    {/* 1. Tipe Invoice */}
                    <div className="space-y-2">
                        <Label>Tipe Invoice</Label>
                        <Select value={selectedType} onValueChange={(val: any) => setSelectedType(val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="design">Design Architecture</SelectItem>
                                <SelectItem value="sipil">Sipil / Konstruksi</SelectItem>
                                <SelectItem value="interior">Interior Design</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 2. Judul */}
                    <div className="space-y-2">
                        <Label>Judul Project</Label>
                        <Input 
                            placeholder="Contoh: Rumah Pak Budi" 
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                    </div>

                    {/* 3. Klien */}
                    <div className="space-y-2">
                        <Label>Pilih Klien</Label>
                        <Select onValueChange={setSelectedClient} value={selectedClient}>
                            <SelectTrigger><SelectValue placeholder="Cari Klien..." /></SelectTrigger>
                            <SelectContent>
                                {clients?.map((client: any) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.company_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button className="w-full mt-4" onClick={handleSubmit} disabled={createMutation.isPending}>
                        {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Buat & Buka Editor
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}