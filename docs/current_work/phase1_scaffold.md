# Phase 1: Scaffold + Build Tooling

**Branch:** `willow`  
**Status:** Complete  
**Last updated:** 2026-06-19

---

## Summary

Phase 1 establishes the entire build toolchain for Verdant Pages: Vite, TypeScript, React, the core npm dependencies, a Cambium proxy, a linting baseline, and the test infrastructure. No application UI was built — the app renders `<div>Verdant Pages</div>`. Everything from Phase 2 onwards builds on this foundation.

---

## What was built

### Vite scaffold

- `vite.config.ts` — Vite 8, `@vitejs/plugin-react`
- `index.html` — entry point
- `src/main.tsx` — React 19 root render
- `src/App.tsx` — minimal: `<div>Verdant Pages</div>`

### Proxy configuration

`vite.config.ts` proxies `/api` and `/auth` to `http://localhost:8080` (Cambium). In the browser, all API calls are same-origin — no CORS issues and no need to pass a base URL in development.

### TypeScript

`tsconfig.app.json` — strict mode enabled, `@/` path alias resolves to `src/`. TypeScript 6 — `paths` works without `baseUrl`.

### Dependencies installed

**Runtime:**
- `react` + `react-dom` ^19.2
- `react-router-dom` ^6 — client-side routing
- `@tanstack/react-query` v5 — server state management
- `@tanstack/react-table` v8 — headless table for ledger views

**Dev:**
- `vite`, `@vitejs/plugin-react`, `typescript`, `eslint`, `prettier`

### Tooling config

- `.prettierrc` — `semi: false`, `singleQuote: true`, `trailingComma: all`, `printWidth: 100`
- `eslint.config.js` — React + TypeScript rules
- `.env.example` — `VITE_CAMBIUM_URL=` (empty = use proxy in dev)
- `.nvmrc` — `24` (Node 24 LTS "Krypton")

### Directory structure

Empty directories created for subsequent phases:
```
src/
  components/     ← Phase 3 primitives
  lib/
    api/          ← Phase 4 API modules
    auth/         ← Phase 4 AuthContext
    query/        ← Phase 4 QueryClient
    sse/          ← Phase 4/6 SSE consumer
  pages/          ← Phase 3+ page components
  routes/         ← Phase 3 router
  styles/         ← Phase 2 tokens, global, utilities
  test/           ← test setup (setup.ts)
```

### Test infrastructure

- **Vitest** — unit and component tests, jsdom environment, globals enabled
- **@testing-library/react** + **jest-dom** + **user-event**
- **Playwright** — E2E tests against Chromium
- `src/test/setup.ts` — imports `@testing-library/jest-dom`
- Vitest scoped to `src/**/*.test.{ts,tsx}` — does not pick up Playwright specs

---

## Tests written

### Unit: `src/App.test.tsx`

```
✅ App — renders without crashing
```

Renders `<App />` in jsdom, asserts "Verdant Pages" is in the document. Confirms React mounts cleanly and the component tree has no broken imports.

### E2E: `e2e/smoke.spec.ts`

```
✅ app loads
```

Playwright opens `http://localhost:5173/`, asserts "Verdant Pages" is visible. Confirms Vite serves the app and the browser renders the React root.

---

## Decisions made

**Node 24, not 20.** Vite 8 requires Node ≥ 20.19. Node 20 hit EOL in April 2026. Node 24.17.0 is the current LTS. `.nvmrc` pins to `24`.

**React 19, not 18.** The Vite scaffold default in mid-2026 is React 19. All planned features (TanStack Query, React Router, Pragmatic DnD) are compatible. Architecture docs reference React 18 but React 19 is a strict superset for our use case.

**No globals for Vitest — actually, globals enabled.** `globals: true` in the Vitest config means `describe`, `it`, `expect`, `vi` are available in test files without imports. `vitest/globals` type added to `tsconfig.app.json` to satisfy TypeScript.

**Vitest include scoped explicitly.** Without `include: ['src/**/*.test.{ts,tsx}']`, Vitest picked up the Playwright spec files and errored. Explicit include is cleaner than relying on excludes.

---

## Smoke test results

```
npm run test:run   → 1 passed (App renders)
npm run test:e2e   → 1 passed (app loads)
npm run build      → ✓ built in ~280ms, 0 errors
```

---

## What Phase 2 needs from this

Phase 2 (tokens + theme) writes into `src/styles/` and wraps `App.tsx` in `ThemeProvider`. Everything it needs is in place: the styles directory exists, the App entry point is minimal and easy to wrap, and the test setup is ready for ThemeProvider tests.
