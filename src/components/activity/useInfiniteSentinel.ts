import { useEffect, useRef } from 'react'

interface InfiniteSentinelOptions {
  disabled?: boolean
  onIntersect: () => void | Promise<unknown>
}

export function useInfiniteSentinel({ disabled = false, onIntersect }: InfiniteSentinelOptions) {
  const ref = useRef<HTMLDivElement>(null)
  const pendingRef = useRef(false)

  useEffect(() => {
    if (disabled) pendingRef.current = false
    if (disabled || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || pendingRef.current) return
        pendingRef.current = true
        try {
          void Promise.resolve(onIntersect()).then(
            () => {
              pendingRef.current = false
            },
            () => {
              pendingRef.current = false
            },
          )
        } catch (error) {
          pendingRef.current = false
          throw error
        }
      },
      { rootMargin: '160px 0px' },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [disabled, onIntersect])

  return ref
}
