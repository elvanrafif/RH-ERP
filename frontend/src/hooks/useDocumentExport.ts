import type { RefObject } from 'react'
import { toJpeg } from 'html-to-image'

/**
 * Handles converting a DOM element to a JPEG blob for document saving.
 * Pass the ref of the element you want to capture (e.g. InvoicePaper).
 */
export function useDocumentExport(ref: RefObject<HTMLDivElement | null>) {
  const generateJpeg = async (): Promise<Blob | null> => {
    if (!ref.current) return null

    try {
      const dataUrl = await toJpeg(ref.current, {
        quality: 0.8,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: false,
      })
      const res = await fetch(dataUrl)
      return await res.blob()
    } catch (err) {
      console.error('Failed to generate document image:', err)
      return null
    }
  }

  return { generateJpeg }
}
