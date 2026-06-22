import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { useInfiniteSentinel } from './useInfiniteSentinel'

let observerCallback: IntersectionObserverCallback | null = null
let observe: ReturnType<typeof vi.fn>
let disconnect: ReturnType<typeof vi.fn>

function Harness({
  disabled = false,
  onIntersect,
}: {
  disabled?: boolean
  onIntersect: () => void | Promise<unknown>
}) {
  const ref = useInfiniteSentinel({ disabled, onIntersect })
  return <div ref={ref}>Sentinel</div>
}

describe('useInfiniteSentinel', () => {
  beforeEach(() => {
    observe = vi.fn()
    disconnect = vi.fn()
    observerCallback = null
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          observerCallback = callback
        }

        observe = observe
        disconnect = disconnect
        unobserve = vi.fn()
        takeRecords = vi.fn(() => [])
        root = null
        rootMargin = ''
        thresholds = []
      },
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('observes the sentinel and disconnects on unmount', () => {
    const { unmount } = render(<Harness onIntersect={() => {}} />)

    expect(observe).toHaveBeenCalledWith(screen.getByText('Sentinel'))
    unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('does not observe when disabled', () => {
    render(<Harness disabled onIntersect={() => {}} />)

    expect(observe).not.toHaveBeenCalled()
    expect(observerCallback).toBeNull()
  })

  it('calls onIntersect once while a load promise is pending', async () => {
    let resolveLoad: () => void = () => {}
    const onIntersect = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve
        }),
    )
    render(<Harness onIntersect={onIntersect} />)

    observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)

    expect(onIntersect).toHaveBeenCalledOnce()

    resolveLoad()
    await Promise.resolve()
    observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)

    expect(onIntersect).toHaveBeenCalledTimes(2)
  })

  it('unlocks the sentinel if onIntersect throws synchronously', () => {
    const error = new Error('load failed before promise')
    const onIntersect = vi.fn(() => {
      throw error
    })
    render(<Harness onIntersect={onIntersect} />)

    expect(() =>
      observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
    ).toThrow(error)
    expect(() =>
      observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
    ).toThrow(error)

    expect(onIntersect).toHaveBeenCalledTimes(2)
  })

  it('unlocks the sentinel if an async load rejects', async () => {
    const onIntersect = vi.fn(() => Promise.reject(new Error('load failed')))
    render(<Harness onIntersect={onIntersect} />)

    observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    await Promise.resolve()
    observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)

    expect(onIntersect).toHaveBeenCalledTimes(2)
  })
})
