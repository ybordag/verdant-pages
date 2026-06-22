import { render, screen, within } from '@testing-library/react'
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

  it('keeps ordered lists continuous and nests follow-up bullets under colon-ended items', () => {
    render(
      <MarkdownMessage
        content={[
          'Here are some ideas:',
          '',
          '1. **Drought-Tolerant Mediterranean Garden:** Lavender and salvia.',
          '',
          '1. **Vibrant Perennial Border:** Some great options include:',
          '',
          '* **Coneflowers:** Attracts pollinators.',
          '* **Daylilies:** Hardy and diverse.',
          '',
          '1. **Rose Garden with Companion Plants:** Consider:',
          '',
          '* **Lavender:** Deters pests.',
          '* **Catmint:** Attracts beneficial insects.',
        ].join('\n')}
      />,
    )

    const topLevelList = screen.getByText('Drought-Tolerant Mediterranean Garden:').closest('ol')
    expect(topLevelList).not.toBeNull()
    if (!topLevelList) return

    const topLevelItems = within(topLevelList).getAllByRole('listitem')
    expect(topLevelItems).toHaveLength(7)

    const perennialItem = screen.getByText('Vibrant Perennial Border:').closest('li')
    expect(perennialItem).not.toBeNull()
    if (!perennialItem) return
    expect(within(perennialItem).getByRole('list')).toContainElement(screen.getByText('Coneflowers:'))
    expect(within(perennialItem).getByText('Daylilies:')).toBeInTheDocument()
  })
})
