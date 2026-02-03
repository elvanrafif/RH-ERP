import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface InvoiceToolbarProps {
    activeTab: string;
    onTabChange: (val: string) => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    filterClient: string;
    onClientFilterChange: (val: string) => void;
    onResetFilter: () => void;
    clients: any[]; // Ganti tipe Client jika ada
}

export function InvoiceToolbar({
    activeTab, onTabChange,
    searchTerm, onSearchChange,
    filterClient, onClientFilterChange,
    onResetFilter, clients
}: InvoiceToolbarProps) {
    
    const hasActiveFilter = searchTerm || filterClient !== "all";

    return (
        <div className="space-y-4">
            {/* TABS FILTER TYPE */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full">
                <TabsList>
                    <TabsTrigger value="all">Semua</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="sipil">Sipil</TabsTrigger>
                    <TabsTrigger value="interior">Interior</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* SEARCH & CLIENT FILTER */}
            <div className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-white p-3 rounded-lg border shadow-sm">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari No. Invoice / Judul..." 
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-56">
                    <Select value={filterClient} onValueChange={onClientFilterChange}>
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

                {hasActiveFilter && (
                    <Button variant="ghost" size="icon" onClick={onResetFilter} title="Reset Filter">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}