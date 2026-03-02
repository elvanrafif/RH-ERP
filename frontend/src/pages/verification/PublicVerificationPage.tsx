import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { pb } from '@/lib/pocketbase'
import { Loader2, Share2, Download, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { toBlob } from 'html-to-image'
import jsPDF from 'jspdf'
import { usePublicDocument } from '@/hooks/usePublicDocument'

import { InvoicePaper } from '../invoices/components/InvoicePaper'
import { QuotationPaper } from '../quotations/QuotationPaper'

export default function PublicVerificationPage() {
  const { docType, id } = useParams()
  const [isCapturing, setIsCapturing] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  const { data: doc, isLoading, isError } = usePublicDocument(docType, id)

  const hasDbFile = !!doc?.document_file

  const handleDownloadAsPdf = async () => {
    if (!doc?.document_file) return
    setIsDownloadingPdf(true)
    const toastId = toast.loading('Mengompres & Menyusun PDF...')

    try {
      const fileUrl = pb.files.getUrl(doc, doc.document_file, { download: true })
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = () => {
        const base64data = reader.result as string
        const pdf = new jsPDF('p', 'mm', 'a4')
        const width = pdf.internal.pageSize.getWidth()
        const height = pdf.internal.pageSize.getHeight()
        pdf.addImage(base64data, 'JPEG', 0, 0, width, height, undefined, 'FAST')
        const fileName = `RH-STUDIO-${docType?.toUpperCase()}-${doc?.invoice_number || doc?.quotation_number}.pdf`
        pdf.save(fileName)
        toast.dismiss(toastId)
        toast.success('PDF Berhasil didownload')
        setIsDownloadingPdf(false)
      }
    } catch (error) {
      console.error(error)
      toast.dismiss(toastId)
      toast.error('Gagal mendownload PDF')
      setIsDownloadingPdf(false)
    }
  }

  useEffect(() => {
    if (isCapturing && captureRef.current) {
      setTimeout(() => runShareProcess(), 500)
    }
  }, [isCapturing])

  const runShareProcess = async () => {
    const toastId = toast.loading('Memproses dokumen...')
    try {
      const element = captureRef.current
      if (!element) throw new Error('Missing element')
      await document.fonts.ready
      const isMobile = window.innerWidth < 768
      const blob = await toBlob(element, {
        cacheBust: false,
        backgroundColor: '#ffffff',
        pixelRatio: isMobile ? 1.5 : 2,
        skipAutoScale: true,
      })
      if (!blob) throw new Error('Gagal')
      const fileName = `Invoice-${doc?.invoice_number}.png`
      const file = new File([blob], fileName, { type: 'image/png' })
      if (navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Invoice', text: doc?.invoice_number })
      } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = fileName
        link.click()
      }
      toast.dismiss(toastId)
    } catch (e: unknown) {
      toast.dismiss(toastId)
      if (e instanceof Error && e.name !== 'AbortError') toast.error('Gagal')
    } finally {
      setIsCapturing(false)
    }
  }

  const client = doc?.expand?.client_id
  const qrLink = `${import.meta.env.VITE_FE_LINK_URL}/verify/${docType}/${id}`

  const renderPaper = (forCapture = false) => {
    if (docType === 'quotations') {
      return (
        <QuotationPaper
          qrLink={qrLink}
          quotationNumber={doc?.quotation_number}
          client={client}
          address={doc?.expand?.client_id?.address}
          projectArea={doc?.project_area}
          pricePerMeter={doc?.price_per_meter}
          grandTotal={doc?.total_price}
          bankDetails={doc?.bank_details}
          isPublicView={!forCapture}
        />
      )
    }
    return (
      <InvoicePaper
        type={doc?.type || 'design'}
        activeTermin={doc?.active_termin || '1'}
        invoiceNumber={doc?.invoice_number}
        date={doc?.date}
        client={client}
        projectArea={doc?.project_area}
        pricePerMeter={doc?.price_per_meter}
        grandTotal={doc?.total_amount}
        items={doc?.items}
        bankDetails={doc?.bank_details}
        qrLink={qrLink}
        isPublicView={!forCapture}
      />
    )
  }

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  if (isError || !doc)
    return <div className="p-10 text-center">Dokumen Tidak Ditemukan</div>

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-0 flex flex-col items-center overflow-x-hidden relative">
      <div className="w-full max-w-[210mm] mb-6 flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-0 z-10 relative">
        <div className="flex items-center gap-3 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg w-full md:w-auto">
          <CheckCircle2 className="h-6 w-6" />
          <div>
            <h2 className="font-bold text-sm">DOKUMEN RESMI</h2>
            <p className="text-[10px]">Valid & Terverifikasi</p>
          </div>
        </div>

        <Button
          onClick={() => {
            if (hasDbFile) {
              handleDownloadAsPdf()
            } else {
              setIsCapturing(true)
            }
          }}
          disabled={isCapturing || isDownloadingPdf}
          className="bg-slate-800 hover:bg-slate-900 shadow-lg w-full md:w-auto"
        >
          {isCapturing || isDownloadingPdf ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : hasDbFile ? (
            <Download className="mr-2 h-4 w-4" />
          ) : (
            <Share2 className="mr-2 h-4 w-4" />
          )}
          {isCapturing || isDownloadingPdf
            ? 'Memproses...'
            : hasDbFile
              ? 'Download PDF Resmi'
              : 'Simpan / Share'}
        </Button>
      </div>

      <div className="w-full flex justify-center overflow-hidden pb-10 relative z-10">
        <div className="relative shadow-2xl bg-white transition-transform origin-top transform scale-[0.45] mb-[-160mm] xs:scale-[0.55] xs:mb-[-130mm] sm:scale-[0.75] sm:mb-[-75mm] md:scale-100 md:mb-0">
          <div
            className="absolute inset-0 z-50 w-full h-full bg-transparent"
            onContextMenu={(e) => {
              e.preventDefault()
              return false
            }}
          />
          {renderPaper(false)}
        </div>
      </div>

      {isCapturing && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/95 flex justify-center overflow-auto pt-10">
          <div
            ref={captureRef}
            style={{
              width: '210mm',
              minHeight: '297mm',
              backgroundColor: 'white',
              flexShrink: 0,
            }}
          >
            {renderPaper(true)}
          </div>
        </div>
      )}
    </div>
  )
}
