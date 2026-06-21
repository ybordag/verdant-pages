import type { ToastItem } from '@/components/shell/Toast/Toast'

// Module-level store, not React Context: this needs to be callable from
// non-component code (apiFetch, the QueryClient's retry function), the same
// way client.ts manages the access token as a module variable rather than
// through context.

type Listener = (toasts: ToastItem[]) => void

const listeners = new Set<Listener>()
let toasts: ToastItem[] = []
let nextId = 0
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function notify() {
  listeners.forEach((l) => l(toasts))
}

export function pushToast(message: string, opts?: { durationMs?: number; onClick?: () => void }): string {
  const id = String(nextId++)
  toasts = [...toasts, { id, message, onClick: opts?.onClick }]
  notify()

  const duration = opts?.durationMs ?? 4000
  const timer = setTimeout(() => dismissToast(id), duration)
  timers.set(id, timer)

  return id
}

export function dismissToast(id: string): void {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  if (!toasts.some((t) => t.id === id)) return
  toasts = toasts.filter((t) => t.id !== id)
  notify()
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener)
  listener(toasts)
  return () => listeners.delete(listener)
}

// Test-only: reset module state between test files.
export function __resetToastStore(): void {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
  toasts = []
  nextId = 0
  listeners.clear()
}
