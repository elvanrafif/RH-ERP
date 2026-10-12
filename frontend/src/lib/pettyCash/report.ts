import { jsPDF } from 'jspdf'
import { formatRupiah } from '@/lib/helpers'
import type { PettyCash, PettyCashEntry } from '@/types/pettyCash'
import type { PettyCashBalance } from './balance'

// --- Layout constants (A4 portrait, satuan: mm) ---
const PAGE_MARGIN = 14
const PAGE_WIDTH = 210
const CONTENT_RIGHT = PAGE_WIDTH - PAGE_MARGIN // 196

// Lebar kolom tabel (total ~182mm, pas dalam area konten)
const COLS = {
  no: { x: 14, w: 8 },
  date: { x: 22, w: 20 },
  type: { x: 42, w: 18 },
  person: { x: 60, w: 34 },
  amount: { x: 94, w: 30 }, // rata kanan ke x + w
  purpose: { x: 126, w: 70 },
}

const ROW_LINE_HEIGHT = 3.4
const ROW_PADDING = 2.4
const HEADER_H = 6

function formatDate(value: string): string {
  // dd MMM yy, konsisten dan ringkas
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

export async function exportPettyCashReport(
  period: PettyCash,
  entries: PettyCashEntry[],
  balance: PettyCashBalance
) {
  const pdf = new jsPDF()
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.transaction_date).getTime() -
      new Date(b.transaction_date).getTime()
  )

  const buildRows = () =>
    sorted.map((entry, index) => ({
      no: String(index + 1),
      date: formatDate(entry.transaction_date),
      type: entry.type === 'expense' ? 'Expense' : 'Top-up',
      person: entry.person_name || '—',
      amount: formatRupiah(entry.amount),
      isExpense: entry.type === 'expense',
      purpose: [entry.purpose, entry.notes].filter(Boolean).join(' / ') || '—',
    }))

  const rows = buildRows()

  // ---- Kop / Summary (halaman pertama) ----
  const drawReportHeader = () => {
    // ---- Banner header (tema Charcoal) ----
    const bannerTop = PAGE_MARGIN
    const bannerH = 24
    const bannerW = CONTENT_RIGHT - PAGE_MARGIN

    pdf.setFillColor(30, 32, 38) // charcoal gelap
    pdf.roundedRect(PAGE_MARGIN, bannerTop, bannerW, bannerH, 2, 2, 'F')

    // Aksen tipis di kiri banner
    pdf.setFillColor(90, 130, 110) // hijau aksen
    pdf.roundedRect(PAGE_MARGIN, bannerTop, 2.5, bannerH, 2, 2, 'F')

    // Judul kecil sebagai label
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(150, 160, 170)
    pdf.text('PETTY CASH REPORT', PAGE_MARGIN + 8, bannerTop + 8)

    // Nama periode sebagai judul utama (menonjol, seimbang dengan banner)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(15)
    pdf.setTextColor(255, 255, 255)
    pdf.text(period.name, PAGE_MARGIN + 8, bannerTop + 17)

    // Status badge (kanan atas banner)
    const statusText = period.status.toUpperCase()
    const isOpen = period.status === 'open'
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'bold')
    const badgeW = pdf.getTextWidth(statusText) + 8
    const badgeX = CONTENT_RIGHT - 8 - badgeW
    pdf.setFillColor(isOpen ? 34 : 90, isOpen ? 120 : 90, isOpen ? 84 : 96)
    pdf.roundedRect(badgeX, bannerTop + 5, badgeW, 6, 3, 3, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.text(statusText, badgeX + 4, bannerTop + 9)

    // Generated date (kanan bawah banner)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    pdf.setTextColor(160, 165, 170)
    pdf.text(
      `Generated ${new Date().toLocaleDateString('en-GB')}`,
      CONTENT_RIGHT - 8,
      bannerTop + 19,
      { align: 'right' }
    )

    // ---- Summary card (compact horizontal, 4 kolom) ----
    const boxTop = bannerTop + bannerH + 5
    const boxH = 18
    const boxW = CONTENT_RIGHT - PAGE_MARGIN
    pdf.setDrawColor(226, 232, 240)
    pdf.setFillColor(250, 251, 252)
    pdf.roundedRect(PAGE_MARGIN, boxTop, boxW, boxH, 2, 2, 'FD')

    const summary: Array<[string, string, [number, number, number]]> = [
      ['INITIAL BALANCE', formatRupiah(period.initial_balance), [30, 32, 38]],
      ['TOTAL TOP-UP', formatRupiah(balance.totalTopup), [22, 130, 90]],
      ['TOTAL SPENT', formatRupiah(balance.totalSpent), [185, 28, 28]],
      ['REMAINING BALANCE', formatRupiah(balance.balance), [30, 32, 38]],
    ]
    const colW = boxW / summary.length

    summary.forEach(([label, value, color], i) => {
      const x = PAGE_MARGIN + colW * i
      // separator vertikal antar kolom
      if (i > 0) {
        pdf.setDrawColor(226, 232, 240)
        pdf.line(x, boxTop + 4, x, boxTop + boxH - 4)
      }
      // label kecil di atas
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(6.5)
      pdf.setTextColor(140, 145, 150)
      pdf.text(label, x + 6, boxTop + 7)
      // value bold di bawah
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.setTextColor(color[0], color[1], color[2])
      pdf.text(value, x + 6, boxTop + 14)
    })

    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
  }

  // ---- Header tabel ----
  const drawTableHeader = (top: number): number => {
    const headerBottom = top + HEADER_H
    pdf.setFillColor(30, 30, 30)
    pdf.rect(PAGE_MARGIN, top, CONTENT_RIGHT - PAGE_MARGIN, HEADER_H, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(255, 255, 255)
    const baseline = top + HEADER_H - 2
    pdf.text('No', COLS.no.x + 1, baseline)
    pdf.text('Date', COLS.date.x, baseline)
    pdf.text('Type', COLS.type.x, baseline)
    pdf.text('Person', COLS.person.x, baseline)
    pdf.text('Amount', COLS.amount.x + COLS.amount.w, baseline, { align: 'right' })
    pdf.text('Purpose / Notes', COLS.purpose.x, baseline)
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    return headerBottom
  }

  const drawFooter = () => {
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(7)
      pdf.setTextColor(150, 150, 150)
      pdf.text(
        `Petty cash report — ${period.name}   |   Page ${i} of ${pageCount}`,
        PAGE_MARGIN,
        288
      )
    }
    pdf.setTextColor(0, 0, 0)
  }

  drawReportHeader()
  let y = drawTableHeader(67)

  // ---- Baris tabel ----
  rows.forEach((row, index) => {
    const purposeLines = pdf.splitTextToSize(
      row.purpose,
      COLS.purpose.w
    ) as string[]
    const identityLines = pdf.splitTextToSize(
      row.person,
      COLS.person.w
    ) as string[]
    const lineCount = Math.max(1, purposeLines.length, identityLines.length)
    const rowH = lineCount * ROW_LINE_HEIGHT + ROW_PADDING

    // Pindah halaman bila perlu
    if (y + rowH > 276) {
      pdf.addPage()
      y = drawTableHeader(PAGE_MARGIN + 4)
    }

    // Zebra striping
    if (index % 2 === 1) {
      pdf.setFillColor(246, 248, 250)
      pdf.rect(PAGE_MARGIN, y, CONTENT_RIGHT - PAGE_MARGIN, rowH, 'F')
    }

    const textTop = y + ROW_PADDING + 2
    pdf.setFontSize(8)

    // No
    pdf.setTextColor(140, 140, 140)
    pdf.text(row.no, COLS.no.x + 1, textTop)
    // Date
    pdf.setTextColor(50, 50, 50)
    pdf.text(row.date, COLS.date.x, textTop)
    // Type (warnai sesuai jenis)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(
      row.isExpense ? 185 : 22,
      row.isExpense ? 28 : 130,
      row.isExpense ? 28 : 90
    )
    pdf.text(row.type, COLS.type.x, textTop)
    pdf.setFont('helvetica', 'normal')
    // Person
    pdf.setTextColor(50, 50, 50)
    pdf.text(identityLines, COLS.person.x, textTop)
    // Amount (rata kanan)
    pdf.text(row.amount, COLS.amount.x + COLS.amount.w, textTop, {
      align: 'right',
    })
    // Purpose / Notes
    pdf.setTextColor(80, 80, 80)
    pdf.text(purposeLines, COLS.purpose.x, textTop)

    y += rowH
    pdf.setDrawColor(232, 236, 240)
    pdf.line(PAGE_MARGIN, y, CONTENT_RIGHT, y)
  })

  // ---- Baris total ----
  if (y + 20 > 276) {
    pdf.addPage()
    y = drawTableHeader(PAGE_MARGIN + 4)
  }
  y += 2
  pdf.setDrawColor(30, 30, 30)
  pdf.setLineWidth(0.4)
  pdf.line(PAGE_MARGIN, y, CONTENT_RIGHT, y)
  pdf.setLineWidth(0.2)

  // Label di kiri (x=126 sejajar kolom Purpose), value rata kanan di ujung tabel (x=196).
  // Gap lebar antara label & value => tidak akan tumpang tindih.
  const labelX = COLS.purpose.x
  const valueRightX = CONTENT_RIGHT
  const totalRows: Array<[string, string, boolean]> = [
    ['Total Top-up', formatRupiah(balance.totalTopup), false],
    ['Total Spent', formatRupiah(balance.totalSpent), false],
    ['Remaining Balance', formatRupiah(balance.balance), true],
  ]

  y += 6
  totalRows.forEach(([label, value, emphasize], i) => {
    if (i === 2) {
      // Baris Remaining dipisah garis tipis
      pdf.setDrawColor(226, 232, 240)
      pdf.line(labelX, y - 4.5, CONTENT_RIGHT, y - 4.5)
    }
    pdf.setFont('helvetica', emphasize ? 'bold' : 'normal')
    pdf.setFontSize(emphasize ? 10 : 9)
    pdf.setTextColor(emphasize ? 20 : 90, emphasize ? 20 : 90, emphasize ? 20 : 90)
    pdf.text(label, labelX, y)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(20, 20, 20)
    pdf.text(value, valueRightX, y, { align: 'right' })
    y += emphasize ? 6 : 5
  })

  pdf.setTextColor(0, 0, 0)
  pdf.setFont('helvetica', 'normal')
  drawFooter()

  pdf.save(`petty-cash-${period.name.replace(/[^a-z0-9-]/gi, '-')}.pdf`)
}
