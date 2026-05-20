# Process Log — OEF City Climate Action Tracker

> A chronological record of the prompts, clarifying questions, answers, and reasoning behind the build.

---

## Section 1 — Backend

This section covers the spec-driven workflow and the implementation of the database schema, validation, business logic, authentication, server actions, server-rendered pages, and the LLM import pipeline.

### Stage 1.1 — Spec Initialization

**User prompt (paraphrased):** Create a spec for the OEF City Climate Action Tracker case study (Attached the oef-city-climate-action-architecture.md file).

**Clarifying questions asked by the workflow:**

| Question | Options | Answer |
|----------|---------|--------|
| What kind of spec is this? | Build a Feature / Fix a Bug / Quick Plan | Build a Feature |
| Where do you want to start? | Requirements / Technical Design | Requirements (requirements-first workflow) |
| Feature name | (free text) | `oef-city-climate-action-tracker` |

**Thought process:**
The case study brief described net-new functionality (a multi-tenant tracker that didn't exist), so "Build a Feature" was the correct spec type. Requirements-first was chosen because the brief had clear business needs (tenant isolation, public dashboard, AI import) but the technical approach still needed shaping. Naming followed the kebab-case convention used in `.kiro/specs/`.

---

### Stage 1.2 — Requirements Document

**User prompt:** (no follow-up — workflow proceeded automatically)

**Reasoning sequence:**

1. **Decomposed the brief into 11 requirement areas** — multi-tenancy, public dashboard, admin auth, city settings, climate-action CRUD, business-logic calculations, LLM import, provider-agnostic AI, Zod validation, schema/seed data, and server-centric mutations.
2. **Wrote acceptance criteria in EARS format** (`WHEN ... THE Tracker SHALL ...`) so each criterion is unambiguous and testable.
3. **Built a glossary upfront** to lock terminology (e.g., `Climate_Action`, `Sector`, `On_Track_Indicator`) so later phases didn't drift.
4. **Ran the requirements analyzer** which auto-resolved trivial ambiguities (e.g., what `partial` means for `Import_Attempt.status`) and surfaced clarifying questions for the user — those answers were folded back into the document.

**Key decision:** Tenant isolation was given two layers — application-level checks plus Postgres RLS — because a single layer is brittle in a multi-tenant system. Documented as Requirement 1.

---

### Stage 1.3 — Design Document

**Thought process:**

1. **Picked a monolith-first architecture.** Single Next.js App Router deployment with logical layers. The case study window was tight; microservices would have been overkill.
2. **Defined the Server Action pipeline** — `authenticate → resolve org → check role → validate → mutate` — and made it the single mutation path. This guarantees consistency and makes the pipeline a property we can test (Property 14).
3. **Chose `react-plotly.js` for charts** instead of a Python/Dash sidecar. Reasoning: the stack is entirely TypeScript/React, Plotly.js gives interactivity for free, and `next/dynamic` with `ssr: false` solves the DOM dependency.
4. **Designed the data model** with `organization_id` denormalized onto `cities`, `climate_actions`, and `import_attempts` to simplify RLS and admin queries.
5. **Listed 18 correctness properties** that the implementation must uphold — these became the basis for property-based tests.
6. **Specified the AI extractor as a provider factory** reading `AI_PROVIDER` and `AI_MODEL` from env vars. All adapters expose the same `(model: string) => LanguageModel` signature so callers never reference a vendor.

**Key decision:** The Supabase service-role client bypasses RLS for writes. Chose to enforce tenant isolation in application code (the Server Action pipeline) and treat RLS as defense-in-depth. Documented this explicitly so reviewers don't think RLS alone is the safety net.

---

### Stage 1.4 — Task Breakdown

**Thought process:**

1. **Decomposed the design into 38 leaf tasks across 9 parent groups** — schema → validation/calculations → auth/db → server actions → public dashboard → admin pages → LLM import.
2. **Wrote a wave-based dependency graph** (11 waves) so independent tasks could run in parallel during execution.
3. **Marked property tests as optional (`*`)** so the critical path could complete first; tests can be filled in incrementally.
4. **Inserted three checkpoints** ("ensure all tests pass") at natural integration points to catch drift early.
5. **Each task references requirements** for traceability — a reviewer can pick any task and find which requirements it satisfies.

---

### Stage 1.5 — Task Execution

**User prompt:** Execute Task 1, then "Proceed with the next tasks" repeatedly through Task 9.

**Approach:**

Used the wave-based parallel scheduler. For each wave:
1. Pulled all `ready` tasks
2. Marked them `in_progress`
3. Dispatched independent sub-agents in parallel (one per task)
4. Marked completed and moved to the next wave

**Wave-by-wave summary:**

| Wave | Tasks | What was built |
|------|-------|---------------|
| 0 | 1.1 | Next.js 16 init, Tailwind not yet, all dependencies, directory scaffolding |
| 1 | 1.2, 1.5 | 5 SQL migrations + shared TypeScript types/interfaces |
| 2 | 1.3, 1.4 | RLS policies migration + idempotent Greenville seed data |
| 3 | 2.1 | Zod schemas (city, climate-action, import) |
| 4 | 2.6, 2.7, 2.8 | Calculations: progress, sector breakdown, projections engine |
| 5 | (checkpoint) | All 42 tests passed |
| 6 | 4.1, 4.2 | Clerk middleware/auth helpers + Supabase client/queries |
| 7 | 5.1, 5.2 | City + climate-action Server Actions |
| 8 | (checkpoint) | All tests still passing |
| 9 | 7.1, 7.3 | Public dashboard page + Plotly wrapper/config |
| 10 | 7.2, 7.4, 8.1 | KPI components + chart components + admin layout |
| 11 | 8.2, 8.3, 8.4, 9.1 | Admin pages (settings/actions/analytics) + LLM extractor |
| 12 | 9.2, 9.4, 9.6 | Error sanitization + import action + import UI |
| 13 | (final checkpoint) | 92 tests passing, TypeScript clean |

**Key decisions during execution:**

- **Tenant isolation enforcement** — all admin DB queries filter by `organization_id` even though RLS is enabled, because the service-role client bypasses RLS. Belt-and-suspenders.
- **Server Action error shape** — adopted a single `ActionResult<T>` discriminated union so every consumer handles errors the same way.
- **Plotly type declarations** — `@types/react-plotly.js` is missing types we needed, so I wrote a minimal `src/types/plotly.d.ts` with just the shapes used (Data, Layout, Config). Avoided a runtime-only `any` cast.
- **LLM provider sanitization** — the extractor's catch block always returns a generic message, never the raw provider error. A dedicated `sanitize-error.ts` utility is documented and tested with 23 cases covering API-key patterns, internal URLs, stack traces, and provider error codes.
- **Human-in-the-loop AI** — the import action returns extracted actions for review; persistence only happens after a separate `approveImportedActions` call. No silent writes from the LLM.

---

### Stage 1.6 — README

**Prompt:** "Build the README.md file explaining everything: how to run, what it is, what it does, architecture, etc."

**Approach:** Wrote a single-source overview with: what the app does → tech stack → architecture diagram → project structure → step-by-step setup (deps, env vars, database, Clerk) → available scripts → testing → schema → roles → AI flow.

---

### Stage 1.7 — `.gitignore` Cleanup

**Prompt:** "Structure the .gitignore file."

**Approach:** Reorganized the existing flat list into 11 labeled sections (Dependencies, Next.js, TypeScript, Env, Testing, IDE, OS, Logs, Secrets, Deployment, Supabase). Added missing patterns for `.idea/`, `Thumbs.db`, `*.key`, etc.

---

### Stage 1.8 — User-Test Verification

**Prompt:** "Now run the full project commands for me to user test it."

**Approach:**
1. Ran `npm test` — 92/92 passed
2. Ran `npx tsc --noEmit` — zero errors
3. Started `npm run dev` as a background process
4. Reported all URLs (public dashboard, admin pages) with their auth requirements

---

## Backend Outcomes

| Metric | Value |
|--------|-------|
| Spec documents | 3 (requirements, design, tasks) |
| Database migrations | 6 |
| Zod schemas | 3 (shared client/server) |
| Server Actions | 5 (city, 3× climate-action, 2× import) |
| LLM provider adapters | 3 (GitHub Models, OpenAI, Anthropic) |
| Tests | 92 passing across 7 files |
| TypeScript errors | 0 |

The backend is fully spec-traced, type-safe, multi-tenant, and ready for the frontend polish layer (Section 2).
