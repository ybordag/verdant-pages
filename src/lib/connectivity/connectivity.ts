import { useEffect, useState } from 'react'
import { pushToast } from '@/lib/toast/toastStore'

// Same module-store pattern as toastStore: apiFetch (not a component) needs
// to report failures, and the offline banner (a component) needs to read
// the resulting state — neither side should depend on React Context.

const FAILURE_THRESHOLD = 3

type Listener = (offline: boolean) => void

const listeners = new Set<Listener>()
let consecutiveFailures = 0
let offline = typeof navigator !== 'undefined' ? !navigator.onLine : false

function notify() {
  listeners.forEach((l) => l(offline))
}

function setOffline(next: boolean) {
  if (next === offline) return
  offline = next
  pushToast(offline ? "You're offline — changes won't save" : 'Back online')
  notify()
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    consecutiveFailures = 0
    setOffline(false)
  })
  window.addEventListener('offline', () => setOffline(true))
}

export function reportNetworkFailure(): void {
  consecutiveFailures += 1
  if (consecutiveFailures >= FAILURE_THRESHOLD) setOffline(true)
}

export function reportNetworkSuccess(): void {
  consecutiveFailures = 0
  setOffline(false)
}

export function isOffline(): boolean {
  return offline
}

export function subscribeOffline(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useConnectivity(): boolean {
  const [state, setState] = useState(isOffline())
  useEffect(() => subscribeOffline(setState), [])
  return state
}

// Test-only: reset module state between test files.
export function __resetConnectivity(): void {
  consecutiveFailures = 0
  offline = false
  listeners.clear()
}
