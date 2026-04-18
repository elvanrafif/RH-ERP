import { useState } from 'react'
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart2,
  Search,
} from 'lucide-react'
import {
  useArchitectureToBuildConversion,
  type ConversionProject,
} from '@/hooks/useArchitectureToBuildConversion'
import { useUsers } from '@/hooks/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { StatCard } from '@/components/shared/StatCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { TablePagination } from '@/components/shared/TablePagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DIVISION } from '@/lib/constant'

type ActiveTab = 'converted' | 'potential' | 'not-converted'

function ConversionTable({
  rows,
  showCivil,
  isLoading,
}: {
  rows: ConversionProject[]
  showCivil: boolean
  isLoading: boolean
}) {
  const colCount = showCivil ? 6 : 4

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Architecture PIC</TableHead>
              <TableHead>Architecture Status</TableHead>
              {showCivil && (
                <>
                  <TableHead>Civil Status</TableHead>
                  <TableHead>Civil Created</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton rows={5} columns={colCount} />
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} className="h-60">
                  <EmptyState
                    title="No data available"
                    description="Try adjusting your search or filter."
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ architecture: arch, civil }, index) => (
                <TableRow key={arch.id} className="h-14">
                  <TableCell className="text-slate-400 text-xs tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {arch.expand?.client?.company_name ?? '—'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {arch.expand?.assignee?.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wide"
                    >
                      {arch.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  {showCivil && (
                    <>
                      <TableCell>
                        {civil ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {civil.status.replace(/_/g, ' ')}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {civil
                          ? new Date(civil.created).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )
                          : '—'}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function BuildConversionPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('converted')
  const [picFilter, setPicFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { users } = useUsers()
  const architectureUsers = users.filter(
    (u) => u.division?.toLowerCase() === DIVISION.ARCHITECTURE
  )

  const selectedPic = picFilter === 'all' ? undefined : picFilter
  const { converted, potential, notConverted, stats, isLoading } =
    useArchitectureToBuildConversion(selectedPic)

  const sortedConverted = [...converted].sort(
    (a, b) =>
      new Date(b.civil!.created).getTime() -
      new Date(a.civil!.created).getTime()
  )

  const filterBySearch = (rows: ConversionProject[]) =>
    debouncedSearch
      ? rows.filter((r) =>
          r.architecture.expand?.client?.company_name
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase())
        )
      : rows

  const filteredConverted = filterBySearch(sortedConverted)
  const filteredPotential = filterBySearch(potential)
  const filteredNotConverted = filterBySearch(notConverted)

  const {
    page: cp,
    setPage: setCp,
    totalItems: ct,
    totalPages: ctp,
    paginatedData: pc,
  } = usePagination(filteredConverted, [debouncedSearch, picFilter, activeTab])

  const {
    page: pp,
    setPage: setPp,
    totalItems: pt,
    totalPages: ptp,
    paginatedData: pp2,
  } = usePagination(filteredPotential, [debouncedSearch, picFilter, activeTab])

  const {
    page: np,
    setPage: setNp,
    totalItems: nt,
    totalPages: ntp,
    paginatedData: pnc,
  } = usePagination(filteredNotConverted, [
    debouncedSearch,
    picFilter,
    activeTab,
  ])

  const tableProps = {
    converted: {
      rows: pc,
      showCivil: true,
      page: cp,
      setPage: setCp,
      total: ct,
      pages: ctp,
      count: pc.length,
    },
    potential: {
      rows: pp2,
      showCivil: false,
      page: pp,
      setPage: setPp,
      total: pt,
      pages: ptp,
      count: pp2.length,
    },
    'not-converted': {
      rows: pnc,
      showCivil: false,
      page: np,
      setPage: setNp,
      total: nt,
      pages: ntp,
      count: pnc.length,
    },
  }[activeTab]

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        title="Design → Build Conversion"
        description="Track which architecture designs have progressed to civil construction. Filter by PIC to view individual conversion performance."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border rounded-xl border border-border overflow-hidden bg-white shadow-sm mb-6 shrink-0">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
          label="Designs Completed"
          value={isLoading ? '—' : stats.totalFinished}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
          label="Converted to Civil"
          value={isLoading ? '—' : stats.convertedCount}
        />
        <StatCard
          icon={<BarChart2 className="h-5 w-5 text-violet-600" />}
          iconBg="bg-violet-100"
          label="Conversion Rate"
          value={isLoading ? '—' : `${stats.conversionRate}%`}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-100"
          label="Potential (Ongoing)"
          value={isLoading ? '—' : stats.potentialCount}
        />
      </div>

      <div className="flex-1 overflow-hidden bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client..."
              className="pl-9 h-9 bg-white w-44"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ActiveTab)}
          >
            <SelectTrigger className="h-9 bg-white w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="converted">
                Converted ({filteredConverted.length})
              </SelectItem>
              <SelectItem value="potential">
                Potential ({filteredPotential.length})
              </SelectItem>
              <SelectItem value="not-converted">
                Not Converted ({filteredNotConverted.length})
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={picFilter} onValueChange={setPicFilter}>
            <SelectTrigger className="h-9 bg-white w-44">
              <SelectValue placeholder="All PICs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PICs</SelectItem>
              {architectureUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ConversionTable
          rows={tableProps.rows}
          showCivil={tableProps.showCivil}
          isLoading={isLoading}
        />
        <TablePagination
          page={tableProps.page}
          totalPages={tableProps.pages}
          totalItems={tableProps.total}
          itemCount={tableProps.count}
          isLoading={isLoading}
          onPageChange={tableProps.setPage}
        />
      </div>
    </div>
  )
}
