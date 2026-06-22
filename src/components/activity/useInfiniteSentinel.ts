import { useEffect, useRef } from 'react'

interface InfiniteSentinelOptions {
  disabled?: boolean
  onIntersect: () => void
}

export function useInfiniteSentinel({ disabled = false, onIntersect }: InfiniteSentinelOptions) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (disabled || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onIntersect()
      },
      { rootMargin: '160px 0px' },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [disabled, onIntersect])

  return ref
}
