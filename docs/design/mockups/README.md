# Verdant Pages Mockups

This folder holds screen mockups for Verdant Pages across the target formats:

- web page
- mac app
- iPad
- phone

The formats should share the same design system, content model, and component
language. They should not become four separate products.

## Folder Structure

- `base/`
  - shared screen concepts, component studies, layout patterns, and design
    decisions that are not format-specific
- `web-mac/`
  - wide-screen app layouts for the browser and eventual mac app
- `ipad/`
  - tablet layouts with split views, side panels, and touch-friendly density
- `phone/`
  - truncated, single-focus flows with sheets/drawers for secondary context

## Mockup Strategy

Use one screen concept at a time and create format variants for it before
moving to the next major screen.

Recommended order:

1. `rhizome-workbench`
   - chat with Rhizome
   - current structured interaction card
   - pending interaction state
   - action resolution
2. `today-dashboard`
   - startup triage
   - weather snapshot
   - urgent/routine/project work
   - pending approvals
3. `tasks`
   - task list
   - task detail
   - complete/defer/skip/start actions
4. `garden`
   - garden profile
   - beds and containers
   - weather grounding
   - constraints and capacity
5. `plants`
   - plant inventory
   - plant detail
   - care state and lifecycle dates
6. `projects`
   - project overview
   - proposal/revision history
   - selected plants/locations
   - generated tasks
7. `object-editor`
   - reusable create/edit patterns for plants, beds, containers, batches,
     incidents, projects, and notes

## Format Rules

### Web / Mac

Use a workbench layout by default:

- persistent left navigation
- main content region
- optional right context panel for Rhizome, pending interactions, details, or
  inspector content
- dense but readable cards and tables

### iPad

Use a split-view layout where the workflow benefits from context:

- sidebar or compact rail
- master/detail list and detail panel
- interaction cards can appear as right panels or centered sheets
- touch targets should be larger than desktop

### Phone

Use focused single-task screens:

- bottom navigation or compact top navigation
- one primary object per screen
- secondary context opens as a sheet, drawer, or pushed detail route
- structured interactions should become full-screen review flows or bottom
  sheets, not cramped side cards

## Current Design Tokens

The current token study lives at:

- `../mockup.html`

Key decisions already locked:

- `--surface-primary: var(--vellum-light)`
- `--radius-journal: 10px` for default cards and review panels
- `Shantell Sans` at `BNCE 20`, `700` weight as the temporary display font
- `Caveat` for botanical names and journal annotations
- `Nunito` for product text
- `Montserrat` for uppercase labels and metadata

