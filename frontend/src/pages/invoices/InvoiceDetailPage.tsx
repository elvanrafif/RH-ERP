import { useState, useRef, useEffect, useCallback, useTransition } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useInvoiceEditor } from '@/hooks/useInvoiceEditor'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { getTemplateByType } from './template'
import { InvoicePaper } from './components/InvoicePaper'
import { LangToggle } from '@/components/shared/LangToggle'
import type { Lang } from '@/lib/invoicing/invoiceLabels'
import { InvoiceEditorSettings } from './components/InvoiceEditorSettings'
import { PaymentTermsEditor } from './components/PaymentTermsEditor'
import { DocumentEditorLayout } from '@/components/editors/DocumentEditorLayout'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentScaling } from '@/hooks/useDocumentScaling'
import { useDocumentExport } from '@/hooks/useDocumentExport'
import { useWhatsAppShare } from '@/hooks/useWhatsAppShare'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { recalculateTermItems, isInvoiceFullyPaid } from '@/lib/invoicing/termCalculation'
import type { TermItem } from '@/lib/invoicing/termCalculation'
import { derivePaymentDates } from '@/lib/invoicing/paymentDates'
import { buildInvoiceFileName } from '@/lib/helpers'
import {
  DEFAULT_DESIGN_PRICE_PER_METER,
  PAYMENT_ITEM_STATUS,
} from '@/lib/constant'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isSuperAdmin } = useAuth()
  const componentRef = useRef<HTMLDivElement>(null)
  const { invoice, isLoading, linkedProject, save, isSaving, deleteInvoice, isDeleting } =
    useInvoiceEditor(id)

  const { containerRef: previewContainerRef, scale: previewScale } =
    useDocumentScaling()
  const { generateJpeg, generatePdf } = useDocumentExport(componentRef)
  const [isDownloading, startDownload] = useTransition()
  const { share: shareViaWhatsApp } = useWhatsAppShare()
  const { hasUnsavedChanges, markAsDirty, markAsClean, handleBack } =
    useUnsavedChanges('/invoices')


  const [items, setItems] = useState<TermItem[]>([])
  const [date, setDate] = useState('')
  const [activeTermin, setActiveTermin] = useState('1')
  const [bankDetails, setBankDetails] = useState('')
  const [type, setType] = useState('design')
  const [notes, setNotes] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedClientData, setSelectedClientData] = useState<any>(null)
  const [projectArea, setProjectArea] = useState(0)
  const [pricePerMeter, setPricePerMeter] = useState(
    DEFAULT_DESIGN_PRICE_PER_METER
  )
  const [manualTotal, setManualTotal] = useState(0)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [lang, setLang] = useState<Lang>('en')

  const qrLink = `${import.meta.env.VITE_FE_LINK_URL}/verify/invoices/${id}`

  const contractValue =
    type === 'design' ? projectArea * pricePerMeter : manualTotal
  const grandTotal =
    discountPercent > 0
      ? contractValue * (1 - discountPercent / 100)
      : contractValue

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
    setDiscountPercent(invoice.discount_percent || 0)
    const total =
      currentType === 'design' ? area * price : invoice.total_amount || 0
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

  const handleAddTerm = () => {
    markAsDirty()
    const newItems = [
      ...items,
      {
        name: `Term ${items.length + 1}`,
        percent: '',
        amount: 0,
        status: '',
        paymentDate: '',
      },
    ]
    setItems(recalcItems(newItems, grandTotal))
  }

  const handleRemoveTerm = (index: number) => {
    markAsDirty()
    const newItems = items.filter((_, i) => i !== index)
    const removedWasActive = String(index + 1) === activeTermin
    if (removedWasActive) {
      const nextActive = Math.min(Number(activeTermin), newItems.length)
      setActiveTermin(String(nextActive))
    } else if (index + 1 < Number(activeTermin)) {
      setActiveTermin(String(Number(activeTermin) - 1))
    }
    setItems(recalcItems(newItems, grandTotal))
  }

  const handleShareWA = () => {
    const message = `Dear ${selectedClientData?.company_name},\n\nYour invoice from RH Studio is ready! Please find the document through the link below:\n${qrLink}\n\nDon't hesitate to reach out if you have any questions — we're happy to help.\n\nBest,\nRH Studio`
    shareViaWhatsApp(selectedClientData?.phone, message)
  }

  const handleDownloadOfficial = () => {
    startDownload(async () => {
      try {
        const fileName = buildInvoiceFileName(
          selectedClientData?.company_name || 'document',
          type,
          activeTermin,
          invoice?.items ?? [],
          selectedClientData?.salutation
        )
        await generatePdf(`${fileName}.pdf`)
        toast.success('PDF downloaded successfully')
      } catch {
        toast.error('Failed to generate PDF')
      }
    })
  }

  const handleSave = async () => {
    const formData = new FormData()
    formData.append('client_id', selectedClientId)
    formData.append('date', new Date(date).toISOString())
    formData.append('items', JSON.stringify(items))
    formData.append('bank_details', bankDetails)
    formData.append('notes', notes)
    formData.append('total_amount', String(contractValue))
    formData.append('discount_percent', String(discountPercent))
    formData.append('project_area', String(type === 'design' ? projectArea : 0))
    formData.append('price_per_meter', String(type === 'design' ? pricePerMeter : 0))
    const derivedStatus = items.every((i) => i.status === PAYMENT_ITEM_STATUS.SUCCESS)
      ? 'paid'
      : 'unpaid'
    formData.append('status', derivedStatus)
    formData.append('is_fully_paid', String(isInvoiceFullyPaid(items)))
    formData.append('active_termin', activeTermin)
    formData.append('payment_dates', JSON.stringify(derivePaymentDates(items)))
    const blob = await generateJpeg()
    if (blob) {
      const jpegFileName = buildInvoiceFileName(
        selectedClientData?.company_name || 'document',
        type,
        activeTermin,
        items,
        selectedClientData?.salutation
      )
      formData.append('document_file', blob, `${jpegFileName}.jpg`)
    }
    save(formData, { onSuccess: () => markAsClean() })
  }

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    )

  return (
    <>
      <DocumentEditorLayout
        documentNumber={invoice?.invoice_number || ''}
        hasUnsavedChanges={hasUnsavedChanges}
        onBack={handleBack}
        totalLabel="Total"
        total={grandTotal}
        isSaving={isSaving}
        isDownloading={isDownloading}
        onSave={handleSave}
        onShareWA={handleShareWA}
        onDownload={handleDownloadOfficial}
        onDelete={isSuperAdmin ? () => setDeleteOpen(true) : undefined}
        isDeleting={isDeleting}
        previewContainerRef={previewContainerRef}
        previewScale={previewScale}
        leftPanel={
          <div className="p-4 sm:p-6 space-y-6">
            <InvoiceEditorSettings
              type={type}
              selectedClientId={selectedClientId}
              date={date}
              projectArea={projectArea}
              pricePerMeter={pricePerMeter}
              manualTotal={manualTotal}
              discountPercent={discountPercent}
              onClientChange={handleClientChange}
              onClientSelect={(client) => {
                setSelectedClientData(client)
                markAsDirty()
              }}
              onDateChange={(val) => {
                setDate(val)
                markAsDirty()
              }}
              onProjectAreaChange={(val) => {
                setProjectArea(val)
                markAsDirty()
              }}
              onPricePerMeterChange={(val) => {
                setPricePerMeter(val)
                markAsDirty()
              }}
              onManualTotalChange={(val) => {
                setManualTotal(val)
                markAsDirty()
              }}
              onDiscountPercentChange={(val) => {
                setDiscountPercent(val)
                markAsDirty()
              }}
            />

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
              {linkedProject && (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">
                    Linked Project
                  </Label>
                  <p className="text-sm font-medium text-slate-700">
                    {linkedProject.expand?.client?.company_name ?? '—'}
                    <span className="ml-2 text-xs text-muted-foreground capitalize">
                      ({linkedProject.type})
                    </span>
                  </p>
                </div>
              )}
            </div>

            <PaymentTermsEditor
              items={items}
              activeTermin={activeTermin}
              onUpdateItem={handleUpdateItem}
              onPercentChange={handlePercentChange}
              onActiveTerminChange={(val) => {
                setActiveTermin(val)
                markAsDirty()
              }}
              onAddTerm={handleAddTerm}
              onRemoveTerm={handleRemoveTerm}
            />
          </div>
        }
        previewAbove={<LangToggle lang={lang} onChange={setLang} />}
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
            contractValue={contractValue}
            discountPercent={discountPercent}
            grandTotal={grandTotal}
            items={items}
            bankDetails={bankDetails}
            qrLink={qrLink}
            lang={lang}
          />
        }
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Invoice?"
        description={`This will permanently delete invoice ${invoice?.invoice_number ?? ''}. This action cannot be undone and all data will be lost.`}
        onConfirm={() => deleteInvoice(undefined, { onSuccess: () => navigate('/invoices') })}
        isLoading={isDeleting}
      />
    </>
  )
}
