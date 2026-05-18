import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Download, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { usePublicDocument } from '@/hooks/usePublicDocument'
import { useDocumentScaling } from '@/hooks/useDocumentScaling'
import { useDocumentExport } from '@/hooks/useDocumentExport'
import { A4_BASE_WIDTH } from '@/lib/constant'
import { buildQuotationFileName } from '@/lib/helpers'

import { InvoicePaper } from '../invoices/components/InvoicePaper'
import { QuotationPaper } from '../quotations/QuotationPaper'

export default function PublicVerificationPage() {
  const { docType, id } = useParams()
  const [isCapturing, setIsCapturing] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  const { data: doc, isLoading, isError } = usePublicDocument(docType, id)
  const { containerRef, scale } = useDocumentScaling()
  const { generatePdf } = useDocumentExport(captureRef)

  useEffect(() => {
    if (isCapturing && captureRef.current) {
      setTimeout(() => runDownloadProcess(), 500)
    }
  }, [isCapturing])

  const runDownloadProcess = async () => {
    const toastId = toast.loading('Generating PDF...')
    try {
      await document.fonts.ready
      const client = doc?.expand?.client_id
      const clientName = (client?.company_name || 'document')
        .toUpperCase()
        .replace(/\s+/g, '_')
      let fileName: string
      if (docType === 'invoices') {
        const typePart = (doc?.type || 'design').toUpperCase()
        const terminPart = `TERMIN${doc?.active_termin || '1'}`
        fileName = `INVOICE_${typePart}_${terminPart}_${clientName}.pdf`
      } else {
        fileName = `${buildQuotationFileName(client?.company_name || 'document', client?.salutation, doc?.project_area)}.pdf`
      }
      await generatePdf(fileName)
      toast.dismiss(toastId)
      toast.success('PDF downloaded successfully')
    } catch {
      toast.dismiss(toastId)
      toast.error('Failed to generate PDF')
    } finally {
      setIsCapturing(false)
    }
  }

  const client = doc?.expand?.client_id
  const qrLink = `${import.meta.env.VITE_FE_LINK_URL}/verify/${docType}/${id}`

  const renderPaper = (forCapture = false) => {
    if (docType === 'quotations') {
      const quotationContractValue =
        (doc?.project_area || 0) * (doc?.price_per_meter || 0)
      const quotationDiscountPercent = doc?.discount_percent || 0
      const quotationGrandTotal =
        quotationDiscountPercent > 0
          ? quotationContractValue * (1 - quotationDiscountPercent / 100)
          : quotationContractValue
      return (
        <QuotationPaper
          qrLink={qrLink}
          quotationNumber={doc?.quotation_number}
          client={client}
          address={doc?.expand?.client_id?.address}
          projectArea={doc?.project_area}
          pricePerMeter={doc?.price_per_meter}
          contractValue={quotationContractValue}
          discountPercent={quotationDiscountPercent}
          grandTotal={quotationGrandTotal}
          bankDetails={doc?.bank_details}
          isPublicView={!forCapture}
        />
      )
    }

    // Derive contractValue and discountPercent for invoices
    const invoiceType = doc?.type || 'design'
    const contractValue =
      invoiceType === 'design'
        ? (doc?.project_area || 0) * (doc?.price_per_meter || 0)
        : doc?.total_amount || 0
    const discountPercent = doc?.discount_percent || 0
    const grandTotal =
      discountPercent > 0
        ? contractValue * (1 - discountPercent / 100)
        : contractValue

    return (
      <InvoicePaper
        type={invoiceType}
        activeTermin={doc?.active_termin || '1'}
        invoiceNumber={doc?.invoice_number}
        date={doc?.date}
        client={client}
        projectArea={doc?.project_area}
        pricePerMeter={doc?.price_per_meter}
        contractValue={contractValue}
        discountPercent={discountPercent}
        grandTotal={grandTotal}
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
    return <div className="p-10 text-center">Document Not Found</div>

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-0 flex flex-col items-center overflow-x-hidden relative">
      <div className="w-full max-w-[210mm] mb-6 flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-0 z-10 relative">
        <div className="flex items-center gap-3 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg w-full md:w-auto">
          <CheckCircle2 className="h-6 w-6" />
          <div>
            <h2 className="font-bold text-sm text-white">OFFICIAL DOCUMENT</h2>
            <p className="text-[10px] text-slate-300">Valid & Verified</p>
          </div>
        </div>

        <Button
          onClick={() => setIsCapturing(true)}
          disabled={isCapturing}
          className="bg-slate-800 hover:bg-slate-900 shadow-lg w-full md:w-auto text-white"
        >
          {isCapturing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
          ) : (
            <Download className="mr-2 h-4 w-4 text-white" />
          )}
          {isCapturing ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      </div>

      <div
        ref={containerRef}
        className="w-full flex-1 flex flex-col justify-center items-center p-6 relative z-10"
      >
        <div
          className="relative shadow-2xl bg-white shrink-0 overflow-hidden"
          style={{
            width: A4_BASE_WIDTH * scale,
            height: (297 / 210) * A4_BASE_WIDTH * scale,
          }}
        >
          <div
            className="absolute inset-0 z-50 w-full h-full bg-transparent"
            onContextMenu={(e) => {
              e.preventDefault()
              return false
            }}
          />
          <div
            className="absolute top-0 left-0 origin-top-left transform-gpu"
            style={{ transform: `scale(${scale})` }}
          >
            {renderPaper(false)}
          </div>
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
