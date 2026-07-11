# Account and Garden Onboarding

| Status | Planned - Phase 5c |
|---|---|
| Frontend | Registration exists; garden onboarding does not |
| Cambium | Account creation and garden-profile proxy are available |
| Rhizome | Garden profiles are available; location-enrichment behavior must be verified before implementation |
| Blockers | Final structured enrichment contract and failure semantics |
| Last verified | 2026-07-10 |

## Purpose

A new account should enter Verdant with enough garden context for Today,
weather, triage, and Rhizome to be useful. Account creation and initial garden
setup are one first-run experience, even if they use separate backend requests.

The user should not land on an empty Today page and discover later that Rhizome
cannot help because no garden profile exists.

## Flow

1. Create the account with email and password.
2. Establish the authenticated session.
3. Collect the minimum garden profile.
4. Ask the backend to enrich location-dependent fields.
5. Let the user review derived values and correct the location if necessary.
6. Land on Today with an honest loading/empty state while first triage data is
   prepared.

Returning users with a garden profile skip onboarding. Returning users with an
incomplete profile resume at the missing step rather than creating duplicates.

## Minimum user input

**Garden name** - human-facing name such as "Backyard" or "Oakland Patio".

**Location** - a human-readable city/region/postal location. Do not ask users
for latitude/longitude.

**Soil** - free text or a small set of common starting choices with optional
detail. The user may not know an exact soil classification.

Optional preferences and constraints can be collected later from Garden or
through Rhizome. The first-run form should remain short.

## Derived fields

The backend should resolve, when available:

- normalized location label
- latitude/longitude for weather services
- timezone
- USDA/climate zone or equivalent supported zone
- estimated last spring and first fall frost dates

Derived values must record their source or confidence where the contract
supports it. Verdant presents them for confirmation; it does not calculate
climate data itself.

## Failure behavior

Location enrichment is useful but must not make the account unusable.

- **No location match:** keep entered values, explain what could not be found,
  and let the user edit/retry.
- **Provider/network failure:** preserve the form and offer retry. Do not imply
  the location is invalid.
- **Partial result:** save valid profile fields and identify missing derived
  values.
- **Skip:** permit a limited profile only when the backend supports missing
  derived values. Today and Rhizome must display an actionable incomplete-profile
  state rather than silently inventing context.
- **Duplicate/reload:** resume the existing profile instead of creating another.

## UX requirements

- Use one clear progression, not a dense settings form.
- Keep account credentials visually separate from garden information while
  retaining one onboarding flow.
- Show progress during enrichment without blocking edits indefinitely.
- Explain why location is needed: weather, climate, frost dates, and task timing.
- Never expose provider errors, stack traces, coordinates, or raw API payloads.
- Support keyboard completion and mobile widths.

## Acceptance path

Register a new user, enter garden name/location/soil, receive derived climate
details, confirm the profile, and arrive on Today. Repeat with an unknown
location and a simulated enrichment outage; entered data must remain intact and
retry must be possible.
