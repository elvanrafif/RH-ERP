import { Sidebar, MobileSidebar } from "./Sidebar"
import { Outlet } from "react-router-dom"

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background flex-col md:flex-row">
      
      {/* 1. SIDEBAR DESKTOP (Hidden di Mobile, Block di MD keatas) */}
      <Sidebar className="hidden md:block" />

      {/* 2. HEADER MOBILE (Hidden di Desktop, Flex di Mobile) */}
      <div className="md:hidden flex items-center p-4 border-b bg-background">
         <MobileSidebar />
         <span className="font-bold ml-2 text-lg">RH STUDIO</span>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="p-4 md:p-8">
           {/* Padding lebih kecil di mobile (p-4) biar lega */}
           <Outlet /> 
        </div>
      </main>
    </div>
  )
}