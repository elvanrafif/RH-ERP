import type { RefObject } from 'react'
import { toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'

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

  const generatePdf = async (fileName: string): Promise<void> => {
    if (!ref.current) return

    const dataUrl = await toJpeg(ref.current, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: false,
    })
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297)
    pdf.save(fileName)
  }

  return { generateJpeg, generatePdf }
}
