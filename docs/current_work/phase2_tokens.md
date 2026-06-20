# Phase 2: Tokens, Theme, Fonts

**Branch:** `aspen`  
**Status:** Complete  
**Last updated:** 2026-06-20

---

## Summary

Phase 2 establishes the full visual foundation: design tokens, the dark/light theme system, and the four-font typography stack. The first pass ported a simplified token set from the `Verdant Pages v2.html` prototype — too simplified, as it turned out. The authoritative design lives in `docs/design/mockup.html`, which defines a much richer token system (the full inkwell/vellum scale, RGB channel variables, border radius scale, display variation tokens). `tokens.css` was rewritten from that source, and `global.css`/`utilities.css` were updated to match the corrected token names.

---

## What was built

### `src/styles/tokens.css` — single source of truth

**Base palette (`:root`, theme-independent):**
- Ink/vellum scale: `--inkwell`, `--vellum`, `--vellum-light`, `--vellum-pale`, `--vellum-whisper`, `--vellum-white`
- Brand colors: `--chartreuse`, `--pine`, `--clay`, `--buttercup`, `--pale-herb`, `--peony`, `--cornflower`, `--wisteria`
- Dark tints (text on colored chips): `--dark-amber`, `--dark-fern`, `--dark-berry`, `--dark-navy`, `--dark-plum`, `--dark-clay` (added later, Phase 3)
- RGB channels for alpha composition: `--inkwell-rgb`, `--vellum-rgb`, `--pine-rgb`, `--clay-rgb` and `--chartreuse-rgb` (both added later, Phase 3)
- Border radius scale: `--radius-tight` (6px) → `--radius-round` (14px)
- Display variation: `--display-bounce: 20`, `--display-weight: 700`

**Semantic tokens (`[data-theme="dark"]` / `[data-theme="light"]`):**
- App shell: `--bg`, `--bg-nav`
- Surfaces: `--surface-primary`, `--surface-secondary`, `--surface-quiet`, `--surface-raised`, `--surface-darker`, `--surface-dark-card`, `--surface-dark-label`, `--surface-dark-header`, `--surface-muted`
- Text: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-muted`, `--text-placeholder`, `--text-strong`
- Lines: `--line`, `--line-subtle`, `--line-strong`, plus grid tokens `--dot`, `--gc`, `--gcb`
- Nav: `--nav-accent`, `--nav-active-bg`
- Input: `--input-bg`

### `src/styles/global.css`

Reset, `body`/`#root` layout, form element base styles, scrollbar styling, shared keyframes (`pIn`, `vsA`, `acceptGlow`). Updated to reference the corrected token names (`--text-primary` instead of the prototype's `--text-p`, etc.).

### `src/styles/utilities.css`

`.dg` (dot grid), `.gg` (line grid), `.chip`, `.hr`, `.cd`, `.nb` — shared utility classes from the prototype, retokenized to match.

### Fonts

Four fonts loaded via Google Fonts `<link>` in `index.html`:

| Font | Token | Usage |
|---|---|---|
| Shantell Sans | `--font-display` | Display headings — paired with `--display-bounce`/`--display-weight` |
| Caveat | `--font-botanical` | Latin names, journal dates, handwritten annotations |
| Nunito | `--font-body` | All body text |
| Montserrat | `--font-label` | All label/metadata text — uppercase, letter-spaced |

### `ThemeProvider`

`src/lib/theme/ThemeProvider.tsx` — reads `localStorage.getItem('theme')` on mount (default `'dark'`), sets `document.documentElement.dataset.theme`, persists on toggle via `useTheme()` hook. `App.tsx` wraps the whole tree in `ThemeProvider`.

---

## Tests written

**Unit (`src/lib/theme/ThemeProvider.test.tsx`):** defaults to dark, reads saved theme from localStorage, toggles dark→light, toggles light→dark, persists to localStorage on toggle.

**E2E (`e2e/theme.spec.ts`):** loads in dark theme by default, toggle switches to light, light theme persists on reload.

---

## Decisions made

**Mockup.html overrides the prototype.** The user explicitly flagged that the first `tokens.css` pass didn't match their design: "I meticulously defined the theme in `docs/design/mockup.html`... It's really important we stick to that theme." The prototype (`Verdant Pages v2.html`) was a quick reference; the mockup is authoritative. All subsequent token work treats `docs/design/mockup.html` as the source of truth.

**`rgb(var(--x-rgb) / alpha)` over hardcoded `rgba()`.** Alpha composition goes through RGB channel variables (`--inkwell-rgb`, `--vellum-rgb`, etc.) rather than literal `rgba(28, 24, 20, 0.84)` — keeps every alpha-blended color traceable to its base token.

**localStorage key renamed from `vp_theme` to `theme`.** Originally namespaced with a `vp_` prefix matching the old `VPNav` component name. During a Phase 3 component-naming audit, the user asked to drop `VP*`-style abbreviations; `theme` was judged sufficiently scoped on its own (see phase3 doc for the full audit).

---

## What Phase 3 needs from this

Phase 3 builds `AppShell`/`AppNav` directly on top of these tokens — surface/text/line tokens for the nav and cards, `--radius-journal`/`--radius-soft` for buttons and panels, `--font-label`/`--font-display` for nav items and the wordmark. No gaps found; Phase 3 consumed the token system as-is, plus added two new RGB tokens (`--clay-rgb`, `--chartreuse-rgb`) and `--dark-clay` for the Quick Actions button colors.
