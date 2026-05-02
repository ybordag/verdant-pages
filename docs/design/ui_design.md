# Verdant Pages UI Design

**Last updated:** April 29th, 2026

## Product role

Verdant Pages is the primary manual testing and user-facing surface for
Rhizome. It should replace the CLI as the main way to interact with the agent
for day-to-day use.

The UI should be built around the current Rhizome product loop:

1. triage
2. review recommended work
3. inspect tasks and incidents
4. approve/reject structured interactions
5. complete work
6. see the garden state update

## Core UX principles

- structured interactions should feel like cards, not chat hacks
- triage should be the landing experience
- tasks should be easy to inspect and act on
- approvals should be explicit and low-friction
- weather and treatment workflows should feel operational, not buried in prose
- image/media flows should fit naturally into the app later

## Initial information architecture

### Primary areas

- `Dashboard`
  - latest triage
  - weather summary
  - pending interactions
  - today’s recommended work

- `Tasks`
  - task list
  - task detail
  - due/blocked/project filters

- `Projects`
  - project overview
  - proposal list/detail
  - execution/task context

- `Incidents`
  - open incidents
  - treatment plans
  - follow-up review

- `History`
  - recent interactions
  - selected activity summaries

### Cross-platform mockup strategy

Verdant Pages should be designed against four target formats:

- web page
- mac app
- iPad
- phone

Mockups live in `docs/design/mockups/`:

- `base/` for shared concepts and component studies
- `web-mac/` for wide-screen browser and mac app layouts
- `ipad/` for tablet split-view layouts
- `phone/` for focused, truncated mobile flows

The app should share one design system across all formats. The screen structure
can adapt by format:

- web/mac: persistent navigation, main workspace, optional right context panel
- iPad: split views, touch-friendly panels, sheets for focused approvals
- phone: single-focus routes, bottom navigation, review sheets/full-screen
  structured interactions

Each major screen concept should be mocked in all three format folders before
implementation decisions are treated as locked.

### Launch flow

The initial user experience should be:

1. login
2. open dashboard
3. see startup triage and weather summary immediately
4. if there is a pending interaction, surface it prominently
5. let the user move into tasks or incidents from there

## Screen concepts

### Dashboard

Should show:

- triage summary
- `Urgent`, `Routine`, `Project Work` sections
- weather note
- pending approvals/reviews
- quick actions into tasks or interactions

### Interaction review screen/card

Should support:

- destructive confirmation
- proposal review
- treatment-plan review
- weather-change review
- triage follow-up actions

Shared structure:

- title
- short summary
- body/notes
- sectioned details
- action buttons
- optional lightweight input fields

### Task list/detail

Task list should support:

- by project
- due soon
- blocked
- recurring/maintenance

Task detail should show:

- title/status/urgency
- timing window/deadline
- blockers and dependencies
- linked plants/beds/containers/projects
- notes
- actions like start, complete, defer, skip

### Incident and treatment views

Incident detail should show:

- incident type and severity
- affected subjects
- related treatment plans

Treatment plan review should show:

- approach summary
- recommended steps
- follow-up strategy
- approve/reject/request revision actions

### Proposal review

Later in Epic 9, proposal views should support:

- plan summary
- cost estimate
- timeline estimate
- effort estimate
- assumptions/tradeoffs/risks
- accept/reject/request revision

## Backend contract assumptions

Verdant Pages should consume Rhizome over HTTP/JSON and expect:

- token-based auth
- structured DTOs for tasks, interactions, triage, weather, incidents, and
  proposals
- media upload support
- no dependence on CLI-formatted strings

## Visual direction

The UI should feel:

- calm
- operational
- information-dense without feeling cluttered
- garden-oriented, but not whimsical to the point of hiding important state

The visual hierarchy should prioritize:

1. what needs attention now
2. what decision is pending
3. what work is ready to do
4. what changed recently

### Design tokens

Verdant Pages should use two related material families:

- paper surfaces for content, cards, forms, chat bodies, and review panels
- dark chrome for app shell, page background, card footers, dark headers, and
  framing elements

The default paper surface is locked as `vellum-light`. Keep `vellum` as the
darker paper variant for moments that need more warmth or age.

Core color tokens:

```css
--inkwell: #1C1814;
--vellum: #F2E8C9;
--vellum-light: #F6F0E0;
--vellum-pale: #F8F4EC;
--vellum-whisper: #FAF7F2;
--vellum-white: #FDFCFA;
--page-bg: #181510;
```

Semantic surface tokens:

```css
--surface-darker: var(--vellum);
--surface-primary: var(--vellum-light);
--surface-secondary: var(--vellum-pale);
--surface-quiet: var(--vellum-whisper);
--surface-raised: var(--vellum-white);
```

Dark chrome should use vellum-tinted overlays rather than a large
inkwell-to-vellum ramp. This keeps the app from accumulating too many muddy
near-neutrals while preserving the dark journal-cover/soil feeling.

```css
--surface-dark-card: rgb(var(--vellum-rgb) / 0.04);
--surface-dark-label: rgb(var(--vellum-rgb) / 0.05);
--surface-dark-header: rgb(var(--vellum-rgb) / 0.06);
```

Text and rule tokens should be role-based:

```css
--text-primary: var(--inkwell);
--text-secondary: rgb(var(--inkwell-rgb) / 0.84);
--text-tertiary: rgb(var(--inkwell-rgb) / 0.78);
--text-on-dark-primary: rgb(var(--vellum-rgb) / 0.94);
--text-on-dark-secondary: rgb(var(--vellum-rgb) / 0.72);
--text-on-dark-tertiary: rgb(var(--vellum-rgb) / 0.42);
--line-on-paper: rgb(var(--inkwell-rgb) / 0.14);
--line-on-dark: rgb(var(--vellum-rgb) / 0.14);
```

Typography tokens:

```css
--font-display: "Shantell Sans", cursive;
--font-botanical: "Caveat", cursive;
--font-body: "Nunito", system-ui, sans-serif;
--font-label: "Montserrat", system-ui, sans-serif;
```

Use `Shantell Sans` at `BNCE 20` and `700` weight for display/common plant
names and temporary app display headers, `Caveat` for
botanical names and journal annotations, `Nunito` for product text, and
letter-spaced uppercase `Montserrat` for subtitles and metadata labels.

Shantell is a temporary display choice. A custom Verdant Pages display font may
replace it later to keep the handmade journal feeling while giving operational
headers more structure.

## Near-term implementation target

The first complete UI milestone should cover:

- login/session
- dashboard triage
- pending interaction review
- task list/detail/actions
- incident and treatment-plan review
- weather snapshot and weather-change review

Media upload and proposal comparison should be designed now so they can slot in
cleanly as the next layer of work.
