# Open Questions

Decisions needed before implementation begins. Most are blockers for Phase 4 (auth) or later.

## Auth

**Q1 — Public registration.** ✅ RESOLVED
Registration is public for now. Very few people know about the project, so obscurity acts as a natural gate. Show "Create account" link on the login page. Revisit if the project becomes more public.

## Streaming / RhizomePage

**Q2 — SSE event types.**
The CLAUDE.md documents three event types: `{ type: "token" }`, `{ type: "interaction" }`, `{ type: "done" }`. Are there others? Specifically:
- Is there an error event (e.g. `{ type: "error", message: "..." }`)?
- Is there a confirmation/interrupt event separate from `interaction`?

**Q3 — Resume vs. resolve interaction.**
When the user accepts a proposal card in RhizomePage, should the frontend call:
- (a) `POST /api/v1/chat/resume/stream` (resumes the LangGraph checkpoint), or
- (b) `POST /api/v1/interactions/{id}/resolve` (resolves the interaction record)?

Option (a) resumes the paused agent graph. Option (b) is for interactions not tied to an active conversation. Confirm (a) is correct for the chat proposal flow.

**Q4 — Thread UX on first open.**
When the user navigates to `/app/rhizome` for the first time:
- (a) Auto-create a new thread and start a fresh conversation, or
- (b) Show a thread list/picker so the user selects or creates one?

## Build / Deploy

**Q5 — Cambium local URL.**
Vite proxy will forward `/api` and `/auth` to Cambium. Assumed `http://localhost:8080` from Cambium CLAUDE.md — please confirm.

**Q6 — Production deploy target.** ✅ RESOLVED
Served on **spark-thor** (DGX Spark hardware). Cambium serves the built static files directly — a Go static file handler for all non-API routes, serving `index.html` for any unknown path (client-side routing). No nginx, no second service.

Implications:
- `VITE_CAMBIUM_URL` stays empty in production (same-origin, no CORS needed)
- `npm run build` produces `dist/` — Cambium must be configured to serve from that path
- A `Dockerfile` for verdant-pages (or a build step in the Cambium Dockerfile) handles the build
- See build-phases.md Phase 8 for the deploy steps
