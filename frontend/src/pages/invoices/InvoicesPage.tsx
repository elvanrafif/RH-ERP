import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import { useDebounce } from "@/hooks/useDebounce"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Import Modular Components
import { InvoiceToolbar } from "./components/InvoiceToolbar"
import { InvoiceTable } from "./components/InvoiceTable"
import { InvoiceCreateDialog } from "./components/InvoiceCreateDialog"

export default function InvoicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // STATE SEARCH & FILTER
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 1. FETCH CLIENTS
  const { data: clients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => await pb.collection('clients').getFullList({ sort: 'company_name' }),
  });

  // 2. FETCH INVOICES
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', debouncedSearch, filterClient, activeTab],
    queryFn: async () => {
      const filters = [];
      
      if (debouncedSearch) filters.push(`title ~ "${debouncedSearch}" || invoice_number ~ "${debouncedSearch}"`);
      if (filterClient && filterClient !== "all") filters.push(`client_id = "${filterClient}"`);
      if (activeTab !== "all") filters.push(`type = "${activeTab}"`);

      const filterString = filters.length > 0 ? filters.join(" && ") : "";

      return await pb.collection('invoices').getFullList({
        sort: '-created',
        expand: 'client_id',
        filter: filterString
      });
    }
  });

  const handleResetFilter = () => {
    setSearchTerm("");
    setFilterClient("all");
  }

  return (
    <div className="p-8 pt-6 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
            <p className="text-muted-foreground">Kelola tagihan Design, Sipil, dan Interior.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Buat Invoice Baru
        </Button>
      </div>

      {/* FILTER & TOOLBAR */}
      <InvoiceToolbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterClient={filterClient}
        onClientFilterChange={setFilterClient}
        onResetFilter={handleResetFilter}
        clients={clients || []}
      />

      {/* TABLE LIST */}
      <InvoiceTable 
        invoices={invoices || []} 
        isLoading={isLoading} 
      />

      {/* MODAL CREATE */}
      <InvoiceCreateDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        clients={clients || []}
      />
    </div>
  )
}