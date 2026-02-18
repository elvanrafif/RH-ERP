import { InvoiceRevenue } from './InvoiceRevenue'
import { QuotationRevenue } from './QuotationRevenue'

export function DocumentRevenueTab() {
  return (
    <div className="grid xl:grid-cols-2 gap-8 pb-10">
      {/* Kolom Kiri - Diurus oleh file InvoiceRevenue.tsx */}
      <InvoiceRevenue />

      {/* Kolom Kanan - Diurus oleh file QuotationRevenue.tsx */}
      <QuotationRevenue />
    </div>
  )
}
