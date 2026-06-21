# Verdant Pages Mockups

**Last updated:** 2026-06-21

This folder is where future layouts get prototyped as static HTML before any implementation decision is treated as locked — across web page, mac app, iPad, and phone. The formats should share the same design system, content model, and component language; they should not become four separate products.

Design principles and the locked aesthetic (typography roles, color usage rules) live in [visual-identity.md](../visual-identity.md) — read that first. This doc tracks the mockup work itself: what's done, what's next, and lessons carried forward from each completed set.

The root mockup index is [`index.html`](index.html).

## Folder structure

- `base/` — shared screen concepts, component studies, layout patterns, and design decisions that are not format-specific. Currently holds [`typography-and-surfaces.html`](base/typography-and-surfaces.html), the original locked token/typography study — open it in a browser to see the design system actually rendered, rather than just reading hex values.
- `web-mac/` — wide-screen app layouts for the browser and eventual mac app
- `ipad/` — tablet layouts with split views, side panels, and touch-friendly density
- `phone/` — truncated, single-focus flows with sheets/drawers for secondary context

## Format rules

### Web / Mac

Workbench layout by default: persistent left navigation, main content region, optional right context panel for Rhizome/pending interactions/details/inspector content, dense but readable cards and tables.

### iPad

Split-view layout where the workflow benefits from context: sidebar or compact rail, master/detail list and detail panel, interaction cards as right panels or centered sheets, touch targets larger than desktop.

### Phone

Focused single-task screens: bottom navigation or compact top navigation, one primary object per screen, secondary context opens as a sheet/drawer/pushed route, structured interactions become full-screen review flows or bottom sheets — never cramped side cards.

Device frames stay ratio-locked: phone `390/844`, iPad portrait `768/1024`, iPad landscape `1024/768`.

## Status

### Completed mockup sets

- **Rhizome chat workbench** — Web/Mac: `web-mac/rhizome-workbench.html` · iPad combined: `ipad/rhizome-workbench.html` · iPad standalone: `ipad/rhizome-workbench-portrait.html`, `ipad/rhizome-workbench-landscape.html` · Phone: `phone/rhizome-workbench.html`
- **Tasks overview** — Web/Mac: `web-mac/tasks-overview.html` · iPad combined: `ipad/tasks-overview.html` · Phone: `phone/tasks-overview.html`
- **Design token / typography study** — `base/typography-and-surfaces.html`, decisions captured in [visual-identity.md](../visual-identity.md)
- **Garden overview** — initial drafts exist: `web-mac/garden-overview.html`, `ipad/garden-overview.html`, `phone/garden-overview.html`. The detailed page spec (layout, tabs, API mapping) is finalized in [pages/02-garden.md](../../pages/02-garden.md) and [pages/03-garden-objects.md](../../pages/03-garden-objects.md).

### Remaining mockup sets, in suggested order

1. **Plants overview and plant detail** — plant cards/ledger rows (common name, botanical name, status, location, lifecycle stage, open tasks/incidents); detail view with photo/sketch slot, care history, linked projects, Rhizome recommendations. Botanical names in Caveat, common names in the display font. Avoid over-cardifying the inventory — consider a field-guide index or specimen-sheet pattern; detail pages can feel more like botanical textbook pages than operational ledgers.
2. **Projects overview and project detail** — project status, linked plants/areas, generated tasks, timeline, Rhizome proposal summary, decisions/revisions, notes. Use a timeline or journal spread, not just cards. Web/Mac and iPad landscape: list + selected detail aside. Phone: one active project with task/notes/next-decision sections.
3. **Incident and triage views** — incident overview/detail, triage intake, treatment plan review, follow-up task generation. Incidents need urgency without overusing red — use clay carefully, lean on explicit warning affordances for serious/destructive actions instead. Photo slots should feel practical and inspectable, not decorative. Treatment plans should reuse the structured-interaction review pattern.
4. **Task detail** — full edit/inspection surface beyond ledger-row expansion: title, status, source, due window, estimated time, linked subjects, recurrence, notes, history, actions (complete/defer/skip/request revision). Keep the ledger for browsing; use detail for editing and history.
5. **Create/edit object flows** — reusable patterns across plant, bed/container, task, incident, project, note, observation: creation sheet/modal, edit view, confirmation/error states, media upload state. Forms used sparingly, field groups feeling like labeled notebook sections. Phone: full-screen sheets or pushed routes. Web/Mac: right-side inspector panels or modal sheets.
6. **Dashboard / Today overview** — startup intake, weather summary, pending Rhizome approvals, urgent/routine/project work, open incidents, quick actions. Should feel like opening the journal to today's page — sections over cards, highest-priority Rhizome item visible immediately.
7. **History / activity log** — timestamp, source, object links, before/after summaries, approvals/rejections, completed tasks. A journal chronology, not an audit-table feel. Web/Mac: ledger/timeline with detail aside. Phone: grouped day sections.
8. **Shared interaction review variants** — weather change, treatment plan, project proposal, destructive confirmation, request revision, media/incident triage follow-up. All should share one structure (label, title, summary, affected objects, proposed changes, confidence/assumptions, approve/reject/request-revision) translated across web/mac right aside, iPad landscape panel, iPad portrait top sheet, phone full-screen review.

This order starts with the core garden model, then expands into the objects and workflows that depend on it.

### Definition of done for each mockup set

- Root mockup index (`index.html`) links to the set
- Web/Mac variant exists when relevant
- iPad variant exists, preferably as one combined review page
- Phone variant exists when the flow needs mobile support
- Key responsive and truncation decisions are visible
- Selected-object/detail behavior is represented
- Create/edit or approval behavior is noted if not mocked directly

## Lessons from completed sets

**Rhizome chat workbench:** separate chat from structured approval/review surfaces; the right-side review aside makes pending decisions visible without burying them in chat on wide layouts, but becomes a top dropdown/inline card on phone and iPad portrait; pine for Rhizome-originated content, clay for user-originated only where it won't read as an error; cornflower-to-chartreuse gradients work for weather action cards.

**Tasks overview:** the task list should feel like a ledger, not enterprise cards — ruled rows, section title highlights, source labels (`Rhizome`/`User`/`Rain`) with color highlights and left bars, inline expansion on phone/iPad portrait, side detail aside on web/mac and iPad landscape. Calendar days feel like journal cells: visible grid, subtle dot-grid texture, compact entries, weather marks in the daily label, weather-aware background on the current day. Strike through completed tasks. A dedicated task detail page is still worth building even with ledger-row expansion.
