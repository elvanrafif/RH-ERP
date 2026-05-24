import type { ConversionProject } from '@/hooks/useArchitectureToBuildConversion'
import { ClientName } from '@/components/shared/ClientName'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MaskingTextByArchitectureStatus } from '@/lib/masking'

interface ConversionTableProps {
  rows: ConversionProject[]
  showCivil: boolean
  isLoading: boolean
}

export function ConversionTable({ rows, showCivil, isLoading }: ConversionTableProps) {
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
                    {arch.expand?.client ? (
                      <ClientName
                        name={arch.expand.client.company_name}
                        salutation={arch.expand.client.salutation}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {arch.expand?.assignee?.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] tracking-wide">
                      {MaskingTextByArchitectureStatus(arch.status)}
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
                          ? new Date(civil.created).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
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
