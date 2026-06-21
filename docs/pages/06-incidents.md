# Incidents & Treatment Plans

**Last updated:** 2026-06-21

## Purpose

Incidents track problems in the garden — pests, disease, blight, environmental damage. Treatment plans are the response. Both can be created and managed directly by the user or with Rhizome's help. This page group is distinct from the agent chat but connects to it naturally.

---

## Pages in this group

| Page | Route |
|---|---|
| Incidents list | `/app/incidents` |
| Incident detail | `/app/incidents/:id` |

---

## Incidents list (`/app/incidents`)

**Layout:** filter rail (left) + ledger table (main).

**Filter rail:** Status (All / Reported / Approved / Resolved), Severity (Critical / High / Medium / Low), Type (Pest / Disease / Weed / Environmental / Other), Date range, Affected subject (plant/bed/container picker).

**Ledger rows:** incident type badge, summary text, severity indicator, affected subjects (comma-separated chips), status badge, date reported, treatment plan status. TanStack Table — sortable by severity and date.

**`+ New Incident` button** opens a creation form at `/app/incidents/new` — type (required), summary (required), severity, affected subjects (multi-select plant/bed/container picker), notes. Quick creation is also accessible from anywhere via the "New Incident" button in the Rhizome topbar.

**Alert → Incident pipeline:** MonitorAlerts of type `pest` or `plant_health` show a "Create incident from this alert" action that pre-fills the form.

**API:**
- `GET /api/v1/incidents?status=X&severity=Y&incident_type=Z&since=ISO&subject_type=T&subject_id=ID`
- `POST /api/v1/incidents`

---

## Incident detail (`/app/incidents/:id`)

### Header

Incident type badge (Pest / Disease / Weed), severity (coloured: critical = clay, high = buttercup, medium = pine, low = muted), summary text, status badge, date reported. Edit summary/severity/notes inline. Resolve button (`PATCH /api/v1/incidents/{id}/resolve`). Delete button (data entry mistakes only, blocked if approved plan with tasks exists).

### Affected subjects

Chips for each plant, bed, or container this incident affects. Clickable — navigate to the object's detail page. `+ Add subject` opens the subject picker to add more.

### Media gallery

Photos of the damage, before/after treatment. This gallery is part of the media endpoint work tracked in the blocked capability note below.

### Treatment plan section

The most important section on the page. Two paths offered in parallel:

**Option A — Ask Rhizome** (primary): "Draft with Rhizome →" opens a Rhizome chat thread pre-seeded with the incident context. Rhizome generates a treatment plan draft, which appears here when complete.

**Option B — Write your own**: "Write my own plan" opens a form with: approach summary, add-step interface (title, task type, estimated minutes, days from approval for each step), follow-up strategy. Calls `POST /api/v1/incidents/{id}/treatment/manual`.

Once a plan exists (either source), this section shows:
- Approach summary
- Steps list with estimated minutes and sequencing (days from approval)
- Follow-up strategy
- Source badge: "Rhizome draft" or "User plan"
- Edit button — `PATCH /api/v1/treatment-plans/{id}` — opens the step editor, available until approval
- **Approve button** — `PATCH /api/v1/treatment-plans/{id}/approve` — auto-generates tasks for each step, locked after this
- Delete draft button — only available pre-approval

### Activity history

Full event feed for this incident: creation, subject additions, treatment plan state changes, resolution. Source: `GET /api/v1/incidents/{id}/activity`.

---

## API endpoints

| Endpoint | Used for |
|---|---|
| `GET /api/v1/incidents` | List (with all filters) |
| `POST /api/v1/incidents` | Create |
| `GET /api/v1/incidents/{id}` | Detail |
| `PATCH /api/v1/incidents/{id}` | Edit |
| `DELETE /api/v1/incidents/{id}` | Delete |
| `PATCH /api/v1/incidents/{id}/resolve` | Resolve |
| `POST /api/v1/incidents/{id}/treatment` | AI treatment draft (Cambium AI trigger) |
| `POST /api/v1/incidents/{id}/treatment/manual` | Manual treatment plan |
| `GET /api/v1/incidents/{id}/treatment` | Get treatment plan |
| `PATCH /api/v1/treatment-plans/{id}` | Edit treatment steps |
| `PATCH /api/v1/treatment-plans/{id}/approve` | Approve → generate tasks |
| `DELETE /api/v1/treatment-plans/{id}` | Delete draft |
| `GET /api/v1/incidents/{id}/activity` | Activity history |

**Blocked capability:** incident media galleries depend on media attachment endpoints from rhizome#117.
