import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Users, HardHat, UserSearch, ClipboardList } from 'lucide-react'
import { Overview } from '@/components/dashboard/Overview'
import { RecentSales } from '@/components/dashboard/RecentSales'
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar'

interface OverviewTabProps {
  data: any
  isLoading: boolean
}

export function OverviewTab({ data, isLoading }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* KPI CARDS GRID */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Prospects */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Prospects
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-md">
              <UserSearch className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : (data?.totalProspects ?? 0)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Potential clients in pipeline
            </p>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Projects
            </CardTitle>
            <div className="p-2 bg-amber-50 rounded-md">
              <HardHat className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : data?.totalProjects || 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Ongoing Design, Civil & Interior
            </p>
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Clients
            </CardTitle>
            <div className="p-2 bg-emerald-50 rounded-md">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : data?.totalClients || 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Registered partner entities
            </p>
          </CardContent>
        </Card>

        {/* Pending Surveys */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending Surveys
            </CardTitle>
            <div className="p-2 bg-purple-50 rounded-md">
              <ClipboardList className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : (data?.pendingSurveys ?? 0)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Surveys awaiting completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TEAM CALENDAR */}
      <DashboardCalendar />

      {/* CHARTS SECTION */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 border-slate-200/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Revenue Analytics
            </CardTitle>
            <CardDescription>
              Visual growth of your company's income over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] md:h-[350px]">
              <Overview />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3 border-slate-200/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Latest invoice payments and quotation updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
