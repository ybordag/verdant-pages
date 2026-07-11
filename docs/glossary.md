# Glossary

**Last reviewed:** 2026-07-10

| Term | Meaning in Verdant Pages |
|---|---|
| **Verdant Pages / Verdant** | The React frontend and primary user-facing gardening workspace |
| **Cambium** | Go gateway that owns authentication, the public/versioned API, and proxying to Rhizome |
| **Rhizome** | Python agent and gardening-domain service that owns reasoning, tools, persistence, and internal APIs |
| **Fairlead** | Optional inference router behind Rhizome; never called by Verdant |
| **Garden profile** | User-scoped garden identity and environmental baseline, created during planned onboarding |
| **Garden object** | A plant, batch, bed, container, project, task, incident, or other addressable domain record |
| **Thread** | A durable Rhizome conversation with messages and session context |
| **Session context** | Thread-level `time_text`, `energy_text`, `focus_text`, and stable focus object references |
| **Focus** | A natural-language statement describing the thread's intended goal, optionally anchored to zero or more objects |
| **Pinned context** | Object references available to Rhizome on every turn in a thread until removed |
| **Message context** | Object references attached to one outgoing user message only |
| **Context reference** | Stable `{ subject_type, subject_id }` identity passed instead of relying on model name matching |
| **Interaction** | A structured pending user decision emitted by Rhizome, such as reviewing proposed changes |
| **Review / approval** | The Verdant UI that presents and resolves a structured interaction |
| **Alert** | A monitor-generated informational or warning signal; not inherently an approval or incident |
| **Incident** | A persisted garden problem with affected subjects and optional treatment planning |
| **Triage** | Rhizome's structured prioritization output grouped into urgent, routine, and project work |
| **Today shortlist** | Compact tasks presented for immediate orientation; not a replacement for the full Tasks page |
| **Activity** | Chronological structured record of domain changes and actions |
| **Batch** | A group of related plants created/acquired together and tracked as a unit where useful |
| **Care state** | Current care-related timestamps/state for a plant, bed, or container |
| **API module** | A React-independent typed client file in `src/lib/api/` that calls Cambium |
| **Page spec** | Intended UX and acceptance behavior for a route group; current readiness lives elsewhere |
| **Fixture** | Deterministic test data scoped to a known user and removable before production |
| **Live test** | A test against running Cambium/Rhizome and possibly a real provider, rather than mocked routes |
