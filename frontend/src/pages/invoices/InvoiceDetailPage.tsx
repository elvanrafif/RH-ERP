import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Printer, Save, Loader2, ArrowLeft, Share2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import RHStudioKopImg from '@/assets/rh-studio-kop.png'
import QRCode from 'react-qr-code'
import { getTemplateByType } from './template'

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
  const appUrl = window.location.origin
  const qrLink = `${appUrl}/invoice/${id}`

  // --- 2. LOGIC GRAND TOTAL (CONDITIONAL) ---
  // Jika Design -> Pakai Rumus (Luas * Harga)
  // Jika Sipil/Interior -> Pakai Manual Input
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
          // Khusus Design, DP bisa fix 2.5jt (opsional, bisa di override persen)
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
    [type] // recalculate depend on type now
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

      // Load Data
      const area = invoice.project_area || 0
      const price = invoice.price_per_meter || 200000
      setProjectArea(area)
      setPricePerMeter(price)
      setManualTotal(invoice.total_amount || 0) // Load manual total

      // Determine initial calculation base
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
    // Trigger kalkulasi ulang jika faktor penentu harga berubah
    if (grandTotal > 0 && items.length > 0) {
      setItems((prevItems) => recalculateAllItems(prevItems, grandTotal))
    }
  }, [grandTotal, recalculateAllItems]) // Depend on grandTotal (which depends on projectArea/manualTotal)

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

  const remainingPayment =
    grandTotal -
    items
      .filter((i) => i.status === 'Success')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

  // SAVE
  const saveMutation = useMutation({
    mutationFn: async () => {
      return await pb.collection('invoices').update(id as string, {
        client_id: selectedClientId,
        date: new Date(date),
        status,
        items: items,
        bank_details: bankDetails,
        notes: notes,
        total_amount: grandTotal, // Save calculated or manual total
        project_area: type === 'design' ? projectArea : 0,
        price_per_meter: type === 'design' ? pricePerMeter : 0,
        active_termin: activeTermin,
      })
    },
    onSuccess: () => {
      toast.success('Invoice tersimpan')
      setHasUnsavedChanges(false)
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => toast.error('Gagal menyimpan'),
  })

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${invoice?.invoice_number || 'Draft'}`,
  })

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
            <Save className="mr-2 h-4 w-4" /> Simpan
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareWA}
            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
          >
            <Share2 className="mr-2 h-4 w-4" /> Share WA
          </Button>

          <Button size="sm" onClick={() => handlePrint()}>
            <Printer className="mr-2 h-4 w-4" /> Print PDF
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
            <div
              ref={componentRef}
              id="invoice-print-area"
              className="bg-white shadow-xl mx-auto p-[15mm] print:shadow-none relative"
              style={{
                width: '210mm',
                minHeight: '297mm',
                color: 'black',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              <div>
                {/* HEADER */}
                <div className="flex justify-between items-start relative">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                      RH STUDIO ARSITEK
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Ruko Puri Aster,
                      <br />
                      Jl. Boulevard Grand Depok City
                      <br />
                      (+62) 858 1005 5005
                    </p>
                  </div>
                  <div className="absolute right-[-20px] top-[-20px]">
                    <img
                      src={RHStudioKopImg}
                      alt="RH Studio Kop"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="py-2 bg-black text-center mb-1">
                    <h2 className="text-[#f1c232] text-2xl font-bold uppercase">
                      INVOICE {type}
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 mb-6">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-yellow-600 font-bold text-lg">
                      Termin {activeTermin}
                    </p>
                    <p className="text-yellow-600 font-bold">
                      Invoice Date:{' '}
                      {date
                        ? new Date(date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="w-full mb-10">
                  <div className="w-1/2 mb-6">
                    <h3 className="text-md font-bold">Invoice to:</h3>
                    <p className="text-slate-600 text-sm font-bold">
                      {selectedClientData?.company_name || 'Nama Klien'}
                    </p>
                    <p className="text-slate-600 text-sm whitespace-pre-line">
                      {selectedClientData?.address || '-'}
                    </p>
                    <p className="text-slate-600 text-sm">
                      {selectedClientData?.phone || '-'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-4 py-3">
                    {/* 4. CONDITIONAL RENDER PREVIEW */}
                    {type === 'design' ? (
                      <>
                        <div className="text-center">
                          <h3 className="text-md font-bold">Design Project:</h3>
                          <p className="text-slate-600 text-sm pl-0">
                            {projectArea} m²
                          </p>
                        </div>
                        <div className="text-center pr-10">
                          <h3 className="text-md font-bold">Price per m²:</h3>
                          <p className="text-slate-600 text-sm">
                            {formatRupiah(pricePerMeter)}
                          </p>
                        </div>
                      </>
                    ) : (
                      // Jika Sipil/Interior, kosongkan bagian kiri agar bersih
                      <div className="text-center w-full">
                        {/* <p className="text-slate-400 text-sm italic">
                          (
                          {type === 'sipil'
                            ? 'Project Konstruksi Sipil'
                            : 'Project Interior Design'}
                          )
                        </p> */}
                      </div>
                    )}
                  </div>
                  <div>
                    {/* 2. GANTI LABEL "TOTAL PAYMENT" -> "NILAI KONTRAK" */}
                    <h2 className="text-yellow-600 text-lg font-bold">
                      NILAI KONTRAK : {formatRupiah(grandTotal)}
                    </h2>
                  </div>
                </div>

                {/* TABEL TERMIN */}
                <table className="w-full text-sm mb-8 border-1">
                  <thead>
                    <tr className="bg-black">
                      <th className="font-bold text-md py-2 text-yellow-500 border-r-0 text-center w-[25%]">
                        DESCRIPTION
                      </th>
                      <th className="font-bold text-md py-2 text-yellow-500 text-center w-[15%]">
                        %
                      </th>
                      <th className="font-bold text-md py-2 text-yellow-500 text-center w-[25%]">
                        PRICE
                      </th>
                      <th className="font-bold text-md py-2 text-yellow-500 text-center w-[15%]">
                        STATUS
                      </th>
                      <th className="font-bold text-md py-2 text-yellow-500 text-center w-[20%]">
                        PAYMENT DATE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => {
                      const activeIndex = parseInt(activeTermin) - 1
                      const isFuture = i > activeIndex
                      const isActiveRow = String(i + 1) === activeTermin

                      const textColor = isFuture
                        ? 'text-gray-300'
                        : 'text-slate-900'
                      const fontWeight = isActiveRow
                        ? 'font-bold'
                        : 'font-normal'

                      const displayPrice = isFuture
                        ? '-'
                        : formatRupiah(Number(item.amount) || 0)

                      return (
                        <tr
                          key={i}
                          className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
                        >
                          <td
                            className={`py-4 text-center ${textColor} ${fontWeight}`}
                          >
                            {item.name}
                          </td>
                          <td
                            className={`py-4 text-center ${textColor} ${fontWeight}`}
                          >
                            {item.percent}
                          </td>
                          <td
                            className={`py-4 text-center ${textColor} ${fontWeight}`}
                          >
                            {displayPrice}
                          </td>
                          <td
                            className={`py-4 text-center ${textColor} ${fontWeight}`}
                          >
                            {item.status}
                          </td>
                          <td
                            className={`py-4 text-center ${textColor} ${fontWeight}`}
                          >
                            {item.paymentDate
                              ? new Date(item.paymentDate).toLocaleDateString(
                                  'en-GB',
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                    year: '2-digit',
                                  }
                                )
                              : ''}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                <div className="mb-10 mr-18">
                  <div className="flex justify-end gap-10">
                    <span className="text-xl font-bold">Remaining Payment</span>
                    <span className="text-xl font-bold">
                      {formatRupiah(remainingPayment)}
                    </span>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="absolute bottom-12 left-0 w-full px-[15mm]">
                <div className="flex justify-between items-end">
                  {/* Left: Bank Info */}
                  <div className="w-2/3 pr-10">
                    <h2 className="font-bold uppercase text-md">
                      INFORMASI PEMBAYARAN
                    </h2>
                    <div className="text-gray-700">
                      <p className="whitespace-pre-line font-medium text-md">
                        {bankDetails || 'Belum ada info rekening.'}
                      </p>
                    </div>
                  </div>

                  {/* Right: QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-1 border-2 border-yellow-400 rounded">
                      <QRCode
                        value={qrLink}
                        size={72}
                        style={{
                          height: 'auto',
                          maxWidth: '100%',
                          width: '100%',
                        }}
                        viewBox={`0 0 256 256`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
