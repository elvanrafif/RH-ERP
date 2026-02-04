import React from 'react'
import QRCode from 'react-qr-code'
import RHStudioKopImg from '@/assets/rh-studio-kop.png'

// --- HELPER FORMATTER ---
const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// --- TYPE DEFINITION ---
interface InvoicePaperProps {
  type: string
  invoiceNumber?: string
  date: string | Date
  activeTermin: string
  client: {
    company_name?: string
    address?: string
    phone?: string
  } | null
  projectArea: number
  pricePerMeter: number
  grandTotal: number
  items: any[]
  bankDetails: string
  qrLink: string

  // NEW PROP: Mode Publik
  isPublicView?: boolean
}

// --- COMPONENT (FORWARD REF AGAR BISA DIPRINT) ---
export const InvoicePaper = React.forwardRef<HTMLDivElement, InvoicePaperProps>(
  (props, ref) => {
    const {
      type,
      invoiceNumber,
      date,
      activeTermin,
      client,
      projectArea,
      pricePerMeter,
      grandTotal,
      items,
      bankDetails,
      qrLink,
      isPublicView = false, // Default False (Mode Admin)
    } = props

    // Hitung sisa pembayaran
    const paidAmount = items
      .filter((i) => i.status === 'Success')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
    const remainingPayment = grandTotal - paidAmount

    // CSS Class untuk mode publik (Anti Tamper)
    // pointer-events-none: Gak bisa diklik
    // user-select-none: Gak bisa di-blok teksnya
    const securityClass = isPublicView
      ? 'pointer-events-none user-select-none'
      : ''

    return (
      <div
        ref={ref}
        className={`bg-white shadow-xl mx-auto p-[15mm] print:shadow-none relative text-black font-sans ${securityClass}`}
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* --- WATERMARK (Hanya muncul jika isPublicView = true) --- */}
        {isPublicView && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden print:hidden">
            <div className="opacity-15 transform -rotate-45 border-[10px] border-emerald-600 px-12 py-4 rounded-xl">
              <span className="text-9xl font-black text-emerald-600 tracking-widest whitespace-nowrap uppercase">
                VERIFIED
              </span>
            </div>
          </div>
        )}

        {/* HEADER KOP */}
        <div className="flex justify-between items-start relative z-10">
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

        {/* JUDUL & NO INVOICE */}
        <div className="grid grid-cols-2 gap-4 mt-4 relative z-10">
          <div className="py-2 bg-black text-center mb-1">
            <h2 className="text-[#f1c232] text-2xl font-bold uppercase">
              INVOICE {type}
            </h2>
          </div>
        </div>

        {/* INFO TANGGAL */}
        <div className="grid grid-cols-2 mb-6 relative z-10">
          <div className="flex flex-col items-center justify-center">
            <p className="text-yellow-600 font-bold text-lg">
              Termin {activeTermin}
            </p>
            <p className="text-yellow-600 font-bold">
              Invoice Date: {formatDate(date)}
            </p>
          </div>
        </div>

        {/* INFO KLIEN & PROJECT */}
        <div className="w-full mb-10 relative z-10">
          <div className="w-1/2 mb-6">
            <h3 className="text-md font-bold">Invoice to:</h3>
            <p className="text-slate-600 text-sm font-bold">
              {client?.company_name || 'Nama Klien'}
            </p>
            <p className="text-slate-600 text-sm whitespace-pre-line">
              {client?.address || '-'}
            </p>
            <p className="text-slate-600 text-sm">{client?.phone || '-'}</p>
          </div>

          <div className="flex items-center justify-between mb-4 py-3">
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
              <div className="w-full"></div>
            )}
          </div>

          <div>
            <h2 className="text-yellow-600 text-lg font-bold">
              NILAI KONTRAK : {formatRupiah(grandTotal)}
            </h2>
          </div>
        </div>

        {/* TABEL ITEM */}
        <table className="w-full text-sm mb-8 border-1 relative z-10">
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

              // Style Logic
              const textColor = isFuture ? 'text-gray-300' : 'text-slate-900'
              const fontWeight = isActiveRow ? 'font-bold' : 'font-normal'
              const displayPrice = isFuture
                ? '-'
                : formatRupiah(Number(item.amount) || 0)
              const displayDate = item.paymentDate
                ? new Date(item.paymentDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit',
                  })
                : ''

              return (
                <tr
                  key={i}
                  className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
                >
                  <td className={`py-4 text-center ${textColor} ${fontWeight}`}>
                    {item.name}
                  </td>
                  <td className={`py-4 text-center ${textColor} ${fontWeight}`}>
                    {item.percent}
                  </td>
                  <td className={`py-4 text-center ${textColor} ${fontWeight}`}>
                    {displayPrice}
                  </td>
                  <td className={`py-4 text-center ${textColor} ${fontWeight}`}>
                    {item.status}
                  </td>
                  <td className={`py-4 text-center ${textColor} ${fontWeight}`}>
                    {displayDate}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* REMAINING */}
        <div className="mb-10 mr-18 relative z-10">
          <div className="flex justify-end gap-10">
            <span className="text-xl font-bold">Remaining Payment</span>
            <span className="text-xl font-bold">
              {formatRupiah(remainingPayment)}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-12 left-0 w-full px-[15mm] z-10">
          <div className="flex justify-between items-end">
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
            <div className="flex flex-col items-center">
              <div className="bg-white p-1 border-2 border-yellow-400 rounded">
                <QRCode
                  value={qrLink}
                  size={72}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  viewBox={`0 0 256 256`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

InvoicePaper.displayName = 'InvoicePaper'
