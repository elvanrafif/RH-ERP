import { jsPDF } from 'jspdf'
import { formatRupiah } from '@/lib/helpers'
import { getReceiptUrl } from './receipt'
import type { PettyCash, PettyCashEntry } from '@/types/pettyCash'
import type { PettyCashBalance } from './balance'

export async function exportPettyCashReport(period: PettyCash, entries: PettyCashEntry[], balance: PettyCashBalance) {
  const pdf = new jsPDF()
  pdf.setFontSize(18)
  pdf.text('Petty Cash Report', 14, 18)
  pdf.setFontSize(11)
  pdf.text(`Name: ${period.name}`, 14, 29)
  pdf.text(`Status: ${period.status}`, 14, 36)
  pdf.text(`Initial Balance: ${formatRupiah(period.initial_balance)}`, 14, 43)
  pdf.text(`Total Top-up: ${formatRupiah(balance.totalTopup)}`, 14, 50)
  pdf.text(`Total Spent: ${formatRupiah(balance.totalSpent)}`, 14, 57)
  pdf.text(`Remaining Balance: ${formatRupiah(balance.balance)}`, 14, 64)

  const rows = await Promise.all(entries.map(async (entry) => {
    let receiptUrl = '—'
    if (entry.receipt) {
      try {
        receiptUrl = await getReceiptUrl(
          { id: entry.id, collectionId: 'petty_cash_entry', receipt: entry.receipt },
          false
        )
      } catch {
        receiptUrl = 'Unavailable'
      }
    }
    return [
      new Date(entry.transaction_date).toLocaleDateString('id-ID'),
      entry.type === 'expense' ? 'Expense' : 'Top-up',
      entry.person_name || '—',
      formatRupiah(entry.amount),
      [entry.purpose, entry.notes].filter(Boolean).join(' / ') || '—',
      receiptUrl,
    ]
  }))

  let y = 73
  const drawHeader = () => {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text('Date', 14, y)
    pdf.text('Type / Person', 42, y)
    pdf.text('Amount', 83, y)
    pdf.text('Purpose / Notes', 112, y)
    pdf.text('Receipt URL', 168, y)
    y += 5
    pdf.setFont('helvetica', 'normal')
  }
  drawHeader()
  for (const row of rows) {
    const lines = [
      pdf.splitTextToSize(String(row[4]), 52) as string[],
      pdf.splitTextToSize(String(row[5]), 34) as string[],
    ]
    const lineCount = Math.max(1, ...lines.map((part) => part.length))
    const height = lineCount * 4 + 3
    if (y + height > 280) {
      pdf.addPage()
      y = 18
      drawHeader()
    }
    pdf.setFontSize(7)
    pdf.text(String(row[0]), 14, y)
    pdf.text(pdf.splitTextToSize(`${row[1]} / ${row[2]}`, 37), 42, y)
    pdf.text(String(row[3]), 83, y)
    pdf.text(lines[0], 112, y)
    if (String(row[5]).startsWith('http')) {
      pdf.text('Open receipt', 168, y)
      pdf.link(168, y - 3, 28, 4, { url: String(row[5]) })
    } else {
      pdf.text(lines[1], 168, y)
    }
    y += height
    pdf.setDrawColor(226, 232, 240)
    pdf.line(14, y - 2, 196, y - 2)
  }
  pdf.save(`petty-cash-${period.name.replace(/[^a-z0-9-]/gi, '-')}.pdf`)
}
