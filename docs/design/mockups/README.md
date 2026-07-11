# Verdant Pages Mockups

**Last reviewed:** 2026-07-10

These static HTML files are visual studies, not implementation status or the product roadmap. They preserve useful composition, responsive, and styling ideas across web, iPad, and phone. Current source behavior wins when a mockup and the application differ.

Read [visual identity](../visual-identity.md) for design principles, [design patterns](../patterns.md) for reusable interaction guidance, and the [page specs](../../pages/) for intended behavior. Use [current status](../../status/current.md) and the [roadmap](../../roadmap/overview.md) to decide what is being built next.

The root gallery is [`index.html`](index.html).

## Contents

| Folder | Purpose |
|---|---|
| `base/` | Token, typography, and non-device-specific studies |
| `web-mac/` | Wide browser/desktop compositions |
| `ipad/` | Portrait and landscape split-workspace studies |
| `phone/` | Single-focus mobile translations |

Existing studies cover:

- Rhizome workbench;
- tasks overview;
- garden overview;
- typography and paper surfaces.

## How To Use A Mockup

1. Identify the interaction or visual rule worth preserving.
2. Compare it with the current page spec and source.
3. Adapt it to current tokens and shared components rather than copying old CSS.
4. Include loading, empty, error, disabled, focus, and narrow-screen states that a static mockup may omit.
5. Update the page spec when a design decision changes intended behavior.

## Format Principles

- **Web/Mac:** persistent navigation, dense but readable workflow, optional supporting panels.
- **iPad landscape:** split workspace where context benefits the main task.
- **iPad portrait:** stacked content and temporary secondary panels.
- **Phone:** one primary workflow at a time; secondary review/context becomes a focused overlay or route.

Reference frame ratios are phone `390/844`, iPad portrait `768/1024`, and iPad landscape `1024/768`.

## Creating A New Study

A new mockup is useful when a page has unresolved composition or responsive behavior. It is not required for routine implementation.

When adding one:

- link it from `index.html`;
- show the relevant desktop and narrow-width translation;
- use real product-like content and worst-case text lengths;
- make selection, truncation, and panel behavior visible;
- record durable decisions in the page or pattern docs afterward.

Do not keep a parallel “remaining mockups” roadmap here. Product sequencing belongs in `docs/roadmap/overview.md`.
