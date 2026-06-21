# Visual Identity & Design Principles

**Last updated:** 2026-06-21

This is the prose companion to [architecture/design-tokens.md](../architecture/design-tokens.md) — that doc has the exact CSS variable names and values; this one explains *why* those values were chosen and how to use them consistently as new screens get built. If the two ever disagree on a value, `architecture/design-tokens.md` (and `src/styles/tokens.css` behind it) wins — fix this doc to match.

This doc supersedes the old `mockup.html` token study. That file is now a renderable visual reference, not documentation — see [mockups/base/typography-and-surfaces.html](mockups/base/typography-and-surfaces.html) if you want to see the tokens actually rendered in a browser.

---

## Product role

Verdant Pages is the primary user-facing surface for Rhizome — it replaces the CLI as the main way to interact with the agent day to day. The UI is built around Rhizome's product loop: triage → review recommended work → inspect tasks and incidents → approve/reject structured interactions → complete work → see the garden state update.

## Core UX principles

- Structured interactions should feel like review cards, not chat hacks.
- Triage is the landing experience — open the app, see what needs attention today.
- Tasks should be easy to inspect and act on without extra navigation.
- Approvals are explicit and low-friction — never bury a decision in prose.
- Weather and treatment workflows should feel operational, not like reading a report.
- Image/media flows should fit naturally into the app as that capability lands.

## Visual tone

The app should feel like a cross between a personal gardening journal, a botanical field notebook, and a quiet operational tool for repeated garden work — calm, operational, information-dense without feeling cluttered. Garden-oriented, but not whimsical to the point of hiding important state.

Prefer a ledger, ruled page, annotated calendar, or journal section over a generic SaaS card wherever one of those fits the content better.

Visual hierarchy priority, in order:
1. What needs attention now
2. What decision is pending
3. What work is ready to do
4. What changed recently

## Typography

Four fonts, each with one job — never mix their roles:

| Font | Role |
|---|---|
| **Shantell Sans** | Display headings, page titles, common plant names. The handmade-journal voice. Temporary choice — a custom Verdant Pages display font may replace it later; keep the same handmade feeling if so. |
| **Caveat** | Botanical/Latin names, journal-style dates, handwritten secondary annotations. |
| **Nunito** | All body text — task descriptions, chat messages, explanatory copy. |
| **Montserrat** | Uppercase labels, section subtitles, metadata, nav letters — always letter-spaced. |

Exact `font-variation-settings`/weight pairings and the Google Fonts loading snippet live in [architecture/design-tokens.md](../architecture/design-tokens.md#four-fonts).

## Color and surfaces

Two material families, used consistently:
- **Paper surfaces** (the vellum scale) for content, cards, forms, chat bodies, review panels.
- **Dark chrome** (vellum-tinted overlays on a near-black base, not a separate dark palette) for app shell, page background, card footers, dark headers, and framing elements. This keeps the dark theme from accumulating muddy near-neutrals while preserving the dark journal-cover/soil feeling.

`vellum-light` is the default paper surface. `vellum-pale` works well for quieter surfaces like calendar cells. `vellum` (the darker paper variant) is for moments that want more warmth or age.

Brand color usage rules — these are deliberate, not arbitrary:
- **Chartreuse** — active navigation, current work, lively botanical accents.
- **Pine** — Rhizome/garden authority, structured labels. Use for Rhizome-originated content in chat and review cards.
- **Clay/terracotta** — user-originated items, sparingly. Never let it read as an error state — that's the one rule that matters most here.
- **Cornflower** — rain/weather shifts and weather-driven task changes. Cornflower-to-chartreuse gradients work well for weather action cards (e.g. "skip watering").
- **Red** — avoid overusing for incidents/urgency. Reach for clay or explicit warning affordances before red.

Exact hex values and the full semantic token table (dark/light theme mappings) live in [architecture/design-tokens.md](../architecture/design-tokens.md).

## Lessons carried forward from completed mockups

These came out of actually mocking the Rhizome chat workbench and Tasks pages, and apply to every screen built after:

- Separate conversational chat from structured approval/review surfaces — don't let review cards live inside the chat scrollback.
- On wide layouts, a right-side review aside keeps pending decisions visible without burying them in chat. On phone/iPad portrait, represent the same thing as a top dropdown or inline card instead of a permanent side panel.
- The task list should feel like a ledger, not a stack of cards: ruled rows, section title highlights, source labels (`Rhizome`/`User`/`Rain`) with color highlights and left bars, inline expansion on phone/iPad portrait, a side detail aside on web/mac and iPad landscape.
- Calendar days should feel like journal calendar cells — visible grid, subtle dot-grid paper texture, compact written entries, weather marks in the daily label area, current day with a weather-aware background.
- Strike through completed tasks. Prefer section dividers over heavy card borders on category headers.
- A dedicated detail page is still worth building even when ledger-row expansion covers quick inspection.

## Cross-platform formats

Verdant Pages targets four formats sharing one design system — they should never become four separate products: web page, mac app (same as web), iPad, phone.

- **Web/Mac:** persistent left sidebar, dark chrome, full labels and counts, optional quick-action/garden-profile cards in the nav footer.
- **iPad landscape:** compressed single-letter nav rail, split-pane content, detail/context panel stays visible when useful.
- **iPad portrait:** bottom navigation, single-letter items, top dropdowns or inline expansion instead of a permanent side panel.
- **Phone:** bottom navigation, single-letter items, one primary thing visible at a time, drawers/sheets/inline expansion instead of side panels.

Mockup device frames stay ratio-locked: phone `390/844`, iPad portrait `768/1024`, iPad landscape `1024/768`.

See [mockups/README.md](mockups/README.md) for how this plays out screen-by-screen, and where the next mockups are planned.
