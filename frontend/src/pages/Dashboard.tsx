import { useDashboardStats } from '@/hooks/useDashboard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Plus } from 'lucide-react'

// Import Tab Components
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab'
import { ResourceMonitoringTab } from '@/components/dashboard/tabs/ResourceMonitoringTab'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  LayoutDashboard,
  UsersRound,
  Briefcase,
  Wallet,
  Compass,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { DocumentRevenueTab } from '@/components/dashboard/tabs/DocumentRevenueTab'

export default function Dashboard() {
  const { data, isLoading, error } = useDashboardStats()

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading dashboard data.
      </div>
    )

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-slate-50/50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
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
          <Button
            size="sm"
            className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <TabsList className="bg-slate-200/50 px-1 py-6 border border-slate-200/60 shadow-inner rounded-lg w-max flex items-center gap-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all text-slate-500 hover:text-slate-900"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-medium text-sm">Overview</span>
            </TabsTrigger>

            <TabsTrigger
              value="resources"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all text-slate-500 hover:text-slate-900"
            >
              <UsersRound className="w-4 h-4" />
              <span className="font-medium text-sm">Resource Monitoring</span>
            </TabsTrigger>

            <TabsTrigger
              value="project-value"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all text-slate-500 hover:text-slate-900"
            >
              <Briefcase className="w-4 h-4" />
              <span className="font-medium text-sm">Project Value</span>
            </TabsTrigger>

            <TabsTrigger
              value="revenue"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all text-slate-500 hover:text-slate-900"
            >
              <Wallet className="w-4 h-4" />
              <span className="font-medium text-sm">Document Revenue</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* CONTENT TABS */}
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

        {/* PLACEHOLDER TABS (Belum di-refactor karena logic belum ada) */}
        <TabsContent value="project-value">
          <Card className="border-dashed border-2 bg-slate-50">
            <CardHeader>
              <CardTitle>Project Value Analytics</CardTitle>
              <CardDescription>
                Breakdown: Interior / Sipil / Arsitektur
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Compass className="h-10 w-10 opacity-20" />
              <p>Under Development</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="revenue"
          className="space-y-6 animate-in fade-in-50"
        >
          <DocumentRevenueTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
