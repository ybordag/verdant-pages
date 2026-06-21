import { describe, expect, it } from 'vitest'
import { isPasswordValid, passwordStrength } from './passwordStrength'

describe('passwordStrength', () => {
  it('returns 0 for an empty password', () => {
    expect(passwordStrength('')).toBe(0)
  })

  it('counts each requirement independently', () => {
    expect(passwordStrength('short')).toBe(0) // <8 chars, no number/upper/special
    expect(passwordStrength('longenough')).toBe(1) // 8+ chars only
    expect(passwordStrength('longenough1')).toBe(2) // + letters and numbers
    expect(passwordStrength('Longenough1')).toBe(3) // + uppercase
    expect(passwordStrength('Longenough1!')).toBe(4) // + special char
  })

  it('isPasswordValid requires all 4 criteria', () => {
    expect(isPasswordValid('Longenough1')).toBe(false)
    expect(isPasswordValid('Longenough1!')).toBe(true)
  })
})
