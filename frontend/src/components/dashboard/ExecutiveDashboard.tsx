// frontend/src/components/dashboard/ExecutiveDashboard.tsx
import { useDashboardStats } from '@/hooks/useDashboard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Download,
  Plus,
  LayoutDashboard,
  UsersRound,
  CalendarDays,
} from 'lucide-react'
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab'
import { ResourceMonitoringTab } from '@/components/dashboard/tabs/ResourceMonitoringTab'
import { ClientTrackingTab } from '@/components/dashboard/tabs/ClientTrackingTab'

export function ExecutiveDashboard() {
  const { data, isLoading, error } = useDashboardStats()

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading dashboard data.
      </div>
    )

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Executive Overview
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time data summary across all construction and design sectors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm" className="shadow-sm flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <TabsList className="bg-muted/60 px-1 py-6 border border-border shadow-inner rounded-lg w-max flex items-center gap-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-medium text-sm">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground"
            >
              <UsersRound className="w-4 h-4" />
              <span className="font-medium text-sm">Resource Monitoring</span>
            </TabsTrigger>
            <TabsTrigger
              value="client-tracking"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="font-medium text-sm">Client Tracking</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="overview"
          className="space-y-6 animate-in fade-in-50"
        >
          <OverviewTab data={data} isLoading={isLoading} />
        </TabsContent>
        <TabsContent
          value="resources"
          className="space-y-6 animate-in fade-in-50"
        >
          <ResourceMonitoringTab />
        </TabsContent>
        <TabsContent
          value="client-tracking"
          className="space-y-6 animate-in fade-in-50"
        >
          <ClientTrackingTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
