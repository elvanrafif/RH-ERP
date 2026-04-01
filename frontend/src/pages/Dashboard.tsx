import { useDashboardStats } from '@/hooks/useDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, UsersRound, Briefcase, Wallet } from 'lucide-react'
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab'
import { ResourceMonitoringTab } from '@/components/dashboard/tabs/ResourceMonitoringTab'
import { DocumentRevenueTab } from '@/components/dashboard/tabs/DocumentRevenueTab'
import { ProjectValueTab } from '@/components/dashboard/tabs/ProjectValueTab'

const TABS = [
  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  { value: 'resources', label: 'Resource Monitoring', icon: UsersRound },
  { value: 'project-value', label: 'Project Value', icon: Briefcase },
  { value: 'revenue', label: 'Document Revenue', icon: Wallet },
]

export default function Dashboard() {
  const { data, isLoading, error } = useDashboardStats()

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading dashboard data.
      </div>
    )

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/40">
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 md:px-6 md:py-5">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Executive Overview
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time data across all construction and design sectors.
            </p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
          {/* TAB BAR */}
          <div className="bg-white border-b border-slate-200 px-4 md:px-6 overflow-x-auto">
            <TabsList className="h-auto bg-transparent p-0 gap-0 flex min-w-max">
              {TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="
                    relative flex items-center gap-1.5 px-3 py-3 md:px-4 md:py-3.5 rounded-none
                    text-sm font-medium text-slate-500 bg-transparent border-0
                    data-[state=active]:text-blue-600 data-[state=active]:shadow-none
                    hover:text-slate-900 transition-colors duration-150
                    data-[state=active]:after:absolute data-[state=active]:after:bottom-0
                    data-[state=active]:after:left-0 data-[state=active]:after:right-0
                    data-[state=active]:after:h-0.5 data-[state=active]:after:bg-blue-600
                    data-[state=active]:after:rounded-t-full
                  "
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">
                    {label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 p-4 md:p-6">
            <TabsContent
              value="overview"
              className="mt-0 animate-in fade-in-50 duration-200"
            >
              <OverviewTab data={data} isLoading={isLoading} />
            </TabsContent>
            <TabsContent
              value="resources"
              className="mt-0 animate-in fade-in-50 duration-200"
            >
              <ResourceMonitoringTab />
            </TabsContent>
            <TabsContent
              value="project-value"
              className="mt-0 animate-in fade-in-50 duration-200"
            >
              <ProjectValueTab />
            </TabsContent>
            <TabsContent
              value="revenue"
              className="mt-0 animate-in fade-in-50 duration-200"
            >
              <DocumentRevenueTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
