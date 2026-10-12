import { pb } from '@/lib/pocketbase'
import { PETTY_CASH_RECEIPT_MAX_EDGE, PETTY_CASH_RECEIPT_MAX_SIZE_BYTES, PETTY_CASH_RECEIPT_WEBP_QUALITY } from '@/lib/constant'

/**
 * Explicit allow-list of receipt MIME types. Deliberately excludes SVG
 * (scriptable, XSS risk) and HEIC/HEIF (not decodable in most desktop browsers).
 */
export const ALLOWED_RECEIPT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const

export function isAllowedReceiptType(file: File): boolean {
  return (ALLOWED_RECEIPT_MIME_TYPES as readonly string[]).includes(file.type)
}

export function isReceiptWithinSize(file: File): boolean {
  return file.size <= PETTY_CASH_RECEIPT_MAX_SIZE_BYTES
}

/** Human-readable allow-list used in validation + error messages. */
export const RECEIPT_ALLOWED_LABEL = 'JPG, PNG, WebP, GIF, or PDF'
export const RECEIPT_MAX_SIZE_LABEL = `${Math.round(PETTY_CASH_RECEIPT_MAX_SIZE_BYTES / (1024 * 1024))} MB`

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Unable to read image'))
    }
    image.src = url
  })
}

export async function processReceipt(file: File): Promise<File> {
  if (!isAllowedReceiptType(file)) {
    throw new Error(`Receipt must be a ${RECEIPT_ALLOWED_LABEL} file`)
  }
  if (!isReceiptWithinSize(file)) {
    throw new Error(`Receipt must be ${RECEIPT_MAX_SIZE_LABEL} or smaller`)
  }
  if (file.type === 'application/pdf') return file

  const image = await loadImage(file)
  const scale = Math.min(1, PETTY_CASH_RECEIPT_MAX_EDGE / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to process receipt image')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Unable to encode receipt image')), 'image/webp', PETTY_CASH_RECEIPT_WEBP_QUALITY)
  })
  const baseName = file.name.replace(/\.[^.]+$/, '')
  return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() })
}

/** Processes receipts sequentially so the resulting order matches the input order. */
export async function processReceipts(files: File[]): Promise<File[]> {
  const processed: File[] = []
  for (const file of files) {
    processed.push(await processReceipt(file))
  }
  return processed
}

/**
 * PocketBase may return a file field as a single string, an array, or nothing
 * depending on maxSelect and how the record was created. Normalize to a list.
 */
export function normalizeReceipts(value: string[] | string | null | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export function isPdfReceipt(name: string): boolean {
  return name.toLowerCase().endsWith('.pdf')
}

export function isImageReceipt(name: string): boolean {
  return /\.(webp|png|jpe?g|gif)$/i.test(name)
}

export async function getReceiptUrl(
  record: { id: string; collectionId: string; collectionName?: string },
  filename: string,
  isImage: boolean
) {
  const token = await pb.files.getToken()
  return pb.files.getURL(
    { ...record, receipt: filename },
    filename,
    {
      token,
      ...(isImage ? { thumb: '400x400' } : {}),
    }
  )
}
