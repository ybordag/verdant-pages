# Auth & Session Architecture

**Last updated:** 2026-06-20

## Token model

Cambium issues two tokens on every successful auth:

| Token | Lifetime | Storage | Transport |
|---|---|---|---|
| Access token | 15 min | In-memory (module-scoped variable) | `Authorization: Bearer <token>` header |
| Refresh token | 7 days | httpOnly cookie (set by Cambium) | Auto-sent by browser on `POST /auth/refresh` |

## Why in-memory over localStorage

The primary threat is XSS. If an attacker injects malicious JavaScript into the page, `localStorage` is directly readable and the token can be exfiltrated. An in-memory token lives only in a module-scoped variable: an active XSS script can still read it in that moment, but there is no persistent artifact to steal after the fact, no access from other tabs, and the token is gone when the page closes.

In-memory does not make XSS harmless — it removes the *persistent, extractable* attack surface. Paired with the httpOnly refresh token (which JavaScript cannot access at all), this is a well-layered design.

**The overhead:** the token is gone on every page reload, so on every page load the app calls `POST /auth/refresh` before rendering authenticated content. One round-trip (~50–100ms in production). A loading state on mount handles this gracefully.

## Auth flow

### App mount (silent refresh)

1. App renders with no access token in memory (every reload starts here — that's the point of in-memory storage).
2. `AuthContext` immediately calls `POST /auth/refresh`. The browser auto-attaches the httpOnly refresh cookie — no JS-readable token is ever sent.
3. **200** → response body has `{ access_token }`. Store it in the module variable, populate `AuthContext.user` from the response, render the authenticated app.
4. **401** (refresh token expired or revoked) → `AuthContext.user` stays `null`, redirect to `/login`.
5. A `<LoadingScreen />` covers steps 1–4 so the app never flashes an unauthenticated state for a user who is actually logged in.

### Login

1. User submits the login form → `POST /auth/login { email, password }`.
2. **200** → response has `{ access_token }`. Store it in the module variable. Cambium also sets the httpOnly refresh cookie on this response (no frontend action needed for that part).
3. Start the proactive refresh timer (see below). Redirect to `/app/today`.
4. **401** (bad credentials) → show an inline error on the form. Token state is untouched — there was nothing to roll back.

### Logout

1. User triggers logout → `POST /auth/logout`.
2. Cambium revokes the refresh token server-side and clears the httpOnly cookie in the response.
3. Frontend clears the in-memory access token, stops the proactive refresh timer, redirects to `/login`.
4. This request is fire-and-forget from the UI's perspective — even if it fails, the frontend still clears local state and redirects, since the user's intent ("log me out") should never be blocked by a network blip.

### Proactive refresh (keeping the session alive)

1. After any successful login or silent refresh, start `setInterval(refreshToken, 12 * 60 * 1000)` — fires every 12 minutes, ahead of the 15-minute access token expiry.
2. Additionally, on tab focus (`visibilitychange` → visible): if the current token was issued more than 10 minutes ago, refresh immediately rather than waiting for the interval. This covers the case where a tab was backgrounded past the expiry window.
3. Either path calls the same refresh logic as app-mount step 2 — success updates the token silently; a 401 here means the refresh token itself expired (7 days idle) or was revoked, and the user is redirected to `/login` mid-session.

## AuthContext

```typescript
interface AuthState {
  user: SessionResponse | null;
  isLoading: boolean;
}
interface AuthActions {
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}
type AuthContextValue = AuthState & AuthActions;
```

## ProtectedRoute / PublicOnlyRoute

```tsx
function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicOnlyRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/app/today" replace />;
  return <Outlet />;
}
```

All `/app/*` routes are wrapped in `ProtectedRoute` (`src/routes/ProtectedRoute.tsx`). `/login` and `/register` are wrapped in `PublicOnlyRoute` (`src/routes/PublicOnlyRoute.tsx`), which redirects to `/app/today` when already authenticated.

## Login / Register screens

No auth screens exist in the prototype — design them in the same botanical aesthetic:

- **Background:** `--bg` (#181510 dark / #FAF6EE light)
- **Card:** centered, `--bg-nav` background, `--line` border, `border-radius: 8px`, `padding: 40px`
- **Logo:** "Verdant Pages" in `--font-display` at 28px, chartreuse
- **Tagline:** short line in `--font-botanical`, `--text-s`
- **Fields:** `Input` primitive with chartreuse focus ring
- **Submit:** primary `Button` (chartreuse fill, dark text)
- **Toggle link:** small link to the other auth page in `--font-label`, pine color

No third-party OAuth. Email + password only (matching Cambium's auth model).

**Registration policy:** open/public for now — anyone can `POST /auth/register`. Very few people know about the project, so obscurity acts as the gate rather than an invite system or approval flow. Revisit if the project becomes more public.
