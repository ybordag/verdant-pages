# Purpose And Product Boundaries

**Last reviewed:** 2026-07-10

## What Verdant Pages Is

Verdant Pages is the browser frontend for the Gardening Agent system. It is the primary surface for daily orientation, garden records, tasks, projects, incidents, Rhizome conversations, and structured reviews.

The intended product is a calm gardening journal combined with an operational workspace: users should be able to understand what matters today, act on it, and see the resulting garden state without learning backend concepts.

## System Boundary

```text
Browser
  -> Verdant Pages (React SPA)
  -> Cambium (Go gateway: auth and versioned API)
  -> Rhizome (Python: agent, domain logic, persistence)
  -> model providers / Fairlead where configured
```

Verdant talks only to Cambium. It does not import Rhizome internals or access its database. Cambium is the frontend's network boundary; Rhizome remains the source of gardening-domain behavior.

## Product Loop

The final experience is organized around a repeatable loop:

1. create an account and establish a usable garden profile;
2. orient with weather, triage, and today's work;
3. inspect or update garden objects;
4. ask Rhizome for planning, diagnosis, or prioritization;
5. review structured proposed actions;
6. complete work and see activity/history update.

The [roadmap](../roadmap/overview.md) sequences the remaining work toward this loop. [Current status](../status/current.md) records what is actually implemented now.

## Design And Engineering Principles

1. **The app is the product.** Optimize for understandable workflows and honest state, not backend convenience.
2. **Structured data over prose parsing.** Use typed views and stable object references whenever the backend supports them.
3. **One gateway boundary.** All browser network calls go through Cambium.
4. **Secure session defaults.** Access tokens remain in memory; refresh tokens remain in Cambium-owned httpOnly cookies.
5. **Durable routes for durable work.** Objects and editing workflows need linkable routes. Temporary thread, context, and review panels are acceptable when they support a current workspace and collapse cleanly.
6. **Server state has one owner.** TanStack Query owns remote state and invalidation; local state owns temporary presentation only.
7. **Optimism must be reversible.** Optimistic mutations need rollback, duplicate suppression, and tests.
8. **Accessibility and responsive behavior are completion criteria.** They are not polish deferred until production.
9. **Current facts and future design stay separate.** Status belongs in `docs/status/`; intended behavior belongs in page and design specs.

## Ownership

Verdant owns:

- public, login, registration, and future onboarding UI;
- authenticated shell and navigation;
- page layouts, interactions, and responsive behavior;
- rendering structured domain views and review actions;
- Rhizome threads, streams, context selection, and composer behavior;
- frontend loading, empty, error, and offline states.

Verdant does not own:

- token issuance or refresh-cookie policy;
- gardening-domain rules and persistence;
- agent graph and tool behavior;
- inference routing;
- background monitoring jobs.

## Intended User

The core persona is a primary gardener managing a personal garden with limited time and attention. Authentication and user isolation exist across the stack, so documentation and code must not assume one global database user. Product design may remain optimized for one gardener's workspace rather than organization/team administration.
