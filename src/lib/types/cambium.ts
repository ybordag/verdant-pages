export interface TokenResponse {
  access_token: string
}

export interface SessionResponse {
  user_id: string
  email: string
  preferred_provider: string | null
  preferred_model: string | null
}
