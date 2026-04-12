import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { QuotationPaper } from './QuotationPaper'
import { DocumentEditorLayout } from '@/components/editors/DocumentEditorLayout'
import { useDocumentScaling } from '@/hooks/useDocumentScaling'
import { useDocumentExport } from '@/hooks/useDocumentExport'
import { useWhatsAppShare } from '@/hooks/useWhatsAppShare'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { DEFAULT_QUOTATION_PRICE_PER_METER } from '@/lib/constant'

export default function QuotationEditor() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const componentRef = useRef<HTMLDivElement>(null)

  const { containerRef: previewContainerRef, scale: previewScale } =
    useDocumentScaling()
  const { generateJpeg } = useDocumentExport(componentRef)
  const { share: shareViaWhatsApp } = useWhatsAppShare()
  const { hasUnsavedChanges, markAsDirty, markAsClean, handleBack } =
    useUnsavedChanges('/quotations')

  const { data: clientsList } = useQuery({
    queryKey: ['clients'],
    queryFn: () =>
      pb.collection('clients').getFullList({ sort: 'company_name' }),
  })

  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () =>
      pb.collection('quotations').getOne(id as string, { expand: 'client_id' }),
  })

  const [quotationNumber, setQuotationNumber] = useState('')
  const [status, setStatus] = useState('draft')
  const [address, setAddress] = useState('')
  const [projectArea, setProjectArea] = useState(0)
  const [pricePerMeter, setPricePerMeter] = useState(
    DEFAULT_QUOTATION_PRICE_PER_METER
  )
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
    setPricePerMeter(
      quotation.price_per_meter || DEFAULT_QUOTATION_PRICE_PER_METER
    )
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
          {
            description: 'Design & Architecture Services',
            quantity: projectArea,
            price: pricePerMeter,
          },
        ])
      )
      const blob = await generateJpeg()
      if (blob) {
        formData.append(
          'document_file',
          blob,
          `Quotation-${quotationNumber || 'Update'}.jpg`
        )
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

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    )

  return (
    <DocumentEditorLayout
      documentNumber={quotationNumber}
      hasUnsavedChanges={hasUnsavedChanges}
      onBack={handleBack}
      totalLabel="Grand Total"
      total={grandTotal}
      isSaving={saveMutation.isPending}
      onSave={() => saveMutation.mutate()}
      onShareWA={handleShareWA}
      onDownload={handleDownloadOfficial}
      previewContainerRef={previewContainerRef}
      previewScale={previewScale}
      leftPanel={
        <div className="p-4 sm:p-6 space-y-6">
          <div className="space-y-4 pb-6">
            <h3 className="font-semibold text-xs uppercase tracking-wide text-slate-500 border-b pb-2">
              Quotation Details
            </h3>

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
      }
      preview={
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
      }
    />
  )
}
