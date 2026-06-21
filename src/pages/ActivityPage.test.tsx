import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActivityPage from './ActivityPage'

describe('ActivityPage', () => {
  it('renders the static feed skeleton with sample events', () => {
    render(<ActivityPage />)

    expect(screen.getByRole('heading', { name: 'Activity' })).toBeInTheDocument()
    expect(screen.getByText('Completed morning watering for container tomatoes.')).toBeInTheDocument()
    expect(screen.getByText('Flagged aphid pressure on kale starts.')).toBeInTheDocument()
    expect(screen.getByText('4 events')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument()
  })

  it('filters sample events by category and resets filters', async () => {
    render(<ActivityPage />)

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'incident')

    expect(screen.getByText('Flagged aphid pressure on kale starts.')).toBeInTheDocument()
    expect(screen.queryByText('Completed morning watering for container tomatoes.')).not.toBeInTheDocument()
    expect(screen.getByText('1 events')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByText('Completed morning watering for container tomatoes.')).toBeInTheDocument()
    expect(screen.getByText('4 events')).toBeInTheDocument()
  })

  it('filters sample events by subject and date bounds', async () => {
    render(<ActivityPage />)

    await userEvent.selectOptions(screen.getByLabelText('Subject'), 'plant')
    await userEvent.type(screen.getByLabelText('Since'), '2026-06-20')
    await userEvent.type(screen.getByLabelText('Before'), '2026-06-21')

    expect(screen.getByText('Flagged aphid pressure on kale starts.')).toBeInTheDocument()
    expect(screen.queryByText('Updated cherry tomato transplant status.')).not.toBeInTheDocument()
    expect(screen.getByText('1 events')).toBeInTheDocument()
  })
})
