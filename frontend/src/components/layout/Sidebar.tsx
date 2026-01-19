import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  LayoutDashboard, FileText, Receipt, Users, Settings, 
  Menu, LogOut, FolderOpen, ChevronLeft 
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

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

// --- HELPER COMPONENT: NAV ITEM ---
const NavItem = ({ 
  to, icon: Icon, label, collapsed, isActive, onClick 
}: { 
  to: string, icon: any, label: string, collapsed: boolean, isActive: boolean, onClick?: () => void 
}) => {
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link to={to} onClick={onClick} className="flex justify-center">
            <Button 
              variant={isActive ? "secondary" : "ghost"} 
              size="icon" 
              className={cn("h-9 w-9", isActive && "bg-muted")}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{label}</span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Link to={to} onClick={onClick}>
      <Button 
        variant={isActive ? "secondary" : "ghost"} 
        className="w-full justify-start"
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  )
}

// --- SIDEBAR CONTENT ---
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
           // Saya ubah text-lg jadi text-sm agar 2 huruf "RH" muat rapi di kotak w-8
           <span className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm tracking-tighter">
             RH
           </span>
        )}
      </div>
      
      {/* MENU */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn("grid gap-1 px-2", collapsed ? "justify-center" : "")}>
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} isActive={isActive("/")} onClick={handleLinkClick} />
          
          {!collapsed && <div className="mt-4 mb-2 px-2 text-xs font-semibold text-muted-foreground">OPERATIONAL</div>}
          {collapsed && <div className="my-2 border-t w-8 mx-auto" />} 
          <NavItem to="/projects" icon={FolderOpen} label="Projects" collapsed={collapsed} isActive={isActive("/projects")} onClick={handleLinkClick} />

          {!collapsed && <div className="mt-4 mb-2 px-2 text-xs font-semibold text-muted-foreground">COMMERCIAL</div>}
          {collapsed && <div className="my-2 border-t w-8 mx-auto" />}
          <NavItem to="/quotations" icon={FileText} label="Quotations" collapsed={collapsed} isActive={isActive("/quotations")} onClick={handleLinkClick} />
          <div className={cn(collapsed ? "opacity-50" : "")}>
             <NavItem to="/invoices" icon={Receipt} label="Invoices (Soon)" collapsed={collapsed} isActive={isActive("/invoices")} onClick={handleLinkClick} />
          </div>

          {!collapsed && <div className="mt-4 mb-2 px-2 text-xs font-semibold text-muted-foreground">MANAGEMENT</div>}
          {collapsed && <div className="my-2 border-t w-8 mx-auto" />}
          <NavItem to="/clients" icon={Users} label="Clients" collapsed={collapsed} isActive={isActive("/clients")} onClick={handleLinkClick} />
          <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} isActive={isActive("/settings")} onClick={handleLinkClick} />
        </nav>
      </ScrollArea>

      {/* FOOTER */}
      <div className="p-2 border-t mt-auto">
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
      <div className={cn("relative border-r bg-white hidden md:block h-screen sticky top-0 transition-all duration-300 ease-in-out", collapsed ? "w-[70px]" : "w-64", className)}>
        
        {/* ISI SIDEBAR */}
        <SidebarContent collapsed={collapsed} />

        {/* TOMBOL TOGGLE FLOATING (Di Garis Batas) */}
        <Button
            onClick={toggleCollapse}
            className="absolute -right-3 top-6 z-40 h-6 w-6 rounded-full border bg-white p-0 shadow-md hover:bg-slate-100 text-slate-500"
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