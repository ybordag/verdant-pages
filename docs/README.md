# Verdant Pages — Documentation

Frontend for the Gardening Agent system. Talks to **Cambium** (Go gateway) — never directly to Rhizome.

---

## Architecture

Technical decisions, constraints, and implementation guides.

| Document | Contents |
|---|---|
| [Tech Stack](architecture/tech-stack.md) | Vite, React, TypeScript, React Router, TanStack Query — decisions and rationale |
| [Design Tokens & Theming](architecture/design-tokens.md) | CSS custom properties, light/dark system, font loading |
| [Component Library](architecture/components.md) | Directory layout, primitives vs composed vs pages, styling approach, DnD, tables |
| [API Client & Types](architecture/api-client.md) | Base fetch wrapper, TypeScript types, page→endpoint mapping |
| [Auth & Session](architecture/auth.md) | In-memory token, httpOnly refresh cookie, login/register screens |
| [SSE & Agent Chat](architecture/sse-streaming.md) | fetch + ReadableStream, async generator, component implications |
| [Routes](architecture/routes.md) | Full route structure including task sub-routes |
| [Build Phases](architecture/build-phases.md) | Phased migration plan — 6 phases from scaffold to SSE |
| [CLAUDE.md Draft](architecture/claude-md.md) | Invariants, build commands, key files — copy to repo root when building |
| [Notifications](architecture/notifications.md) | Real-time notification SSE stream, bell icon, job progress, alert/interaction push |
| [Known API Gaps](architecture/api-gaps.md) | Gaps identified during design, GitHub issue links, blocked features |
| [Open Questions](architecture/open-questions.md) | Decisions needed before implementation begins |

---

## Page Design

UX decisions, layouts, interactions, and navigation for each page group.

| Document | Pages |
|---|---|
| [Daily Driver](pages/01-daily-driver.md) | Today, Tasks, Calendar |
| [Garden Hub](pages/02-garden.md) | Garden overview page — map, profile, constraints, object tabs |
| [Garden Objects](pages/03-garden-objects.md) | Plants list, Plant detail, Bed detail, Container detail — shared pattern |
| [Projects](pages/04-projects.md) | Projects, Proposals, Project tasks |
| [Agent](pages/05-agent.md) | Rhizome chat, Interactions & Approvals |
| [Incidents](pages/06-incidents.md) | Incidents, Treatment Plans |
| [Activity](pages/07-activity.md) | Global activity feed, per-object history |
| [Account](pages/08-account.md) | Settings, Provider keys |

---

## Design Assets

Visual mockups and design reference in [design/](design/).
