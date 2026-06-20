import { render, screen } from '@testing-library/react'
import ProgressBar from './ProgressBar'

describe('ProgressBar', () => {
  it('exposes value and max via ARIA attributes', () => {
    render(<ProgressBar value={30} max={50} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '30')
    expect(bar).toHaveAttribute('aria-valuemax', '50')
  })

  it('defaults max to 100', () => {
    render(<ProgressBar value={25} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100')
  })

  it('renders the fill width as a percentage of max', () => {
    render(<ProgressBar value={25} max={100} />)
    const fill = screen.getByRole('progressbar').firstChild as HTMLElement
    expect(fill).toHaveStyle({ width: '25%' })
  })

  it('clamps the fill width to 100% when value exceeds max', () => {
    render(<ProgressBar value={150} max={100} />)
    const fill = screen.getByRole('progressbar').firstChild as HTMLElement
    expect(fill).toHaveStyle({ width: '100%' })
  })

  it('clamps the fill width to 0% when value is negative', () => {
    render(<ProgressBar value={-10} max={100} />)
    const fill = screen.getByRole('progressbar').firstChild as HTMLElement
    expect(fill).toHaveStyle({ width: '0%' })
  })
})
