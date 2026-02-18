import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'
import { toJpeg } from 'html-to-image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Download, Save, Loader2, ArrowLeft, Share2 } from 'lucide-react'

// PANGGIL KOMPONEN KERTAS QUOTATION (Nanti kita buat filenya)
import { QuotationPaper } from './QuotationPaper'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatRupiah } from '@/lib/helpers'

export default function QuotationEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const componentRef = useRef<HTMLDivElement>(null)

  // --- REF & STATE UNTUK DYNAMIC SCALING ---
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(1)

  // FETCH CLIENTS
  const { data: clientsList } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      return await pb
        .collection('clients')
        .getFullList({ sort: 'company_name' })
    },
  })

  // FETCH QUOTATION
  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      return await pb
        .collection('quotations')
        .getOne(id as string, { expand: 'client_id' })
    },
  })

  // STATE
  const [quotationNumber, setQuotationNumber] = useState('')
  const [status, setStatus] = useState('draft') // <-- FITUR BARU: STATE STATUS
  const [address, setAddress] = useState('')
  const [projectArea, setProjectArea] = useState(0)
  const [pricePerMeter, setPricePerMeter] = useState(180000)
  const [bankDetails, setBankDetails] = useState(
    'Name : Ismail Deyrian Anugrah\nAccount Number : BNI 0717571663'
  )

  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedClientData, setSelectedClientData] = useState<any>(null)

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // LINK GENERATOR (Jika Bapak pakai verifikasi public nantinya, pakai ini. Kalau tidak, biarkan saja)
  const qrLink = `${import.meta.env.VITE_FE_LINK_URL}/verify/quotations/${id}`

  // --- LOGIC GRAND TOTAL ---
  const grandTotal = projectArea * pricePerMeter

  // --- EFFECT: INITIAL LOAD ---
  useEffect(() => {
    if (quotation) {
      // 1. Set Quotation Number (Auto Gen if Empty)
      if (!quotation.quotation_number) {
        const autoNum = `Q-${new Date().toISOString().slice(0, 7).replace('-', '')}-${id?.substring(0, 4).toUpperCase()}`
        setQuotationNumber(autoNum)
      } else {
        setQuotationNumber(quotation.quotation_number)
      }

      // FITUR BARU: Set Status
      if (quotation.status) {
        setStatus(quotation.status)
      } else {
        setStatus('draft')
      }

      // 2. Set Client & Address
      const clientObj = quotation.expand?.client_id
      if (quotation.client_id) {
        setSelectedClientId(quotation.client_id)
        setSelectedClientData(clientObj)
      }

      if (quotation.address) {
        setAddress(quotation.address)
      } else if (clientObj?.address) {
        setAddress(clientObj.address)
      }

      // 3. Set Area & Price
      setProjectArea(quotation.project_area || 0)
      setPricePerMeter(quotation.price_per_meter || 180000)

      // 4. Set Bank Details (Jika ada di DB pakai DB, jika tidak pakai default State)
      if (quotation.bank_details) {
        setBankDetails(quotation.bank_details)
      }

      setHasUnsavedChanges(false)
    }
  }, [quotation, id])

  // --- EFFECT: DYNAMIC PREVIEW SCALING ---
  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const availableWidth = entry.contentRect.width
        const baseWidth = 800
        const newScale = Math.min(availableWidth / baseWidth, 1)
        setPreviewScale(newScale)
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // --- HANDLERS ---
  const markAsDirty = () => setHasUnsavedChanges(true)

  const handleClientChange = (newClientId: string) => {
    markAsDirty()
    setSelectedClientId(newClientId)
    const clientObj = clientsList?.find((c: any) => c.id === newClientId)
    if (clientObj) {
      setSelectedClientData(clientObj)
      if (!address) setAddress(clientObj.address) // Auto-fill alamat jika masih kosong
    }
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
      if (!confirmLeave) return
    }
    navigate('/quotations')
  }

  const handleShareWA = () => {
    if (!selectedClientData?.phone) {
      toast.error('Client phone number is missing in the database.')
      return
    }
    let rawPhone = selectedClientData.phone.toString()
    let cleanPhone = rawPhone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1)
    } else if (cleanPhone.startsWith('8')) {
      cleanPhone = '62' + cleanPhone
    }
    const message = `Hello ${selectedClientData.company_name},\n\nHere is the link to your Quotation:\n${qrLink}\n\nThank you.`
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  // SAVE
  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()

      formData.append('client_id', selectedClientId)
      formData.append('quotation_number', quotationNumber)
      formData.append('status', status) // <-- FITUR BARU: PAYLOAD STATUS
      formData.append('address', address)
      formData.append('project_area', String(projectArea))
      formData.append('price_per_meter', String(pricePerMeter))
      formData.append('total_price', String(grandTotal))
      formData.append('bank_details', bankDetails)

      // Simpan Item Statis sebagai Record
      formData.append(
        'items',
        JSON.stringify([
          {
            description: 'Design & Architecture Services',
            quantity: projectArea,
            price: pricePerMeter,
          },
        ])
      )

      if (componentRef.current) {
        try {
          const dataUrl = await toJpeg(componentRef.current, {
            quality: 0.8,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            cacheBust: false,
          })

          const res = await fetch(dataUrl)
          const blob = await res.blob()

          if (blob) {
            const fileName = `Quotation-${quotationNumber || 'Update'}.jpg`
            formData.append('document_file', blob, fileName)
          }
        } catch (err) {
          console.error('Failed to generate quotation image:', err)
        }
      }

      return await pb.collection('quotations').update(id as string, formData)
    },
    onSuccess: () => {
      toast.success('Quotation & Official Document saved')
      setHasUnsavedChanges(false)
      queryClient.invalidateQueries({ queryKey: ['quotation', id] })
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: () => toast.error('Failed to save changes'),
  })

  // --- DOWNLOAD OFFICIAL FILE ---
  const handleDownloadOfficial = () => {
    const fileName = quotation?.document_file

    if (!fileName) {
      toast.error(
        "Document not available. Please click 'Save' first to generate the document."
      )
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
            <ArrowLeft className="mr-2 h-4 w-4" />{' '}
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
            <span className="text-blue-600 font-bold">
              {formatRupiah(grandTotal)}
            </span>
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
              <Share2 className="mr-2 h-4 w-4" />{' '}
              <span className="hidden sm:inline">Share WA</span>
            </Button>

            <Button
              size="sm"
              onClick={handleDownloadOfficial}
              className="whitespace-nowrap"
            >
              <Download className="mr-2 h-4 w-4" />{' '}
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

              {/* CLIENT */}
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Client</Label>
                <Select
                  value={selectedClientId}
                  onValueChange={handleClientChange}
                >
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

              {/* FITUR BARU: STATUS */}
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

              {/* PROJECT ADDRESS */}
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500 block">
                  Project Address
                </Label>
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

              {/* CALCULATOR AREA */}
              <div className="bg-slate-50 p-3 rounded border">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500">
                      Area (m²)
                    </Label>
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
                    <Label className="text-[10px] text-slate-500">
                      Price / m²
                    </Label>
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

          {/* Dynamic Scaling Wrapper */}
          <div
            className="w-full flex justify-center print:h-auto print:block"
            style={{ height: `calc(297mm * ${previewScale})` }}
          >
            <div
              className="origin-top transform-gpu print:scale-100"
              style={{ transform: `scale(${previewScale})` }}
            >
              {/* KOMPONEN KERTAS QUOTATION */}
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
