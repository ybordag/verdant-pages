# Verdant Pages Documentation

## Overview
- [Purpose and Design](overview/purpose.md) — what it is, where it fits, design principles

## Getting Started
- [Setup](getting-started/setup.md) — prerequisites, install, dev server, tests

## Architecture
- [Tech Stack](architecture/tech-stack.md) — Vite, React, TypeScript, Router, TanStack Query — decisions and rationale
- [Design Tokens & Theming](architecture/design-tokens.md) — CSS custom properties, light/dark system, fonts
- [Component Library](architecture/components.md) — primitives, composed components, layout, styling approach
- [API Client & Types](architecture/api-client.md) — base fetch wrapper, TypeScript types, page→endpoint mapping
- [Auth & Session](architecture/auth.md) — in-memory token, httpOnly refresh cookie, login/register
- [SSE & Agent Chat](architecture/sse-streaming.md) — fetch + ReadableStream, async generator, component implications
- [Routes](architecture/routes.md) — full route structure
- [Notifications](architecture/notifications.md) — real-time notification SSE, bell, job progress, alerts
- [Known API Gaps](architecture/api-gaps.md) — gaps against the Cambium API, GitHub issue links

## Page Design
- [Daily Driver](pages/01-daily-driver.md) — Today, Tasks, Calendar
- [Garden Hub](pages/02-garden.md) — overview, map, profile, constraints, object tabs
- [Garden Objects](pages/03-garden-objects.md) — Plants, Beds, Containers — shared patterns
- [Projects](pages/04-projects.md) — Projects, Proposals, planning and execution modes
- [Agent](pages/05-agent.md) — Rhizome chat, Interactions & Approvals
- [Incidents](pages/06-incidents.md) — Incidents, Treatment Plans
- [Activity](pages/07-activity.md) — global activity feed, per-object history
- [Account](pages/08-account.md) — settings, provider keys

## Development
- [Testing Guide](development/testing.md) — Vitest + Playwright, patterns, what to test per phase

## Build Phases
- [Build Phases](architecture/build-phases.md) — full 8-phase implementation plan with deliverables

## Roadmap
- [Roadmap Overview](roadmap/overview.md) — phase status, what's done, what's next

## Current Work
- [Phase 1: Scaffold](current_work/phase1_scaffold.md) — what was built, decisions made, test coverage

## Design Assets
- [Design files and mockups](design/) — visual reference, mockups by viewport
