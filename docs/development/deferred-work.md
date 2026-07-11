# Deferred Work

**Last reviewed:** 2026-07-10

This file records intentional deferrals with a reason and re-enable condition. Bugs, failing tests, and active stabilization work are not deferrals; they belong in [current status](../status/current.md).

## Current Deferrals

| Work | Why deferred | Re-enable when |
|---|---|---|
| Media/image upload and galleries | Rhizome/Cambium media contract is not available | Backend exposes a structured, secured media lifecycle |
| Advanced spatial garden map | Domain layout model/routes are not ready and do not block core garden records | Backend layout contract is designed and the list/profile garden workflows are stable |
| Visual identification/vision workflow | Depends on media plus a vision pipeline | Media contract and async vision behavior are implemented |
| RAG, external web grounding, iNaturalist | Intelligence/sensing initiatives outside core V1 UI | Rhizome exposes supported structured capabilities and product priority warrants UI |
| Drag-and-drop library selection | Calendar and project planning interactions are not implemented | Phase 6 Calendar or Phase 8 planning begins; evaluate a maintained library then |
| Enforced coverage thresholds | Current stabilization needs a truthful baseline and CI first | Phase 5f adds report-only coverage and CI; set thresholds after baseline review |
| Screenshot regression baselines | UI is still changing and no baseline review policy exists | Phase 5f defines ownership/update policy and captures core light/dark widths |
| Broader Playwright browser/device matrix | Current default is Desktop Chromium for iteration speed | Phase 5f adds at least mobile plus one non-Chromium core path |
| Required live full-stack E2E job | Local service/provider state is not yet deterministic enough for a default job | Seeded service orchestration exists and can own lifecycle/cleanup |
| Notification drawer content and reconnecting stream UI | Sequenced after core daily workflows; backend support exists | Phase 9 settings/notifications begins |
| Full Settings UI | Client wrappers and page workflow remain future frontend work; backend support exists | Phase 9, or earlier if model/provider editing blocks Rhizome closeout |

## Intentionally Absent Contracts

These are design decisions, not deferred work:

- Do not add `getTriageRecommendations`; use `getLatestTriage()`.
- Do not parse `ThreadView.session_context` for display/edit; use the dedicated session-context endpoint.
- Do not call Rhizome directly from the browser.

## Removing A Deferral

When work resumes:

1. move delivery details into the active roadmap phase/current status;
2. implement and test the behavior;
3. delete the deferral entry rather than marking it done forever;
4. record the completed milestone in roadmap history when appropriate.
