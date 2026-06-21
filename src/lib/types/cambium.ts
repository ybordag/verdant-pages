import type { InteractionEnvelopeView, MonitorAlertView } from './rhizome'

export interface TokenResponse {
  access_token: string
}

export interface SessionResponse {
  user_id: string
  email: string
  preferred_provider: string | null
  preferred_model: string | null
}

export interface ChatRequest {
  message: string
}

export interface ChatResponse {
  thread_id: string
  response: string
  interaction: Record<string, unknown> | null
}

export interface ResumeRequest {
  thread_id: string
  resolution: string
}

export interface ThreadIDResponse {
  thread_id: string
}

export type SSEEvent =
  | { type: 'token'; content: string }
  | { type: 'interaction'; payload: InteractionEnvelopeView }
  | { type: 'done' }

export type NotificationEvent =
  | { type: 'heartbeat' }
  | { type: 'alert'; payload: MonitorAlertView }
  | { type: 'interaction_pending'; payload: { id: string; title: string; interaction_type: string } }
  | { type: 'job_started'; job_id: string; title: string }
  | { type: 'job_step'; job_id: string; step: string; status: 'running' | 'done' }
  | { type: 'job_complete'; job_id: string; title: string; summary: string }
  | { type: 'job_failed'; job_id: string; title: string; error: string }
