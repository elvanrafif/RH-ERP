import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import {
  Loader2,
  AlertTriangle,
  Share2,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { toBlob } from 'html-to-image'
import jsPDF from 'jspdf' // IMPORT INI

import { InvoicePaper } from '../invoices/components/InvoicePaper'

export default function PublicVerificationPage() {
  const { docType, id } = useParams()
  const [isCapturing, setIsCapturing] = useState(false)
  // State untuk loading saat convert PDF
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  // ... (Kode getCollectionName & useQuery SAMA SEPERTI SEBELUMNYA) ...
  const getCollectionName = (type: string | undefined) => {
    switch (type) {
      case 'quotation':
        return 'quotations'
      case 'spk':
        return 'spks'
      case 'invoice':
      default:
        return 'invoices'
    }
  }

  const {
    data: doc,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-doc', docType, id],
    queryFn: async () => {
      const collection = getCollectionName(docType)
      return await pb
        .collection(collection)
        .getOne(id as string, { expand: 'client_id' })
    },
    retry: false,
  })

  // --- LOGIC BARU: DOWNLOAD PNG DARI DB -> CONVERT JADI PDF ---
  const hasDbFile = !!doc?.document_file

  const handleDownloadAsPdf = async () => {
    if (!doc?.document_file) return

    setIsDownloadingPdf(true)
    const toastId = toast.loading('Mengompres & Menyusun PDF...') // Update text

    try {
      // 1. Dapatkan URL File Gambar dari PocketBase
      const fileUrl = pb.files.getUrl(doc, doc.document_file, {
        download: true,
      })

      // 2. Fetch Gambar
      const response = await fetch(fileUrl)
      const blob = await response.blob()

      // 3. Convert Blob ke Base64
      const reader = new FileReader()
      reader.readAsDataURL(blob)

      reader.onloadend = () => {
        const base64data = reader.result as string

        // 4. Buat PDF A4 (Gunakan unit 'mm')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const width = pdf.internal.pageSize.getWidth() // 210mm
        const height = pdf.internal.pageSize.getHeight() // 297mm

        // --- PERBAIKAN DI SINI: GUNAKAN KOMPRESI JPEG ---
        // Format: pdf.addImage(imageData, format, x, y, w, h, alias, compression, rotation)
        // 'FAST' = Kompresi cepat & ukuran kecil.
        // 'MEDIUM' = Seimbang.
        // 'SLOW' = Kompresi terbaik tapi lama.
        // Kita gunakan format 'JPEG' meskipun aslinya PNG agar bisa dikompres.

        pdf.addImage(
          base64data,
          'JPEG', // Paksa convert ke JPEG di dalam PDF
          0,
          0,
          width,
          height,
          undefined, // alias
          'FAST' // Compression level (FAST bikin file jadi kecil banget)
        )

        // 5. Save PDF
        const fileName = `RH-STUDIO-${docType?.toUpperCase()}-${doc?.invoice_number}.pdf`
        pdf.save(fileName)

        toast.dismiss(toastId)
        toast.success('PDF (Compressed) Berhasil didownload')
        setIsDownloadingPdf(false)
      }
    } catch (error) {
      console.error(error)
      toast.dismiss(toastId)
      toast.error('Gagal mendownload PDF')
      setIsDownloadingPdf(false)
    }
  }

  // ... (Kode Capture Fallback & Render SAMA SEPERTI SEBELUMNYA) ...
  // Saya persingkat bagian ini agar fokus ke perubahan

  // Logic Fallback lama (tetap disimpan jaga-jaga)
  useEffect(() => {
    if (isCapturing && captureRef.current) {
      setTimeout(() => runShareProcess(), 500)
    }
  }, [isCapturing])

  const runShareProcess = async () => {
    // ... (LOGIC LAMA COPY DARI SEBELUMNYA) ...
    // Biar aman saya copy logic lama disini sekilas:
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
      if (
        navigator.canShare &&
        navigator.share &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: 'Invoice',
          text: doc?.invoice_number,
        })
      } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = fileName
        link.click()
      }
      toast.dismiss(toastId)
    } catch (e: any) {
      toast.dismiss(toastId)
      if (e.name !== 'AbortError') toast.error('Gagal')
    } finally {
      setIsCapturing(false)
    }
  }

  // ... Header Config & RenderPaper function SAMA ...
  const client = doc?.expand?.client_id
  const qrLink = `${import.meta.env.VITE_FE_LINK_URL}/verify/${docType}/${id}`
  const headerConfig = (() => {
    /* ... Logic Header ... */ return {
      label: 'INVOICE',
      color: 'bg-slate-800',
      icon: <FileText />,
    }
  })()

  const renderPaper = (forCapture = false) => {
    /* ... Logic Render Paper SAMA ... */
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
        <div
          className={`flex items-center gap-3 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg w-full md:w-auto`}
        >
          {/* Header Info */}
          <CheckCircle2 className="h-6 w-6" />
          <div>
            <h2 className="font-bold text-sm">DOKUMEN RESMI</h2>
            <p className="text-[10px]">Valid & Terverifikasi</p>
          </div>
        </div>

        {/* BUTTON UTAMA */}
        <Button
          onClick={() => {
            if (hasDbFile) {
              handleDownloadAsPdf() // Logic Baru: PNG to PDF
            } else {
              setIsCapturing(true) // Fallback: Capture ulang
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
              ? 'Download PDF Resmi' // Label berubah jadi PDF
              : 'Simpan / Share'}
        </Button>
      </div>

      {/* Preview Area & Overlay logic SAMA seperti sebelumnya */}
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
