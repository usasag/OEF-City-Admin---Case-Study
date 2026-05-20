# OEF City Climate Action Tracker

A multi-tenant web application that helps cities track, visualize, and manage their climate action initiatives. Built as a case study demonstrating architecture discipline, AI-native engineering, and product judgment.

## What It Does

The tracker provides two distinct user experiences:

- **Public Dashboard** (`/cities/[citySlug]`) — Citizens can view their city's climate progress with interactive charts, KPI summaries, sector breakdowns, and a full list of climate actions. No login required.
- **Admin Workspace** (`/admin`) — Authenticated city climate teams can manage emissions data, configure city settings, perform CRUD on climate actions, view analytics, and import new actions from free text using AI extraction with human review.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript 6 |
| Auth | Clerk (organization-aware, role-based) |
| Database | Supabase Postgres + Row-Level Security |
| Validation | Zod 4 (shared client/server schemas) |
| Charts | Plotly.js via react-plotly.js (client-side, SSR-safe) |
| AI | Vercel AI SDK (provider-agnostic: GitHub Models, OpenAI, Anthropic) |
| Testing | Vitest + fast-check (property-based testing) |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  Public Dashboard │ Admin Workspace │ Plotly.js Charts       │
└────────┬──────────┴────────┬────────┴────────┬──────────────┘
         │                   │                  │
┌────────▼───────────────────▼──────────────────▼──────────────┐
│                   Next.js App Router                          │
│  React Server Components │ Server Actions │ Clerk Middleware  │
└────────┬──────────────────┴───────┬───────┴─────────────────┘
         │                          │
┌────────▼──────────────────────────▼──────────────────────────┐
│                    Application Core                           │
│  Auth & Permissions │ Zod Validation │ Calculations │ AI     │
└────────┬────────────┴────────────────┴──────┬───────┴───┬────┘
         │                                    │           │
┌────────▼────────────┐  ┌───────────────────▼┐  ┌──────▼─────┐
│  Supabase Postgres  │  │      Clerk         │  │ LLM Provider│
│  + RLS              │  │                    │  │ (configurable)│
└─────────────────────┘  └────────────────────┘  └────────────┘
```

### Key Design Decisions

1. **Monolith-first** — Single repo, single deployment, single database. Clean separation via logical layers.
2. **Server-centric mutations** — All writes go through Server Actions with a consistent pipeline: `authenticate → resolve org → check role → validate → mutate`.
3. **Defense-in-depth tenancy** — Application-layer tenant checks + Postgres RLS policies ensure data isolation.
4. **Human-in-the-loop AI** — LLM output is always a draft requiring explicit admin approval before persistence.
5. **Provider abstraction** — Vercel AI SDK unified interface prevents vendor lock-in.

## Project Structure

```
src/
├── app/
│   ├── (public)/cities/[citySlug]/   # Public dashboard (SSR)
│   └── (admin)/admin/                # Admin workspace
│       ├── settings/                  # City configuration
│       ├── actions/                   # Climate action CRUD
│       ├── import/                    # AI-assisted import
│       └── analytics/                 # Charts & analytics
├── actions/                           # Next.js Server Actions
│   ├── city.ts                        # updateCitySettings
│   ├── climate-actions.ts             # create/update/delete actions
│   └── imports.ts                     # importClimateActions, approveImportedActions
├── components/
│   ├── dashboard/                     # KpiSummary, SectorBreakdown, ActionsList, OnTrackBadge
│   ├── charts/                        # EmissionsProjection, SectorBreakdown, ProgressGauge, AnnualReductionBar
│   └── admin/                         # CitySettingsForm, ActionsTable, ActionForm, ImportForm, ImportReview
├── lib/
│   ├── auth/                          # Clerk helpers, requireAuth, requireRole
│   ├── db/                            # Supabase client + query helpers
│   ├── ai/                            # Provider factory, extraction, error sanitization
│   ├── calculations/                  # progress, sector-breakdown, projections
│   ├── charts/                        # Plotly config & data transforms
│   └── validations/                   # Zod schemas (city, climate-action, import)
├── types/                             # Shared TypeScript interfaces
└── middleware.ts                      # Clerk route protection

supabase/
├── migrations/                        # 6 numbered SQL migration files
└── seed.sql                           # Idempotent demo data (Greenville)

tests/                                 # Unit & property tests
```

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (or local Supabase via CLI)
- A [Clerk](https://clerk.com) application with organizations enabled
- An AI provider API key (GitHub Models, OpenAI, or Anthropic)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) |
| `AI_PROVIDER` | One of: `github-models`, `openai`, `anthropic` |
| `AI_MODEL` | Model identifier (e.g., `gpt-4o`, `claude-sonnet-4-20250514`) |

Provider-specific keys (depending on `AI_PROVIDER`):

| Provider | Required Variable |
|----------|------------------|
| `github-models` | `GITHUB_TOKEN` |
| `openai` | `OPENAI_API_KEY` |
| `anthropic` | `ANTHROPIC_API_KEY` |

### 3. Set Up the Database

Run the migrations in order against your Supabase project:

```bash
# Using Supabase CLI (if running locally)
supabase db reset

# Or manually execute each migration file in supabase/migrations/ in order
```

Seed demo data:

```bash
# Via Supabase CLI
supabase db seed

# Or execute supabase/seed.sql directly against your database
```

This creates a demo organization with a city called **Greenville** (5,000 tonnes CO2e baseline, 2030 target) and 5 climate actions across all sectors.

### 4. Configure Clerk

1. Create a Clerk application with **Organizations** enabled
2. Set up organization roles: `org:admin`, `org:editor`, `org:viewer`
3. Create an organization and note its Clerk org ID
4. Update the `organizations` table to map your Clerk org ID to the seeded organization (or create a new one)

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000/cities/greenville](http://localhost:3000/cities/greenville) for the public dashboard.

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) for the admin workspace (requires sign-in).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Testing

The project uses Vitest with fast-check for property-based testing:

```bash
npm test
```

Tests cover:
- Calculation functions (progress, sector breakdown, projections)
- Zod validation schemas (city, climate action, import text)
- Chart data transforms
- Error sanitization (provider error stripping)

## Database Schema

```
organizations ──┬── cities ──┬── climate_actions
                │            └── import_attempts
                ├── climate_actions (via organization_id)
                └── import_attempts (via organization_id)
```

- **organizations** — Tenant container mapped to Clerk organizations
- **cities** — City profiles with baseline emissions and target year
- **climate_actions** — Individual climate initiatives with sector, reduction, status
- **import_attempts** — Audit log of AI extraction operations

Row-Level Security is enabled on all tenant-scoped tables. Public read access is granted for `cities` and `climate_actions` (supporting the public dashboard). Write operations use the service role client with application-layer tenant enforcement.

## Roles & Permissions

| Role | Can View | Can Edit | Can Delete |
|------|----------|----------|------------|
| Admin | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ |
| Viewer | ✅ | ❌ | ❌ |

## AI Import Flow

1. Admin/editor pastes free-text descriptions of climate actions (up to 10,000 chars)
2. The system validates input length, then calls the configured LLM provider
3. Structured data is extracted using Vercel AI SDK's `generateObject` with a Zod schema
4. Extracted actions are presented in a review interface with editable fields
5. User can edit, remove individual actions, then approve
6. Only approved actions are persisted to the database
7. Every extraction attempt is logged for audit purposes

Provider errors are sanitized — no API keys, internal URLs, or stack traces are ever exposed to users.

## License

Private — Case study project.
