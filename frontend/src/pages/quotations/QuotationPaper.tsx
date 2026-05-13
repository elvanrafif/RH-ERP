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
  contractValue: number
  discountPercent: number
  grandTotal: number
  bankDetails: string
  qrLink: string
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
    contractValue,
    discountPercent,
    grandTotal,
    bankDetails,
    qrLink,
    isPublicView,
  } = props

  return (
    <div
      ref={ref}
      className="bg-white p-[15mm] text-black font-sans relative shadow-xl print:shadow-none print:w-[210mm] print:min-h-[297mm]"
      style={{ width: '800px', minHeight: '1131px' }}
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
      <div className="flex justify-between items-start mb-4 relative">
        <div className="mt-4">
          {/* Ribbon Hitam & Emas menempel ke kiri margin */}
          <div className="bg-black text-[#ce9c2b] inline-block pl-[20mm] pr-8 py-2 mb-3 ml-[-15mm]">
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
        <div className="mt-5 mb-3 text-sm text-slate-900 leading-relaxed font-light pr-10">
          With reference to our prior discussions, we are pleased to present
          this design quotation for the residential renovation of{' '}
          <span>{client?.company_name || 'Client'}</span>, located at{' '}
          <span>{address || 'Project Address'}</span>. The detailed scope of
          services is as follows:
        </div>

        {/* --- 3. TABEL UTAMA --- */}
        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="border-b-[3px] border-[#ce9c2b]">
              <th className="text-left py-3 font-black tracking-widest text-[17px] w-[45%] text-slate-900">
                DESCRIPTION
              </th>
              <th className="text-center py-3 font-black tracking-widest text-[17px] text-slate-900">
                QTY
              </th>
              <th className="text-center py-3 font-black tracking-widest text-[17px] text-slate-900">
                PRICE
              </th>
              <th className="text-center py-3 font-black tracking-widest text-[17px] text-slate-900">
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody className="border-b-[3px] border-[#ce9c2b]">
            <tr>
              <td className="py-5 pr-4 align-top">
                <ul className="list-disc pl-5 space-y-1.5 font-light text-slate-900 leading-tight">
                  <li>Layout / Floor Plan Design</li>
                  <li>3D Facade Planning</li>
                  <li>3D Facade Rendering</li>
                  <li>Detail Drawing / Working Drawing</li>
                  <li>Interior Schematic Draft</li>
                  <li>Budget Estimation (RAB)</li>
                  <li>
                    50% Discount applicable upon inclusion of construction works
                  </li>
                  <li>
                    Complimentary interior design upon request, subject to
                    inclusion of construction works
                  </li>
                </ul>
              </td>
              <td className="py-5 text-center align-middle font-medium text-slate-900 text-[14px]">
                {projectArea > 0 ? `${projectArea} m2` : ''}
              </td>
              <td className="py-5 text-center align-middle font-medium text-slate-900 text-[14px]">
                {formatRupiah(pricePerMeter)}
              </td>
              <td className="py-5 text-center align-middle font-medium text-slate-900 text-[14px]">
                {projectArea > 0 ? (
                  discountPercent > 0 ? (
                    <div className="flex flex-col items-center gap-0.5 mt-10">
                      <span className="line-through text-slate-400">
                        {formatRupiah(contractValue)}
                      </span>
                      <span className="text-[12px] text-slate-500">
                        Disc {discountPercent}%
                      </span>
                      <span className="font-bold">
                        {formatRupiah(grandTotal)}
                      </span>
                    </div>
                  ) : (
                    formatRupiah(grandTotal)
                  )
                ) : (
                  ''
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs italic mt-1 text-slate-800 font-light tracking-tight">
          Note: The total built area shall be measured and verified using
          AutoCAD and is subject to mutual review and agreement.
        </p>

        {/* --- 4. SYARAT & KETENTUAN --- */}
        <div className="mt-6 text-sm text-slate-900 font-light">
          <h4 className="font-bold text-[15px] mb-2">
            Payment Terms & Conditions:
          </h4>
          <div className="leading-5">
            <p>
              <span className="font-bold">Term 1</span> — IDR 2,500,000, payable
              prior to the commencement of design work.
            </p>
            <p>
              <span className="font-bold">Term 2</span> — 50% of the total fee,
              payable upon finalization of the Floor Plan or prior to the
              commencement of 3D Facade design.
            </p>
            <p>
              <span className="font-bold">Term 3</span> — 30% of the total fee,
              payable upon finalization of the 3D Facade or prior to the
              commencement of Working Drawings and Interior Schematic.
            </p>
            <p>
              <span className="font-bold">Term 4</span> — remaining balance,
              payable upon completion of Structural Drawings and Budget
              Estimation.
            </p>
          </div>
        </div>

        {/* --- 5. PAYMENT INFORMATION & QR CODE --- */}
        <div className="mt-6 flex justify-between items-end">
          <div className="w-2/3 pr-10">
            <h4 className="font-black text-[20px] tracking-[0.1em] uppercase mb-1 text-slate-900">
              PAYMENT INFORMATION
            </h4>
            <div className="text-sm font-light text-slate-900 space-y-1 tracking-wide whitespace-pre-line">
              {bankDetails}
            </div>
          </div>

          {/* Kotak QR Code di kanan bawah */}
          <div className="flex flex-col items-center gap-1">
            <div className="bg-white p-1 border-2 border-[#ce9c2b] rounded">
              <QRCode
                value={qrLink}
                size={80}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                viewBox={`0 0 256 256`}
              />
            </div>
            <p className="text-[9px] text-gray-500 tracking-wide">
              Scan to Verify
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

QuotationPaper.displayName = 'QuotationPaper'
