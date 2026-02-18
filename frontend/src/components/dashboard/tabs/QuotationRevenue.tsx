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
import { Loader2, FileCheck, Award, CalendarDays, Check } from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'

const buildPbFilter = (
  field: string,
  filterType: string,
  start: string,
  end: string
) => {
  if (filterType === 'all') return ''

  const now = new Date()
  let startDate, endDate

  if (filterType === 'this_month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )
  } else if (filterType === 'this_year') {
    startDate = new Date(now.getFullYear(), 0, 1)
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
  } else if (filterType === 'custom') {
    if (!start || !end) return ''
    startDate = new Date(start)
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(end)
    endDate.setHours(23, 59, 59, 999)
  }

  if (startDate && endDate) {
    const startStr = startDate.toISOString().replace('T', ' ')
    const endStr = endDate.toISOString().replace('T', ' ')
    return `${field} >= "${startStr}" && ${field} <= "${endStr}"`
  }
  return ''
}

export function QuotationRevenue() {
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

  const { data: quotationData, isLoading } = useQuery({
    queryKey: ['document-quotations', filter, appliedStart, appliedEnd],
    queryFn: async () => {
      // 1. Dapatkan filter tanggal
      const dateFilterStr = buildPbFilter(
        'created',
        filter,
        appliedStart,
        appliedEnd
      )

      // 2. Gabungkan dengan filter mutlak: HANYA STATUS PAID
      const statusFilterStr = `status = "paid"`
      const finalFilter = dateFilterStr
        ? `(${dateFilterStr}) && ${statusFilterStr}`
        : statusFilterStr

      const quotations = await pb.collection('quotations').getFullList({
        filter: finalFilter,
        sort: '-created',
        expand: 'project_id.client_id,client_id',
      })

      let totalRealized = 0
      quotations.forEach((q) => {
        totalRealized += q.total_price || 0
      })

      const topQuotations = [...quotations]
        .sort((a, b) => (b.total_price || 0) - (a.total_price || 0))
        .slice(0, 5)

      return { totalRealized, topQuotations }
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center flex-col gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="text-sm font-medium">Fetching realized deals...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* HEADER & FILTER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {/* Ikon diubah menjadi FileCheck agar lebih relevan dengan status Paid */}
          <div className="p-1.5 bg-purple-100 rounded-md text-purple-700">
            <FileCheck className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Realized Quotations
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
                  className="w-full h-8 mt-1 bg-purple-600 hover:bg-purple-700 text-xs"
                  onClick={() => {
                    setAppliedStart(tempStart)
                    setAppliedEnd(tempEnd)
                    setShowCustomModal(false)
                  }}
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Apply Filter
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Card */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white border-none shadow-md">
        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between">
            {/* Teks dan ikon KPI diganti menyesuaikan "Realized" */}
            <CardTitle className="text-sm font-medium">
              Total Approved Deals
            </CardTitle>
            <Award className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-3xl font-bold tracking-tight">
            {formatRupiah(quotationData?.totalRealized || 0)}
          </p>
        </CardContent>
      </Card>

      {/* List Top Quotations */}
      <Card className="border-slate-200/60 shadow-sm overflow-hidden h-auto">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-bold text-slate-800">
            Top 5 Paid Quotations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {!quotationData?.topQuotations ||
          quotationData.topQuotations.length === 0 ? (
            <div className="h-[150px] flex items-center justify-center text-slate-400 text-xs">
              No paid quotations found in this period.
            </div>
          ) : (
            <div className="space-y-3">
              {quotationData.topQuotations.map((q, idx) => {
                const nestedClient = q.expand?.project_id?.expand?.client_id
                const directClient = q.expand?.client_id

                const clientName =
                  nestedClient?.company_name ||
                  nestedClient?.name ||
                  directClient?.company_name ||
                  directClient?.name ||
                  'Unknown Client'

                return (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-2.5 bg-purple-50/30 rounded-lg border border-purple-100/50"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-white border border-purple-100 flex items-center justify-center font-bold text-purple-600 text-[10px] shadow-sm">
                        #{idx + 1}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {clientName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-slate-400 font-mono">
                            {q.quotation_number || 'QUO-XXX'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-bold text-purple-700 text-sm pl-2 shrink-0">
                      {formatRupiah(q.total_price || 0)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
