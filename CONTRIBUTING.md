# Contributing To Verdant Pages

## Start Here

1. Read [current status](docs/status/current.md) and the [roadmap](docs/roadmap/overview.md).
2. Read the relevant [page spec](docs/pages/) and [capability matrix](docs/capabilities.md).
3. Use the [codebase tour](docs/architecture/codebase-tour.md) to find the owning module.
4. For a complex route, read [frontend structure](docs/architecture/frontend-structure.md).
5. Run the smallest setup mode that can prove the change.

Repository-wide coding-agent invariants are in [CLAUDE.md](CLAUDE.md). Product terms are in the [glossary](docs/glossary.md).

## Local Setup

```bash
nvm use
npm ci
cp .env.example .env
npm run dev
```

See [frontend setup](docs/getting-started/setup.md) and [full-stack development](docs/getting-started/full-stack.md).

## Branches And Commits

Verdant branches use tree names. Phase sub-branches may use species names when that helps keep review scope small.

- Keep commits scoped to a coherent, testable slice.
- Do not mix unrelated formatting or generated churn into a feature commit.
- Preserve user work in a dirty tree; never discard changes you did not create.
- Include docs in the same slice when behavior or status changes.

## Implementation Workflow

1. Confirm current behavior in source and tests.
2. Confirm backend capability in Cambium/Rhizome when the change crosses the API boundary.
3. Implement with existing tokens, primitives, and API modules.
4. Keep route pages as composition roots and move cohesive workflow behavior into feature modules when complexity warrants it.
5. Cover loading, empty, populated, error, disabled, and race states that apply.
6. Verify light/dark and desktop/narrow layouts for user-facing changes.
7. Update current status, page specs, capability matrix, or API catalog where needed.

Do not build speculative frontend wrappers for backend routes that do not exist. Open or update the appropriate backend issue with a concrete request/response contract.

## Tests And Checks

Use the smallest test that proves the behavior, then run the repository checks before review:

```bash
npm run test:run
npm run lint
npm run build
```

Run relevant Playwright specs for route-level workflows:

```bash
npm run test:e2e
```

Live-stack verification is required when behavior depends on a changed Cambium or Rhizome contract. Mocked browser tests remain valuable for deterministic UI states and races.

See [testing](docs/development/testing.md).

## Documentation Responsibilities

- `docs/status/current.md`: current checkpoint, priorities, known quality state.
- `docs/roadmap/overview.md`: future sequence and acceptance outcomes.
- `docs/roadmap/history.md`: completed milestone record.
- `docs/pages/`: intended page behavior, not a duplicate backend-status ledger.
- `docs/pages/_template.md`: required concerns for a new or materially redesigned page spec.
- `docs/capabilities.md`: cross-repo readiness at a glance.
- `docs/development/deferred-work.md`: intentionally postponed work with a re-enable condition.

Architecture docs describe what exists. Design patterns clearly label proposals. Remove stale statements rather than layering corrections below them.

## Pull Request Checklist

- Requested behavior is complete and scoped.
- Relevant tests pass and new regressions are covered.
- Build and lint pass.
- Accessibility and responsive behavior were checked.
- Live contract was verified when applicable.
- Documentation reflects both current state and future plan.
- Deferred work has a reason and explicit trigger.
