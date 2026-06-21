# Verdant Pages — Documentation

**Last updated:** 2026-06-21

Frontend for the Gardening Agent system. Talks to **Cambium** (Go gateway) — never directly to Rhizome. This file is both the index and the explanation of how this `docs/` tree is organized — read the "How these docs are organized" section once, then use the tables below as a reference.

Read in order if you're new here: [overview/purpose.md](overview/purpose.md) → [getting-started/quickstart.md](getting-started/quickstart.md) → [architecture/](architecture/) for how it's built → [pages/](pages/) for what each screen does → [roadmap/overview.md](roadmap/overview.md) for what's done and what's next. By the end of that path you should understand the whole repo without reading code.

---

## How these docs are organized

**Folders, by what they answer:**

| Folder | Answers | Lifecycle |
|---|---|---|
| `overview/` | What is this thing and why does it exist? | Written once, rarely changes |
| `getting-started/` | How do I run this locally? | Updated when commands/setup steps change |
| `architecture/` | How is it built, and why this way and not another way? | Living — updated as decisions are made or revised |
| `pages/` | What does each page do, look like, and call? | Living — written ahead of implementation, refined as each page actually ships |
| `design/` | What does it look like, and why? | Living for principles/aesthetic; mockups are throwaway prototypes for layouts not yet built |
| `development/` | How do I work on it day-to-day — test it, debug it, know what's intentionally unfinished? | Living |
| `roadmap/` | What's the phase plan, and what's done vs. not? | Updated continuously as work lands, not just at phase boundaries |

There is deliberately no `current_work/` or per-phase history folder. `roadmap/overview.md` carries both the plan *and* the record of what actually shipped (including bugs found and fixed along the way) — one place, kept current, rather than a status table that drifts from a separate frozen history. The root [`/CLAUDE.md`](../CLAUDE.md) is the other living document: it tracks what's being worked on *right now*, in-session, and gets updated continuously rather than only at milestones.

**Conventions used across these docs:**

- **`**Last updated:**` tag** under the H1 on every doc — a quick staleness check. If a doc you're reading is months old and contradicts the code, trust the code and fix the doc.
- **Rationale, not just specification.** Architecture docs explain *why*, not just *what* — e.g. [architecture/tech-stack.md](architecture/tech-stack.md)'s "why not Next.js" section. A doc that only says what to build without why is incomplete.
- **Deferred work is documented, not silent.** Anything intentionally unbuilt or untested — not a bug, a conscious choice — goes in [development/deferred-work.md](development/deferred-work.md) with a re-enable condition. If something looks unfinished and isn't in that doc, it's a real gap worth flagging.
- **GitHub issue links for backend blockers.** Where a frontend feature is blocked on Rhizome or Cambium work, the doc links the issue directly (e.g. `rhizome#120`) rather than describing the blocker in prose that can drift out of sync.
- **No frozen, point-in-time docs living in a "living" folder.** If a doc only made sense before some milestone (a design question, a gap list), it gets resolved into the relevant living doc and deleted once that milestone passes — not left behind to go stale.

---

## Overview

| Document | Contents |
|---|---|
| [Purpose and Design](overview/purpose.md) | What Verdant is, where it fits in the system, design principles, what it owns vs. doesn't |

## Getting Started

| Document | Contents |
|---|---|
| [Quickstart](getting-started/quickstart.md) | Fastest path to a running dev server — four commands |
| [Setup](getting-started/setup.md) | Full walkthrough — prerequisites, environment, running Cambium, tests, troubleshooting |

## Architecture

Technical decisions, constraints, and implementation guides — how the codebase is built and why.

| Document | Contents |
|---|---|
| [Tech Stack](architecture/tech-stack.md) | Vite, React, TypeScript, React Router, TanStack Query — decisions and rationale |
| [Design Tokens & Theming](architecture/design-tokens.md) | CSS custom properties, light/dark system, font loading — the technical reference (exact values) |
| [Component Library](architecture/components.md) | Directory layout, primitives vs composed vs pages, styling approach, DnD, tables |
| [API Client & Types](architecture/api-client.md) | Base fetch wrapper, TypeScript types, page→endpoint mapping |
| [Auth & Session](architecture/auth.md) | In-memory token, httpOnly refresh cookie, login/register screens |
| [SSE & Agent Chat](architecture/sse-streaming.md) | fetch + ReadableStream, async generator, component implications |
| [Routes](architecture/routes.md) | Full route structure including task sub-routes |
| [Notifications](architecture/notifications.md) | Real-time notification SSE stream, bell icon, job progress, alert/interaction push |

## Page Design

UX decisions, layouts, interactions, and navigation for each page group — what every page in the app does, looks like, and calls.

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

## Design

What the app looks like, and why — principles, aesthetic, and where future layouts get prototyped.

| Document | Contents |
|---|---|
| [Visual Identity & Design Principles](design/visual-identity.md) | Design principles, aesthetic, typography/color rules, and the rationale behind the locked tokens |
| [Mockups](design/mockups/README.md) | Where future layouts are prototyped as static HTML — status, what's next, lessons from completed sets |

## Development

| Document | Contents |
|---|---|
| [Testing Guide](development/testing.md) | Vitest + Playwright, patterns, what to test per phase |
| [Error Handling](development/error-handling.md) | Every API error status, network failure, and SSE-drop scenario → exact UI behavior |
| [Deferred Work](development/deferred-work.md) | What's intentionally unbuilt or untested right now, why, and when to revisit |

## Roadmap

| Document | Contents |
|---|---|
| [Roadmap Overview](roadmap/overview.md) | Phase status, what shipped (and what broke along the way), what's next, full build plan per phase |
