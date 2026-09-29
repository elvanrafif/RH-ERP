import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  parseTermType,
  recalculateTermItems,
  serializeTermType,
  updateTermItemType,
} from './termCalculation.ts'

describe('payment term types', () => {
  it('round-trips Custom Amount so the selection does not reset', () => {
    const storedValue = serializeTermType('custom_amount')

    assert.deepEqual(parseTermType(storedValue.percent, storedValue.termType), {
      type: 'custom_amount',
      value: '',
    })
    assert.equal(storedValue.percent, '')
  })

  it('recognizes existing DP, settlement, percentage, and empty values', () => {
    assert.equal(parseTermType('DP').type, 'fixed_dp')
    assert.equal(parseTermType('Pelunasan').type, 'settlement')
    assert.deepEqual(parseTermType('50%'), { type: 'percentage', value: '50' })
    assert.equal(parseTermType('').type, 'percentage')
  })

  it('clears a custom amount when changing to an empty percentage term', () => {
    const updated = updateTermItemType(
      {
        ...serializeTermType('custom_amount'),
        amount: 300_000,
      },
      'percentage'
    )

    assert.deepEqual(updated, { percent: '', amount: 0 })
  })
})

describe('recalculateTermItems', () => {
  it('preserves a custom amount and deducts it from a following settlement', () => {
    const result = recalculateTermItems(
      [
        { name: 'Custom', ...serializeTermType('custom_amount'), amount: 300_000 },
        { name: 'Settlement', percent: 'Pelunasan', amount: 0 },
      ],
      1_000_000,
      'sipil'
    )

    assert.deepEqual(result.map((item) => item.amount), [300_000, 700_000])
  })

  it('updates a following settlement after a custom amount is edited', () => {
    const items = [
      { ...serializeTermType('custom_amount'), amount: 300_000 },
      { percent: 'Settlement', amount: 700_000 },
    ]
    const editedItems = items.map((item, index) =>
      index === 0 ? { ...item, amount: 450_000 } : item
    )

    const result = recalculateTermItems(editedItems, 1_000_000, 'sipil')

    assert.deepEqual(result.map((item) => item.amount), [450_000, 550_000])
  })

  it('keeps a saved custom amount unchanged when the invoice total changes', () => {
    const savedItems = JSON.parse(
      JSON.stringify([
        {
          name: 'Custom',
          ...serializeTermType('custom_amount'),
          amount: 300_000,
        },
      ])
    )

    assert.equal(
      recalculateTermItems(savedItems, 2_000_000, 'interior')[0].amount,
      300_000
    )
  })

  it('does not allow a negative settlement when prior custom terms exceed the total', () => {
    const result = recalculateTermItems(
      [
        { ...serializeTermType('custom_amount'), amount: 1_200_000 },
        { percent: 'Settlement', amount: 0 },
      ],
      1_000_000,
      'sipil'
    )

    assert.deepEqual(result.map((item) => item.amount), [1_200_000, 0])
  })

  it('recalculates existing percentage, design DP, and settlement terms as before', () => {
    const result = recalculateTermItems(
      [
        { percent: 'DP', amount: 0 },
        { percent: '50%', amount: 0 },
        { percent: 'Pelunasan', amount: 0 },
      ],
      10_000_000,
      'design'
    )

    assert.deepEqual(result.map((item) => item.amount), [
      2_500_000,
      5_000_000,
      2_500_000,
    ])
  })

  it('continues to preserve an existing DP amount for non-design invoices', () => {
    const result = recalculateTermItems(
      [{ percent: 'DP', amount: 1_500_000 }],
      10_000_000,
      'sipil'
    )

    assert.equal(result[0].amount, 1_500_000)
  })
})
