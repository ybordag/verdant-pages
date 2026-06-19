# Tech Stack

## Proposed: Vite + React 18 + TypeScript + React Router v7

| Layer | Choice | Rationale |
|---|---|---|
| Bundler | Vite | Sub-second HMR, TypeScript first-class, production build via Rollup. Simpler than Next.js for a pure SPA. |
| UI | React 18 | Matches the UMD prototype — migration is a direct port. `useTransition` and Suspense give smooth async data loading. |
| Language | TypeScript (strict) | Full type safety from Cambium API types to component props. Catches contract violations at compile time. |
| Routing | React Router v7 | Client-side SPA routing, nested layouts, protected routes, `useNavigate` for 401→login redirect. |
| Server state | TanStack Query v5 | Fetch, cache, revalidate, optimistic mutations for every API call. Handles loading/error states without boilerplate. |
| Styling | CSS custom properties + CSS modules | Faithful port of the prototype's token system. No CSS-in-JS overhead. `tokens.css` is the single source of truth for design tokens. |
| Tables | TanStack Table v8 | Headless, sorting and filtering built-in. Used for ledger-style tables (tasks, beds, containers, plants). |
| Drag and drop | Pragmatic Drag and Drop | Atlassian's high-performance DnD library. Powers task rescheduling on the Calendar and any reorder interactions. Chosen over @dnd-kit for better real-world performance characteristics. |
| Linting | ESLint + Prettier | Consistent code style throughout. |

**Why not Next.js:** The app is a fully authenticated SPA dashboard. Server-side rendering adds complexity (auth cookies, hydration, edge runtime) with no SEO benefit. Vite is faster to develop on and produces an equivalent production bundle.

**Why not Redux / Zustand:** State lives either in URL (page), server (TanStack Query), or ephemeral component state. There is no complex cross-tree shared state that would justify a global store. `AuthContext` handles the single truly global concern.

**Why Pragmatic DnD over @dnd-kit:** @dnd-kit can feel sluggish in practice — it simulates drag events through React state. Pragmatic DnD operates directly on native browser drag events, giving a noticeably snappier feel. It is also the library powering Jira, Trello, and Confluence.
