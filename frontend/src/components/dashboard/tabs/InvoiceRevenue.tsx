import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Wallet, CheckCircle2, CalendarDays } from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'
import { useInvoiceRevenue } from '@/hooks/useInvoiceRevenue'
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter'
import { RevenuePieChart } from './RevenuePieChart'
import { TopInvoicesList } from './TopInvoicesList'

export function InvoiceRevenue() {
  const {
    filter,
    setFilter,
    showCustomModal,
    modalRef,
    tempStart,
    setTempStart,
    tempEnd,
    setTempEnd,
    appliedStart,
    appliedEnd,
    applyCustomDates,
  } = useDateRangeFilter()

  const { data: invoiceData, isLoading } = useInvoiceRevenue(filter, appliedStart, appliedEnd)

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center flex-col gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="text-sm font-medium">Fetching invoice data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-700">
            <Wallet className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Realized Invoices</h2>
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-8 text-xs w-full sm:w-[130px] bg-white border-slate-200">
              <CalendarDays className="h-3.5 w-3.5 mr-2 text-slate-500" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Date</SelectItem>
            </SelectContent>
          </Select>

          {filter === 'custom' && (
            <Button
              variant="outline"
              className="h-8 text-xs bg-white text-slate-600 w-full sm:w-auto"
              onClick={() => {}}
            >
              {appliedStart && appliedEnd ? `${appliedStart} - ${appliedEnd}` : 'Set Dates'}
            </Button>
          )}

          {filter === 'custom' && showCustomModal && (
            <div
              ref={modalRef}
              className="absolute top-10 right-0 z-50 w-[240px] p-3 bg-white border border-slate-200 rounded-lg shadow-xl animate-in fade-in zoom-in-95"
            >
              <p className="text-xs font-semibold text-slate-700 mb-2">Select Date Range</p>
              <div className="flex flex-col gap-2">
                <Input
                  type="date"
                  className="h-8 text-xs bg-slate-50 border-slate-200 block w-full text-left cursor-pointer"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                />
                <Input
                  type="date"
                  className="h-8 text-xs bg-slate-50 border-slate-200 block w-full text-left cursor-pointer"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                />
                <Button
                  size="sm"
                  className="w-full h-8 mt-1 bg-emerald-600 hover:bg-emerald-700 text-xs"
                  onClick={applyCustomDates}
                >
                  Apply Filter
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-emerald-50">Total Paid Invoices</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-200/50" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">
            {formatRupiah(invoiceData?.totalActual || 0)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-bold text-slate-800">
            Distribution & Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100">
            <RevenuePieChart chartData={invoiceData?.chartData || []} />
          </div>
          <div className="p-4 space-y-2.5 bg-white">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Top 5 Invoices
            </h4>
            <TopInvoicesList invoices={invoiceData?.topInvoices || []} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
