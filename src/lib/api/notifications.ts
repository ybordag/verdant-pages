import { apiFetch, toQueryString } from './client'
import { consumeNotificationStream } from '@/lib/sse/stream'
import type { NotificationsSnapshot } from '@/lib/types/rhizome'
import type { NotificationEvent } from '@/lib/types/cambium'

export function getNotifications(params?: { since?: string }): Promise<NotificationsSnapshot> {
  return apiFetch(`/api/v1/notifications${toQueryString(params)}`)
}

export function streamNotifications(): AsyncGenerator<NotificationEvent> {
  return consumeNotificationStream()
}
