import { useState } from 'react'
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart2,
} from 'lucide-react'
import { useArchitectureToBuildConversion } from '@/hooks/useArchitectureToBuildConversion'
import { useUsers } from '@/hooks/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { StatCard } from '@/components/shared/StatCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { TablePagination } from '@/components/shared/TablePagination'
import { DIVISION } from '@/lib/constant'
import { ConversionTable } from './ConversionTable'
import { ConversionToolbar } from './ConversionToolbar'

type ActiveTab = 'converted' | 'potential' | 'not-converted'

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
        <ConversionToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          picFilter={picFilter}
          onPicFilterChange={setPicFilter}
          architectureUsers={architectureUsers}
          convertedCount={filteredConverted.length}
          potentialCount={filteredPotential.length}
          notConvertedCount={filteredNotConverted.length}
        />

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
