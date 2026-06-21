import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { __resetToastStore, dismissToast, pushToast, subscribeToasts } from './toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    __resetToastStore()
    vi.useRealTimers()
  })

  it('pushToast adds a toast that subscribers receive', () => {
    const listener = vi.fn()
    subscribeToasts(listener)
    pushToast('Hello')
    expect(listener).toHaveBeenLastCalledWith([expect.objectContaining({ message: 'Hello' })])
  })

  it('subscribeToasts immediately replays the current state to a new subscriber', () => {
    pushToast('Existing')
    const listener = vi.fn()
    subscribeToasts(listener)
    expect(listener).toHaveBeenCalledWith([expect.objectContaining({ message: 'Existing' })])
  })

  it('auto-dismisses a toast after its duration', () => {
    const listener = vi.fn()
    subscribeToasts(listener)
    pushToast('Goes away', { durationMs: 1000 })
    vi.advanceTimersByTime(1000)
    expect(listener).toHaveBeenLastCalledWith([])
  })

  it('dismissToast removes a toast before its timer fires', () => {
    const listener = vi.fn()
    subscribeToasts(listener)
    const id = pushToast('Manual dismiss')
    dismissToast(id)
    expect(listener).toHaveBeenLastCalledWith([])
  })

  it('notifies multiple subscribers', () => {
    const a = vi.fn()
    const b = vi.fn()
    subscribeToasts(a)
    subscribeToasts(b)
    pushToast('Both see this')
    expect(a).toHaveBeenLastCalledWith([expect.objectContaining({ message: 'Both see this' })])
    expect(b).toHaveBeenLastCalledWith([expect.objectContaining({ message: 'Both see this' })])
  })

  it('unsubscribe stops further updates', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToasts(listener)
    unsubscribe()
    listener.mockClear()
    pushToast('Should not be seen')
    expect(listener).not.toHaveBeenCalled()
  })

  it('dismissing an already-dismissed or unknown id is a no-op', () => {
    const listener = vi.fn()
    subscribeToasts(listener)
    listener.mockClear()
    dismissToast('does-not-exist')
    expect(listener).not.toHaveBeenCalled()
  })
})
