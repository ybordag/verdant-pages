# Verdant Pages — Documentation

**Last updated:** 2026-06-20

Frontend for the Gardening Agent system. Talks to **Cambium** (Go gateway) — never directly to Rhizome. This file is both the index and the explanation of how this `docs/` tree is organized — read the "How these docs are organized" section once, then use the tables below as a reference.

---

## How these docs are organized

**Folders, by what they answer:**

| Folder | Answers | Lifecycle |
|---|---|---|
| `overview/` | What is this thing and why does it exist? | Written once, rarely changes |
| `getting-started/` | How do I run this locally? | Updated when commands/setup steps change |
| `architecture/` | How is it built, and why this way and not another way? | Living — updated as decisions are made or revised |
| `pages/` | What does each page do, look like, and call? | Written ahead of implementation, per page group |
| `design/` | What does it look like? (visual reference, mockups) | Source-of-truth assets, rarely edited once locked in |
| `development/` | How do I work on it day-to-day — test it, debug it, know what's intentionally unfinished? | Living |
| `roadmap/` | What's the phase plan, and what's done vs. not? | Updated at the end of every phase |
| `current_work/` | What actually happened during a completed phase — as opposed to what was planned? | Append-only historical record, one file per phase, never edited after the phase closes |

**The roadmap vs. current_work distinction matters:** `roadmap/overview.md` is the plan and current status — it gets edited as phases complete. `current_work/phaseN_*.md` is a record of what was actually built, including decisions made and bugs hit along the way — once a phase closes, its `current_work` doc doesn't change. If you want to know "what's next," read roadmap. If you want to know "why does this component look like this," read the relevant `current_work` doc.

**Conventions used across these docs:**

- **`**Last updated:**` tag** under the H1 on every architecture/development doc — a quick staleness check. If a doc you're reading is months old and contradicts the code, trust the code and fix the doc.
- **Rationale, not just specification.** Architecture docs explain *why*, not just *what* — e.g. [architecture/tech-stack.md](architecture/tech-stack.md)'s "why not Next.js" section. A doc that only says what to build without why is incomplete.
- **Deferred work is documented, not silent.** Anything intentionally unbuilt or untested — not a bug, a conscious choice — goes in [development/deferred-work.md](development/deferred-work.md) with a re-enable condition. If something looks unfinished and isn't in that doc, it's a real gap worth flagging.
- **GitHub issue links for backend blockers.** Where a frontend feature is blocked on Rhizome or Cambium work, the doc links the issue directly (e.g. `rhizome#120`) rather than describing the blocker in prose that can drift out of sync.

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
| [Build Phases](architecture/build-phases.md) | Phased migration plan — 8 phases from scaffold to deploy |
| [CLAUDE.md Draft (historical)](architecture/claude-md.md) | Pre-build draft — superseded by the canonical [`/CLAUDE.md`](../CLAUDE.md), kept for record |
| [Notifications](architecture/notifications.md) | Real-time notification SSE stream, bell icon, job progress, alert/interaction push |
| [Known API Gaps](architecture/api-gaps.md) | Gaps identified during design, GitHub issue links, blocked features |
| [Open Questions](architecture/open-questions.md) | Decisions needed before implementation begins |

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

## Development

| Document | Contents |
|---|---|
| [Testing Guide](development/testing.md) | Vitest + Playwright, patterns, what to test per phase |
| [Error Handling](development/error-handling.md) | Every API error status, network failure, and SSE-drop scenario → exact UI behavior |
| [Deferred Work](development/deferred-work.md) | What's intentionally unbuilt or untested right now, why, and when to revisit |

## Roadmap

| Document | Contents |
|---|---|
| [Roadmap Overview](roadmap/overview.md) | Phase status table, dependency map, what's done, what's next |

## Current Work

Per-phase build records — what was actually built, decisions made, smoke test results. Written once a phase closes; not updated afterward.

| Document | Phase |
|---|---|
| [Phase 1: Scaffold](current_work/phase1_scaffold.md) | Build tooling, project structure |
| [Phase 2: Tokens](current_work/phase2_tokens.md) | Design tokens, theme, fonts |
| [Phase 3: App Shell](current_work/phase3_app_shell.md) | Primitives, nav, router, sidebar widgets |

## Design Assets

Visual mockups and design reference in [design/](design/) — see [ui_design.md](design/ui_design.md) for the design principles behind them.
