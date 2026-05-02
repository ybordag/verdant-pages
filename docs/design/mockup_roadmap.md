# Verdant Pages Mockup Roadmap

**Last updated:** May 1, 2026

This document tracks the cross-platform mockup work needed before Verdant Pages
frontend implementation should be considered design-ready. The goal is to make
the app feel like a well-loved gardening journal with enough structure for
Rhizome's agentic workflows: chat, structured interactions, weather-aware task
changes, garden state tracking, incidents, projects, and object editing.

Mockups live in `docs/design/mockups/`. The root mockup index is:

- `docs/design/mockups/index.html`

## Current Status

### Completed Mockup Sets

- [x] **Rhizome chat workbench**
  - Web/Mac: `docs/design/mockups/web-mac/rhizome-workbench.html`
  - iPad combined review page: `docs/design/mockups/ipad/rhizome-workbench.html`
  - iPad standalone variants:
    - `docs/design/mockups/ipad/rhizome-workbench-portrait.html`
    - `docs/design/mockups/ipad/rhizome-workbench-landscape.html`
  - Phone: `docs/design/mockups/phone/rhizome-workbench.html`

- [x] **Tasks overview**
  - Web/Mac: `docs/design/mockups/web-mac/tasks-overview.html`
  - iPad combined review page: `docs/design/mockups/ipad/tasks-overview.html`
  - Phone: `docs/design/mockups/phone/tasks-overview.html`

- [x] **Design token / typography study**
  - Base study: `docs/design/mockup.html`
  - Decisions captured in `docs/design/ui_design.md`

### Remaining Mockup Sets

- [ ] Garden overview
- [ ] Plants overview and plant detail
- [ ] Projects overview and project detail
- [ ] Task detail
- [ ] Create/edit object flows
- [ ] Incident and triage views
- [ ] Dashboard / today overview
- [ ] History / activity log
- [ ] Shared interaction review variants

## Design System Decisions To Carry Forward

### Visual Tone

The app should feel like a cross between:

- a personal gardening journal
- a botanical field notebook
- a quiet operational tool for repeated garden work

The UI should avoid generic SaaS cards where a ledger, ruled page, annotated
calendar, or journal section would be more appropriate.

### Typography

Use the current typography roles consistently:

- `Shantell Sans`, `BNCE 20`, `700` weight:
  - app title
  - major page titles
  - selected object/common plant names
  - temporary display font until a custom Verdant Pages font exists
- `Caveat`:
  - botanical/journal annotations
  - month/date accent text
  - handwritten secondary emphasis
- `Nunito`:
  - body text
  - task descriptions
  - explanatory copy
  - operational details
- `Montserrat`:
  - uppercase labels
  - section subtitles
  - metadata
  - nav letters

### Color And Surfaces

Carry forward these material rules:

- `vellum-light` is the default app paper surface.
- `vellum-pale` is useful for calendar cells and quieter journal surfaces.
- Dark chrome uses `page-bg` and vellum-tinted overlays.
- Avoid creating a large inkwell-to-vellum ramp unless a role clearly requires
  it.
- Use `chartreuse` for active navigation, current work, and lively botanical
  accents.
- Use `pine` for Rhizome/garden authority and structured labels.
- Use `clay`/terracotta sparingly for user-originated items; avoid making it
  look like an error state.
- Use `cornflower`/navy for rain/weather shifts and related task changes.

### Navigation

Use the same mental model across formats, but not the same physical layout:

- Web/Mac:
  - persistent left sidebar
  - dark chrome
  - full labels and counts
  - optional quick-action and garden profile cards at the bottom
- iPad landscape:
  - compressed rail
  - single-letter nav items
  - `V` brand/home at the top
  - active destination uses chartreuse background and inkwell text
- iPad portrait:
  - bottom navigation
  - single-letter nav items
  - centered quick-action button
- Phone:
  - bottom navigation
  - single-letter nav items
  - centered quick-action button

Current nav mapping:

- `V`: Verdant Pages / home / workspace switcher
- `R`: Rhizome
- `T`: Tasks
- `G`: Garden
- `P`: Plants
- `I`: Incidents
- `+`: create / upload / quick Rhizome action sheet

### Responsive Patterns

Use a format-specific layout, not one endlessly fluid layout:

- Web/Mac:
  - wide workspace
  - sidebar + main + optional right aside
  - dense, repeatable operational surfaces
- iPad landscape:
  - compact rail
  - split-pane layout
  - detail/context panel remains visible when useful
- iPad portrait:
  - tablet-scale single focus
  - top dropdowns for selected day/object summaries where useful
  - inline expansion for task details
- Phone:
  - fixed portrait mock viewport
  - one primary thing visible
  - drawers/sheets/inline expansion instead of side panels

Keep mockup device frames ratio-locked:

- phone: `390 / 844`
- iPad portrait: `768 / 1024`
- iPad landscape: `1024 / 768`

## Completed Page Lessons

### Rhizome Chat Workbench

What worked:

- Separate Rhizome chat from structured approval/review surfaces.
- Use the right-side review aside on wide layouts because it makes current
  decisions visible without burying them in chat.
- On phone and iPad portrait, represent review/selected interaction as a top
  dropdown or inline card rather than a permanent side panel.
- Use pine for Rhizome-originated content and terracotta/clay for user-originated
  messages only when it does not read as an error.
- Use cornflower-to-chartreuse gradients for weather-related action cards such
  as skip watering.

Carry forward:

- Chat text remains conversational.
- Structured cards carry state, approval, metadata, and actions.
- Pending interaction lists should collapse when not central.
- User-provided startup intake belongs visually apart from weather/status
  signals.

### Tasks Overview

What worked:

- The task list should feel like a ledger, not a stack of enterprise cards.
- Calendar days should feel like journal calendar cells:
  - visible grid
  - subtle dot grid paper texture
  - compact written entries
  - weather marks in the daily label area
  - current day with a weather-aware background
- The task ledger should use:
  - ruled rows
  - section title highlights
  - source labels with color highlights and left bars
  - inline expansion on phone/iPad portrait
  - side detail aside on web/mac and iPad landscape
- A dedicated task detail page is still needed even though ledger expansion
  covers quick inspection.

Carry forward:

- Prefer section dividers on category headers, not heavy card borders.
- Strike through completed tasks.
- Keep list/calendar/week view toggles icon-based where space is limited.
- Use source names consistently: `Rhizome`, `User`, `Rain`.

## Remaining Mockup Sets

### 1. Garden Overview

Recommended next mockup set.

Purpose:

- Show the garden as the user's central operational context.
- Connect tasks, plants, projects, incidents, weather, and Rhizome observations.

Views to mock:

- Web/Mac garden overview
- iPad portrait and landscape garden overview
- Phone garden overview

Core content:

- garden profile
  - zone
  - soil
  - garden areas
  - constraints
  - watering notes
- garden map / area list
  - beds
  - containers
  - indoor trays
  - patio pots
- today's garden state
  - weather context
  - active tasks
  - active incidents
  - current projects
- Rhizome summary
  - what changed
  - what needs attention
  - recommendations

Design approach:

- Web/Mac:
  - sidebar + garden map/list + right Rhizome context aside
  - avoid decorative map cards; make the garden map functional and scannable
- iPad landscape:
  - compressed rail + split garden map/detail
- iPad portrait:
  - top summary + area list with expandable garden areas
- Phone:
  - compact garden profile + area list
  - selected area opens inline or in a sheet

Open design questions:

- Should garden areas be spatial map-first or ledger/list-first?
- How much editing is allowed on the overview versus a detail/edit route?

### 2. Plants Overview And Plant Detail

Purpose:

- Let the user inspect plants currently in the garden.
- Show care state, tasks, incidents, lifecycle, and Rhizome context for each
  plant.

Views to mock:

- plant inventory / overview
- individual plant detail
- phone plant list/detail
- iPad and web/mac variants

Core content:

- plant cards or ledger rows
  - common name
  - botanical name
  - status
  - location
  - lifecycle stage
  - open tasks/incidents
- plant detail
  - photo or sketch slot
  - notes
  - care history
  - watering/fertilizing history
  - linked projects
  - Rhizome recommendations

Design approach:

- Botanical names should use `Caveat`.
- Common plant names can use the display font.
- Avoid over-cardifying the inventory; consider a field-guide index or
  specimen-sheet pattern.
- Detail pages can feel more like botanical textbook pages than operational
  ledgers.

Open design questions:

- Do plants belong in one inventory, grouped by area, or grouped by lifecycle?
- How should plant varieties/cultivars be represented?

### 3. Projects Overview And Project Detail

Purpose:

- Show longer-running garden work such as pollinator borders, seedling
  hardening, irrigation improvements, or seasonal plans.

Views to mock:

- project overview
- project detail
- proposal/revision history embedded in project detail
- phone project summary/detail

Core content:

- project status
- linked plants/areas
- generated tasks
- timeline
- Rhizome proposal summary
- decisions and revisions
- notes and attachments

Design approach:

- Use a timeline or journal spread, not just cards.
- Web/Mac and iPad landscape should use a project list with a selected detail
  aside.
- Phone should focus on one active project with sections for tasks, notes, and
  next decision.

Open design questions:

- Are proposals a sub-view under projects or a first-class review workflow?
- How much historical proposal text should remain visible after acceptance?

### 4. Task Detail

Purpose:

- Provide a complete task edit/inspection surface beyond ledger expansion.

Views to mock:

- web/mac task detail
- phone task detail
- iPad detail/sheet

Core content:

- title
- status
- source
- due window
- estimated time
- linked plant/garden area/project/incident
- recurrence
- notes
- history
- actions
  - complete
  - defer
  - skip
  - request Rhizome revision

Design approach:

- Keep the ledger for browsing.
- Use task detail for editing and history.
- Preserve journal feeling through ruled sections and inline annotations.

Open design questions:

- Should task detail be a route, sheet, or both depending on format?
- How should recurring tasks expose recurrence editing without becoming too
  form-heavy?

### 5. Create/Edit Object Flows

Purpose:

- Establish reusable object editing patterns.

Objects to cover:

- plant
- garden area / bed / container
- task
- incident
- project
- note
- observation

Views to mock:

- object creation sheet/modal
- object edit view
- confirmation/error states
- media upload state

Design approach:

- Use forms sparingly and with journal-like grouping.
- Field groups should feel like labeled notebook sections.
- Use compact labels, clear inputs, and obvious save/cancel actions.
- Phone should use full-screen sheets or pushed routes.
- Web/Mac can use right-side inspector panels or modal sheets.

Open design questions:

- Which objects need fast-add flows from `+`?
- Which objects need detailed create flows versus lightweight capture first?

### 6. Incident And Triage Views

Purpose:

- Support garden issue intake, Rhizome triage, treatment plans, and follow-up.

Views to mock:

- incident overview
- incident detail
- triage intake
- treatment plan review
- follow-up task generation

Core content:

- affected plants/areas
- photos/media
- observed symptoms
- severity
- suspected causes
- Rhizome recommendation
- treatment steps
- follow-up schedule

Design approach:

- Incidents need urgency without overusing red.
- Use clay only carefully; serious/destructive actions can use explicit warning
  affordances if needed.
- Photo slots should feel practical and inspectable, not decorative.
- Treatment plans should reuse structured interaction review patterns.

Open design questions:

- Is triage a standalone workflow, part of Rhizome chat, or both?
- How are user photos annotated or compared over time?

### 7. Dashboard / Today Overview

Purpose:

- Provide a launch surface for startup triage, weather, pending approvals, and
  today's useful work.

Views to mock:

- web/mac dashboard
- iPad dashboard
- phone today screen

Core content:

- startup intake
- weather summary
- pending Rhizome approvals
- urgent/routine/project work
- open incidents
- quick actions

Design approach:

- Should feel like opening the journal to today's page.
- Use sections rather than cards where possible.
- Keep the highest-priority Rhizome item visible immediately.

Open design questions:

- Should dashboard and tasks `Today` be separate destinations?
- Does dashboard become the default landing page or Rhizome chat?

### 8. History / Activity Log

Purpose:

- Let the user inspect what changed, what Rhizome did, and what the user
  approved or completed.

Views to mock:

- activity log
- selected activity detail
- filterable history by object/source

Core content:

- timestamp
- source
- object links
- before/after summaries
- approvals/rejections
- completed tasks

Design approach:

- A journal chronology is more appropriate than an audit-table feel.
- Web/Mac can use a ledger/timeline with detail aside.
- Phone should use grouped day sections.

Open design questions:

- How much raw Rhizome reasoning/history should be visible?
- Should history be user-facing only, debug-facing, or both?

### 9. Shared Interaction Review Variants

Purpose:

- Ensure all approval-gated Rhizome actions use a consistent pattern.

Variants to mock:

- weather change review
- treatment plan review
- project proposal review
- destructive confirmation
- request revision
- media/incident triage follow-up

Design approach:

- Structured review cards/panels should include:
  - label
  - title
  - short summary
  - affected objects
  - proposed changes
  - confidence/assumptions where useful
  - approve/reject/request revision controls
- The same structure should translate to:
  - web/mac right aside
  - iPad landscape panel
  - iPad portrait top drawer/sheet
  - phone sheet/full-screen review

Open design questions:

- Which interaction types can be approved inline?
- Which require full review before approval?

## Suggested Order Of Work

1. Garden overview
2. Plants overview and plant detail
3. Projects overview and project detail
4. Incident and triage views
5. Task detail
6. Create/edit object flows
7. Dashboard / today overview
8. History / activity log
9. Shared interaction review variants

This order starts with the core garden model, then expands into the objects and
workflows that depend on it.

## Definition Of Done For Each Mockup Set

Each mockup set is complete when:

- root mockup index links to the set
- web/mac variant exists when relevant
- iPad variant exists, preferably as one combined review page
- phone variant exists when the flow needs mobile support
- key responsive and truncation decisions are visible
- selected-object/detail behavior is represented
- create/edit or approval behavior is noted if not mocked directly
- design decisions are summarized in this roadmap or a nearby README

