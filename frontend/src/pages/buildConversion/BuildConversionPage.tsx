import { useState } from 'react'
import { TrendingUp, CheckCircle2, Clock, BarChart2 } from 'lucide-react'
import {
  useArchitectureToBuildConversion,
  type ConversionProject,
} from '@/hooks/useArchitectureToBuildConversion'
import { useUsers } from '@/hooks/useUsers'
import { StatCard } from '@/components/shared/StatCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DIVISION } from '@/lib/constant'
import { Badge } from '@/components/ui/badge'

function ConversionTable({
  rows,
  showCivil,
}: {
  rows: ConversionProject[]
  showCivil: boolean
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        Tidak ada data.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Client
            </th>
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              PIC Arsitektur
            </th>
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Status Arsitektur
            </th>
            {showCivil && (
              <>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Status Civil
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Civil Dibuat
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ architecture: arch, civil }) => (
            <tr
              key={arch.id}
              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {arch.expand?.client?.company_name ?? '—'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {arch.expand?.assignee?.name ?? '—'}
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wide"
                >
                  {arch.status.replace(/_/g, ' ')}
                </Badge>
              </td>
              {showCivil && (
                <>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {civil
                      ? new Date(civil.created).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function BuildConversionPage() {
  const [picFilter, setPicFilter] = useState<string>('all')
  const { users } = useUsers()
  const architectureUsers = users.filter(
    (u) => u.division?.toLowerCase() === DIVISION.ARCHITECTURE
  )

  const selectedPic = picFilter === 'all' ? undefined : picFilter
  const { converted, potential, notConverted, stats, isLoading } =
    useArchitectureToBuildConversion(selectedPic)

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Design → Build Conversion" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border rounded-xl border border-border overflow-hidden bg-white shadow-sm">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
          label="Total Design Selesai"
          value={isLoading ? '—' : stats.totalFinished}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
          label="Converted ke Civil"
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
          label="Potensial (Ongoing)"
          value={isLoading ? '—' : stats.potentialCount}
        />
      </div>

      {/* Filter PIC */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-muted-foreground shrink-0">
          Filter PIC:
        </p>
        <Select value={picFilter} onValueChange={setPicFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Semua PIC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua PIC</SelectItem>
            {architectureUsers.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name || u.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="converted">
        <TabsList>
          <TabsTrigger value="converted">
            Lanjut ke Build ({converted.length})
          </TabsTrigger>
          <TabsTrigger value="potential">
            Potensial ({potential.length})
          </TabsTrigger>
          <TabsTrigger value="not-converted">
            Belum Lanjut ({notConverted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="converted" className="mt-4">
          <ConversionTable rows={converted} showCivil={true} />
        </TabsContent>

        <TabsContent value="potential" className="mt-4">
          <ConversionTable rows={potential} showCivil={false} />
        </TabsContent>

        <TabsContent value="not-converted" className="mt-4">
          <ConversionTable rows={notConverted} showCivil={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
