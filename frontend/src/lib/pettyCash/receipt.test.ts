import { describe, expect, it } from 'vitest'
import { processReceipt } from './receipt'

describe('processReceipt', () => {
  it('passes PDF receipts through without changing the file', async () => {
    const file = new File(['pdf-content'], 'receipt.pdf', { type: 'application/pdf' })
    await expect(processReceipt(file)).resolves.toBe(file)
  })

  it('rejects unsupported receipt types', async () => {
    const file = new File(['text'], 'receipt.txt', { type: 'text/plain' })
    await expect(processReceipt(file)).rejects.toThrow('Receipt must be an image or PDF')
  })
})
