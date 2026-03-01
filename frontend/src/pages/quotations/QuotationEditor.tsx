import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Download, Save, Loader2, ArrowLeft, Share2 } from 'lucide-react'
import { QuotationPaper } from './QuotationPaper'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatRupiah } from '@/lib/helpers'
import { useDocumentScaling } from '@/hooks/useDocumentScaling'
import { useDocumentExport } from '@/hooks/useDocumentExport'
import { useWhatsAppShare } from '@/hooks/useWhatsAppShare'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

export default function QuotationEditor() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const componentRef = useRef<HTMLDivElement>(null)

  const { containerRef: previewContainerRef, scale: previewScale } = useDocumentScaling()
  const { generateJpeg } = useDocumentExport(componentRef)
  const { share: shareViaWhatsApp } = useWhatsAppShare()
  const { hasUnsavedChanges, markAsDirty, markAsClean, handleBack } = useUnsavedChanges('/quotations')

  // FETCH CLIENTS
  const { data: clientsList } = useQuery({
    queryKey: ['clients'],
    queryFn: () => pb.collection('clients').getFullList({ sort: 'company_name' }),
  })

  // FETCH QUOTATION
  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => pb.collection('quotations').getOne(id as string, { expand: 'client_id' }),
  })

  // STATE
  const [quotationNumber, setQuotationNumber] = useState('')
  const [status, setStatus] = useState('draft')
  const [address, setAddress] = useState('')
  const [projectArea, setProjectArea] = useState(0)
  const [pricePerMeter, setPricePerMeter] = useState(180000)
  const [bankDetails, setBankDetails] = useState(
    'Name : Ismail Deyrian Anugrah\nAccount Number : BNI 0717571663'
  )
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedClientData, setSelectedClientData] = useState<any>(null)

  const qrLink = `${import.meta.env.VITE_FE_LINK_URL}/verify/quotations/${id}`
  const grandTotal = projectArea * pricePerMeter

  useEffect(() => {
    if (!quotation) return

    if (!quotation.quotation_number) {
      const autoNum = `Q-${new Date().toISOString().slice(0, 7).replace('-', '')}-${id?.substring(0, 4).toUpperCase()}`
      setQuotationNumber(autoNum)
    } else {
      setQuotationNumber(quotation.quotation_number)
    }

    setStatus(quotation.status || 'draft')

    const clientObj = quotation.expand?.client_id
    if (quotation.client_id) {
      setSelectedClientId(quotation.client_id)
      setSelectedClientData(clientObj)
    }

    setAddress(quotation.address || clientObj?.address || '')
    setProjectArea(quotation.project_area || 0)
    setPricePerMeter(quotation.price_per_meter || 180000)

    if (quotation.bank_details) setBankDetails(quotation.bank_details)

    markAsClean()
  }, [quotation, id])

  const handleClientChange = (newClientId: string) => {
    markAsDirty()
    setSelectedClientId(newClientId)
    const clientObj = clientsList?.find((c: any) => c.id === newClientId)
    if (clientObj) {
      setSelectedClientData(clientObj)
      if (!address) setAddress(clientObj.address)
    }
  }

  const handleShareWA = () => {
    const message = `Hello ${selectedClientData?.company_name},\n\nHere is the link to your Quotation:\n${qrLink}\n\nThank you.`
    shareViaWhatsApp(selectedClientData?.phone, message)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('client_id', selectedClientId)
      formData.append('quotation_number', quotationNumber)
      formData.append('status', status)
      formData.append('address', address)
      formData.append('project_area', String(projectArea))
      formData.append('price_per_meter', String(pricePerMeter))
      formData.append('total_price', String(grandTotal))
      formData.append('bank_details', bankDetails)
      formData.append(
        'items',
        JSON.stringify([
          { description: 'Design & Architecture Services', quantity: projectArea, price: pricePerMeter },
        ])
      )

      const blob = await generateJpeg()
      if (blob) {
        formData.append('document_file', blob, `Quotation-${quotationNumber || 'Update'}.jpg`)
      }

      return await pb.collection('quotations').update(id as string, formData)
    },
    onSuccess: () => {
      toast.success('Quotation & Official Document saved')
      markAsClean()
      queryClient.invalidateQueries({ queryKey: ['quotation', id] })
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: () => toast.error('Failed to save changes'),
  })

  const handleDownloadOfficial = () => {
    const fileName = quotation?.document_file
    if (!fileName) {
      toast.error("Document not available. Please click 'Save' first to generate the document.")
      return
    }
    const fileUrl = pb.files.getUrl(quotation, fileName, { download: true })
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = `Quotation-${quotationNumber}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Downloading Official Document...')
  }

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    )

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* HEADER BAR */}
      <div className="shrink-0 h-auto min-h-14 py-2 lg:py-0 lg:h-14 border-b bg-white flex flex-col lg:flex-row items-center justify-between px-4 shadow-sm z-20 gap-3 lg:gap-0 print:hidden">
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className={`shrink-0 ${hasUnsavedChanges ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="hidden lg:block h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm font-mono truncate max-w-[150px] sm:max-w-none">
              {quotationNumber}
            </span>
            {hasUnsavedChanges && (
              <span className="text-[10px] sm:text-xs text-red-500 italic bg-red-50 px-2 py-1 rounded">
                (Unsaved)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <div className="mr-2 lg:mr-4 text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap">
            Grand Total:{' '}
            <span className="text-blue-600 font-bold">{formatRupiah(grandTotal)}</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className={`whitespace-nowrap ${hasUnsavedChanges ? 'border-blue-500 text-blue-600' : ''}`}
            >
              {saveMutation.isPending ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWA}
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 whitespace-nowrap"
            >
              <Share2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Share WA</span>
            </Button>

            <Button size="sm" onClick={handleDownloadOfficial} className="whitespace-nowrap">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden relative z-0">
        {/* LEFT: EDITOR FORM */}
        <div className="w-full md:w-[380px] lg:w-[450px] bg-white border-b md:border-b-0 md:border-r flex flex-col md:h-full md:overflow-y-auto shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)] z-10 print:hidden shrink-0">
          <div className="p-4 sm:p-6 space-y-6">
            {/* SETTINGS AREA */}
            <div className="space-y-4 pb-6">
              <h3 className="font-semibold text-xs uppercase tracking-wide text-slate-500 border-b pb-2">
                Quotation Details
              </h3>

              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Client</Label>
                <Select value={selectedClientId} onValueChange={handleClientChange}>
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsList?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Status</Label>
                <Select
                  value={status}
                  onValueChange={(val) => {
                    setStatus(val)
                    markAsDirty()
                  }}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500 block">Project Address</Label>
                <Textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    markAsDirty()
                  }}
                  className="text-xs min-h-[60px]"
                  placeholder="Enter project location address..."
                />
              </div>

              <div className="bg-slate-50 p-3 rounded border">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500">Area (m²)</Label>
                    <Input
                      type="number"
                      value={projectArea}
                      onChange={(e) => {
                        setProjectArea(Number(e.target.value))
                        markAsDirty()
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500">Price / m²</Label>
                    <Input
                      type="number"
                      value={pricePerMeter}
                      onChange={(e) => {
                        setPricePerMeter(Number(e.target.value))
                        markAsDirty()
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BANK DETAILS */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label className="text-xs mb-2 font-semibold text-slate-500 block">
                  Payment Information (PDF Footer)
                </Label>
                <Textarea
                  value={bankDetails}
                  onChange={(e) => {
                    setBankDetails(e.target.value)
                    markAsDirty()
                  }}
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (Desktop) / BOTTOM (Mobile): PREVIEW A4 WITH DYNAMIC SCALING */}
        <div
          ref={previewContainerRef}
          className="flex-1 bg-slate-200/80 p-4 lg:p-8 flex flex-col items-center md:overflow-y-auto print:p-0 print:bg-white print:overflow-visible"
        >
          <div className="mb-4 text-center md:hidden print:hidden mt-4 shrink-0">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-300/50 px-4 py-1.5 rounded-full inline-block">
              A4 Document Preview
            </h3>
          </div>

          <div
            className="w-full flex justify-center print:h-auto print:block"
            style={{ height: `calc(297mm * ${previewScale})` }}
          >
            <div
              className="origin-top transform-gpu print:scale-100"
              style={{ transform: `scale(${previewScale})` }}
            >
              <QuotationPaper
                qrLink={qrLink}
                ref={componentRef}
                quotationNumber={quotationNumber}
                client={selectedClientData}
                address={address}
                projectArea={projectArea}
                pricePerMeter={pricePerMeter}
                grandTotal={grandTotal}
                bankDetails={bankDetails}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
