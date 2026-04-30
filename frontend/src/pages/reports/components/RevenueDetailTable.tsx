import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRupiah, formatDate } from '@/lib/helpers'
import type { InvoiceReportRow, QuotationReportRow } from '@/lib/invoicing/reportTypes'

const TYPE_LABELS: Record<string, string> = {
  design: 'Arsitektur',
  sipil: 'Sipil',
  interior: 'Interior',
}

interface RevenueDetailTableProps {
  invoiceRows: InvoiceReportRow[]
  quotationRows: QuotationReportRow[]
}

export function RevenueDetailTable({ invoiceRows, quotationRows }: RevenueDetailTableProps) {
  const invoiceTotal = invoiceRows.reduce((s, r) => s + r.terminValue, 0)
  const quotationTotal = quotationRows.reduce((s, r) => s + r.totalValue, 0)

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
      <Tabs defaultValue="invoice">
        <div className="border-b px-4 pt-3 bg-slate-50/50">
          <TabsList className="bg-transparent h-auto p-0 gap-4">
            <TabsTrigger
              value="invoice"
              className="rounded-none pb-3 px-0 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent"
            >
              Invoice ({invoiceRows.length})
            </TabsTrigger>
            <TabsTrigger
              value="quotation"
              className="rounded-none pb-3 px-0 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent"
            >
              Quotation ({quotationRows.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="invoice" className="m-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">No. Invoice</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Tipe</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">Nilai Termin</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoiceRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground">
                      Tidak ada data invoice pada periode ini
                    </td>
                  </tr>
                ) : (
                  invoiceRows.map(row => (
                    <tr key={row.id} className="border-t border-border/60 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.invoiceNumber}</td>
                      <td className="px-4 py-3">{row.clientName}</td>
                      <td className="px-4 py-3 text-slate-600">{TYPE_LABELS[row.projectType] ?? row.projectType}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatRupiah(row.terminValue)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${row.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {row.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {invoiceRows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-4 py-3 font-semibold text-slate-700">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{formatRupiah(invoiceTotal)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </TabsContent>

        <TabsContent value="quotation" className="m-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">No. Quotation</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Client</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">Nilai Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Tanggal Paid</th>
                </tr>
              </thead>
              <tbody>
                {quotationRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-muted-foreground">
                      Tidak ada quotation paid pada periode ini
                    </td>
                  </tr>
                ) : (
                  quotationRows.map(row => (
                    <tr key={row.id} className="border-t border-border/60 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.quotationNumber}</td>
                      <td className="px-4 py-3">{row.clientName}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatRupiah(row.totalValue)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(row.paidAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {quotationRows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{formatRupiah(quotationTotal)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
