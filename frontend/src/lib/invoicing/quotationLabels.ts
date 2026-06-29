import type { Lang } from './invoiceLabels'

export const QUOTATION_LABELS: Record<Lang, {
  verified: string
  introText: (clientName: string, address: string) => string
  clientFallback: string
  addressFallback: string
  description: string
  price: string
  services: string[]
  note: string
  paymentTermsTitle: string
  terms: Array<{ label: string; text: string }>
  paymentInformation: string
  scanToVerify: string
}> = {
  en: {
    verified: 'VERIFIED',
    introText: (clientName, address) =>
      `With reference to our previous discussions, we are pleased to present this design quotation for the residential renovation project of ${clientName}, located in ${address}. The detailed scope of services is as follows:`,
    clientFallback: 'Client',
    addressFallback: 'Project Address',
    description: 'DESCRIPTION',
    price: 'PRICE',
    services: [
      'Layout / Floor Plan Design',
      '3D Facade Design',
      '3D Facade Rendering',
      'Detail Drawing / Working Drawing',
      'Draft Interior Schematic Design',
      'Budget Estimation (RAB)',
      '50% Discount applicable upon inclusion of construction works',
      'Complimentary interior design upon request, subject to inclusion of construction works',
    ],
    note: 'Note: The total built area shall be measured and verified using AutoCAD and is subject to mutual review and agreement.',
    paymentTermsTitle: 'Payment Terms & Conditions:',
    terms: [
      { label: 'Term 1', text: '— IDR 2,500,000, payable prior to the commencement of design work.' },
      { label: 'Term 2', text: '— 50% of the total fee, payable upon finalization of the Floor Plan or prior to the commencement of 3D Facade design.' },
      { label: 'Term 3', text: '— 30% of the total fee, payable upon finalization of the 3D Facade or prior to the commencement of Working Drawings and Interior Schematic.' },
      { label: 'Term 4', text: '— remaining balance, payable upon completion of Structural Drawings and Budget Estimation.' },
    ],
    paymentInformation: 'PAYMENT INFORMATION',
    scanToVerify: 'Scan to Verify',
  },
  id: {
    verified: 'TERVERIFIKASI',
    introText: (clientName, address) =>
      `Menindak lanjuti pembicaraan dengan bapak/ibu, kami menyanggupi untuk mengerjakan pembuatan design renovasi rumah tinggal ${clientName} di ${address}. adapun perincian pekerjaan kami adalah sebagai berikut :`,
    clientFallback: 'Ibu Laura',
    addressFallback: 'Jln. Tebet Barat X No. 42',
    description: 'DESKRIPSI',
    price: 'HARGA',
    services: [
      'Perencanaan Layout/Denah',
      'Perencanaan 3D Facade',
      'Rendering 3D Facade',
      'Detail Drawing/Gambar Kerja',
      'Draft Skematik Interior',
      'Rencana Anggaran Biaya (RAB)',
      'Discount 50% jika include build',
      'Gratis Design interior by request jika include build',
    ],
    note: 'catatan : perhitungan luas area yang terbangun akan dihitung menggunakan program autocad dan dapat dievaluasi bersama',
    paymentTermsTitle: 'Syarat & Ketentuan Pembayaran :',
    terms: [
      { label: 'Termin 1', text: 'sebesar Rp. 2.500.000, dibayarkan sebelum perencanaan dimulai.' },
      { label: 'Termin 2', text: 'sebesar 50% dibayarkan setelah final denah atau sebelum perencanaan 3D Facade.' },
      { label: 'Termin 3', text: 'sebesar 30% dibayarkan setelah final 3D Facade atau sebelum perencaan Gambar Kerja dan Draft Skematik Interior.' },
      { label: 'Termin 4', text: 'atau pelunasan, dibayarkan setelah Gambar Struktur dan RAB selesai.' },
    ],
    paymentInformation: 'PAYMENT INFORMATION',
    scanToVerify: 'Pindai untuk Verifikasi',
  },
}
