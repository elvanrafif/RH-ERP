import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Settings,
  PencilRuler,
  HardHat,
  Sofa,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavItem } from './NavItem'
import { Guard } from '@/components/ui/guard'

interface SidebarNavProps {
  collapsed: boolean
  isSuperAdmin: boolean
  pathname: string
  isActive: (path: string) => boolean
  onLinkClick: () => void
}

export function SidebarNav({
  collapsed,
  isSuperAdmin,
  pathname,
  isActive,
  onLinkClick,
}: SidebarNavProps) {
  return (
    <nav
      className={cn('grid gap-1 px-3', collapsed ? 'justify-center px-2' : '')}
    >
      <Guard require="view_dashboard">
        <NavItem
          to="/"
          icon={LayoutDashboard}
          label="Dashboard"
          collapsed={collapsed}
          isActive={isActive('/') && pathname === '/'}
          onClick={onLinkClick}
        />
      </Guard>

      {!collapsed && (
        <div className="mt-6 mb-2 px-2 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
          Project Tracker
        </div>
      )}

      <Guard require="view_index_project_architecture">
        <NavItem
          to="/projects/architecture"
          icon={PencilRuler}
          label="Architecture"
          collapsed={collapsed}
          isActive={isActive('/projects/architecture')}
          onClick={onLinkClick}
        />
      </Guard>

      <Guard require="view_index_project_civil">
        <NavItem
          to="/projects/civil"
          icon={HardHat}
          label="Civil Construction"
          collapsed={collapsed}
          isActive={isActive('/projects/civil')}
          onClick={onLinkClick}
        />
      </Guard>

      <Guard require="view_index_project_interior">
        <NavItem
          to="/projects/interior"
          icon={Sofa}
          label="Interior"
          collapsed={collapsed}
          isActive={isActive('/projects/interior')}
          onClick={onLinkClick}
        />
      </Guard>

      {!collapsed && isSuperAdmin && (
        <div className="mt-6 mb-2 px-2 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
          Commercial
        </div>
      )}

      <Guard require="view_revenue">
        <NavItem
          to="/quotations"
          icon={FileText}
          label="Quotations"
          collapsed={collapsed}
          isActive={isActive('/quotations')}
          onClick={onLinkClick}
        />
        <NavItem
          to="/invoices"
          icon={Receipt}
          label="Invoices"
          collapsed={collapsed}
          isActive={isActive('/invoices')}
          onClick={onLinkClick}
        />
      </Guard>

      {!collapsed && (
        <div className="mt-6 mb-2 px-2 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
          Management
        </div>
      )}

      <NavItem
        to="/clients"
        icon={Users}
        label="Clients"
        collapsed={collapsed}
        isActive={isActive('/clients')}
        onClick={onLinkClick}
      />

      <Guard require="manage_users">
        <NavItem
          to="/settings/users"
          icon={Users}
          label="User Management"
          collapsed={collapsed}
          isActive={isActive('/settings/users')}
          onClick={onLinkClick}
        />
        <NavItem
          to="/settings/roles"
          icon={ShieldCheck}
          label="Role Management"
          collapsed={collapsed}
          isActive={isActive('/settings/roles')}
          onClick={onLinkClick}
        />
      </Guard>

      <NavItem
        to="/settings/profile"
        icon={Settings}
        label="Profile"
        collapsed={collapsed}
        isActive={isActive('/settings/profile')}
        onClick={onLinkClick}
      />
    </nav>
  )
}
