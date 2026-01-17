import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  LayoutDashboard, 
  PenTool, 
  HardHat, 
  FileText, 
  Receipt, 
  Users, 
  Settings, 
  FolderOpen,
  Menu,
  LogOut 
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { pb } from "@/lib/pocketbase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

// --- KOMPONEN ISI MENU (Dipakai di Desktop & Mobile) ---
function SidebarContent({ className, setOpen }: { className?: string, setOpen?: (open: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  // Helper untuk cek menu aktif
  const isActive = (path: string) => pathname === path;

  // Helper untuk menutup sidebar mobile saat link diklik
  const handleLinkClick = () => {
    if (setOpen) setOpen(false);
  }

  // Fungsi Logout Eksekusi
  const handleLogout = () => {
    pb.authStore.clear(); 
    toast.info("Anda telah logout."); // 4. Toast Info/Logout
    navigate("/login");   
}

  return (
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      
      {/* HEADER LOGO */}
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xl font-bold tracking-tight text-primary">
            RH STUDIO
          </h2>
        </div>
        
        {/* GROUP: DASHBOARD */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link to="/" onClick={handleLinkClick}>
              <Button variant={isActive("/") ? "secondary" : "ghost"} className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
        
        {/* GROUP: OPERATIONAL */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
            OPERATIONAL
          </h2>
          <div className="space-y-1">
            <Link to="/projects" onClick={handleLinkClick}>
              <Button variant={isActive("/projects") ? "secondary" : "ghost"} className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Kanban Board
              </Button>
            </Link>
            {/* Menu List Project (Database View) bisa ditaruh bawahnya nanti */}
          </div>
        </div>

        {/* GROUP: FINANCE & DOCS */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
            FINANCE & DOCS
          </h2>
          <div className="space-y-1">
            <Link to="/documents/quotes" onClick={handleLinkClick}>
              <Button variant={isActive("/documents/quotes") ? "secondary" : "ghost"} className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Quotations
              </Button>
            </Link>
            <Link to="/documents/invoices" onClick={handleLinkClick}>
              <Button variant={isActive("/documents/invoices") ? "secondary" : "ghost"} className="w-full justify-start">
                <Receipt className="mr-2 h-4 w-4" />
                Invoices
              </Button>
            </Link>
          </div>
        </div>

        {/* GROUP: MANAGEMENT */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
            MANAGEMENT
          </h2>
          <div className="space-y-1">
            <Link to="/clients" onClick={handleLinkClick}>
              <Button variant={isActive("/clients") ? "secondary" : "ghost"} className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Clients
              </Button>
            </Link>
             <Link to="/settings" onClick={handleLinkClick}>
              <Button variant={isActive("/settings") ? "secondary" : "ghost"} className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER: LOGOUT WITH CONFIRMATION */}
      <div className="px-3 py-2 border-t mt-auto">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin ingin keluar?</AlertDialogTitle>
              <AlertDialogDescription>
                Anda harus login kembali untuk mengakses data dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Ya, Keluar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

// --- KOMPONEN WRAPPER DESKTOP ---
export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12 w-64 border-r min-h-screen bg-background hidden md:block", className)}>
      <ScrollArea className="h-full">
         <SidebarContent />
      </ScrollArea>
    </div>
  )
}

// --- KOMPONEN WRAPPER MOBILE (DRAWER) ---
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <ScrollArea className="h-full">
           <SidebarContent setOpen={setOpen} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}