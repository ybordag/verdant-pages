# Full-Stack Local Development

**Last verified:** 2026-07-10

This runbook connects Verdant Pages to the sibling Cambium and Rhizome repositories. Their own setup guides remain authoritative for backend-specific configuration.

## Architecture And Ports

```text
Verdant/Vite  http://localhost:5173
Cambium       http://localhost:8080
Rhizome       http://localhost:8001
Postgres      localhost:5432
```

Verdant calls Cambium. Cambium authenticates the user and forwards structured requests to Rhizome. Both backends should use the same Postgres instance but different schemas/driver URL forms.

## First-Time Backend Setup

1. Follow [Cambium setup](../../../cambium/docs/getting-started/setup.md).
2. Follow [Rhizome setup](../../../rhizome/docs/getting-started/setup.md).
3. Create each repo's `.env` from its example.
4. Configure Cambium secrets and its plain `postgresql://` URL.
5. Configure Rhizome's `postgresql+psycopg2://` URL.
6. Configure at least one supported provider for live agent work. Structured CRUD/fixture work may not require a live model.

Never commit provider keys, JWT secrets, encryption keys, or database credentials.

## Start The Stack

From Cambium:

```bash
make setup
make dev-stack-db
```

`make dev-stack-db` starts/waits for the local Postgres container, then runs Rhizome and Cambium together with interleaved logs. Use `Ctrl-C` to stop both foreground servers.

In another terminal, verify:

```bash
cd ../cambium
make stack-health
```

Then start Verdant:

```bash
cd ../verdant-pages
nvm use
npm ci
npm run dev
```

## Migrations

Apply Rhizome migrations from an environment where its Python dependencies and `alembic` are installed:

```bash
cd ../rhizome
conda activate RHIZOME_ENV
make migrate
```

An empty successful return means Alembic reached the current head. If `alembic` is missing, the wrong Python/conda environment is active.

Cambium creates its auth schema on startup; follow Cambium's docs if that behavior changes.

## Accounts And Fixture Data

Verdant does not ship a universal test login. Create an account through `/register`, then obtain that authenticated account's `user_id` from `/auth/session` or browser/network inspection.

Seed deterministic Rhizome records for that exact user:

```bash
cd ../rhizome
conda activate RHIZOME_ENV
make seed-verdant-test USER_ID=<cambium-user-id>
```

Remove only that fixture set before production or when finished:

```bash
make clean-verdant-test USER_ID=<cambium-user-id>
```

Fixture records are user-scoped. Seeding without the matching Cambium user ID will produce an apparently empty frontend because Rhizome correctly isolates users.

## Provider Modes

| Need | Provider required? |
|---|---|
| Login, registration, shell | No |
| Structured garden/task/project API | Usually no |
| Mocked Playwright flows | No |
| Rhizome streaming and agent reasoning | Yes |
| Live triage/drafting/proposal generation | Yes |

Provider selection and keys are backend concerns. Verdant sends supported provider/model preferences through Cambium when that UI is implemented.

## Health And Diagnosis

```bash
curl http://localhost:8001/health
curl http://localhost:8080/health
```

Interpretation:

- Rhizome fails: inspect Python environment, database URL/migrations, and Rhizome logs.
- Rhizome passes but Cambium fails: inspect Cambium `.env`, secrets, database, and Go logs.
- Both pass but Verdant gets 502: confirm Cambium's `RHIZOME_INTERNAL_URL` and inspect the specific proxied route.
- Login works but data is empty: confirm fixture/user ownership and the database used by the running Rhizome process.
- Structured calls work but chat fails: inspect provider configuration and stream telemetry.

## Backend References

- [Cambium local setup](../../../cambium/docs/getting-started/setup.md)
- [Cambium API usage](../../../cambium/docs/getting-started/using-the-api.md)
- [Rhizome local development](../../../rhizome/docs/getting-started/local-development.md)
- [Rhizome setup](../../../rhizome/docs/getting-started/setup.md)
