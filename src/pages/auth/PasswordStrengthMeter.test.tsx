import { render, screen } from '@testing-library/react'
import PasswordStrengthMeter from './PasswordStrengthMeter'

function bars(container: HTMLElement) {
  return container.querySelectorAll('[class*="bar"]:not([class*="bars"])')
}

function filledBars(container: HTMLElement) {
  return container.querySelectorAll('[class*="bar"]:not([class*="bars"])[class*="level"]')
}

describe('PasswordStrengthMeter', () => {
  it('shows no label and no filled bars for an empty password', () => {
    const { container } = render(<PasswordStrengthMeter password="" />)
    expect(bars(container)).toHaveLength(4)
    expect(filledBars(container)).toHaveLength(0)
    expect(screen.queryByText('Weak')).not.toBeInTheDocument()
    expect(screen.queryByText('Fair')).not.toBeInTheDocument()
    expect(screen.queryByText('Good')).not.toBeInTheDocument()
    expect(screen.queryByText('Strong')).not.toBeInTheDocument()
  })

  it('shows "Weak" with one filled bar when only one requirement is met', () => {
    // meets only "at least 8 characters"
    const { container } = render(<PasswordStrengthMeter password="aaaaaaaa" />)
    expect(screen.getByText('Weak')).toBeInTheDocument()
    expect(filledBars(container)).toHaveLength(1)
  })

  it('shows "Fair" with two filled bars when two requirements are met', () => {
    // length + letters-and-numbers
    const { container } = render(<PasswordStrengthMeter password="aaaaaa11" />)
    expect(screen.getByText('Fair')).toBeInTheDocument()
    expect(filledBars(container)).toHaveLength(2)
  })

  it('shows "Good" with three filled bars when three requirements are met', () => {
    // length + letters-and-numbers + uppercase
    const { container } = render(<PasswordStrengthMeter password="Aaaaaa11" />)
    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(filledBars(container)).toHaveLength(3)
  })

  it('shows "Strong" with all four bars filled when every requirement is met', () => {
    const { container } = render(<PasswordStrengthMeter password="Aaaaaa11!" />)
    expect(screen.getByText('Strong')).toBeInTheDocument()
    expect(filledBars(container)).toHaveLength(4)
  })

  it('marks each requirement met/unmet as the password changes', () => {
    render(<PasswordStrengthMeter password="Aaaaaa11" />)
    const items = screen.getAllByRole('listitem')
    const metLabels = items.filter((li) => li.className.includes('met')).map((li) => li.textContent)
    // "Aaaaaa11" meets length, letters+numbers, and uppercase, but not special character
    expect(metLabels.some((t) => t?.includes('At least 8 characters'))).toBe(true)
    expect(metLabels.some((t) => t?.includes('Letters and numbers'))).toBe(true)
    expect(metLabels.some((t) => t?.includes('One uppercase letter'))).toBe(true)
    expect(metLabels.some((t) => t?.includes('One special character'))).toBe(false)
  })
})
