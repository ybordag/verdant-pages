# Garden And Plants Page Design Plan

**Status:** planning for next mockup pass  
**Scope:** Garden page, Garden sub-pages, and the standalone Plants page  
**Related mockups:** `docs/design/mockups/`

## Purpose

The Garden page should be the user's spatial and operational model of the
garden. It should answer:

- What exists in the garden?
- Where is it?
- What constraints shape work here?
- What needs attention?
- Which areas, beds, containers, plants, projects, and incidents are connected?

The Plants page should be its own first-class destination. It should reuse the
same page structure as Garden, but its mental model is different: Garden is
place-first, while Plants is specimen/crop-first.

## Data Model Grounding

Rhizome separates the global garden profile from concrete garden resources:

- `GardenProfile`
  - climate zone
  - frost dates
  - soil type
  - tray capacity
  - location
  - hard constraints
  - soft preferences
  - notes
- `Bed`
  - name
  - location
  - sunlight
  - soil type
  - dimensions
  - care timestamps
  - notes
- `Container`
  - name
  - type
  - size
  - location
  - mobility
  - care timestamps
  - notes

The UI should respect this separation. The Garden overview can summarize the
profile, but the profile is not the whole page. Beds and containers are the
actual inspectable places where work happens.

## Core Mental Model

Use a game-map style model without making the app feel like a game:

- **Garden:** world / property / whole site.
- **Areas:** zones or regions inside the garden.
- **Beds and containers:** inspectable places where care happens.
- **Plants:** living records that may appear in locations, but deserve their own
  index and detail page.
- **Projects:** planned work that may target one or more areas, containers, or
  plants.
- **Incidents:** problems attached to plants, areas, containers, or the garden
  generally.

The user should feel like they are opening a garden journal to a mapped property,
then drilling into a selected place or specimen.

## Navigation Model

### Global App Navigation

Keep the established app navigation:

- `R`: Rhizome
- `T`: Tasks
- `G`: Garden
- `P`: Plants
- `I`: Incidents
- `+`: create / quick action

The Garden and Plants pages should both use this same global shell.

### Garden Page Tabs

Use a small set of Garden tabs:

- `Overview`
- `Areas`
- `Containers`
- `Projects`
- `Activity`

Do not add separate top-level `Map` and `Profile` tabs. Those are nested states
inside Overview:

- clicking the garden sketch opens a focused map view
- the focused map view can toggle between map notes and garden profile text
- the profile information appears as a summary/description panel in Overview

### Plants Page Tabs

Plants should be a separate page with the same structural pattern:

- `Inventory`
- `By Area`
- `Care`
- `Incidents`
- `Activity`

The top-level Plants page should not be hidden inside Garden. Garden can show
plants attached to a selected area or container, but the full plant index belongs
under `P`.

## Shared Layout Structure

The Garden and Plants pages should share the same broad geometry:

```text
┌ App Nav ┬───────────────────────────────────────────────────────────────┐
│         │ Page title / subtitle / view toggle                           │
│         ├──────────────────────────────────────────────┬────────────────┤
│         │ Primary selected object view                  │ Search /       │
│         │ - map, sketch, image, or specimen view         │ switcher aside │
│         ├──────────────────────────────────────────────┤                │
│         │ Selected object details / ledgers / sections   │                │
└─────────┴──────────────────────────────────────────────┴────────────────┘
```

The right-side search/switcher aside is important. It prevents huge object lists
from taking over the primary content, and it avoids a top switcher that would
break down when the garden has many beds, containers, or plants.

The aside should be collapsible.

## Garden Overview

### With Garden Sketch

Use this when the user has a generated or uploaded garden sketch.

Primary layout:

- top-left: garden sketch/map
- top-right: garden description/profile summary
- bottom-left: current state, projects, constraints, and active areas
- right aside: searchable Garden index

```text
┌ Sidebar ┬───────────────────────────────────────────────────────────────┐
│         │ Garden                                                       │
│         │ Overview | Areas | Containers | Projects | Activity           │
│         ├──────────────────────────────┬───────────────┬────────────────┤
│         │ Garden sketch                 │ Garden notes  │ Search garden  │
│         │ - vellum plan                  │ - zone        │ - search input  │
│         │ - inkwell linework             │ - soil        │ - areas         │
│         │ - scale grid                   │ - constraints │ - containers    │
│         │ - mapped beds/pots             │ - capacity    │ - plants        │
│         ├──────────────────────────────┴───────────────┤ - projects      │
│         │ Overview ledgers / sections                   │                │
│         │ - current constraints                          │                │
│         │ - active projects                              │                │
│         │ - recently changed                             │                │
│         │ - Rhizome garden notes                          │                │
└─────────┴──────────────────────────────────────────────┴────────────────┘
```

Sketch behavior:

- click or tap the sketch to open a focused map state
- focused map shows the sketch full-screen inside the app shell
- focused map includes a small toggle for:
  - `Map`
  - `Profile`
  - `Layers`
- layers can eventually include:
  - sunlight
  - water
  - containers
  - plants
  - projects
  - incidents

### Without Garden Sketch

Use this when the user has not supplied enough information to generate a map.

The page should not feel broken or empty. Replace the sketch with a structured
"Garden at a glance" surface:

- zone and frost dates
- soil
- tray capacity
- area count
- container count
- known constraints
- open data gaps

```text
┌ Sidebar ┬───────────────────────────────────────────────────────────────┐
│         │ Garden                                                       │
│         │ Overview | Areas | Containers | Projects | Activity           │
│         ├──────────────────────────────┬───────────────┬────────────────┤
│         │ Garden at a glance            │ Garden notes  │ Search garden  │
│         │ - zone                         │ - description │ - search input  │
│         │ - soil                         │ - constraints │ - objects       │
│         │ - frost dates                  │ - preferences │                │
│         │ - capacity                     │               │                │
│         ├──────────────────────────────┴───────────────┤                │
│         │ Setup prompts / known areas / active work      │                │
└─────────┴──────────────────────────────────────────────┴────────────────┘
```

This state should guide Rhizome-assisted garden mapping without becoming a
garden designer. Suggested prompts can include:

- add a bed
- add containers
- upload garden photos
- describe sun/shade
- ask Rhizome to draft a layout

## Garden Areas Tab

Areas are region-level objects such as front yard, courtyard, backyard slope, or
patio. They help organize beds, containers, plants, tasks, and projects.

Primary layout:

- main top-left: selected area image/sketch/map crop
- main top-right: selected area description
- bottom-left: selected area sections
- right aside: searchable area switcher

```text
┌ Sidebar ┬───────────────────────────────────────────────────────────────┐
│         │ Garden > Areas                                               │
│         ├──────────────────────────────┬───────────────┬────────────────┤
│         │ Selected area visual          │ Area notes    │ Search areas   │
│         │ - photo/sketch/map crop        │ - sunlight    │ - search input  │
│         │ - selected boundary            │ - soil        │ - grouped list  │
│         │ - linked beds/containers       │ - water       │ - filters       │
│         ├──────────────────────────────┴───────────────┤                │
│         │ Selected area details                         │                │
│         │ - beds and containers                          │                │
│         │ - plants in this area                           │                │
│         │ - active tasks                                  │                │
│         │ - projects                                      │                │
│         │ - incidents                                     │                │
└─────────┴──────────────────────────────────────────────┴────────────────┘
```

Expected user flow:

1. User opens Garden.
2. User selects `Areas`.
3. Default selected area is either the most recently viewed area or the area
   with the most urgent work.
4. User searches or filters in the right aside.
5. Selecting an area updates the main visual, description, and bottom details.
6. Clicking a bed/container inside the area can navigate to the Containers tab
   or open an inline preview.

Reasoning:

- The selected area remains the primary focus.
- The right aside is a switcher, not the page's main content.
- The bottom section contains attributes of the selected area, not navigation.

## Garden Containers Tab

Containers include pots, trays, raised planters, grow bags, and mobile
containers.

Primary layout mirrors Areas:

```text
┌ Sidebar ┬───────────────────────────────────────────────────────────────┐
│         │ Garden > Containers                                          │
│         ├──────────────────────────────┬───────────────┬────────────────┤
│         │ Selected container visual     │ Container     │ Search         │
│         │ - photo/sketch                │ notes         │ containers     │
│         │ - size/type marker            │ - size        │ - search input  │
│         │ - current placement           │ - material    │ - grouped list  │
│         │                               │ - mobility    │                │
│         ├──────────────────────────────┴───────────────┤                │
│         │ Selected container details                    │                │
│         │ - plants currently inside                      │                │
│         │ - care tasks                                   │                │
│         │ - watering/fertilizing history                  │                │
│         │ - linked projects                              │                │
│         │ - notes                                        │                │
└─────────┴──────────────────────────────────────────────┴────────────────┘
```

Expected user flow:

1. User needs to inspect a pot, tray, or planter.
2. User opens `Garden > Containers`.
3. User searches by container name, location, plant, or type.
4. User selects a container.
5. The main page shows the container, its contents, and its current work.

Reasoning:

- Containers are movable and operational, so the page should emphasize current
  state and care needs.
- The same visual/description/details/search shell keeps Garden sub-pages easy
  to learn.

## Plants Page

Plants should be independent from Garden, even though plant records are often
linked to areas and containers.

Garden asks "where is this work happening?" Plants asks "what is happening to
this living thing?"

### Plants Inventory

Primary layout:

- top-left: selected plant image/specimen view or inventory focus
- top-right: plant description and current state
- bottom-left: care ledger, tasks, incidents, lifecycle notes
- right aside: searchable plant index

```text
┌ Sidebar ┬───────────────────────────────────────────────────────────────┐
│         │ Plants                                                       │
│         │ Inventory | By Area | Care | Incidents | Activity             │
│         ├──────────────────────────────┬───────────────┬────────────────┤
│         │ Selected plant visual         │ Plant notes   │ Search plants  │
│         │ - photo/sketch                │ - common name │ - search input  │
│         │ - botanical name              │ - variety     │ - grouped list  │
│         │ - lifecycle marker            │ - location    │ - filters       │
│         ├──────────────────────────────┴───────────────┤                │
│         │ Selected plant details                        │                │
│         │ - care tasks                                   │                │
│         │ - observations                                 │                │
│         │ - incidents                                    │                │
│         │ - project links                                │                │
│         │ - harvest/lifecycle notes                       │                │
└─────────┴──────────────────────────────────────────────┴────────────────┘
```

Expected user flow:

1. User opens Plants.
2. User searches for a plant or uses a grouped list.
3. Selecting a plant updates the specimen view and detail sections.
4. User can jump to the plant's garden location from the location metadata.
5. User can create a task, log an observation, or start an incident from the
   selected plant.

Reasoning:

- Plant records deserve richer biological detail than a Garden sub-section can
  provide.
- The right search aside works well because the plant list may be large.
- The same shell keeps Plants visually related to Garden without merging their
  mental models.

### Plants By Area

This tab should not replace the Garden Areas tab. It is a plant-centered
inventory filter.

Use it when the user asks:

- what plants are in the courtyard?
- which tomatoes are on the slope?
- which seedlings are still indoors?

The selected object remains a plant, but the list and filters are grouped by
garden location.

## Mobile And Tablet Behavior

### Web/Mac

Use the full three-part layout:

- left app nav
- central selected object page
- right collapsible search/switcher aside

The right aside can remain visible by default on web/mac.

### iPad Landscape

Use the same structure with a compressed rail:

- left single-letter nav rail
- central selected object content
- right collapsible search/switcher aside

If space is tight, the aside can narrow before it collapses.

### iPad Portrait

Use a single-focus page:

- top dark app header
- tab row
- selected object visual and description stacked
- right search aside becomes a picker sheet
- details appear as collapsible journal sections

### Phone

Use a strongly simplified version:

- top dark app header
- tab row can horizontally scroll
- selected object visual first
- search/switcher is a sheet opened from a button
- details are nested pages or collapsible sections
- full-screen map is a pushed route or modal sheet

Phone Garden flow example:

1. User opens `G`.
2. Overview shows current garden summary.
3. User taps search/switcher.
4. A sheet opens with search and grouped areas/containers/plants.
5. User selects `Courtyard medium bed`.
6. The page navigates to selected area detail.
7. The user expands `Tasks`, `Plants`, `Projects`, or `Notes`.

## Mockup File Plan

Keep the mockup files smaller than the Tasks page by splitting the next Garden
and Plants mocks by conceptual surface.

### Garden Overview Mock

One mockup file per format:

- `docs/design/mockups/web-mac/garden-overview.html`
- `docs/design/mockups/ipad/garden-overview.html`
- `docs/design/mockups/phone/garden-overview.html`

Include these states:

- Overview with garden sketch
- Overview without garden sketch
- Focused map state, if the file stays manageable

If focused map makes the file too large, split it later into:

- `docs/design/mockups/web-mac/garden-map-focus.html`
- `docs/design/mockups/ipad/garden-map-focus.html`
- `docs/design/mockups/phone/garden-map-focus.html`

### Garden Areas And Containers Mock

Separate from the overview mock:

- `docs/design/mockups/web-mac/garden-areas-containers.html`
- `docs/design/mockups/ipad/garden-areas-containers.html`
- `docs/design/mockups/phone/garden-areas-containers.html`

Include:

- Areas tab with one selected area
- Containers tab with one selected container
- collapsible/searchable right switcher
- mobile picker sheet state

Reason for this split:

- Overview is about the whole garden.
- Areas and containers are selected-object inspection pages.
- Combining them would make the mockup too large and harder to review.

### Plants Page Mock

Plants should get its own mock set:

- `docs/design/mockups/web-mac/plants-overview.html`
- `docs/design/mockups/ipad/plants-overview.html`
- `docs/design/mockups/phone/plants-overview.html`

Include:

- Inventory tab
- By Area tab
- selected plant detail
- plant search/switcher

Reason for this split:

- Plants are a separate global page.
- The structure should echo Garden, but the content and user intent are
  specimen-focused.

## Design Rules For The Next Mock Pass

- Do not make the object list the primary content.
- Do not put huge object switchers in a top tab strip.
- Do not put navigation lists at the bottom where they read as selected-object
  attributes.
- The selected object should own the center of the page.
- The right aside is for finding and switching objects.
- The bottom section is for data about the selected object.
- Overview uses nested map/profile states; it does not need separate top-level
  Map and Profile tabs.
- Plants belongs in the global `P` page, not only under Garden.
- Keep the journal feeling:
  - vellum paper
  - ruled sections
  - restrained borders
  - botanical annotations
  - ledger-like data where appropriate
  - fewer generic cards

## Open Questions For Mockup Review

- Should Garden `Projects` be a tab inside Garden, or should it only show
  garden-scoped project links while the full project page lives under `Projects`?
- Should the focused map state allow simple layer toggles in the first mock, or
  should it be visual-only until the layout is validated?
- How much of the GardenProfile edit surface belongs on Overview versus a
  separate edit flow?
- Should Areas include beds as children, or should beds be first-class objects
  alongside areas?
- Should the Plants page default to all plants, active plants, or plants with
  current work?

