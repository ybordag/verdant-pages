# Authentication And Session Architecture

**Last verified:** 2026-07-10

## Token Model

| Token | Frontend storage | Transport |
|---|---|---|
| Access token | Module-scoped memory | `Authorization: Bearer` header |
| Refresh token | Cambium-owned httpOnly cookie | Browser cookie on auth refresh/logout requests |

The frontend never writes either token to local storage, session storage, or a URL. In-memory access storage limits persistent token exposure; it does not make XSS harmless.

## Current UI

Verdant implements:

- `/login`;
- `/register`;
- protected and public-only route guards;
- app-mount session restoration;
- logout from the authenticated shell;
- proactive access-token refresh.

Garden-profile onboarding is not yet implemented. It is planned as the post-registration completion step in Phase 5c; see [onboarding](../pages/00-onboarding.md).

## Session Lifecycle

### App mount

1. The app starts without an in-memory access token.
2. `AuthProvider` attempts `POST /auth/refresh`; the browser sends Cambium's refresh cookie.
3. On success, the access token is stored in memory and `/auth/session` loads the user session.
4. On failure, the user remains unauthenticated and protected routes redirect to `/login`.
5. A loading state prevents authenticated content from flashing before restoration finishes.

### Login and registration

1. Submit credentials to Cambium.
2. Store the returned access token in memory; Cambium sets the refresh cookie.
3. Load session state and navigate into the app.
4. Render validation/authentication errors inline without clearing unrelated form state.

Registration currently enters the authenticated app. Phase 5c will route users without a usable garden profile through onboarding before the normal daily workspace.

### Ordinary request refresh

`apiFetch` retries one unauthorized request after a successful refresh. It must not recurse indefinitely. A failed refresh clears frontend authentication so the route guard can return the user to login.

### Logout

Logout asks Cambium to revoke/clear refresh state, then clears the in-memory token and local user state. The UI should honor logout locally even if the network request fails.

## Ownership

| Concern | Owner |
|---|---|
| Access token variable and refresh request | `src/lib/api/client.ts` / `auth.ts` |
| User state and lifecycle coordination | `src/lib/auth/context.tsx` |
| Authenticated route protection | `src/routes/ProtectedRoute.tsx` |
| Redirect authenticated users away from auth forms | `src/routes/PublicOnlyRoute.tsx` |
| Refresh cookie issuance, expiry, revocation | Cambium |

## Registration Policy

Local and portfolio deployments currently allow email/password registration. Before a public production deployment, decide whether registration remains open and add appropriate abuse controls, rate limits, password policy, and account-recovery behavior. Do not rely on project obscurity as a security boundary.

## Test Expectations

Cover:

- successful and failed login/registration;
- silent refresh success and failure;
- a single 401 refresh/retry path;
- logout local cleanup when the server request fails;
- protected/public-only redirects;
- no token persistence in browser-readable storage.
