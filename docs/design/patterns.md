# Product UI Patterns

**Status:** Proposed reference; patterns become current only when implemented and linked from a page spec.

**Last reviewed:** 2026-07-10

This file captures repeated interaction and layout intentions without pretending that every component already exists. Current component inventory is documented in [component architecture](../architecture/components.md).

## Quiet Operational Layouts

Verdant Pages is a working journal, not a marketing site. Operational pages should favor:

- compact headers and clear hierarchy;
- full-width page bands rather than nested floating cards;
- rows and ledgers for scanning related objects;
- restrained borders and surface changes instead of shadows;
- a stable primary workflow with optional supporting panels;
- visible loading, empty, error, and disabled states.

## Lists And Ledgers

Use a row list when users need to scan or compare many objects. A row normally has:

- a primary label;
- one concise metadata line;
- status or type at the trailing edge;
- a subtle divider;
- selected, hover, keyboard-focus, and disabled states.

Use TanStack Table only when sorting, column comparison, or tabular density materially helps. Do not force a table onto a short summary list.

## Filter Rail

A filter rail is appropriate for dense operational pages such as Tasks, Plants, Incidents, or Activity. It should:

- remain narrower than the result region;
- use compact themed controls;
- expose a clear reset action;
- validate impossible ranges locally;
- collapse above or beside results on narrow screens.

Activity is the current implemented reference, not a universal extracted component.

## Detail Pages

Object detail pages should use a durable route and progressive sections:

1. identity, status, and primary actions;
2. current state and care/work summary;
3. related objects and upcoming work;
4. history or activity.

Temporary inspection panels may preview an object without leaving a workflow, but the full object remains addressable by a route.

## Context Autocomplete

Context selection uses one shared result language across Rhizome focus, pinned context, message context, and composer tokens:

- consistent result rows and type colors;
- an anchor close to the text being entered;
- ellipsis for overflow;
- outside-click and Escape dismissal;
- selected objects removed from available results;
- single-select where one focus object is required, multi-select for context collections.

The current implementation is `ContextAutocomplete`.

## Rhizome Workspace Panels

Rhizome may open temporary thread navigation and review/context panels. They should:

- push or resize the main workspace on wide screens rather than obscure it;
- become overlays or dedicated views only at constrained widths;
- disappear completely when closed;
- preserve an obvious way to reopen them;
- keep the composer anchored and the conversation independently scrollable.

These panels are workflow tools, not replacements for durable object routes.

## Reviews And Approvals

Agent-proposed changes should be rendered as structured review content, not hidden in prose. A review surface needs:

- what Rhizome proposes;
- why it proposes it;
- affected subjects;
- the exact action or changes;
- approve, reject, modify, or continue controls supported by the backend;
- pending, submitting, success, and failure states.

Incidents and alerts may appear in the same supporting workspace, but they remain distinct concepts: alerts inform, incidents track domain problems, and interactions require a user decision.

## Forms

- Keep labels persistent; placeholders are examples, not labels.
- Use native input semantics behind themed controls.
- Validate locally when the rule is deterministic, then display backend validation near the relevant field.
- Break long creation flows into steps only when later fields depend on earlier choices.
- Preserve entered values after recoverable failures.

## Responsive Translation

Desktop density should not become mobile overlap. At narrow widths:

- columns stack in workflow order;
- secondary panels close or become focused overlays;
- fixed-format controls use stable dimensions;
- labels wrap rather than collide;
- horizontal scrolling is reserved for genuinely tabular content.

Every implemented page should be checked at desktop and mobile widths before its phase is closed.
