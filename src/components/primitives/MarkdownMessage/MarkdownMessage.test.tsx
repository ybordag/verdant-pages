import { render, screen } from '@testing-library/react'
import MarkdownMessage from './MarkdownMessage'

describe('MarkdownMessage', () => {
  it('renders paragraphs, emphasis, strong text, and lists', () => {
    render(
      <MarkdownMessage
        content={
          'Before we can plan, tell me:\n\n* **Climate zone**\n* *Soil type*\n* `Frost date`'
        }
      />,
    )

    expect(screen.getByText('Before we can plan, tell me:')).toBeInTheDocument()
    expect(screen.getByText('Climate zone').tagName).toBe('STRONG')
    expect(screen.getByText('Soil type').tagName).toBe('EM')
    expect(screen.getByText('Frost date').tagName).toBe('CODE')
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders safe links and leaves raw html inert', () => {
    render(
      <MarkdownMessage content={'Use [Verdant](/app/rhizome) and ignore <script>alert(1)</script>.'} />,
    )

    expect(screen.getByRole('link', { name: 'Verdant' })).toHaveAttribute('href', '/app/rhizome')
    expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeInTheDocument()
  })
})
