# Open Questions

Decisions needed before implementation begins. Most are blockers for Phase 4 (auth) or later.

## Auth

**Q1 — Public registration.**
Is `POST /auth/register` open to anyone, or is this effectively a single-user app? This affects whether we show a "Create account" link on the login page or gate registration behind an invite.

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

**Q6 — Production deploy target.**
Where will the built frontend be served?
- Static hosting (Vercel, Netlify, Cloudflare Pages)
- Served by Cambium itself (Go static file handler)
- Other

This affects how `VITE_CAMBIUM_URL` is set and whether CORS needs configuring.
