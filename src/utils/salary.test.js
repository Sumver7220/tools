import { describe, it, expect } from 'vitest'
import { calcBasePay, calcChampagnePay, calcSessionPay, calcTotalPay } from './salary'

describe('calcBasePay', () => {
  it('returns hours × 50000', () => {
    expect(calcBasePay(4)).toBe(200000)
  })
  it('returns 0 for 0 hours', () => {
    expect(calcBasePay(0)).toBe(0)
  })
})

describe('calcChampagnePay', () => {
  it('applies 50% commission to bottles + towers', () => {
    // (3 × 30000 + 1 × 200000) × 0.5 = 145000
    expect(calcChampagnePay(3, 1)).toBe(145000)
  })
  it('handles bottles only', () => {
    // 5 × 30000 × 0.5 = 75000
    expect(calcChampagnePay(5, 0)).toBe(75000)
  })
  it('handles towers only', () => {
    // 2 × 200000 × 0.5 = 200000
    expect(calcChampagnePay(0, 2)).toBe(200000)
  })
  it('returns 0 when both zero', () => {
    expect(calcChampagnePay(0, 0)).toBe(0)
  })
})

describe('calcSessionPay', () => {
  it('returns sessions × 40000 × 40%', () => {
    // 8 × 40000 × 0.4 = 128000
    expect(calcSessionPay(8)).toBe(128000)
  })
  it('returns 0 for 0 sessions', () => {
    expect(calcSessionPay(0)).toBe(0)
  })
})

describe('calcTotalPay', () => {
  it('sums base + champagne + session pay', () => {
    // 200000 + 145000 + 128000 = 473000
    expect(calcTotalPay(4, 3, 1, 8)).toBe(473000)
  })
})
