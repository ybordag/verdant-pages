import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'

const pushToast = vi.fn()
vi.mock('@/lib/toast/toastStore', () => ({ pushToast: (...args: unknown[]) => pushToast(...args) }))

import { queryRetry } from './queryClient'

describe('queryRetry', () => {
  it('never retries an ApiError', () => {
    expect(queryRetry(0, new ApiError(500, null))).toBe(false)
    expect(pushToast).not.toHaveBeenCalled()
  })

  it('retries a non-ApiError failure and pushes a toast, up to the cap', () => {
    expect(queryRetry(0, new TypeError('network down'))).toBe(true)
    expect(pushToast).toHaveBeenCalledWith('Retrying… (0/3)')

    expect(queryRetry(1, new TypeError('network down'))).toBe(true)
    expect(queryRetry(2, new TypeError('network down'))).toBe(true)
    expect(queryRetry(3, new TypeError('network down'))).toBe(false)
  })
})
