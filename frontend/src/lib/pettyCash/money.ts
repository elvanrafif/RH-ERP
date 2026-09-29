export function parseAmountInput(value: string): number {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

export function formatAmountInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}
