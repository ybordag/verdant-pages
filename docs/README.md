# Verdant Pages Documentation

**Last reviewed:** 2026-07-10

Verdant Pages is the React frontend for the Gardening Agent system. It calls Cambium and never calls Rhizome directly.

## Start Here

### New developer

1. [Purpose and boundaries](overview/purpose.md)
2. [Quickstart](getting-started/quickstart.md)
3. [Codebase tour](architecture/codebase-tour.md)
4. [Current status](status/current.md)
5. The relevant [page spec](pages/) and [capability matrix](capabilities.md)
6. [Contributing](../CONTRIBUTING.md)

### Coding agent or returning contributor

1. [Current status](status/current.md)
2. [Roadmap](roadmap/overview.md)
3. Root [coding-agent guide](../CLAUDE.md)
4. Relevant page, architecture, and test docs

### First full-stack run

1. [Frontend setup](getting-started/setup.md)
2. [Full-stack development](getting-started/full-stack.md)
3. [Testing](development/testing.md)

## Source Of Truth

| Question | Source |
|---|---|
| What is being worked on now? | [Current status](status/current.md) |
| What comes next? | [Roadmap](roadmap/overview.md) |
| What already shipped? | [Roadmap history](roadmap/history.md) |
| What should a page ultimately do? | [Page specs](pages/) |
| Is the frontend/backend capability ready? | [Capability matrix](capabilities.md) |
| How does current code work? | [Architecture](architecture/) plus source/tests |
| What is intentionally postponed? | [Deferred work](development/deferred-work.md) |
| What does a product term mean? | [Glossary](glossary.md) |

Do not duplicate live branch names, test counts, or blocker status outside `status/current.md`. Page specs describe intended UX and include only a small readiness block. Architecture docs describe current implementation; proposed patterns identify themselves as proposals.

## Documentation Map

### Overview

- [Purpose and product boundaries](overview/purpose.md)
- [Capability matrix](capabilities.md)
- [Glossary](glossary.md)

### Getting Started

- [Quickstart](getting-started/quickstart.md)
- [Frontend setup](getting-started/setup.md)
- [Full-stack local development](getting-started/full-stack.md)

### Architecture

- [Codebase tour](architecture/codebase-tour.md)
- [Tech stack](architecture/tech-stack.md)
- [Route structure](architecture/routes.md)
- [Component architecture](architecture/components.md)
- [Design tokens and theming](architecture/design-tokens.md)
- [API client architecture](architecture/api-client.md)
- [API module catalog](architecture/api-modules.md)
- [Authentication and session](architecture/auth.md)
- [SSE and agent streaming](architecture/sse-streaming.md)
- [Notifications](architecture/notifications.md)

### Product And Page Specs

- [Onboarding](pages/00-onboarding.md)
- [Today, Tasks, Calendar](pages/01-daily-driver.md)
- [Garden hub](pages/02-garden.md)
- [Plants, beds, containers](pages/03-garden-objects.md)
- [Projects](pages/04-projects.md)
- [Rhizome](pages/05-agent.md)
- [Incidents](pages/06-incidents.md)
- [Activity](pages/07-activity.md)
- [Account and settings](pages/08-account.md)

### Design

- [Visual identity](design/visual-identity.md)
- [Product UI patterns](design/patterns.md)
- [Static mockup reference](design/mockups/README.md)

### Development

- [Testing](development/testing.md)
- [Error handling](development/error-handling.md)
- [Deferred work](development/deferred-work.md)
- [Contribution workflow](../CONTRIBUTING.md)

### Planning

- [Current status](status/current.md)
- [Roadmap](roadmap/overview.md)
- [Completed history](roadmap/history.md)

## Maintenance Rules

- Use `Last verified` for factual implementation/runbook references and recheck them against source.
- Use `Last reviewed` for product/design guidance that was reconsidered but is not mechanically verifiable.
- Update behavior docs in the same change as behavior.
- Remove resolved deferrals and stale blocker prose rather than appending a correction.
- Link backend issues only while they remain useful active dependencies; the capability matrix should explain the product impact.
- Keep docs readable: split a file when it answers multiple unrelated questions, not merely because it passes an arbitrary line count.
- Run the local-link check or otherwise verify changed Markdown links before committing.
