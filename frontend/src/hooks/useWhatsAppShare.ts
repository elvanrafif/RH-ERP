import { toast } from 'sonner'

/**
 * Formats a phone number to WhatsApp-compatible format (62xxx).
 * Handles numbers starting with 0, 8, or already in international format.
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.startsWith('0')) return '62' + clean.slice(1)
  if (clean.startsWith('8')) return '62' + clean
  return clean
}

/**
 * Opens WhatsApp Web with a pre-filled message to the client's phone number.
 * Shows a toast error if the phone number is missing.
 */
export function useWhatsAppShare() {
  const share = (phone: string | undefined, message: string) => {
    if (!phone) {
      toast.error('Client phone number is missing in the database.')
      return
    }
    const formattedPhone = formatPhoneForWhatsApp(phone.toString())
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  return { share }
}
