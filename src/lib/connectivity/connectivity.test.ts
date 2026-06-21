import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const pushToast = vi.fn()
vi.mock('@/lib/toast/toastStore', () => ({ pushToast: (...args: unknown[]) => pushToast(...args) }))

import { __resetConnectivity, isOffline, reportNetworkFailure, reportNetworkSuccess, subscribeOffline } from './connectivity'

describe('connectivity', () => {
  beforeEach(() => {
    __resetConnectivity()
    pushToast.mockClear()
  })

  afterEach(() => {
    __resetConnectivity()
  })

  it('starts online', () => {
    expect(isOffline()).toBe(false)
  })

  it('does not flip offline before the failure threshold', () => {
    reportNetworkFailure()
    reportNetworkFailure()
    expect(isOffline()).toBe(false)
    expect(pushToast).not.toHaveBeenCalled()
  })

  it('flips offline after 3 consecutive failures and pushes a toast', () => {
    reportNetworkFailure()
    reportNetworkFailure()
    reportNetworkFailure()
    expect(isOffline()).toBe(true)
    expect(pushToast).toHaveBeenCalledWith("You're offline — changes won't save")
  })

  it('does not push a duplicate toast on repeated failures while already offline', () => {
    reportNetworkFailure()
    reportNetworkFailure()
    reportNetworkFailure()
    pushToast.mockClear()
    reportNetworkFailure()
    expect(pushToast).not.toHaveBeenCalled()
  })

  it('reportNetworkSuccess resets the counter and clears offline, with a toast', () => {
    reportNetworkFailure()
    reportNetworkFailure()
    reportNetworkFailure()
    pushToast.mockClear()
    reportNetworkSuccess()
    expect(isOffline()).toBe(false)
    expect(pushToast).toHaveBeenCalledWith('Back online')
  })

  it('reportNetworkSuccess after a success requires a fresh 3 failures to go offline again', () => {
    reportNetworkFailure()
    reportNetworkFailure()
    reportNetworkSuccess()
    reportNetworkFailure()
    reportNetworkFailure()
    expect(isOffline()).toBe(false)
  })

  it('notifies subscribers when offline state changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeOffline(listener)
    reportNetworkFailure()
    reportNetworkFailure()
    reportNetworkFailure()
    expect(listener).toHaveBeenCalledWith(true)
    unsubscribe()
  })

  it('window offline/online events drive the same state', () => {
    window.dispatchEvent(new Event('offline'))
    expect(isOffline()).toBe(true)
    window.dispatchEvent(new Event('online'))
    expect(isOffline()).toBe(false)
  })
})
