import { pb } from '@/lib/pocketbase'
import { derivePaymentDates } from './paymentDates'

export async function backfillPaymentDates() {
  const records = await pb.collection('invoices').getFullList({
    fields: 'id,items',
  })

  let updated = 0
  for (const record of records) {
    const items = Array.isArray(record.items) ? record.items : []
    const paymentDates = derivePaymentDates(items)
    await pb.collection('invoices').update(record.id, { payment_dates: paymentDates })
    updated++
  }

  console.log(`Backfill complete: ${updated} records updated`)
}
