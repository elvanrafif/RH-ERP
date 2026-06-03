import type { TermItem } from './termCalculation'

export function derivePaymentDates(items: TermItem[]): string[] {
  return items
    .map((item) => item.paymentDate ?? '')
    .filter(Boolean)
}
