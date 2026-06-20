# Quickstart

**Last updated:** 2026-06-20

The fastest path to a running dev server. For the full walkthrough — environment variables, running Cambium, troubleshooting, production builds — see [setup.md](setup.md).

```bash
nvm use            # requires Node 24, see .nvmrc
npm install
cp .env.example .env
npm run dev         # → http://localhost:5173
```

That's it for pure UI work — component rendering, styling, routing all work without anything else running.

**If you need real data:** Cambium must be running on `:8080` (and Rhizome on `:8001` behind it). In a separate terminal:

```bash
cd ../cambium && go run ./cmd/server/
```

**Running tests:**

```bash
npm run test         # Vitest, watch mode — no Cambium needed
npm run test:e2e     # Playwright — auto-starts the dev server
```

**Something not working?** Setup.md has a troubleshooting section; [CLAUDE.md](../../CLAUDE.md) at the repo root has the invariants and architecture summary if you're trying to understand *why* something is built the way it is, not just how to run it.
