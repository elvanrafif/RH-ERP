import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  LayoutDashboard, FileText, Receipt, Users, Settings, 
  Menu, LogOut, ChevronLeft, 
  PencilRuler, HardHat, Sofa // Icon baru untuk proyek
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { pb } from "@/lib/pocketbase"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { NavItem } from "./Sidebar/NavItem"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarContent({ 
  className, setOpen, collapsed = false 
}: { 
  className?: string, setOpen?: (open: boolean) => void, collapsed?: boolean 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  const handleLinkClick = () => { if (setOpen) setOpen(false); }
  const handleLogout = () => { pb.authStore.clear(); toast.info("Logout berhasil."); navigate("/login"); }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      
      {/* HEADER LOGO */}
      <div className={cn("flex items-center h-[60px] border-b transition-all", collapsed ? "justify-center px-0" : "px-6")}>
        {!collapsed ? (
           // MODE EXPANDED (Full Logo)
           <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
             <span className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center rounded-lg text-sm shadow-sm">RH</span>
             <span className="truncate">RH STUDIO</span>
           </h2>
        ) : (
           // MODE COLLAPSED (Logo "RH")
           <span className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm tracking-tighter cursor-default">
             RH
           </span>
        )}
      </div>
      
      {/* MENU */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn("grid gap-1 px-3", collapsed ? "justify-center px-2" : "")}>
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} isActive={isActive("/") && pathname === "/"} onClick={handleLinkClick} />
          
          {/* DIVIDER PROJECTS */}
          {!collapsed && <div className="mt-6 mb-2 px-2 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Project Tracker</div>}
          {collapsed && <div className="my-2 border-t w-8 mx-auto" />} 
          
          {/* MENU PROJECTS YANG DIPECAH */}
          <NavItem to="/projects/arsitektur" icon={PencilRuler} label="Arsitektur" collapsed={collapsed} isActive={isActive("/projects/arsitektur")} onClick={handleLinkClick} />
          <NavItem to="/projects/sipil" icon={HardHat} label="Konstruksi Sipil" collapsed={collapsed} isActive={isActive("/projects/sipil")} onClick={handleLinkClick} />
          <NavItem to="/projects/interior" icon={Sofa} label="Interior" collapsed={collapsed} isActive={isActive("/projects/interior")} onClick={handleLinkClick} />

          {/* DIVIDER COMMERCIAL */}
          {!collapsed && <div className="mt-6 mb-2 px-2 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Commercial</div>}
          {collapsed && <div className="my-2 border-t w-8 mx-auto" />}
          
          <NavItem to="/quotations" icon={FileText} label="Quotations" collapsed={collapsed} isActive={isActive("/quotations")} onClick={handleLinkClick} />
          <div className={cn(collapsed ? "opacity-50" : "")}>
             <NavItem to="/invoices" icon={Receipt} label="Invoices" collapsed={collapsed} isActive={isActive("/invoices")} onClick={handleLinkClick} />
          </div>

          {/* DIVIDER MANAGEMENT */}
          {!collapsed && <div className="mt-6 mb-2 px-2 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Management</div>}
          {collapsed && <div className="my-2 border-t w-8 mx-auto" />}
          
          <NavItem to="/clients" icon={Users} label="Clients" collapsed={collapsed} isActive={isActive("/clients")} onClick={handleLinkClick} />
          <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} isActive={isActive("/settings")} onClick={handleLinkClick} />
        </nav>
      </ScrollArea>

      {/* FOOTER */}
      <div className="p-3 border-t mt-auto">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {collapsed ? (
                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 mx-auto flex">
                    <LogOut className="h-4 w-4" />
                </Button>
            ) : (
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            )}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Keluar dari aplikasi?</AlertDialogTitle>
              <AlertDialogDescription>Anda harus login kembali untuk mengakses data.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">Ya, Keluar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

// --- DESKTOP SIDEBAR (Floating Toggle) ---
export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
     const saved = localStorage.getItem("sidebar-collapsed");
     return saved === "true";
  });

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  }

  return (
    <TooltipProvider>
      <div className={cn("relative border-r bg-white hidden md:block h-screen sticky top-0 transition-all duration-300 ease-in-out z-20", collapsed ? "w-[70px]" : "w-64", className)}>
        
        {/* ISI SIDEBAR */}
        <SidebarContent collapsed={collapsed} />

        {/* TOMBOL TOGGLE FLOATING (Di Garis Batas) */}
        <Button
            onClick={toggleCollapse}
            className="absolute -right-3 top-7 z-50 h-6 w-6 rounded-full border bg-white p-0 shadow-md hover:bg-slate-100 text-slate-500"
            variant="ghost"
        >
            <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
        </Button>

      </div>
    </TooltipProvider>
  )
}

// --- MOBILE SIDEBAR ---
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
           <SidebarContent setOpen={setOpen} collapsed={false} />
      </SheetContent>
    </Sheet>
  )
}