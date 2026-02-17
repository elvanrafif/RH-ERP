import { useState, useRef, useEffect, useCallback } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getTemplateByType } from './template'
import { InvoicePaper } from './components/InvoicePaper'
import { formatRupiah } from '@/lib/helpers'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const componentRef = useRef<HTMLDivElement>(null)

  // --- NEW: REF & STATE UNTUK DYNAMIC SCALING ---
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

  // FETCH INVOICE
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      return await pb
        .collection('invoices')
        .getOne(id as string, { expand: 'client_id' })
    },
  })

  // STATE
  const [items, setItems] = useState<any[]>([])
  const [date, setDate] = useState('')
  const [activeTermin, setActiveTermin] = useState('1')
  const [status, setStatus] = useState('unpaid')
  const [bankDetails, setBankDetails] = useState('')
  const [type, setType] = useState('design') // Default design
  const [notes, setNotes] = useState('')

  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedClientData, setSelectedClientData] = useState<any>(null)

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Header Data
  const [projectArea, setProjectArea] = useState(0)
  const [pricePerMeter, setPricePerMeter] = useState(200000)

  // New State: Manual Total (for Civil & Interior)
  const [manualTotal, setManualTotal] = useState(0)

  // LINK GENERATOR
  const qrLink = `${import.meta.env.VITE_FE_LINK_URL}/verify/invoices/${id}`

  // --- LOGIC GRAND TOTAL ---
  const grandTotal =
    type === 'design' ? projectArea * pricePerMeter : manualTotal

  // --- LOGIC RE-CALCULATE ---
  const recalculateAllItems = useCallback(
    (currentItems: any[], currentTotal: number) => {
      let runningTotal = 0
      return currentItems.map((item) => {
        let newAmount = 0
        const val = item.percent || ''
        const cleanVal = val.toString().replace('%', '').trim().toLowerCase()

        if (cleanVal === 'dp' && type === 'design') {
          newAmount = 2500000
        } else if (cleanVal === 'pelunasan' || cleanVal === 'settlement') {
          newAmount = Math.max(0, currentTotal - runningTotal)
        } else {
          const numericVal = parseFloat(cleanVal)
          if (!isNaN(numericVal) && currentTotal > 0) {
            newAmount = (currentTotal * numericVal) / 100
          } else {
            newAmount = Number(item.amount) || 0
          }
        }
        runningTotal += newAmount
        return { ...item, amount: newAmount }
      })
    },
    [type]
  )

  // --- EFFECT: INITIAL LOAD ---
  useEffect(() => {
    if (invoice) {
      const currentType = invoice.type || 'design'
      setType(currentType)

      let loadedItems = []
      if (invoice.items && invoice.items.length > 0) {
        loadedItems = invoice.items
      } else {
        loadedItems = getTemplateByType(currentType)
      }

      setDate(invoice.date ? invoice.date.substring(0, 10) : '')
      setActiveTermin(invoice.active_termin || '1')
      setStatus(invoice.status || 'unpaid')
      setBankDetails(invoice.bank_details || '')
      setNotes(invoice.notes || '')

      if (invoice.client_id) {
        setSelectedClientId(invoice.client_id)
        setSelectedClientData(invoice.expand?.client_id)
      }

      const area = invoice.project_area || 0
      const price = invoice.price_per_meter || 200000
      setProjectArea(area)
      setPricePerMeter(price)
      setManualTotal(invoice.total_amount || 0)

      const total =
        currentType === 'design' ? area * price : invoice.total_amount || 0

      if (total > 0) {
        setItems((prev) => recalculateAllItems(loadedItems, total))
      } else {
        setItems(loadedItems)
      }

      setHasUnsavedChanges(false)
    }
  }, [invoice, recalculateAllItems])

  // --- EFFECT: AUTO-CALC ON CHANGE ---
  useEffect(() => {
    if (grandTotal > 0 && items.length > 0) {
      setItems((prevItems) => recalculateAllItems(prevItems, grandTotal))
    }
  }, [grandTotal, recalculateAllItems])

  // --- EFFECT: DYNAMIC PREVIEW SCALING ---
  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Ambil lebar container yang tersedia (content box)
        const availableWidth = entry.contentRect.width

        // Lebar standar A4 di layar sekitar 794px (210mm).
        // Kita jadikan base width 800px agar ada sedikit ruang bernafas.
        const baseWidth = 800

        // Hitung skala (maksimal 1 agar tidak pecah/kebesaran di layar lebar)
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
    if (clientObj) setSelectedClientData(clientObj)
  }

  const handlePercentChange = (index: number, val: string) => {
    markAsDirty()
    const newItems = [...items]
    newItems[index].percent = val
    const recalculated = recalculateAllItems(newItems, grandTotal)
    setItems(recalculated)
  }

  const updateItem = (index: number, field: string, value: any) => {
    markAsDirty()
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
      if (!confirmLeave) return
    }
    navigate('/invoices')
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
    const message = `Hello ${selectedClientData.company_name},\n\nHere is the link to your Invoice:\n${qrLink}\n\nThank you.`
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  // SAVE
  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()

      formData.append('client_id', selectedClientId)
      formData.append('date', new Date(date).toISOString())
      formData.append('status', status)
      formData.append('items', JSON.stringify(items))
      formData.append('bank_details', bankDetails)
      formData.append('notes', notes)
      formData.append('total_amount', String(grandTotal))
      formData.append(
        'project_area',
        String(type === 'design' ? projectArea : 0)
      )
      formData.append(
        'price_per_meter',
        String(type === 'design' ? pricePerMeter : 0)
      )
      formData.append('active_termin', activeTermin)

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
            const fileName = `Invoice-${invoice?.invoice_number || 'Update'}.jpg`
            formData.append('document_file', blob, fileName)
          }
        } catch (err) {
          console.error('Failed to generate invoice image:', err)
        }
      }

      return await pb.collection('invoices').update(id as string, formData)
    },
    onSuccess: () => {
      toast.success('Invoice & Official Document saved')
      setHasUnsavedChanges(false)
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => toast.error('Failed to save changes'),
  })

  // --- DOWNLOAD OFFICIAL FILE ---
  const handleDownloadOfficial = () => {
    const fileName = invoice?.document_file

    if (!fileName) {
      toast.error(
        "Document not available. Please click 'Save' first to generate the document."
      )
      return
    }

    const fileUrl = pb.files.getUrl(invoice, fileName, { download: true })

    const link = document.createElement('a')
    link.href = fileUrl
    link.download = `Invoice-${invoice.invoice_number}.jpg`
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
              {invoice?.invoice_number}
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
            Total:{' '}
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
            <div className="space-y-4 border-b pb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs uppercase tracking-wide text-slate-500">
                  Settings ({type.toUpperCase()})
                </h3>
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] sm:text-xs uppercase font-bold text-yellow-700 whitespace-nowrap">
                    Active Term:
                  </Label>
                  <Select
                    value={activeTermin}
                    onValueChange={(val) => {
                      setActiveTermin(val)
                      markAsDirty()
                    }}
                  >
                    <SelectTrigger className="h-7 w-24 text-xs bg-yellow-50 border-yellow-200 text-yellow-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((_, i) => (
                        <SelectItem key={i} value={String(i + 1)}>
                          Term {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* DATE & CLIENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-500">
                    Invoice Date
                  </Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                      markAsDirty()
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* CALCULATOR AREA */}
              <div className="bg-slate-50 p-3 rounded border">
                {type === 'design' ? (
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
                ) : (
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 font-bold uppercase text-blue-600">
                      Total Contract Value (IDR)
                    </Label>
                    <Input
                      type="number"
                      value={manualTotal}
                      onChange={(e) => {
                        setManualTotal(Number(e.target.value))
                        markAsDirty()
                      }}
                      className="h-8 text-sm font-mono border-blue-200 focus-visible:ring-blue-500"
                      placeholder="Enter total value..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* NOTES & BANK */}
            <div className="space-y-4 border-b pb-6">
              <div>
                <Label className="text-xs mb-2 font-semibold text-slate-500 block">
                  Internal Notes
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    markAsDirty()
                  }}
                  className="text-xs min-h-[60px]"
                  placeholder="e.g. Revised twice, additional fees applied..."
                />
              </div>

              <div>
                <Label className="text-xs mb-2 font-semibold text-slate-500 block">
                  Bank Details (PDF Footer)
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

            {/* ITEMS EDITOR */}
            <div>
              <h3 className="font-semibold mb-3 text-xs uppercase tracking-wide text-slate-500">
                Payment Terms Details
              </h3>
              <div className="space-y-3">
                {items.map((item, index) => {
                  const isActive = activeTermin === String(index + 1)
                  const isPastTerm = index + 1 < Number(activeTermin)

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded border text-xs shadow-sm transition-all ${isActive ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-dashed border-slate-200">
                        <div className="flex items-center gap-2">
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              updateItem(index, 'name', e.target.value)
                            }
                            className={`h-6 w-32 px-1 text-xs font-bold border-none bg-transparent shadow-none focus-visible:ring-0 ${isActive ? 'text-blue-700' : 'text-slate-700'} ${isPastTerm ? 'opacity-70' : ''}`}
                          />
                          {isActive && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                              Active
                            </span>
                          )}
                          {isPastTerm && (
                            <span className="text-[9px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                              Past
                            </span>
                          )}
                        </div>

                        <div className="w-full sm:w-28">
                          <Select
                            value={item.status || 'empty'}
                            onValueChange={(val) =>
                              updateItem(
                                index,
                                'status',
                                val === 'empty' ? '' : val
                              )
                            }
                          >
                            <SelectTrigger
                              className={`h-6 text-[10px] w-full ${item.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white'}`}
                            >
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="empty">
                                <span className="text-slate-400">Unpaid</span>
                              </SelectItem>
                              <SelectItem value="Success">
                                <span className="font-bold text-green-600">
                                  Paid
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center">
                        <div className="sm:col-span-2 space-y-0.5 flex justify-between sm:block">
                          <Label className="text-[9px] text-slate-400 uppercase sm:mb-1">
                            Desc / %
                          </Label>
                          <Input
                            value={item.percent}
                            onChange={(e) =>
                              handlePercentChange(index, e.target.value)
                            }
                            placeholder="DP / 50%"
                            className="h-7 text-xs bg-white w-24 sm:w-full"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-0.5 flex justify-between sm:block">
                          <Label className="text-[9px] text-slate-400 uppercase sm:mb-1">
                            Amount (Auto)
                          </Label>
                          <Input
                            value={formatRupiah(Number(item.amount) || 0)}
                            readOnly
                            disabled
                            className="h-7 text-xs font-mono bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed w-32 sm:w-full"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-0.5 flex justify-between sm:block">
                          <Label className="text-[9px] text-slate-400 uppercase sm:mb-1">
                            Pay Date
                          </Label>
                          <Input
                            type="date"
                            value={item.paymentDate || ''}
                            onChange={(e) =>
                              updateItem(index, 'paymentDate', e.target.value)
                            }
                            className="h-7 text-[10px] px-1 bg-white w-28 sm:w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
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
            // CSS trik agar box bungkusannya ikut menyusut tingginya sesuai dengan elemen A4 yang di-scale
            style={{ height: `calc(297mm * ${previewScale})` }}
          >
            <div
              className="origin-top transform-gpu print:scale-100"
              style={{ transform: `scale(${previewScale})` }}
            >
              <InvoicePaper
                ref={componentRef}
                type={type}
                invoiceNumber={invoice?.invoice_number}
                date={date}
                activeTermin={activeTermin}
                client={selectedClientData}
                projectArea={projectArea}
                pricePerMeter={pricePerMeter}
                grandTotal={grandTotal}
                items={items}
                bankDetails={bankDetails}
                qrLink={qrLink}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
