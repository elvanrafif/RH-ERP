import { useState } from 'react'
import type { RefObject } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

interface ReportExportButtonProps {
  contentRef: RefObject<HTMLDivElement | null>
}

export function ReportExportButton({ contentRef }: ReportExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (!contentRef.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(contentRef.current, { quality: 0.95, pixelRatio: 2 })
      const img = new Image()
      img.src = dataUrl
      await new Promise<void>(res => { img.onload = () => res() })
      const w = img.width / 2
      const h = img.height / 2
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [w, h] })
      pdf.addImage(dataUrl, 'PNG', 0, 0, w, h)
      pdf.save(`laporan-keuangan-${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success('PDF berhasil diunduh')
    } catch {
      toast.error('Gagal mengekspor PDF')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={exporting} className="gap-2 shadow-sm">
      {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Export PDF
    </Button>
  )
}
