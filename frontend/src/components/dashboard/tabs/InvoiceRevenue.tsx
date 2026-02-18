import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
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
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Loader2, Wallet, CheckCircle2, CalendarDays } from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'

const isWithinFilter = (
  dateStr: string,
  filter: string,
  start: string,
  end: string
) => {
  if (!dateStr) return false
  if (filter === 'all') return true

  const d = new Date(dateStr)
  const now = new Date()

  if (filter === 'this_month') {
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    )
  }
  if (filter === 'this_year') {
    return d.getFullYear() === now.getFullYear()
  }
  if (filter === 'custom') {
    if (!start || !end) return true
    const startDate = new Date(start)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(end)
    endDate.setHours(23, 59, 59, 999)
    return d >= startDate && d <= endDate
  }
  return true
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-slate-200 shadow-md p-2 rounded-md z-50">
        <p className="font-semibold text-slate-800 text-xs mb-1">{data.name}</p>
        <p className="font-bold text-emerald-600 text-sm">
          {formatRupiah(data.value)}
        </p>
      </div>
    )
  }
  return null
}

export function InvoiceRevenue() {
  const [filter, setFilter] = useState('this_month')

  const [showCustomModal, setShowCustomModal] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const [tempStart, setTempStart] = useState('')
  const [tempEnd, setTempEnd] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowCustomModal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['document-invoices', filter, appliedStart, appliedEnd],
    queryFn: async () => {
      // PERUBAHAN: Gunakan relasi bertingkat (Invoice -> Project -> Client)
      // Jika error, pastikan nama relasinya sesuai DB Bapak (misal: 'project.client' atau 'project_id.client_id')
      const invoices = await pb.collection('invoices').getFullList({
        sort: '-updated',
        expand: 'project_id.client_id,client_id', // Kita ambil 2 kemungkinan, via project atau langsung
      })

      let totalActual = 0
      const distribution = {
        architecture: 0,
        civil: 0,
        interior: 0,
        uncategorized: 0,
      }

      const validInvoices = invoices.filter((inv) => {
        let items = inv.items || []
        if (typeof items === 'string') {
          try {
            items = JSON.parse(items)
          } catch (e) {
            items = []
          }
        }
        if (!Array.isArray(items) || items.length === 0) return false

        const lastSuccessItem = [...items]
          .reverse()
          .find(
            (item: any) =>
              item.status && item.status.toLowerCase() === 'success'
          )
        if (!lastSuccessItem) return false

        const paymentDate = lastSuccessItem.paymentDate || inv.updated
        return isWithinFilter(paymentDate, filter, appliedStart, appliedEnd)
      })

      validInvoices.forEach((inv) => {
        const amount = inv.total_amount || inv.amount || 0
        totalActual += amount
        const category = String(inv.type || inv.category || inv.division || '')
          .toLowerCase()
          .trim()

        if (category === 'design') {
          distribution.architecture += amount
        } else if (category === 'civil' || category === 'sipil') {
          distribution.civil += amount
        } else if (category === 'interior') {
          distribution.interior += amount
        } else {
          distribution.uncategorized += amount
        }
      })

      const chartData = [
        {
          name: 'Design',
          value: distribution.architecture,
          color: '#2b6cb0',
        },
        { name: 'Civil', value: distribution.civil, color: '#B45309' },
        { name: 'Interior', value: distribution.interior, color: '#047857' },
        { name: 'Other', value: distribution.uncategorized, color: '#94a3b8' },
      ].filter((item) => item.value > 0)

      const topInvoices = [...validInvoices]
        .sort(
          (a, b) =>
            (b.total_amount || b.amount || 0) -
            (a.total_amount || a.amount || 0)
        )
        .slice(0, 5)

      return { totalActual, chartData, topInvoices }
    },
  })

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
          <h2 className="text-lg font-bold text-slate-800">
            Realized Invoices
          </h2>
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
          <Select
            value={filter}
            onValueChange={(val) => {
              setFilter(val)
              if (val === 'custom') {
                setShowCustomModal(true)
              } else {
                setShowCustomModal(false)
                setAppliedStart('')
                setAppliedEnd('')
              }
            }}
          >
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
              onClick={() => setShowCustomModal((prev) => !prev)}
            >
              {appliedStart && appliedEnd
                ? `${appliedStart} - ${appliedEnd}`
                : 'Set Dates'}
            </Button>
          )}

          {filter === 'custom' && showCustomModal && (
            <div
              ref={modalRef}
              className="absolute top-10 right-0 z-50 w-[240px] p-3 bg-white border border-slate-200 rounded-lg shadow-xl animate-in fade-in zoom-in-95"
            >
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Select Date Range
              </p>
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
                  onClick={() => {
                    setAppliedStart(tempStart)
                    setAppliedEnd(tempEnd)
                    setShowCustomModal(false)
                  }}
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
            <CardTitle className="text-sm font-medium text-emerald-50">
              Total Paid Invoices
            </CardTitle>
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
            {!invoiceData?.chartData || invoiceData.chartData.length === 0 ? (
              <div className="h-[120px] flex items-center justify-center text-slate-400 text-xs">
                No paid invoices found.
              </div>
            ) : (
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={invoiceData.chartData}
                      cx="30%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {invoiceData.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ fontSize: '11px' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="p-4 space-y-2.5 bg-white">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Top 5 Invoices
            </h4>
            {!invoiceData?.topInvoices ||
            invoiceData.topInvoices.length === 0 ? (
              <div className="h-[100px] flex items-center justify-center text-slate-400 text-xs">
                No data available.
              </div>
            ) : (
              invoiceData.topInvoices.map((inv, idx) => {
                // PERUBAHAN: Ekstrak client dari nested expand project_id -> client_id
                const nestedClient = inv.expand?.project_id?.expand?.client_id
                const directClient = inv.expand?.client_id

                // Prioritaskan nama company, lalu nama orang, lalu nama fallback
                const clientName =
                  nestedClient?.company_name ||
                  nestedClient?.name ||
                  directClient?.company_name ||
                  directClient?.name ||
                  'Unknown Client'

                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-6 w-6 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-[10px]">
                        #{idx + 1}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {clientName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-slate-500 font-mono bg-slate-100 px-1 rounded border border-slate-200">
                            {inv.invoice_number || 'INV-XXX'}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize truncate">
                            {inv.type ||
                              inv.category ||
                              inv.division ||
                              'General'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-bold text-emerald-600 text-sm pl-2 shrink-0">
                      {formatRupiah(inv.total_amount || inv.amount || 0)}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
