import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Users, DollarSign, TrendingUp, HardHat, FileText } from 'lucide-react'
import { Overview } from '@/components/dashboard/Overview'
import { RecentSales } from '@/components/dashboard/RecentSales'
import { formatRupiah } from '@/lib/helpers'

interface OverviewTabProps {
  data: any
  isLoading: boolean
}

export function OverviewTab({ data, isLoading }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* KPI CARDS GRID */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Actual Revenue */}
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
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Settled
              Invoices (Term 4 + Paid)
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

        {/* Quotations Sent */}
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
              {isLoading ? '...' : data?.totalQuotations || 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Ready for conversion
            </p>
          </CardContent>
        </Card>
      </div>

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
