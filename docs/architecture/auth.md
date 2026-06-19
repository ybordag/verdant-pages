# Auth & Session Architecture

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

```
App mount
  └─ no token in memory → refresh flow

Refresh flow
  └─ POST /auth/refresh (browser sends httpOnly cookie automatically)
       ├─ 200: { access_token } → store in module variable + set user in AuthContext
       └─ 401 (expired/revoked) → redirect to /login

Login
  └─ POST /auth/login { email, password }
       ├─ 200: { access_token } → store in module variable
       │        (Cambium also sets httpOnly refresh cookie)
       └─ 401: show error

Logout
  └─ POST /auth/logout → Cambium revokes refresh token, clears cookie
       └─ clear in-memory token + redirect to /login

Proactive refresh
  └─ After successful auth, setInterval(refreshToken, 12 * 60 * 1000)
       └─ Fires at 12 minutes (before 15-min expiry)
       └─ On tab focus: if token was issued > 10 min ago, refresh immediately
```

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

## ProtectedRoute

```tsx
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
```

All `/app/*` routes are wrapped. `/login` and `/register` redirect to `/app/today` when already authenticated.

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
