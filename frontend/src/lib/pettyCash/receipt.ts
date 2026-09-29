import { pb } from '@/lib/pocketbase'
import { PETTY_CASH_RECEIPT_MAX_EDGE, PETTY_CASH_RECEIPT_WEBP_QUALITY } from '@/lib/constant'

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
  if (file.type === 'application/pdf') return file
  if (!file.type.startsWith('image/')) throw new Error('Receipt must be an image or PDF')

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

export async function getReceiptUrl(record: { id: string; collectionId: string; receipt: string }, isImage: boolean) {
  const token = await pb.files.getToken()
  return pb.files.getURL(record, record.receipt, {
    token,
    ...(isImage ? { thumb: '400x400' } : {}),
  })
}
