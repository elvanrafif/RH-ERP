import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// HAPUS: import { useReactToPrint } from 'react-to-print' (Tidak dipakai lagi)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'
import { toJpeg } from 'html-to-image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// GANTI ICON PRINTER JADI DOWNLOAD (Opsional, tapi lebih cocok)
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

// Helper Format Rupiah
const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const componentRef = useRef<HTMLDivElement>(null)

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

  // New State: Manual Total (untuk Sipil & Interior)
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
        } else if (cleanVal === 'pelunasan') {
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
        'Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?'
      )
      if (!confirmLeave) return
    }
    navigate('/invoices')
  }

  const handleShareWA = () => {
    if (!selectedClientData?.phone) {
      toast.error('Nomor HP Klien belum diisi di database klien ini.')
      return
    }
    let rawPhone = selectedClientData.phone.toString()
    let cleanPhone = rawPhone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1)
    } else if (cleanPhone.startsWith('8')) {
      cleanPhone = '62' + cleanPhone
    }
    const message = `Halo ${selectedClientData.company_name},\n\nBerikut link Invoice Anda:\n${qrLink}\n\nTerima kasih.`
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
          // Gunakan JPEG dengan kualitas 0.8 (80%)
          // Ini akan membuat file di Database jauh lebih kecil
          const dataUrl = await toJpeg(componentRef.current, {
            quality: 0.8, // 80% Quality (Masih sangat tajam tapi ringan)
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            cacheBust: false,
          })

          // Convert DataURL ke Blob untuk upload
          const res = await fetch(dataUrl)
          const blob = await res.blob()

          if (blob) {
            // Ubah ekstensi jadi .jpg
            const fileName = `Invoice-${invoice?.invoice_number || 'Update'}.jpg`
            formData.append('document_file', blob, fileName)
          }
        } catch (err) {
          console.error('Gagal membuat gambar invoice:', err)
        }
      }

      return await pb.collection('invoices').update(id as string, formData)
    },
    onSuccess: () => {
      toast.success('Invoice & Dokumen Resmi tersimpan')
      setHasUnsavedChanges(false)
      // Invalidasi query agar data invoice terbaru (termasuk filename baru) ter-fetch ulang
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => toast.error('Gagal menyimpan'),
  })

  // --- NEW LOGIC: DOWNLOAD OFFICIAL FILE (REPLACES PRINT) ---
  const handleDownloadOfficial = () => {
    // 1. Cek apakah ada file di database
    const fileName = invoice?.document_file

    if (!fileName) {
      toast.error(
        "Dokumen belum tersedia. Silakan klik tombol 'Simpan' terlebih dahulu untuk men-generate dokumen."
      )
      return
    }

    // 2. Jika ada, download langsung dari PocketBase
    const fileUrl = pb.files.getUrl(invoice, fileName, { download: true })

    const link = document.createElement('a')
    link.href = fileUrl
    link.download = `Invoice-${invoice.invoice_number}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Mendownload Dokumen Resmi...')
  }

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="flex h-screen flex-col bg-slate-100 overflow-hidden">
      {/* HEADER BAR */}
      <div className="h-14 border-b bg-white flex items-center justify-between px-4 shadow-sm z-10 print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className={
              hasUnsavedChanges
                ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                : ''
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <span className="font-semibold text-sm font-mono">
            {invoice?.invoice_number}
          </span>
          {hasUnsavedChanges && (
            <span className="text-xs text-red-500 italic bg-red-50 px-2 py-1 rounded">
              (Unsaved)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="mr-4 text-sm font-medium text-slate-600">
            Total:{' '}
            <span className="text-blue-600 font-bold">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className={hasUnsavedChanges ? 'border-blue-500 text-blue-600' : ''}
          >
            {saveMutation.isPending ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareWA}
            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
          >
            <Share2 className="mr-2 h-4 w-4" /> Share WA
          </Button>

          {/* TOMBOL PRINT DIGANTI JADI DOWNLOAD OFFICIAL */}
          <Button size="sm" onClick={handleDownloadOfficial}>
            <Download className="mr-2 h-4 w-4" /> Download Dokumen
          </Button>
        </div>
      </div>

      {/* SPLIT VIEW */}
      <div className="flex flex-1 overflow-hidden">
        {/* KIRI: EDITOR FORM */}
        <div className="w-[450px] bg-white border-r flex flex-col h-full overflow-hidden shadow-lg z-0 print:hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* SETTINGS UTAMA */}
            <div className="space-y-4 border-b pb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs uppercase tracking-wide text-slate-500">
                  Pengaturan ({type.toUpperCase()})
                </h3>
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] uppercase font-bold text-yellow-700">
                    Termin Aktif:
                  </Label>
                  <Select
                    value={activeTermin}
                    onValueChange={(val) => {
                      setActiveTermin(val)
                      markAsDirty()
                    }}
                  >
                    <SelectTrigger className="h-6 w-24 text-xs bg-yellow-50 border-yellow-200 text-yellow-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((_, i) => (
                        <SelectItem key={i} value={String(i + 1)}>
                          Termin {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* BARIS TANGGAL & CLIENT */}
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-1">
                    <Label className="text-[10px] text-slate-500">Klien</Label>
                    <Select
                      value={selectedClientId}
                      onValueChange={handleClientChange}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue placeholder="Pilih Klien" />
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
                  <div className="space-y-1 col-span-1">
                    <Label className="text-[10px] text-slate-500">
                      Tgl Invoice
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
              </div>

              {/* 3. CALCULATOR AREA (CONDITIONAL) */}
              <div className="bg-slate-50 p-3 rounded border">
                {type === 'design' ? (
                  // TAMPILAN KHUSUS DESIGN (Luas x Harga)
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500">
                        Luas (m2)
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
                        Harga / m2
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
                  // TAMPILAN SIPIL & INTERIOR (Manual Total Input)
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 font-bold uppercase text-blue-600">
                      Nilai Kontrak Total (IDR)
                    </Label>
                    <Input
                      type="number"
                      value={manualTotal}
                      onChange={(e) => {
                        setManualTotal(Number(e.target.value))
                        markAsDirty()
                      }}
                      className="h-8 text-sm font-mono border-blue-200 focus-visible:ring-blue-500"
                      placeholder="Masukkan total nilai kontrak..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* NOTES & BANK */}
            <div className="space-y-4 border-b pb-6">
              <div>
                <Label className="text-xs mb-2 block font-semibold text-slate-500 flex justify-between">
                  Catatan Internal
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    markAsDirty()
                  }}
                  className="text-xs min-h-[60px]"
                  placeholder="Contoh: Revisi denah 2x, fee tambahan masuk termin 3..."
                />
              </div>

              <div>
                <Label className="text-xs mb-2 block font-semibold text-slate-500">
                  Info Rekening (Footer PDF)
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
                Detail Termin
              </h3>
              <div className="space-y-3">
                {items.map((item, index) => {
                  const isActive = activeTermin === String(index + 1)

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded border text-xs shadow-sm transition-all ${isActive ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-dashed border-slate-200">
                        <div className="flex items-center gap-2">
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              updateItem(index, 'name', e.target.value)
                            }
                            className={`h-6 w-32 px-1 text-xs font-bold border-none bg-transparent shadow-none focus-visible:ring-0 ${isActive ? 'text-blue-700' : 'text-slate-700'}`}
                          />
                          {isActive && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                              Aktif
                            </span>
                          )}
                        </div>

                        <div className="w-24">
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
                              className={`h-6 text-[10px] ${item.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white'}`}
                            >
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="empty">
                                <span className="text-slate-400">
                                  Belum Bayar
                                </span>
                              </SelectItem>
                              <SelectItem value="Success">
                                <span className="font-bold text-green-600">
                                  Lunas
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-2 items-center">
                        <div className="col-span-2 space-y-0.5">
                          <Label className="text-[9px] text-slate-400 uppercase">
                            Keterangan / %
                          </Label>
                          <Input
                            value={item.percent}
                            onChange={(e) =>
                              handlePercentChange(index, e.target.value)
                            }
                            placeholder="DP / 50%"
                            className="h-7 text-xs bg-white"
                          />
                        </div>

                        <div className="col-span-3 space-y-0.5">
                          <Label className="text-[9px] text-slate-400 uppercase">
                            Nominal (Auto)
                          </Label>
                          <Input
                            value={formatRupiah(Number(item.amount) || 0)}
                            readOnly
                            disabled
                            className="h-7 text-xs font-mono bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                          />
                        </div>

                        <div className="col-span-2 space-y-0.5">
                          <Label className="text-[9px] text-slate-400 uppercase">
                            Tgl Bayar
                          </Label>
                          <div className="relative">
                            <Input
                              type="date"
                              value={item.paymentDate || ''}
                              onChange={(e) =>
                                updateItem(index, 'paymentDate', e.target.value)
                              }
                              className="h-7 text-[10px] px-1 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* KANAN: PREVIEW A4 */}
        <div className="flex-1 overflow-y-auto bg-slate-200/50 p-8 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div className="scale-[0.85] origin-top print:scale-100">
            {/* PANGGIL COMPONENT MODULAR */}
            <InvoicePaper
              ref={componentRef} // Ref untuk generate image
              // Pass Data State (Realtime Editing)
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
  )
}
