# Purpose and Design

## What Verdant Pages is

Verdant Pages is the browser-based frontend for the Gardening Agent system. It is the surface through which a user does everything: reviews their daily triage, acts on tasks, monitors their garden objects, plans projects, chats with Rhizome, and handles pending approvals.

The rest of the system — Rhizome (the agent and domain engine), Cambium (the API gateway), Fairlead (the inference router) — exists to serve this surface. From the user's perspective, Verdant is the product.

---

## Where it fits in the system

```
Browser
  └── Verdant Pages (React SPA)
        └── Cambium :8080  (Go API gateway — auth, versioned JSON API)
              └── Rhizome :8001  (Python — agent, domain logic, Postgres)
                    └── Fairlead  (Rust — inference router, vLLM)
```

Verdant talks **only** to Cambium. It has no awareness of Rhizome internals, LangGraph, SQLAlchemy, or Postgres. The boundary is clean: Verdant is a consumer of a versioned JSON API with well-defined DTOs. Cambium absorbs any Rhizome API changes so Verdant does not need to.

---

## Design principles

**1. The app is the product.** The CLI is a development surface; Verdant is what users actually live in. Every architectural decision in this repo is evaluated against: does it make the app feel fast, honest, and easy to act in?

**2. Fetch is the contract, not the tool name.** All API calls go through `apiFetch` in `src/lib/api/client.ts`. This is not boilerplate — it's the single place where auth headers are attached, 401s are caught and retried, and API errors are surfaced consistently. Nothing calls `fetch()` directly.

**3. Token security is non-negotiable.** The JWT access token lives in a module variable in memory — never in `localStorage`, never in a cookie, never in a URL. It disappears on page reload, which is intentional; `POST /auth/refresh` re-establishes the session silently. This is the only safe approach given the sensitivity of the token.

**4. SSE via fetch, not EventSource.** The agent chat stream requires an `Authorization: Bearer` header. `EventSource` cannot send custom headers. Verdant uses `fetch` + `ReadableStream` for all SSE consumption. This is a firm architectural constraint — never use `EventSource` in this repo.

**5. Pages over drawers.** Creation and editing flows use dedicated routes (`/app/plants/new`, `/app/tasks/:id`). The only drawer in the app is the notification drawer. This keeps the URL honest, makes deep-linking trivial, and avoids the complexity of sheet-state management.

**6. Optimistic mutations with honest rollback.** Completing a task strikes it through immediately. If the server rejects the action, the UI reverts and shows an error. TanStack Query handles this pattern cleanly — don't bypass it with local state.

---

## What Verdant owns

- Login, registration, and session management UI
- App shell: navigation, quick actions, garden profile card, notification drawer
- All page layouts and interactions across 8 page groups
- Rendering of triage, tasks, proposals, treatment plans, and weather reviews
- Interaction-resolution UI (structured approval cards)
- Agent chat thread list, streaming message display, and composer
- Media upload and display flows (future — Phase 7)

## What Verdant does not own

- Auth token issuance — Cambium owns this
- Domain logic — Rhizome owns this
- Persistence — Postgres, owned by Rhizome
- Inference routing — Fairlead owns this
- Background monitoring — Rhizome's `scripts/monitor.py` cron runner

---

## The user

A single user managing a hobby garden. Think: Bay Area Zone 9b, vegetables and flowers, beds and containers, organic-first, limited weekend time. The app is designed around their daily rhythm: morning check-in (Today page), task execution across the week, occasional project planning.

The system is currently single-tenant. Multi-tenancy is on the Rhizome roadmap; the schema is ready but tool queries haven't been hardened yet.
