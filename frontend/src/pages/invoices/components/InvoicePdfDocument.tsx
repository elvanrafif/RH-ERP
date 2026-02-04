import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer'
import RHStudioKopImg from '@/assets/rh-studio-kop.png'

// --- 1. REGISTER FONT (Opsional, pakai Helvetica bawaan sudah cukup bagus) ---
// Kalau mau custom font, harus register dulu. Kita pakai standar saja biar ringan.

// --- 2. STYLES (Mirip CSS tapi JS Object) ---
const styles = StyleSheet.create({
  page: {
    padding: 40, // Margin kertas
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333',
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  companyInfo: {
    width: '60%',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold', // Helvetica-Bold
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  companyAddress: {
    fontSize: 9,
    color: '#666',
  },
  logoContainer: {
    width: '30%',
    alignItems: 'flex-end',
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  // Title
  titleContainer: {
    backgroundColor: '#000',
    padding: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  titleText: {
    color: '#f1c232', // Warna Kuning Emas
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  // Info Grid (Termin & Date)
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  centerInfo: {
    alignItems: 'center',
  },
  highlightText: {
    color: '#ca8a04', // Yellow-600
    fontWeight: 'bold',
    fontSize: 11,
  },
  // Client Section
  clientSection: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientLeft: {
    width: '50%',
  },
  clientRight: {
    width: '45%',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    marginBottom: 1,
  },
  // Table
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000',
    padding: 8,
  },
  tableHeaderCell: {
    color: '#f1c232',
    fontWeight: 'bold',
    fontSize: 9,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    backgroundColor: '#fff',
  },
  tableCell: {
    fontSize: 9,
    textAlign: 'center',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bankInfo: {
    width: '60%',
  },
  bankTitle: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
    fontSize: 10,
  },
  qrContainer: {
    borderWidth: 1,
    borderColor: '#facc15', // Yellow border
    padding: 4,
  },
  qrImage: {
    width: 60,
    height: 60,
  },
})

// Helper Formatter
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

// --- 3. DOCUMENT COMPONENT ---
interface InvoicePdfProps {
  data: any // Data Invoice dari API
  docType: string
  qrUrl: string // URL QR Code Gambar (Kita generate dulu jadi DataURL)
}

export const InvoicePdfDocument = ({
  data,
  docType,
  qrUrl,
}: InvoicePdfProps) => {
  const client = data.expand?.client_id
  const items = data.items || []
  const activeTermin = data.active_termin || '1'

  // Hitung ulang total (sama logicnya)
  const paidAmount = items
    .filter((i: any) => i.status === 'Success')
    .reduce((sum: number, i: any) => sum + (Number(i.amount) || 0), 0)
  const grandTotal = data.total_amount || 0
  const remainingPayment = grandTotal - paidAmount

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>RH STUDIO ARSITEK</Text>
            <Text style={styles.companyAddress}>Ruko Puri Aster,</Text>
            <Text style={styles.companyAddress}>
              Jl. Boulevard Grand Depok City
            </Text>
            <Text style={styles.companyAddress}>(+62) 858 1005 5005</Text>
          </View>
          <View style={styles.logoContainer}>
            {/* Image di sini pasti ter-render karena native PDF image */}
            <Image src={RHStudioKopImg} style={styles.logo} />
          </View>
        </View>

        {/* TITLE */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{docType} INVOICE</Text>
        </View>

        {/* DATE & TERMIN */}
        <View style={styles.infoGrid}>
          <View style={styles.centerInfo}>
            <Text style={styles.highlightText}>Termin {activeTermin}</Text>
            <Text style={styles.highlightText}>
              Invoice Date: {formatDate(data.date)}
            </Text>
            <Text style={{ fontSize: 9, color: '#999', marginTop: 2 }}>
              {data.invoice_number}
            </Text>
          </View>
        </View>

        {/* CLIENT INFO */}
        <View style={styles.clientSection}>
          <View style={styles.clientLeft}>
            <Text style={styles.label}>Invoice to:</Text>
            <Text style={[styles.value, { fontWeight: 'bold' }]}>
              {client?.company_name || 'Nama Klien'}
            </Text>
            <Text style={styles.value}>{client?.address || '-'}</Text>
            <Text style={styles.value}>{client?.phone || '-'}</Text>
          </View>
          <View style={styles.clientRight}>
            {/* Logic Design Project / Sipil */}
            <Text style={styles.label}>Nilai Kontrak:</Text>
            <Text
              style={[
                styles.value,
                { fontSize: 12, fontWeight: 'bold', color: '#ca8a04' },
              ]}
            >
              {formatRupiah(grandTotal)}
            </Text>
            <Text style={{ fontSize: 9, marginTop: 5 }}>
              Remaining: {formatRupiah(remainingPayment)}
            </Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.tableHeaderCell,
                { width: '30%', textAlign: 'left' },
              ]}
            >
              {' '}
              DESCRIPTION
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '15%' }]}>%</Text>
            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>
              PRICE
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '15%' }]}>
              STATUS
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '15%' }]}>DATE</Text>
          </View>
          {/* Body */}
          {items.map((item: any, i: number) => {
            const activeIndex = parseInt(activeTermin) - 1
            const isFuture = i > activeIndex
            const isActiveRow = String(i + 1) === activeTermin
            const color = isFuture ? '#ccc' : '#000'
            const weight = isActiveRow ? 'bold' : 'normal'

            return (
              <View key={i} style={styles.tableRow}>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      width: '30%',
                      textAlign: 'left',
                      color,
                      fontWeight: weight,
                    },
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: '15%', color, fontWeight: weight },
                  ]}
                >
                  {item.percent}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: '25%', color, fontWeight: weight },
                  ]}
                >
                  {isFuture ? '-' : formatRupiah(Number(item.amount) || 0)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: '15%', color, fontWeight: weight },
                  ]}
                >
                  {item.status}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: '15%', color, fontWeight: weight },
                  ]}
                >
                  {item.paymentDate ? formatDate(item.paymentDate) : '-'}
                </Text>
              </View>
            )
          })}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.bankInfo}>
            <Text style={styles.bankTitle}>INFORMASI PEMBAYARAN</Text>
            <Text style={{ fontSize: 9 }}>
              {data.bank_details || 'Belum ada info rekening.'}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.qrContainer}>
              {/* QR Code juga harus Image di PDF */}
              {qrUrl ? <Image src={qrUrl} style={styles.qrImage} /> : null}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
