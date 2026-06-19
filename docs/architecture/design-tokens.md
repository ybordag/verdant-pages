# Design Tokens & Theming

The prototype's token system is ported verbatim — no redesign. `src/styles/tokens.css` is the single source of truth.

## Token file structure

```css
/* src/styles/tokens.css */

/* ── Brand palette (theme-independent) ── */
:root {
  --chartreuse: #B8D43A;
  --pine: #2B5C2F;
  --clay: #E06B4A;
  --buttercup: #FFC94D;
  --pale-herb: #B0EAAC;
  --peony: #F5A0C8;
  --cornflower: #A0B8F5;
  --wisteria: #D7A5FF;
}

/* ── Dark theme (default) ── */
[data-theme="dark"] {
  --bg: #181510;
  --bg-nav: #201C17;
  --bg-raised: rgba(242, 232, 201, 0.05);
  --bg-card: rgba(242, 232, 201, 0.04);

  --text-p: rgba(242, 232, 201, 0.94);
  --text-s: rgba(242, 232, 201, 0.70);
  --text-t: rgba(242, 232, 201, 0.48);
  --text-m: rgba(242, 232, 201, 0.34);

  --line: rgba(242, 232, 201, 0.10);
  --line-s: rgba(242, 232, 201, 0.18);
  --dot: rgba(242, 232, 201, 0.14);
  --gc: rgba(43, 92, 47, 0.22);
  --gcb: rgba(43, 92, 47, 0.38);

  --nav-accent: var(--chartreuse);
  --nav-active-bg: rgba(184, 212, 58, 0.10);
  --input-bg: rgba(242, 232, 201, 0.06);
}

/* ── Light theme ── */
[data-theme="light"] {
  --bg: #FAF6EE;
  --bg-nav: #EDE8D4;
  --bg-raised: rgba(28, 24, 20, 0.05);
  --bg-card: rgba(28, 24, 20, 0.03);

  --text-p: rgba(28, 24, 20, 0.92);
  --text-s: rgba(28, 24, 20, 0.80);
  --text-t: rgba(28, 24, 20, 0.62);
  --text-m: rgba(28, 24, 20, 0.55);

  --line: rgba(28, 24, 20, 0.13);
  --line-s: rgba(28, 24, 20, 0.24);
  --dot: rgba(28, 24, 20, 0.12);
  --gc: rgba(43, 92, 47, 0.18);
  --gcb: rgba(43, 92, 47, 0.32);

  --nav-accent: var(--pine);
  --nav-active-bg: rgba(184, 212, 58, 0.28);
  --input-bg: rgba(28, 24, 20, 0.06);
}

/* ── Typography ── */
:root {
  --font-display: "Shantell Sans", cursive;
  --font-botanical: "Caveat", cursive;
  --font-body: "Nunito", system-ui, sans-serif;
  --font-label: "Montserrat", system-ui, sans-serif;
}
```

## Four fonts

| Font | Variable | Usage |
|---|---|---|
| Shantell Sans | `--font-display` | Display headings, plant names. Always use with `font-variation-settings: "BNCE" 20; font-weight: 700` |
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

Currently loading from Google Fonts. Once the core frontend is built, consider migrating to self-hosted font files (downloaded at build time, served from the same domain). Benefits: removes the external Google dependency, eliminates the extra DNS lookup, avoids GDPR concerns around third-party font requests. The `font-display: swap` strategy stays the same — only the source URL changes.

## Theme persistence

`ThemeProvider` reads `localStorage.getItem('vp_theme')` on mount (default: `'dark'`), sets `document.documentElement.dataset.theme`, and persists on toggle. Theme preference is one of the few things that *should* go in localStorage — it's not sensitive data, and you don't want a flash of the wrong theme on every page load.

## Styling approach

- CSS modules for component-specific styles
- Global `tokens.css` + a small `utilities.css` for shared classes (`.dg` dot grid, `.gg` line grid, `.chip`, `.hr`, `.cd`, `.nb`)
- No CSS-in-JS, no Tailwind
- Never hardcode colour values in components — always reference `var(--token-name)`
