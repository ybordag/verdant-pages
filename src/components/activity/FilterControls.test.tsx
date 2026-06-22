import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { FilterDatePicker, FilterSelect } from './FilterControls'

function ControlledSelect() {
  const [value, setValue] = useState('')
  return (
    <FilterSelect
      label="Category"
      value={value}
      placeholder="All categories"
      options={[
        { value: 'incident', label: 'incident' },
        { value: 'task', label: 'task' },
      ]}
      onChange={setValue}
    />
  )
}

function ControlledDatePicker({ error }: { error?: string }) {
  const [value, setValue] = useState('')
  return <FilterDatePicker label="Since" value={value} error={error} onChange={setValue} />
}

describe('FilterSelect', () => {
  it('selects an option and closes the menu', async () => {
    render(<ControlledSelect />)

    await userEvent.click(screen.getByRole('button', { name: 'Category' }))
    await userEvent.click(screen.getByRole('option', { name: 'incident' }))

    expect(screen.getByRole('button', { name: 'Category' })).toHaveTextContent('incident')
    expect(screen.queryByRole('listbox', { name: 'Category' })).not.toBeInTheDocument()
  })

  it('dismisses on Escape and outside click without changing the selection', async () => {
    render(
      <div>
        <ControlledSelect />
        <button type="button">Outside</button>
      </div>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Category' }))
    expect(screen.getByRole('listbox', { name: 'Category' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox', { name: 'Category' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Category' }))
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }))
    expect(screen.queryByRole('listbox', { name: 'Category' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Category' })).toHaveTextContent('All categories')
  })
})

describe('FilterDatePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 21, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('selects a date from another month and closes the calendar', async () => {
    render(<ControlledDatePicker />)

    fireEvent.click(screen.getByRole('button', { name: 'Since' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next month for Since' }))
    fireEvent.click(screen.getByRole('button', { name: 'Since 07/04/2026' }))

    expect(screen.getByRole('button', { name: 'Since' })).toHaveTextContent('07/04/2026')
    expect(screen.queryByRole('dialog', { name: 'Since calendar' })).not.toBeInTheDocument()
  })

  it('supports Today and Clear actions', async () => {
    render(<ControlledDatePicker />)

    fireEvent.click(screen.getByRole('button', { name: 'Since' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Since calendar' })).getByRole('button', { name: 'Today' }))
    expect(screen.getByRole('button', { name: 'Since' })).toHaveTextContent('06/21/2026')

    fireEvent.click(screen.getByRole('button', { name: 'Since' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Since calendar' })).getByRole('button', { name: 'Clear' }))
    expect(screen.getByRole('button', { name: 'Since' })).toHaveTextContent('Any date')
    expect(screen.queryByRole('dialog', { name: 'Since calendar' })).not.toBeInTheDocument()
  })

  it('announces validation errors on the trigger', async () => {
    render(<ControlledDatePicker error="Since cannot be in the future." />)

    const trigger = screen.getByRole('button', { name: 'Since' })
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAccessibleDescription('Since cannot be in the future.')
  })
})
