import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Users, HardHat, UserSearch, ClipboardList } from 'lucide-react'
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar'
import { useDashboardCalendarEvents } from '@/hooks/useDashboardCalendarEvents'

interface OverviewTabProps {
  data: any
  isLoading: boolean
}

export function OverviewTab({ data, isLoading }: OverviewTabProps) {
  const { events: calendarEvents, isLoading: calendarLoading } =
    useDashboardCalendarEvents()

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
      <DashboardCalendar events={calendarEvents} isLoading={calendarLoading} />
    </div>
  )
}
