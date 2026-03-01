import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { getTemplateByType } from './template'
import { InvoicePaper } from './components/InvoicePaper'
import { InvoiceEditorSettings } from './components/InvoiceEditorSettings'
import { PaymentTermsEditor } from './components/PaymentTermsEditor'
import { DocumentEditorLayout } from '@/components/editors/DocumentEditorLayout'
import { useDocumentScaling } from '@/hooks/useDocumentScaling'
import { useDocumentExport } from '@/hooks/useDocumentExport'
import { useWhatsAppShare } from '@/hooks/useWhatsAppShare'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { recalculateTermItems } from '@/lib/invoicing/termCalculation'
import type { TermItem } from '@/lib/invoicing/termCalculation'
import { DEFAULT_DESIGN_PRICE_PER_METER } from '@/lib/constant'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const componentRef = useRef<HTMLDivElement>(null)

  const { containerRef: previewContainerRef, scale: previewScale } = useDocumentScaling()
  const { generateJpeg } = useDocumentExport(componentRef)
  const { share: shareViaWhatsApp } = useWhatsAppShare()
  const { hasUnsavedChanges, markAsDirty, markAsClean, handleBack } = useUnsavedChanges('/invoices')

  const { data: clientsList } = useQuery({
    queryKey: ['clients'],
    queryFn: () => pb.collection('clients').getFullList({ sort: 'company_name' }),
  })

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => pb.collection('invoices').getOne(id as string, { expand: 'client_id' }),
  })

  const [items, setItems] = useState<TermItem[]>([])
  const [date, setDate] = useState('')
  const [activeTermin, setActiveTermin] = useState('1')
  const [status, setStatus] = useState('unpaid')
  const [bankDetails, setBankDetails] = useState('')
  const [type, setType] = useState('design')
  const [notes, setNotes] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedClientData, setSelectedClientData] = useState<any>(null)
  const [projectArea, setProjectArea] = useState(0)
  const [pricePerMeter, setPricePerMeter] = useState(DEFAULT_DESIGN_PRICE_PER_METER)
  const [manualTotal, setManualTotal] = useState(0)

  const qrLink = `${import.meta.env.VITE_FE_LINK_URL}/verify/invoices/${id}`
  const grandTotal = type === 'design' ? projectArea * pricePerMeter : manualTotal

  const recalcItems = useCallback(
    (currentItems: TermItem[], currentTotal: number) =>
      recalculateTermItems(currentItems, currentTotal, type),
    [type]
  )

  useEffect(() => {
    if (!invoice) return
    const currentType = invoice.type || 'design'
    setType(currentType)
    const loadedItems =
      invoice.items?.length > 0 ? invoice.items : getTemplateByType(currentType)
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
    const price = invoice.price_per_meter || DEFAULT_DESIGN_PRICE_PER_METER
    setProjectArea(area)
    setPricePerMeter(price)
    setManualTotal(invoice.total_amount || 0)
    const total = currentType === 'design' ? area * price : invoice.total_amount || 0
    setItems(total > 0 ? recalcItems(loadedItems, total) : loadedItems)
    markAsClean()
  }, [invoice, recalcItems])

  useEffect(() => {
    if (grandTotal > 0 && items.length > 0) {
      setItems((prev) => recalcItems(prev, grandTotal))
    }
  }, [grandTotal, recalcItems])

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
    setItems(recalcItems(newItems, grandTotal))
  }

  const handleUpdateItem = (index: number, field: string, value: unknown) => {
    markAsDirty()
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleShareWA = () => {
    const message = `Hello ${selectedClientData?.company_name},\n\nHere is the link to your Invoice:\n${qrLink}\n\nThank you.`
    shareViaWhatsApp(selectedClientData?.phone, message)
  }

  const handleDownloadOfficial = () => {
    const fileName = invoice?.document_file
    if (!fileName) {
      toast.error("Document not available. Please click 'Save' first to generate the document.")
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
      formData.append('project_area', String(type === 'design' ? projectArea : 0))
      formData.append('price_per_meter', String(type === 'design' ? pricePerMeter : 0))
      formData.append('active_termin', activeTermin)
      const blob = await generateJpeg()
      if (blob) {
        formData.append(
          'document_file',
          blob,
          `Invoice-${invoice?.invoice_number || 'Update'}.jpg`
        )
      }
      return await pb.collection('invoices').update(id as string, formData)
    },
    onSuccess: () => {
      toast.success('Invoice & Official Document saved')
      markAsClean()
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => toast.error('Failed to save changes'),
  })

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    )

  return (
    <DocumentEditorLayout
      documentNumber={invoice?.invoice_number || ''}
      hasUnsavedChanges={hasUnsavedChanges}
      onBack={handleBack}
      totalLabel="Total"
      total={grandTotal}
      isSaving={saveMutation.isPending}
      onSave={() => saveMutation.mutate()}
      onShareWA={handleShareWA}
      onDownload={handleDownloadOfficial}
      previewContainerRef={previewContainerRef}
      previewScale={previewScale}
      leftPanel={
        <div className="p-4 sm:p-6 space-y-6">
          <InvoiceEditorSettings
            type={type}
            activeTermin={activeTermin}
            items={items}
            selectedClientId={selectedClientId}
            date={date}
            projectArea={projectArea}
            pricePerMeter={pricePerMeter}
            manualTotal={manualTotal}
            clientsList={clientsList as any}
            onActiveTerminChange={(val) => { setActiveTermin(val); markAsDirty() }}
            onClientChange={handleClientChange}
            onDateChange={(val) => { setDate(val); markAsDirty() }}
            onProjectAreaChange={(val) => { setProjectArea(val); markAsDirty() }}
            onPricePerMeterChange={(val) => { setPricePerMeter(val); markAsDirty() }}
            onManualTotalChange={(val) => { setManualTotal(val); markAsDirty() }}
          />

          <div className="space-y-4 border-b pb-6">
            <div>
              <Label className="text-xs mb-2 font-semibold text-slate-500 block">
                Internal Notes
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); markAsDirty() }}
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
                onChange={(e) => { setBankDetails(e.target.value); markAsDirty() }}
                className="text-xs min-h-[60px] resize-none"
              />
            </div>
          </div>

          <PaymentTermsEditor
            items={items}
            activeTermin={activeTermin}
            grandTotal={grandTotal}
            onUpdateItem={handleUpdateItem}
            onPercentChange={handlePercentChange}
          />
        </div>
      }
      preview={
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
      }
    />
  )
}
