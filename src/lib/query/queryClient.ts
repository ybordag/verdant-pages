import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api/client'
import { pushToast } from '@/lib/toast/toastStore'

const MAX_RETRIES = 3

// Queries: skip retry entirely for ApiError (4xx/5xx already have defined UI
// behavior per error-handling.md — no point blindly retrying a 404 or a
// validation error). Network failures (raw TypeError, no ApiError) get up
// to MAX_RETRIES attempts, with a toast on each attempt so a retry-in-
// progress is visible instead of the UI just looking frozen.
export function queryRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) return false
  if (failureCount >= MAX_RETRIES) return false
  pushToast(`Retrying… (${failureCount}/${MAX_RETRIES})`)
  return true
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: queryRetry },
    },
  })
}
