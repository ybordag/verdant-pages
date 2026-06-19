# CLAUDE.md Draft

Copy this to the repo root as `CLAUDE.md` when starting the build.

---

```markdown
# Verdant Pages — Claude Code Memory

## What this is

Verdant Pages is the React frontend for the Gardening Agent system.
It talks to **Cambium** (the Go API gateway) — never directly to Rhizome.
Rhizome is an internal ClusterIP service unreachable from outside the cluster.

## Build + run commands

npm install
npm run dev       # Vite dev server (proxies /api + /auth to Cambium)
npm run build     # Production build to dist/
npm run lint      # ESLint

No other services needed for the frontend — just Cambium running on :8080.

## Environment

VITE_CAMBIUM_URL=  # empty = use Vite proxy; set to full URL for production

## Architecture

SPA: Vite + React 18 + TypeScript + React Router v7.
Auth: JWT access token in-memory (module variable), refresh token in httpOnly cookie.
      On every page load, POST /auth/refresh runs before the app renders.
Server state: TanStack Query v5.
Styling: CSS custom properties (src/styles/tokens.css).
Tables: TanStack Table v8.
Drag and drop: Pragmatic Drag and Drop (not @dnd-kit).

## Invariants — never violate

- **The frontend calls Cambium, never Rhizome directly.** All endpoints are under
  Cambium's /api/v1 or /auth. There is no direct Rhizome URL in this repo.
- **Never use EventSource for SSE.** Chat streaming uses fetch + ReadableStream
  because Cambium requires Authorization: Bearer in the header.
- **Token in Authorization header, never in query params.** JWT in a URL
  leaks in browser history, server logs, and Referer headers.
- **apiFetch handles 401.** All API calls go through src/lib/api/client.ts.
  Never call fetch() directly in page components.
- **No inline styles for tokens.** Use CSS custom properties. Don't hardcode
  color values in components — reference var(--chartreuse) etc.
- **Port the design, don't restyle.** Tokens and font choices come from the
  prototype. Changes to the visual language need explicit sign-off.
- **Access token is in-memory only.** Never write it to localStorage,
  sessionStorage, or any cookie. It lives in a module variable in client.ts.

## Key files

src/styles/tokens.css          — ALL design tokens (both themes). Single source of truth.
src/lib/api/client.ts          — Base fetch wrapper, in-memory token, 401 handling, refresh retry.
src/lib/auth/context.tsx       — AuthContext, useAuth hook.
src/lib/sse/stream.ts          — consumeSSEStream() async generator.
src/routes/router.tsx          — All routes.
src/routes/ProtectedRoute.tsx  — Auth guard.
docs/                          — Architecture decisions and page design docs.
```
