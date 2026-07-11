# Capability Matrix

**Last verified:** 2026-07-10

This is the cross-repository readiness map for Verdant Pages. It answers a
different question from the roadmap: not *when will we build this?*, but *which
layers exist today?* Verify exact schemas in Cambium Swagger and Rhizome's API
reference before implementation.

| Capability | Verdant UI | Verdant client | Cambium/Rhizome | Notes |
|---|---|---|---|---|
| Login, registration, session refresh | Built | Built | Ready | Garden onboarding is not part of registration yet |
| Garden-profile onboarding/enrichment | Planned | Profile update built; enrichment wrapper pending | Profile exists; location enrichment must be verified | Phase 5c |
| Activity history | Built | Built | Ready | Global feed and object feeds available |
| Rhizome thread home/history | Built | Built | Ready | Phase 5b stabilization remains |
| Streaming chat and resume | Built | Built | Ready | SSE through Cambium |
| Structured session context | Partial | Built | Ready | UI must support multiple focus references everywhere |
| Pinned thread context | Built | Built | Ready | Stable object references |
| Message-only context | UI only | Not in stream request | Contract pending | Must not be represented as persisted/pinned |
| Unified object search | Built in Rhizome UI | Built | Ready | Structured search; deeper ranked full text remains future |
| Interaction review | Partial | Built | Ready | First active interaction works; richer variants/queue remain |
| Alerts/context inspector drawer | Planned | Alerts client built | Ready for alerts; inspector composition is frontend work | Phase 5d |
| Today briefing | Planned placeholder | Built dependencies | Ready | Weather, triage, tasks, projects, interactions |
| Tasks and task series | Planned placeholders | Built | Ready | Phase 6 |
| Calendar annotations/scheduling | Planned placeholder | Built | Ready | Phase 6; DnD library not installed yet |
| Incidents/treatment plans | Planned placeholders | Built | Ready | Media excluded |
| Garden profile/beds/containers | Planned placeholders | Built | Ready | Spatial layout deferred |
| Plants and batches | Planned placeholders | Built | Ready | Media excluded |
| Projects/proposals/resources | Planned placeholders | Built | Ready | Advanced UI is substantial Phase 8 work |
| Settings: provider/model/password | Planned placeholder | Auth wrappers incomplete | Cambium ready | Add profile/password wrappers in Phase 9 or earlier as needed |
| Provider keys | Planned placeholder | Wrapper pending | Cambium ready | Keys are write-only; status is boolean |
| Notifications/job progress | Shell only | Built | Ready | Frontend stream/reconnect/presentation remains |
| Static production serving | Build output only | N/A | Cambium ready | Deployment integration remains |
| Media/image attachments | Not built | Not built | Stub/501 | Post-V1, blocked on backend media work |
| Advanced spatial garden map | Not built | Not built | Not started | Post-V1 |
| Visual garden understanding | Not built | Not built | Planned in Rhizome | Post-V1 |

## Status meanings

- **Built:** Present in the current frontend and covered at an appropriate level.
- **Partial:** A usable first pass exists but the documented contract or final
  interaction model is not complete.
- **Planned placeholder:** The route exists but does not yet implement the page.
- **Shell only:** Layout/control exists without real domain content.
- **Ready:** Required structured backend capability exists.
- **Contract pending:** The intended frontend behavior cannot be represented
  honestly by the current API.
