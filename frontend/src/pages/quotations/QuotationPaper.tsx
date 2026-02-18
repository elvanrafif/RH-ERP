import React from 'react'
import RHStudioKopImg from '@/assets/rh-studio-kop.png'
import { formatRupiah } from '@/lib/helpers'
import QRCode from 'react-qr-code' // <-- Tambahkan import ini

interface QuotationPaperProps {
  quotationNumber: string
  client: any
  address: string
  projectArea: number
  pricePerMeter: number
  grandTotal: number
  bankDetails: string
  qrLink: string // <-- Tambahkan tipe qrLink
  isPublicView?: boolean
}

export const QuotationPaper = React.forwardRef<
  HTMLDivElement,
  QuotationPaperProps
>((props, ref) => {
  const {
    client,
    address,
    projectArea,
    pricePerMeter,
    grandTotal,
    bankDetails,
    qrLink, // <-- Panggil qrLink dari props
    isPublicView,
  } = props

  return (
    <div
      ref={ref}
      className="bg-white p-[15mm] text-black font-sans relative shadow-xl print:shadow-none"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      {isPublicView && (
        <div className="watermark-layer absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden print:hidden">
          <div className="opacity-15 transform -rotate-45 border-[10px] border-emerald-600 px-12 py-4 rounded-xl">
            <span className="text-9xl font-black text-emerald-600 tracking-widest whitespace-nowrap uppercase">
              VERIFIED
            </span>
          </div>
        </div>
      )}
      {/* --- 1. HEADER (LOGO & KOP) --- */}
      <div className="flex justify-between items-start mb-8 relative">
        <div className="mt-8">
          {/* Ribbon Hitam & Emas menempel ke kiri margin */}
          <div className="bg-black text-[#ce9c2b] inline-block pl-[20mm] pr-8 py-2 mb-6 ml-[-15mm]">
            <h1 className="text-6xl font-black tracking-tighter">Quotation</h1>
          </div>

          <h2 className="text-[22px] font-black tracking-[0.15em] uppercase text-slate-900 mb-2">
            RH ARSITEK STUDIO
          </h2>
          <p className="text-sm leading-snug text-slate-800 font-light">
            Jl. Boulevard Grand Depok CIty Ruko Verbena,
            <br />
            Tirtajaya, Kec.Sukmajaya , Kota Depok, Jawa Barat
            <br />
            16412
          </p>
        </div>

        {/* Logo Kanan Atas */}
        <div className="w-56 absolute -top-4 -right-4">
          <img
            src={RHStudioKopImg}
            alt="RH Studio Logo"
            className="w-full h-auto object-contain"
            crossOrigin="anonymous"
            loading="eager"
          />
        </div>
      </div>

      <div className="px-6">
        {/* --- 2. INTRO TEXT --- */}
        <div className="mt-6 mb-1 text-sm text-slate-900 leading-relaxed font-light pr-10">
          Menindak lanjuti pembicaraan dengan bapak/ibu, kami menyanggupi untuk
          mengerjakan pembuatan design renovasi rumah tinggal{' '}
          <span>{client?.company_name || 'Ibu Laura'}</span> di{' '}
          <span>{address || 'Jln. Tebet Barat X No. 42'}</span>
          .
          <br />
          <br />
          adapun perincian pekerjaan kami adalah sebagai berikut :
        </div>

        {/* --- 3. TABEL UTAMA --- */}
        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="border-b-[3px] border-[#ce9c2b]">
              <th className="text-left py-3 font-black tracking-widest text-[17px] w-[45%] text-slate-900">
                DESKRIPSI
              </th>
              <th className="text-center py-3 font-black tracking-widest text-[17px] text-slate-900">
                QTY
              </th>
              <th className="text-center py-3 font-black tracking-widest text-[17px] text-slate-900">
                HARGA
              </th>
              <th className="text-center py-3 font-black tracking-widest text-[17px] text-slate-900">
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody className="border-b-[3px] border-[#ce9c2b]">
            <tr>
              <td className="py-6 pr-4 align-top">
                <ul className="list-disc pl-5 space-y-3 font-light text-slate-900 leading-tight">
                  <li>Perencanaan Layout/Denah</li>
                  <li>Perencanaan 3D Facade</li>
                  <li>Rendering 3D Facade</li>
                  <li>Detail Drawing/Gambar Kerja</li>
                  <li>Draft Skematik Interior</li>
                  <li>Rencana Anggaran Biaya (RAB)</li>
                  <li>DIscount 50% jika include build</li>
                  <li>Gratis Design interior by request jika include build</li>
                </ul>
              </td>
              <td className="py-6 text-center align-middle font-medium text-slate-900 text-[14px]">
                {projectArea} m2
              </td>
              <td className="py-6 text-center align-middle font-medium text-slate-900 text-[14px]">
                {formatRupiah(pricePerMeter)}
              </td>
              <td className="py-6 text-center align-middle font-medium text-slate-900 text-[14px]">
                {formatRupiah(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs italic mt-1 text-slate-800 font-light tracking-tight">
          catatan : perhitungan luas area yang terbangun akan dihitung
          menggunakan program autocad dan dapat dievaluasi bersama
        </p>

        {/* --- 4. SYARAT & KETENTUAN --- */}
        <div className="mt-12 text-sm text-slate-900 font-light">
          <h4 className="font-bold text-[15px] mb-2">
            Syarat & Ketentuan Pembayaran :
          </h4>
          <div className="leading-5">
            <p>
              <span className="font-bold">Termin 1</span> sebesar Rp. 2.500.000,
              dibayarkan sebelum perencanaan dimulai.
            </p>
            <p>
              <span className="font-bold">Termin 2</span> sebesar 50% dibayarkan
              setelah final denah atau sebelum perencanaan 3D Facade.
            </p>
            <p>
              <span className="font-bold">Termin 3</span> sebesar 30% dibayarkan
              setelah final 3D Facade atau sebelum perencaan Gambar Kerja dan
              Draft Skematik Interior.
            </p>
            <p>
              <span className="font-bold">Termin 4</span> atau pelunasan,
              dibayarkan setelah Gambar Struktur dan RAB selesai.
            </p>
          </div>
        </div>

        {/* --- 5. PAYMENT INFORMATION & QR CODE --- */}
        <div className="mt-12 flex justify-between items-end">
          <div className="w-2/3 pr-10">
            <h4 className="font-black text-[20px] tracking-[0.1em] uppercase mb-3 text-slate-900">
              PAYMENT INFORMATION
            </h4>
            <div className="text-sm font-light text-slate-900 space-y-1 tracking-wide whitespace-pre-line">
              {bankDetails}
            </div>
          </div>

          {/* Kotak QR Code di kanan bawah */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-1 border-2 border-[#ce9c2b] rounded">
              <QRCode
                value={qrLink}
                size={80}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                viewBox={`0 0 256 256`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

QuotationPaper.displayName = 'QuotationPaper'
