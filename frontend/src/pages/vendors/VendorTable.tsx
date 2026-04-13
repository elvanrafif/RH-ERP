import type { Vendor } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye, Pencil } from 'lucide-react'
import { RowActions } from '@/components/shared/RowActions'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { getInitials } from '@/lib/helpers'

const PROJECT_TYPE_LABEL: Record<Vendor['project_type'], string> = {
  civil: 'Civil',
  interior: 'Interior',
}

const PROJECT_TYPE_BADGE_CLASS: Record<Vendor['project_type'], string> = {
  civil: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  interior: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
}

interface VendorTableProps {
  vendors: Vendor[]
  isLoading: boolean
  onView: (vendor: Vendor) => void
  onEdit: (vendor: Vendor) => void
}

export function VendorTable({
  vendors,
  isLoading,
  onView,
  onEdit,
}: VendorTableProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[700px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[240px]">Vendor Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-[110px]">Project Type</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} columns={6} />
              ) : vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-60">
                    <EmptyState
                      title="No vendors found"
                      description="Try adjusting your filters or add a new vendor."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor, index) => (
                  <TableRow key={vendor.id} className="h-14">
                    <TableCell className="text-slate-400 text-xs tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {getInitials(vendor.name)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {vendor.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {vendor.phone || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          PROJECT_TYPE_BADGE_CLASS[vendor.project_type]
                        }
                      >
                        {PROJECT_TYPE_LABEL[vendor.project_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          vendor.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }
                      >
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">
                      {vendor.notes || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        actions={[
                          {
                            label: 'View Details',
                            icon: Eye,
                            onClick: () => onView(vendor),
                          },
                          {
                            label: 'Edit',
                            icon: Pencil,
                            onClick: () => onEdit(vendor),
                            separator: true,
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
