import { describe, expect, it } from 'vitest'
import { formatAmountInput, parseAmountInput } from './money'

describe('petty cash amount input', () => {
  it('formats digit input with Indonesian thousands separators', () => {
    expect(formatAmountInput('5000000')).toBe('5.000.000')
  })

  it('parses a formatted amount into the numeric value sent to PocketBase', () => {
    expect(parseAmountInput('5.000.000')).toBe(5_000_000)
  })
})
