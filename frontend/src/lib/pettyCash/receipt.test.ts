import { describe, expect, it } from 'vitest'
import { processReceipt, processReceipts, normalizeReceipts, isImageReceipt, isPdfReceipt, isAllowedReceiptType, isReceiptWithinSize } from './receipt'

describe('processReceipt', () => {
  it('passes PDF receipts through without changing the file', async () => {
    const file = new File(['pdf-content'], 'receipt.pdf', { type: 'application/pdf' })
    await expect(processReceipt(file)).resolves.toBe(file)
  })

  it('rejects unsupported receipt types', async () => {
    const file = new File(['text'], 'receipt.txt', { type: 'text/plain' })
    await expect(processReceipt(file)).rejects.toThrow(/JPG, PNG, WebP, GIF, or PDF/)
  })

  it('rejects SVG even though it is an image type', async () => {
    const file = new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' })
    await expect(processReceipt(file)).rejects.toThrow(/JPG, PNG, WebP, GIF, or PDF/)
  })

  it('rejects HEIC images', async () => {
    const file = new File(['heic'], 'photo.heic', { type: 'image/heic' })
    await expect(processReceipt(file)).rejects.toThrow(/JPG, PNG, WebP, GIF, or PDF/)
  })

  it('rejects files larger than the size limit', async () => {
    const file = new File(['pdf'], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: 4 * 1024 * 1024 })
    await expect(processReceipt(file)).rejects.toThrow(/3 MB or smaller/)
  })
})

describe('receipt type + size guards', () => {
  it('allows only whitelisted mime types', () => {
    expect(isAllowedReceiptType(new File(['a'], 'a.jpg', { type: 'image/jpeg' }))).toBe(true)
    expect(isAllowedReceiptType(new File(['a'], 'a.png', { type: 'image/png' }))).toBe(true)
    expect(isAllowedReceiptType(new File(['a'], 'a.webp', { type: 'image/webp' }))).toBe(true)
    expect(isAllowedReceiptType(new File(['a'], 'a.gif', { type: 'image/gif' }))).toBe(true)
    expect(isAllowedReceiptType(new File(['a'], 'a.pdf', { type: 'application/pdf' }))).toBe(true)
    expect(isAllowedReceiptType(new File(['a'], 'a.svg', { type: 'image/svg+xml' }))).toBe(false)
    expect(isAllowedReceiptType(new File(['a'], 'a.heic', { type: 'image/heic' }))).toBe(false)
    expect(isAllowedReceiptType(new File(['a'], 'a.exe', { type: 'application/octet-stream' }))).toBe(false)
  })

  it('enforces the size limit boundary', () => {
    const small = new File(['small'], 'a.pdf', { type: 'application/pdf' })
    Object.defineProperty(small, 'size', { value: 3 * 1024 * 1024 })
    expect(isReceiptWithinSize(small)).toBe(true)

    const big = new File(['big'], 'a.pdf', { type: 'application/pdf' })
    Object.defineProperty(big, 'size', { value: 3 * 1024 * 1024 + 1 })
    expect(isReceiptWithinSize(big)).toBe(false)
  })
})

describe('processReceipts', () => {
  it('returns an empty list for no files', async () => {
    await expect(processReceipts([])).resolves.toEqual([])
  })

  it('preserves input order and passes PDFs through', async () => {
    const a = new File(['a'], 'a.pdf', { type: 'application/pdf' })
    const b = new File(['b'], 'b.pdf', { type: 'application/pdf' })
    const result = await processReceipts([a, b])
    expect(result).toEqual([a, b])
  })

  it('rejects when any file is unsupported', async () => {
    const good = new File(['a'], 'a.pdf', { type: 'application/pdf' })
    const bad = new File(['x'], 'x.txt', { type: 'text/plain' })
    await expect(processReceipts([good, bad])).rejects.toThrow(/JPG, PNG, WebP, GIF, or PDF/)
  })
})

describe('normalizeReceipts', () => {
  it('returns an empty list for empty values', () => {
    expect(normalizeReceipts(undefined)).toEqual([])
    expect(normalizeReceipts(null)).toEqual([])
    expect(normalizeReceipts('')).toEqual([])
    expect(normalizeReceipts([])).toEqual([])
  })

  it('wraps a single legacy string filename', () => {
    expect(normalizeReceipts('receipt_abc.webp')).toEqual(['receipt_abc.webp'])
  })

  it('passes through an array unchanged', () => {
    expect(normalizeReceipts(['a.webp', 'b.pdf'])).toEqual(['a.webp', 'b.pdf'])
  })
})

describe('receipt type helpers', () => {
  it('detects pdf and image filenames', () => {
    expect(isPdfReceipt('scan.PDF')).toBe(true)
    expect(isPdfReceipt('scan.webp')).toBe(false)
    expect(isImageReceipt('scan.webp')).toBe(true)
    expect(isImageReceipt('scan.jpeg')).toBe(true)
    expect(isImageReceipt('scan.pdf')).toBe(false)
  })
})
