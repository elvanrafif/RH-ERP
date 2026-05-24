import { PauseCircle } from 'lucide-react'
import { formatDateShort } from '@/lib/helpers'

interface ProjectHoldBannerProps {
  reason?: string | null
  heldAt?: string | null
}

export function ProjectHoldBanner({ reason, heldAt }: ProjectHoldBannerProps) {
  return (
    <div className="mx-6 mt-5 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
      <PauseCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
          On Hold
        </p>
        {reason && (
          <p className="text-sm text-orange-800 mt-0.5 leading-snug">{reason}</p>
        )}
        {heldAt && (
          <p className="text-xs text-orange-500 mt-1">
            Since {formatDateShort(heldAt)}
          </p>
        )}
      </div>
    </div>
  )
}
