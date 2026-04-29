# Verdant Pages

Verdant Pages is the frontend application for Rhizome.

This repository is where the UI and client-side product experience will live.
Rhizome remains the backend/domain engine in a separate repository and is
responsible for planning, task tracking, triage, incidents, weather-aware task
updates, and structured interaction handling.

## Purpose

This repo will provide the app-facing experience for:

- daily triage and garden dashboard views
- pending approvals and structured interaction cards
- task lists, task details, and task actions
- incidents and treatment plan reviews
- weather snapshots and weather-driven task-change reviews
- project proposal browsing and review
- image/media upload flows for future visual-garden-understanding work

## Relationship to Rhizome

Verdant Pages should talk to Rhizome over a formal HTTP/JSON API.

Rhizome owns:

- planner, tracker, triage, weather, and incident logic
- database schema and persistence
- authentication/session backend
- structured DTOs and interaction payloads
- media asset ingestion/storage contract

Verdant Pages owns:

- login and app shell UX
- dashboard and navigation
- rendering of triage, tasks, proposals, treatment plans, and weather reviews
- interaction-resolution UI
- media upload and display UX

## Initial product direction

The first UI slice should focus on core operations:

1. login/session
2. startup triage
3. pending interactions
4. task list/detail/action flows
5. incidents and treatment-plan review
6. weather snapshot and weather-change review

Proposal UI is part of the broader Epic 9 scope, but it can follow shortly
after the core operations slice is stable.

## Recommended frontend approach

Current assumption:

- React-based frontend
- web-first delivery target
- architecture that can later support desktop/mobile packaging if needed

The backend contract should be stable enough that the UI does not depend on
CLI-formatted strings or Python internals from the Rhizome repo.

## Repo structure

This repo is intentionally lightweight right now. The initial structure is:

- `README.md`
- `docs/design/ui_design.md`

As implementation begins, we should add:

- app shell and route structure
- API client layer
- feature modules for triage, tasks, interactions, incidents, and weather
- upload/media support
- test setup

## Related docs

- Rhizome Epic 9 plan:
  - `/Users/yashi/Documents/Work/Code/Gardening Agent/rhizome/docs/roadmap/epic_09_app_frontend_experience.md`
- Rhizome long-term roadmap:
  - `/Users/yashi/Documents/Work/Code/Gardening Agent/rhizome/docs/roadmap/long_term_roadmap.md`

## Next steps

1. scaffold the frontend app shell
2. define the API client boundary against Rhizome
3. build the startup triage + pending interaction dashboard
4. build task and treatment-plan review flows
5. add media upload support ahead of visual-garden-understanding work
