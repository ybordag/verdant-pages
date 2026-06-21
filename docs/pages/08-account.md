# Account & Settings

**Last updated:** 2026-06-21

## Purpose

User account management and app-wide preferences. Accessed via the nav sidebar footer (user avatar or settings icon). Single page — lightweight enough that no sub-pages are needed.

---

## Page (`/app/settings`)

Single scrollable page with four sections.

---

### 1. Profile

**Email** — displayed read-only. Email changes are deferred (require a verification flow not yet designed).

**Password** — a "Change password" form: current password field, new password field, confirm field. Submit calls `POST /auth/password` *(requires [cambium#20](https://github.com/ybordag/cambium/issues/20))*. Inline success/error feedback.

---

### 2. AI provider

Which LLM provider and model Rhizome uses for this user's sessions.

**Provider picker** — segmented control: Gemini / OpenAI / Anthropic. Saves to `preferred_provider` via `PATCH /auth/profile` *(cambium#20)*.

**Model** — text input or dropdown for the model name (e.g. `gemini-2.5-flash`, `gpt-4o`, `claude-sonnet-4-6`). Optional — if blank, Rhizome uses its default for the selected provider.

Source: `GET /auth/session` (preferred_provider, preferred_model). Saves via `PATCH /auth/profile`.

---

### 3. API keys

Which LLM provider API keys are configured. Keys are never shown — only a boolean indicating whether each is set.

Three rows — Gemini / OpenAI / Anthropic — each showing:
- Provider name + logo
- Status badge: **Configured** (green) or **Not set** (muted)
- Set/Update button → opens an inline input field for the key, hides on submit
- Remove button (only shown when configured)

Source: `GET /api/v1/auth/keys`. Set via `PUT /api/v1/auth/keys`. Remove via `DELETE /api/v1/auth/keys/{provider}`.

---

### 4. Appearance

**Theme** — Light / Dark toggle (same toggle as the nav sidebar). Persists to `localStorage('theme')`. No server round-trip.

---

## API endpoints

| Endpoint | Used for | Status |
|---|---|---|
| `GET /auth/session` | Load profile (email, preferred_provider, preferred_model) | ✅ |
| `PATCH /auth/profile` | Update preferred_provider, preferred_model | Blocked on [cambium#20](https://github.com/ybordag/cambium/issues/20) |
| `POST /auth/password` | Change password | Blocked on [cambium#20](https://github.com/ybordag/cambium/issues/20) |
| `GET /api/v1/auth/keys` | Which providers are configured | ✅ |
| `PUT /api/v1/auth/keys` | Set/update provider key | ✅ |
| `DELETE /api/v1/auth/keys/{provider}` | Remove provider key | ✅ |
