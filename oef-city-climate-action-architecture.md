# OEF City Climate Action Tracker — Architecture Breakdown

## Goal
Build a lightweight web app with two user experiences: a **public viewer** for citizens and an **admin workspace** for city climate teams. The app must support baseline emissions, target year, climate action CRUD, and free-text action import via an LLM with human review before save.

This architecture is optimized for two things: shipping a credible MVP within roughly 4 hours, and producing an implementation plan that a coding assistant can convert directly into tasks. Because of that, the system favors a compact monolith, explicit module boundaries, and low-ceremony integrations over platform complexity.

## Updated technical stance
Persistence, multi-city support, and admin authentication should be treated as **first-class architecture**, not optional stretch goals, because they fit the scope if the implementation stays narrow. The chart can remain lower priority, but the architecture should leave a clean place for it.

### Recommended stack
- **Frontend/App framework:** Next.js App Router + React + TypeScript.
- **Database + persistence:** Supabase Postgres.
- **Tenant isolation:** Postgres row-level security (RLS) keyed by `organization_id` / `city_id` style tenancy.
- **Admin auth:** Clerk for authentication and organization-aware admin access in Next.js.
- **LLM abstraction:** Vercel AI SDK, because it provides a unified provider architecture for OpenAI, Anthropic, Google, and other providers.
- **Testing provider path:** GitHub Models for the exercise, since it exposes multiple providers through an OpenAI-compatible interface.
- **Validation:** Zod for request, form, and model-output validation.

## Architecture principles
This app should be implemented as a **single Next.js codebase** with clear logical layers rather than separate frontend and backend repos. That gives fast setup, easy demoability, and a simpler story in the interview.

### Principles to preserve
- **Monolith first:** one repo, one deployment unit, one database.
- **Server-centric mutations:** use Server Actions for most writes; use route handlers only where an explicit JSON endpoint is useful.
- **Human-in-the-loop AI:** the LLM creates a draft action, never a final persisted record without admin review.
- **Multi-tenant by default:** every city-scoped record must be tenant-bound from day one.
- **Provider abstraction:** do not hardcode one LLM vendor into parsing logic.

## System shape
The architecture is a web app with three bounded areas:

1. **Public app** — read-only city progress dashboard.
2. **Admin app** — authenticated city management UI.
3. **Shared application core** — validation, calculations, DB access, tenant checks, and LLM extraction.

### Runtime flow
- Public users access a city page by slug, such as `/cities/greenville`.
- Admin users sign in with Clerk and are authorized against one or more city memberships mapped to Clerk organizations.
- All city data is stored in Supabase Postgres and protected with RLS so tenant isolation exists below the app layer as defense in depth.
- LLM extraction is routed through a provider-agnostic adapter so GitHub Models can be used for testing now and other providers later.

## Multi-tenant data model
The app should support multiple cities from the start using a shared-schema multi-tenant design. Supabase recommends using Postgres row-level security for tenant isolation, which is a strong fit for a compact SaaS-style architecture.

### Core tables
| Table | Purpose | Key fields |
|---|---|---|
| `organizations` | Tenant container, usually one city government tenant | `id`, `name`, `slug`, `clerk_org_id`, `created_at` |
| `cities` | Public-facing city profile under a tenant | `id`, `organization_id`, `name`, `slug`, `baseline_emissions`, `target_year`, `created_at`, `updated_at` |
| `climate_actions` | Climate actions belonging to a city | `id`, `organization_id`, `city_id`, `title`, `sector`, `annual_reduction`, `status`, `start_year`, `source_text`, `created_at`, `updated_at` |
| `memberships` | Optional app-level mirror of Clerk membership for role checks | `id`, `organization_id`, `user_id`, `role`, `created_at` |
| `import_attempts` | Optional but useful audit trail for AI parsing | `id`, `organization_id`, `city_id`, `input_text`, `provider`, `model`, `parsed_json`, `status`, `created_at` |

### Enums
- `sector`: `transport | energy | buildings | waste | land_use`.
- `status`: `planned | in_progress | completed`.
- `role`: `admin | editor | viewer`

### Design note
Store both `organization_id` and `city_id` on city-scoped tables. It is slightly redundant, but it simplifies RLS policies, admin filtering, and future multi-city-per-organization support.

## Auth and authorization
Clerk should handle authentication and session management in Next.js, while tenant membership should be anchored to Clerk Organizations or synchronized into a local membership table for app-specific role checks. This keeps auth UX fast to implement and leaves the database focused on authorization and isolation.

### Recommended auth model
- **Public viewer:** no auth required.
- **Admin:** Clerk sign-in required.
- **Tenant selection:** active Clerk organization determines the admin's working tenant.
- **Role enforcement:** only `admin` or `editor` can mutate city/action data.

### Recommended integration pattern
1. User signs in with Clerk.
2. App reads active Clerk organization.
3. Server layer resolves `organization_id` from `clerk_org_id`.
4. Server Actions enforce role checks before writes.
5. Supabase RLS enforces tenant isolation at the DB level.

## Supabase persistence and RLS
Supabase documents RLS as a core Postgres primitive and positions it as defense in depth for secure data access. For this case, that means every tenant-owned table should have RLS enabled and policies scoped by the caller's organization membership.

### Practical RLS strategy
- Enable RLS on `cities`, `climate_actions`, `memberships`, and `import_attempts`.
- Allow public `SELECT` only for city data that is intentionally public.
- Restrict admin `INSERT/UPDATE/DELETE` to members of the active tenant with admin/editor roles.
- Index `organization_id` and `city_id` on all tenant tables to keep policy filtering efficient.

### Important implementation note
Because Clerk is the auth provider, the cleanest MVP is to run all mutations through the trusted Next.js server layer using the Supabase service role, then enforce tenant/role checks in application code and preserve RLS where feasible for defense in depth. Full end-to-end Clerk-to-Supabase JWT bridging is possible later, but it is not necessary for the 4-hour build.

## LLM provider architecture
The parsing feature should be implemented behind a provider-agnostic service interface. The Vercel AI SDK exposes a unified provider architecture for OpenAI, Anthropic, Google, and others, which makes it a strong fit when the app needs to support at least three providers.

GitHub Models is also a good testing path because it provides access to multiple providers through an OpenAI-compatible API surface. That means the exercise can run against GitHub Models now while keeping the abstraction ready for direct OpenAI, Anthropic, or Google adapters later.

### Recommended provider strategy
- **Primary testing path:** GitHub Models.
- **Supported abstraction targets:** OpenAI, Anthropic, Google.
- **Framework:** Vercel AI SDK with a thin internal adapter layer.

### Suggested interface
```ts
export type ExtractActionInput = {
  text: string;
  cityName?: string;
};

export type ExtractActionOutput = {
  title: string;
  sector: 'transport' | 'energy' | 'buildings' | 'waste' | 'land_use';
  annualReduction: number;
  status: 'planned' | 'in_progress' | 'completed';
  startYear: number;
  confidence?: number;
  notes?: string;
};

export interface ClimateActionExtractor {
  extract(input: ExtractActionInput): Promise<ExtractActionOutput>;
}
```

### Adapter structure
```txt
src/lib/ai/
  index.ts                 # factory by provider
  schema.ts                # zod/json schema for extraction
  providers/
    github-models.ts
    openai.ts
    anthropic.ts
    google.ts
  extract-climate-action.ts
```

### Behavioral rules
- Always request structured JSON output.
- Validate model output with Zod before returning it.
- Never persist the model output directly.
- Save the source text and parsing metadata for troubleshooting.
- Allow provider/model selection from config, not from business logic.

## Application modules
The project should be organized so a coding assistant can generate code in small, isolated tasks.

```txt
src/
  app/
    (public)/
      cities/[citySlug]/page.tsx
    (admin)/
      admin/page.tsx
      admin/cities/[cityId]/page.tsx
    api/
      health/route.ts
    actions/
      city.ts
      climate-actions.ts
      imports.ts
  components/
    dashboard/
    climate-actions/
    forms/
    layout/
    ui/
  lib/
    auth/
      clerk.ts
      permissions.ts
    db/
      supabase.ts
      queries.ts
    ai/
    calculations/
      progress.ts
      sector-breakdown.ts
      projections.ts
    validations/
      city.ts
      climate-action.ts
      import.ts
  types/
  hooks/
```

## User experience breakdown
The UI should stay functional and obvious. The assignment explicitly values structure and clarity over polish.

### Public viewer
Route shape:
- `/cities/[citySlug]`

Features:
- City header with baseline emissions and target year.
- KPI summary: total reductions, percent vs baseline, number of actions, on-track status.
- Sector breakdown list or bars.
- Public list/table of climate actions.

### Admin workspace
Route shape:
- `/admin`
- `/admin/cities/[cityId]`

Features:
- Tenant-aware city switcher.
- Edit city settings form.
- Actions table with create/edit/delete.
- Free-text import form with review step before save.
- Optional audit panel for recent import attempts.

## Core business logic
Keep calculations deterministic and framework-independent so they are easy to test and explain.

### Required calculations
- `totalEstimatedReduction(actions)`
- `reductionBySector(actions)`
- `percentOfBaselineReduced(city, actions)`
- `isOnTrack(city, actions, referenceYear)`
- `projectEmissionsByYear(city, actions)` *(implementation-ready even if chart UI ships later)*

### On-track heuristic
A lightweight and defendable MVP rule is enough for the exercise: compare current effective annual reductions against a linear reduction pace needed to reach net zero by `targetYear`. This is simple to explain in the presentation and avoids pretending to do full climate modeling.

## Suggested implementation plan
This section is intentionally written so a coding assistant can convert it into tasks.

### Phase 1 — bootstrap
- Initialize Next.js app with TypeScript and App Router.
- Install Clerk, Supabase client, Zod, and Vercel AI SDK.
- Create `.env.example` with Clerk, Supabase, and AI provider keys.
- Add seed data for Greenville from the assignment.

### Phase 2 — schema and persistence
- Create SQL or migration files for `organizations`, `cities`, `climate_actions`, and optional `memberships` / `import_attempts`.
- Add indexes on `organization_id`, `city_id`, `slug`.
- Enable RLS and add initial public/admin policies.
- Build query helpers for city dashboard and action CRUD.

### Phase 3 — auth and tenancy
- Configure Clerk middleware and protected admin routes.
- Resolve active organization from Clerk session.
- Create server-side permission helpers: `requireAuth`, `requireOrg`, `requireRole`.
- Add seeded organization-city mapping for demo.

### Phase 4 — public dashboard
- Build city page with KPI cards, sector breakdown, and action list.
- Implement calculation utilities.
- Add on-track badge with green/red visual state.

### Phase 5 — admin CRUD
- Build city settings form.
- Build create/edit/delete flows for climate actions.
- Use Server Actions and shared Zod validation.

### Phase 6 — AI import
- Implement provider-agnostic extractor interface.
- Add GitHub Models adapter first.
- Add OpenAI, Anthropic, and Google adapters behind the same contract.
- Build import textarea, draft preview, manual edit step, and save flow.
- Log import attempts for debugging.

### Phase 7 — optional chart
- Implement `projectEmissionsByYear` now.
- Add chart UI only if time remains.

## Task decomposition for coding assistants
The coding assistant should receive small, dependency-aware tasks rather than one giant prompt.

### Recommended task order
1. Scaffold repo and dependencies.
2. Create DB schema and seed script.
3. Implement auth middleware and permission helpers.
4. Build public city dashboard.
5. Build admin city settings form.
6. Build admin climate action CRUD.
7. Implement AI extraction contract and GitHub Models adapter.
8. Add additional provider adapters.
9. Build import-review-save UX.
10. Add tests and polish.

11. One-page write-up on AI-assisted build process, including design decisions, prompts, etc. in a doc named `ai-assisted-build.md`.

### Prompting guidance
When using a coding assistant, each task prompt should include:
- the exact target files,
- the expected inputs/outputs,
- constraints such as tenant safety and validation,
- and a request to avoid changing unrelated files.

That approach will produce better diffs than asking the assistant to “build the whole app.”

## AI workflow write-up
The assignment requires a short write-up explaining how AI coding tools were used. The repo should therefore include `docs/ai-assisted-build.md` with concise bullets covering tools, one time-saving generation, one corrected AI mistake, and how context/rules/tasks were structured.

## Repo deliverables
- `README.md` — setup and local run instructions.
- `docs/architecture.md` — this architecture breakdown.
- `docs/ai-assisted-build.md` — required workflow write-up.
- `supabase/` or `db/` — schema, policies, seed scripts.
- `src/lib/ai/` — provider abstraction plus adapters.

## Time-boxed scope
A credible 4-hour submission should ship the full vertical slice with persistence, multi-city readiness, and admin auth, but keep each area narrow. That means one polished public page, one practical admin page, one real import flow, and only lightweight role management.

### Explicit defer list if time runs out
- Rich charts UI.
- Full Clerk-to-Supabase JWT bridging.
- Full organization self-service management.
- Advanced audit history views.
- More realistic emissions forecasting logic.

## Recommended final positioning
In the interview, present this as a **multi-tenant climate action tracker MVP** with secure admin access, public transparency, and an LLM-assisted ingestion workflow built behind a vendor-flexible AI abstraction. That framing shows product judgment, architecture discipline, and practical AI-native engineering choices.
