import type { ElementType } from 'react'
import type { Vendor } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Phone, FileText, HardHat, Sofa } from 'lucide-react'
import { getInitials } from '@/lib/helpers'

const PROJECT_TYPE_LABEL: Record<Vendor['project_type'], string> = {
  civil: 'Sipil',
  interior: 'Interior',
}

const PROJECT_TYPE_BADGE_CLASS: Record<Vendor['project_type'], string> = {
  civil: 'bg-amber-100 text-amber-800',
  interior: 'bg-purple-100 text-purple-800',
}

const PROJECT_TYPE_ICON: Record<Vendor['project_type'], ElementType> = {
  civil: HardHat,
  interior: Sofa,
}

interface VendorDetailDialogProps {
  vendor: Vendor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VendorDetailDialog({ vendor, open, onOpenChange }: VendorDetailDialogProps) {
  if (!vendor) return null

  const TypeIcon = PROJECT_TYPE_ICON[vendor.project_type]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
              {getInitials(vendor.name)}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {vendor.name}
              </DialogTitle>
              <Badge className={PROJECT_TYPE_BADGE_CLASS[vendor.project_type]}>
                <TypeIcon className="mr-1 h-3 w-3" />
                {PROJECT_TYPE_LABEL[vendor.project_type]}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700">{vendor.phone || '—'}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700 whitespace-pre-wrap">{vendor.notes || '—'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
