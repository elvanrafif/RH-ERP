import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  FileText,
  Receipt,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'

// Import Komponen Kertas
import { InvoicePaper } from '../invoices/components/InvoicePaper'

export default function PublicVerificationPage() {
  const { docType, id } = useParams()
  const componentRef = useRef<HTMLDivElement>(null)

  // 1. TENTUKAN COLLECTION
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

  // 2. FETCH DATA
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

  // 3. PRINT HANDLER
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Verified-${docType?.toUpperCase()}-${id}`,
  })

  // --- UI STATES ---
  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium animate-pulse">
          Memverifikasi Dokumen...
        </p>
      </div>
    )

  if (isError || !doc)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-4 text-center">
        <div className="bg-red-100 p-4 rounded-full">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dokumen Tidak Ditemukan
        </h1>
        <p className="text-slate-500 max-w-md">
          Sistem tidak dapat memverifikasi dokumen ini. Kemungkinan link rusak
          atau dokumen tidak valid.
        </p>
      </div>
    )

  // --- DATA PREPARATION ---
  const client = doc.expand?.client_id
  const qrLink = `${import.meta.env.VITE_FE_LINK_URL}/verify/${docType}/${id}`

  const getHeaderConfig = () => {
    switch (docType) {
      case 'quotation':
        return {
          label: 'PENAWARAN RESMI',
          color: 'bg-blue-600',
          icon: <FileText className="h-6 w-6" />,
        }
      case 'spk':
        return {
          label: 'SURAT PERINTAH KERJA',
          color: 'bg-amber-600',
          icon: <ShieldCheck className="h-6 w-6" />,
        }
      default:
        return {
          label: 'INVOICE TERVERIFIKASI',
          color: 'bg-emerald-600',
          icon: <CheckCircle2 className="h-6 w-6" />,
        }
    }
  }
  const headerConfig = getHeaderConfig()

  // --- RENDER CONTENT ---
  const renderDocumentContent = () => {
    switch (docType) {
      case 'quotation':
        return (
          <InvoicePaper
            ref={componentRef}
            type="QUOTATION"
            invoiceNumber={doc.quotation_number}
            date={doc.date}
            activeTermin="-"
            client={client}
            projectArea={doc.project_area || 0}
            pricePerMeter={doc.price_per_meter || 0}
            grandTotal={doc.total_amount || 0}
            items={doc.items || []}
            bankDetails={doc.bank_details}
            qrLink={qrLink}
            isPublicView={true}
          />
        )
      case 'spk':
        return <div className="p-10 text-center">Tampilan SPK Belum Dibuat</div>
      case 'invoice':
      default:
        return (
          <InvoicePaper
            ref={componentRef}
            type={doc.type || 'design'}
            invoiceNumber={doc.invoice_number}
            date={doc.date}
            activeTermin={doc.active_termin || '1'}
            client={client}
            projectArea={doc.project_area || 0}
            pricePerMeter={doc.price_per_meter || 0}
            grandTotal={doc.total_amount || 0}
            items={doc.items || []}
            bankDetails={doc.bank_details}
            qrLink={qrLink}
            isPublicView={true} // Aktifkan Mode Aman
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-0 flex flex-col items-center overflow-x-hidden">
      {/* HEADER BAR */}
      <div className="w-full max-w-[210mm] mb-6 flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-0 z-10">
        <Button
          onClick={() => handlePrint()}
          className="bg-slate-800 hover:bg-slate-900 shadow-lg w-auto"
        >
          <Printer className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* --- CONTAINER KERTAS --- */}
      <div className="w-full flex justify-center overflow-hidden pb-10">
        <div
          className="relative shadow-2xl bg-white transition-transform origin-top transform 
          scale-[0.45] mb-[-160mm] 
          xs:scale-[0.55] xs:mb-[-130mm] 
          sm:scale-[0.75] sm:mb-[-75mm] 
          md:scale-100 md:mb-0"
        >
          {/* SECURITY LAYER (INVISIBLE SHIELD) */}
          {/* Ini layer transparan di atas kertas. Kalau user 'Inspect Element' di sini,
              mereka akan inspect div kosong ini, bukan text invoice-nya. */}
          <div
            className="absolute inset-0 z-50 w-full h-full bg-transparent"
            onContextMenu={(e) => {
              e.preventDefault() // Matikan Klik Kanan
              return false
            }}
          />

          {/* DOCUMENT CONTENT */}
          {renderDocumentContent()}
        </div>
      </div>

      {/* FOOTER COPYRIGHT */}
      <div className="mt-8 text-center text-slate-400 text-xs px-4 relative z-20">
        &copy; {new Date().getFullYear()} RH Studio Arsitek. All Rights
        Reserved. <br />
      </div>
    </div>
  )
}
