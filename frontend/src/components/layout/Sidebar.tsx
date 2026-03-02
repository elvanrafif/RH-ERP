import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, LogOut, ChevronLeft } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { pb } from '@/lib/pocketbase'
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
} from '@/components/ui/alert-dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useRole } from '@/hooks/useRole'
import { SidebarNav } from './Sidebar/SidebarNav'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarContent({
  className,
  setOpen,
  collapsed = false,
}: {
  className?: string
  setOpen?: (open: boolean) => void
  collapsed?: boolean
}) {
  const location = useLocation()
  const pathname = location.pathname
  const { isSuperAdmin } = useRole()

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false
    return pathname.startsWith(path)
  }

  const handleLinkClick = () => {
    if (setOpen) setOpen(false)
  }

  const handleLogout = () => {
    pb.authStore.clear()
    localStorage.removeItem('sidebar-collapsed')
    window.location.href = '/login'
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* HEADER LOGO */}
      <div
        className={cn(
          'flex items-center h-[60px] border-b transition-all',
          collapsed ? 'justify-center px-0' : 'px-6'
        )}
      >
        {!collapsed ? (
          <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center rounded-lg text-sm shadow-sm">
              RH
            </span>
            <span className="truncate">RH STUDIO</span>
          </h2>
        ) : (
          <span className="bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm tracking-tighter cursor-default">
            RH
          </span>
        )}
      </div>

      {/* MENU */}
      <ScrollArea className="flex-1 py-4">
        <SidebarNav
          collapsed={collapsed}
          isSuperAdmin={isSuperAdmin}
          pathname={pathname}
          isActive={isActive}
          onLinkClick={handleLinkClick}
        />
      </ScrollArea>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-200 mt-auto bg-slate-50/30">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {collapsed ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50 mx-auto flex transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Log out
              </Button>
            )}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log out of the application?</AlertDialogTitle>
              <AlertDialogDescription>
                You will need to log in again to access your data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Yes, Log out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

// --- DESKTOP SIDEBAR ---
export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved === 'true'
  })

  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          'relative border-r bg-white hidden md:block h-screen sticky top-0 transition-all duration-300 ease-in-out z-20',
          collapsed ? 'w-[70px]' : 'w-64',
          className
        )}
      >
        <SidebarContent collapsed={collapsed} />
        <Button
          onClick={toggleCollapse}
          className="absolute -right-3 top-7 z-50 h-6 w-6 rounded-full border bg-white p-0 shadow-md hover:bg-slate-100 text-slate-500"
          variant="ghost"
        >
          <ChevronLeft
            className={cn(
              'h-3 w-3 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>
    </TooltipProvider>
  )
}

// --- MOBILE SIDEBAR ---
export function MobileSidebar() {
  const [open, setOpen] = useState(false)
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
