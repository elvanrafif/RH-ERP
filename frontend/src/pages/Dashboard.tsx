import { useDashboardStats } from '@/hooks/useDashboard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  CreditCard,
  Activity,
  DollarSign,
  Download,
  Plus,
  FileText,
  Briefcase,
  TrendingUp,
} from 'lucide-react'
import { Overview } from '@/components/dashboard/Overview'
import { RecentSales } from '@/components/dashboard/RecentSales'
import { formatRupiah } from '@/lib/helpers'

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
        <div className="overflow-x-auto pb-1 scrollbar-hide">
          <TabsList className="bg-white border shadow-sm w-full md:w-auto flex justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects Breakdown</TabsTrigger>
            <TabsTrigger value="finance">Financial Insights</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI CARDS GRID */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Actual Revenue
                </CardTitle>
                <div className="p-2 bg-blue-50 rounded-md">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : formatRupiah(data?.totalOmzet || 0)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" /> Total
                  settled invoices
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
                  <Briefcase className="h-4 w-4 text-amber-600" />
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

            {/* Pending Quotations */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Quotations Sent
                </CardTitle>
                <div className="p-2 bg-purple-50 rounded-md">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* Asumsi data tersedia di hooks */}
                  {isLoading ? '...' : (data as any)?.totalQuotations || 12}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium text-emerald-600">
                  Ready for conversion
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
                  {isLoading ? '...' : (data as any)?.totalClients || 57}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Registered partner entities
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CHARTS & RECENT ACTIVITY SECTION */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
            {/* Revenue Analytics Chart */}
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

            {/* Recent Sales/Activities */}
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
        </TabsContent>

        {/* Placeholder untuk Tab lain agar struktur tetap rapi */}
        <TabsContent value="projects">
          <div className="p-10 border-2 border-dashed rounded-xl text-center text-slate-400">
            Projects Detailed Analytics Coming Soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
