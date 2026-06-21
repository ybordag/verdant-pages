# Design Tokens & Theming

**Last updated:** 2026-06-20

`src/styles/tokens.css` is the single source of truth. Tokens originate from the locked design study at [`design/mockups/base/typography-and-surfaces.html`](../design/mockups/base/typography-and-surfaces.html) — see [`design/visual-identity.md`](../design/visual-identity.md) for the rationale behind these values. Do not restyle or invent new values without explicit sign-off.

## Token file structure

```
:root                    — theme-independent base palette, typography, radius
[data-theme="dark"]      — semantic tokens mapped for dark backgrounds
[data-theme="light"]     — semantic tokens mapped for paper/vellum surfaces
```

## Base palette (`:root`)

### Ink / vellum scale

| Token | Value | Role |
|---|---|---|
| `--inkwell` | `#1C1814` | Near-black ink, primary text on paper |
| `--vellum` | `#F2E8C9` | Base warm parchment |
| `--vellum-light` | `#F6F0E0` | Slightly lighter — primary card surface |
| `--vellum-pale` | `#F8F4EC` | Secondary card surface |
| `--vellum-whisper` | `#FAF7F2` | Quiet surface / light-theme page bg |
| `--vellum-white` | `#FDFCFA` | Raised surface / modal bg |

### Brand

| Token | Value |
|---|---|
| `--chartreuse` | `#B8D43A` |
| `--pine` | `#2B5C2F` |
| `--clay` | `#E06B4A` |
| `--buttercup` | `#FFC94D` |
| `--pale-herb` | `#B0EAAC` |
| `--peony` | `#F5A0C8` |
| `--cornflower` | `#A0B8F5` |
| `--wisteria` | `#D7A5FF` |

### Dark tints (text on coloured chip/badge backgrounds)

| Token | Value |
|---|---|
| `--dark-amber` | `#2C1E00` |
| `--dark-fern` | `#0C1E0C` |
| `--dark-berry` | `#280C18` |
| `--dark-navy` | `#0A1428` |
| `--dark-plum` | `#1A0A2C` |

### RGB channels

Used for `rgb(var(--foo-rgb) / alpha)` alpha composition:

| Token | Value |
|---|---|
| `--inkwell-rgb` | `28 24 20` |
| `--vellum-rgb` | `242 232 201` |
| `--pine-rgb` | `43 92 47` |

### Border radius

| Token | Value |
|---|---|
| `--radius-tight` | `6px` |
| `--radius-soft` | `8px` |
| `--radius-journal` | `10px` |
| `--radius-round` | `14px` |

### Display variation

| Token | Value | Usage |
|---|---|---|
| `--display-bounce` | `20` | `font-variation-settings: "BNCE" var(--display-bounce)` on Shantell Sans |
| `--display-weight` | `700` | `font-weight: var(--display-weight)` on display headings |

## Semantic tokens (theme-scoped)

These are set by `[data-theme="dark"]` and `[data-theme="light"]`.

### App shell

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#181510` | `var(--vellum-whisper)` |
| `--bg-nav` | `#201C17` | `var(--vellum-light)` |

### Surfaces

| Token | Dark | Light |
|---|---|---|
| `--surface-primary` | `var(--vellum-light)` | `var(--vellum-light)` |
| `--surface-secondary` | `var(--vellum-pale)` | `var(--vellum-pale)` |
| `--surface-quiet` | `var(--vellum-whisper)` | `var(--vellum-whisper)` |
| `--surface-raised` | `var(--vellum-white)` | `var(--vellum-white)` |
| `--surface-darker` | `var(--vellum)` | `var(--vellum)` |
| `--surface-dark-card` | vellum / 4% | inkwell / 3% |
| `--surface-dark-label` | vellum / 5% | inkwell / 4% |
| `--surface-dark-header` | vellum / 6% | inkwell / 5% |
| `--surface-muted` | vellum / 6% | inkwell / 6% |

### Text

| Token | Dark | Light |
|---|---|---|
| `--text-primary` | vellum / 94% | `var(--inkwell)` |
| `--text-secondary` | vellum / 72% | inkwell / 84% |
| `--text-tertiary` | vellum / 42% | inkwell / 78% |
| `--text-muted` | vellum / 38% | inkwell / 55% |
| `--text-placeholder` | vellum / 38% | inkwell / 52% |
| `--text-strong` | vellum / 94% | inkwell / 88% |

### Lines and grids

| Token | Dark | Light |
|---|---|---|
| `--line` | vellum / 10% | inkwell / 14% |
| `--line-subtle` | vellum / 12% | inkwell / 12% |
| `--line-strong` | vellum / 18% | inkwell / 24% |
| `--dot` | vellum / 14% | inkwell / 12% |
| `--gc` | pine / 22% | pine / 18% |
| `--gcb` | pine / 38% | pine / 32% |

### Nav

| Token | Dark | Light |
|---|---|---|
| `--nav-accent` | `var(--chartreuse)` | `var(--pine)` |
| `--nav-active-bg` | chartreuse / 10% | chartreuse / 28% |

### Input

| Token | Dark | Light |
|---|---|---|
| `--input-bg` | vellum / 6% | inkwell / 6% |

## Four fonts

| Font | Variable | Usage |
|---|---|---|
| Shantell Sans | `--font-display` | Display headings, plant names. Always pair with `font-variation-settings: "BNCE" var(--display-bounce); font-weight: var(--display-weight)` |
| Caveat | `--font-botanical` | Latin names, journal dates, handwritten annotations |
| Nunito | `--font-body` | All body text, paragraphs, chat messages |
| Montserrat | `--font-label` | All label/metadata text — always uppercase, letter-spaced |

## Font loading

Load via Google Fonts in `index.html` with `display=swap` to prevent flash of invisible text:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Montserrat:wght@300;400;500;600&family=Nunito:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Shantell+Sans:BNCE,ital,wght@20,0,400;20,0,700;20,1,400&display=swap" rel="stylesheet">
```

### Future improvement — self-hosted fonts

Once the core frontend is built, consider migrating to self-hosted font files served from the same domain. Benefits: removes the external Google dependency, eliminates the extra DNS lookup, avoids GDPR concerns around third-party font requests. The `font-display: swap` strategy stays the same — only the source URL changes.

## Theme persistence

`ThemeProvider` reads `localStorage.getItem('theme')` on mount (default: `'dark'`), sets `document.documentElement.dataset.theme`, and persists on toggle. Theme preference is one of the few things that *should* go in localStorage — it's not sensitive data, and you don't want a flash of the wrong theme on every page load.

## Styling approach

- CSS modules for component-specific styles
- Global `tokens.css` + `global.css` (reset, base elements, keyframes) + `utilities.css` (shared layout/component classes)
- No CSS-in-JS, no Tailwind
- Never hardcode colour values in components — always reference `var(--token-name)`
- Alpha composition via `rgb(var(--inkwell-rgb) / 0.84)` — not `rgba()` with hardcoded channels
