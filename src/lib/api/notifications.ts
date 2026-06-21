import { apiFetch, toQueryString } from './client'
import type { NotificationsSnapshot } from '@/lib/types/rhizome'

export function getNotifications(params?: { since?: string }): Promise<NotificationsSnapshot> {
  return apiFetch(`/api/v1/notifications${toQueryString(params)}`)
}

// streamNotifications (SSE) is intentionally not implemented yet — it depends
// on src/lib/sse/stream.ts (consumeNotificationStream), which is still empty
// pending Phase 7. See deferred-work.md.
