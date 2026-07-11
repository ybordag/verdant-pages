# Design Tokens And Theming

**Last verified:** 2026-07-10

`src/styles/tokens.css` is authoritative. This document explains the current token families and how to use them; it does not replace the CSS file.

## Structure

```text
:root                 base palette, fonts, radii, RGB channels
[data-theme="dark"]  semantic mappings for dark mode
[data-theme="light"] semantic mappings for light mode
```

Components should consume semantic tokens such as `--bg`, `--text-primary`, and `--line`. Base palette tokens are appropriate when color carries a specific product meaning.

## Base Palette

### Ink And Vellum

| Token | Current value | Intended role |
|---|---|---|
| `--inkwell` | `#1C1814` | Primary ink |
| `--inkwell-light` | `#6F665A` | Muted ink-like neutral |
| `--vellum-dark` | `#E9DEB7` | Dark paper accent |
| `--vellum` | `#F2E8C9` | Navigation and warm paper |
| `--vellum-page` | `#F4ECD5` | Light-theme app page background |
| `--vellum-grey` | `#8F8672` | Greyed vellum text/accent |
| `--vellum-bright` | relative lighter vellum | Light marketing page background |
| `--vellum-light` | `#F6F0E0` | Primary light paper surface |
| `--vellum-pale` | `#F8F4EC` | Secondary paper surface |
| `--vellum-whisper` | `#FAF7F2` | Quiet paper surface |
| `--vellum-white` | `#FDFCFA` | Raised light surface |

### Brand And Category Colors

| Token | Role |
|---|---|
| `--chartreuse`, `--chartreuse-deep` | active work and accessible chartreuse text/borders |
| `--pine`, `--pine-light` | garden/Rhizome authority and plant context |
| `--clay`, `--dark-clay` | user actions, task context, warm emphasis |
| `--buttercup` | warning/sun accents |
| `--pale-herb` | gentle positive/plant accents |
| `--peony`, `--cornflower`, `--wisteria` | category distinctions where needed |

Dark text companions (`--dark-amber`, `--dark-fern`, `--dark-berry`, `--dark-navy`, `--dark-plum`) support readable text on colored backgrounds.

RGB channel tokens exist for alpha composition. Reuse them instead of repeating channel values.

## Semantic Theme Tokens

### Shell

| Token | Dark | Light |
|---|---|---|
| `--bg` | near-black journal surface | `--vellum-page` |
| `--bg-nav` | dark raised chrome | `--vellum` |
| `--bg-marketing` | app background | `--vellum-bright` |
| `--card-marketing` | dark card surface | `--vellum` |

### Text

Use `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-muted`, `--text-placeholder`, and `--text-strong`. Their opacity and base color change by theme. Do not simulate disabled text by choosing an unrelated base color.

### Lines And Texture

Use `--line`, `--line-subtle`, and `--line-strong` for hierarchy. `--dot`, `--gc`, and `--gcb` support journal textures and grid marks. Message and content surfaces over a dot grid must be opaque enough that dots do not show through.

### Surfaces

`--surface-primary`, `--surface-secondary`, `--surface-quiet`, `--surface-raised`, and `--surface-darker` describe paper hierarchy. The `--surface-dark-*` family supplies low-opacity theme-aware overlays.

Light-mode page content uses `--vellum-page`; navigation uses `--vellum`. Inputs use `--input-bg`, while marketing inputs have their own warm mapping.

### Navigation

`--nav-accent` is chartreuse in dark mode and pine in light mode. Specific active controls may use `--chartreuse-deep` in light mode when contrast requires it. `--nav-active-bg` supplies the active tint.

## Typography

| Token/font | Use |
|---|---|
| `--font-display` / Shantell Sans | Page and product display headings |
| `--font-botanical` / Caveat | Botanical names and handwritten annotations |
| `--font-body` / Nunito | Body, controls, chat, and descriptions |
| `--font-label` / Montserrat | Uppercase metadata and compact labels |

Display headings use the configured `--display-bounce` and `--display-weight`. Do not use display sizing inside compact controls or operational rows.

## Radius And Depth

Available radii are `--radius-tight`, `--radius-soft`, `--radius-journal`, and `--radius-round`. Cards should generally remain at 8px or less unless an established component calls for another token.

Avoid box shadows as a default depth device. Prefer surface contrast, borders, and full-width bands. A modal or transient overlay may use depth only when separation cannot be communicated clearly otherwise.

## Theme Persistence

Theme choice is stored in local storage because it is non-sensitive and must survive reloads. The theme provider sets `data-theme` on the document root.

## Adding A Token

1. Confirm an existing semantic token cannot express the role.
2. Add the base value only if it has a durable palette meaning.
3. Add dark and light semantic mappings where needed.
4. Update this document if the token changes the shared design vocabulary.
5. Verify contrast and both themes in the consuming component.

Never introduce a one-off hex value in a component CSS module to bypass the token system.
