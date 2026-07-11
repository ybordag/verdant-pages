# Current Status

**Last verified:** 2026-07-10

This is the live checkpoint for Verdant Pages. Update it whenever the active
slice, branch, blocker state, or quality-gate result changes. Stable repository
rules belong in [`CLAUDE.md`](../../CLAUDE.md); long-term sequencing belongs in
the [roadmap](../roadmap/overview.md).

## Active work

| Item | Current state |
|---|---|
| Active phase | Phase 5b - Rhizome foundation stabilization and closeout |
| Branch | `red-maple` |
| Remote state | Local documentation commits are ahead of the last audited remote state |
| Previous phase | Phase 5a Activity foundation - implemented and merged |

## What is implemented

- Authentication, protected/public routes, refresh-token session restoration,
  theme state, app shell, offline banner, and generic toasts.
- Fifteen structured domain API modules plus chat/SSE support. Media remains
  intentionally absent until the backend media contract exists.
- Activity page with real data, themed filters/date controls, validation,
  error/empty states, and cursor-based infinite scrolling.
- Rhizome thread home, recent threads, thread navigation, first-message thread
  creation, streaming responses, Markdown rendering, retry banner, structured
  startup/session context, pinned context, context autocomplete, first-pass
  interaction review/resume, and responsive light drawers.
- Mocked browser coverage for the principal Activity and Rhizome flows, plus an
  opt-in/live backend path for selected integration checks.

Most other product routes are registered but still render placeholders.

## Phase 5b closeout priorities

The documentation truth pass is complete: current status, roadmap/history,
capability readiness, page-spec status, architecture references, setup modes,
contribution guidance, glossary, and documentation ownership are aligned.

Next:

1. Re-run and restore green lint, unit, and browser quality gates.
2. Break the large `RhizomePage` and stylesheet into bounded feature components
   and hooks without changing accepted behavior.
3. Represent session focus as natural-language intent plus zero-to-many stable
   object references, matching the current Rhizome/Cambium contract.
4. Recheck model/provider editing now that Cambium profile updates are built.
5. Complete a focused live-stack smoke for create thread -> set context ->
   stream -> review/resume -> switch/reload.
6. Re-audit the quality table below after stabilization and prepare merge readiness.

## Quality gates at the latest audit

| Check | Result | Follow-up |
|---|---|---|
| `npm run build` | Pass | Production bundle builds successfully |
| `npm run lint` | Fail: 2 errors | State updates inside effects in `RhizomePage.tsx` |
| `npm run test:run` | 386/389 pass | One stale nav-badge assertion; two date-dependent Activity tests |
| `npm run test:e2e` | 31 pass, 1 fail, 1 skipped | Activity date test is fixed to June 2026 |

Do not copy these counts into other documents. Replace this table when the
stabilization pass changes the result.

## Backend compatibility

| Service | Audited branch | Relevant capability |
|---|---|---|
| Cambium | `phelloderm` | Structured thread session context, profile/model updates, password changes, notifications, and static SPA serving are built |
| Rhizome | `ranunculus` | Deterministic structured focus/session context and detailed object rendering are built |

The remaining intentional backend deferrals are media/image attachments and
advanced garden spatial layout. Neither blocks the current core product phases.

## Next planned product work

After Phase 5b closes:

1. Phase 5c - garden-profile onboarding and a thin real Today page.
2. Phase 5d - richer Rhizome context, reviews, alerts, and object inspection.
3. Phase 5e - incidents and treatment-plan workflows.
4. Phase 5f - complete daily-loop integration and hardening.

See the [roadmap](../roadmap/overview.md) for later Tasks, Calendar, Garden,
Plants, Projects, Settings, notifications, and production work.
