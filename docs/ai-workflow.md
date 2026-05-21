# AI Workflow Document

## 1. Which AI tools I used

- **Kiro** — AI-powered IDE with spec-driven development workflow
- **Claude Model Family** — Underlying LLM model for code generation and reasoning
- **Workflow**: Spec creation (requirements → design → tasks), then automated task execution with parallel dispatch across independent tasks

## 2. One moment where AI saved significant time

**Property-based test generation.** Prompted with "write property tests for calculation functions" and Kiro generated 13 comprehensive fast-check tests covering:
- Sum invariants (total reduction = sum of sector reductions)
- Sector breakdown consistency (percentages sum to 100%)
- Floating-point tolerance handling
- Boundary cases (zero baseline, empty actions, single action)

All 13 tests passed on first run. This would have taken 2+ hours to write manually with equivalent coverage.

## 3. One moment where I overrode/corrected the AI

**GitHub Models API integration.** The AI initially used Vercel's `@ai-sdk/openai` with the wrong endpoint (`models.inference.ai.azure.com`) and incorrect model format. It kept failing with 404 errors.

I had to:
1. Provide the correct endpoint (`https://models.github.ai/inference`)
2. Correct the model format to `openai/gpt-4o`
3. Ultimately replace the entire Vercel AI SDK layer with the direct `openai` npm package

The direct SDK approach worked immediately — simpler code, no abstraction layer, correct endpoint handling out of the box.

## 4. How I structured my session

Used Kiro's spec-driven workflow:

1. **Requirements document** — EARS format (stimulus/response), acceptance criteria for each feature
2. **Design document** — Architecture diagram, data flow, correctness properties, component breakdown
3. **Task breakdown** — Dependency graph with parallel execution waves
4. **Execution** — Tasks dispatched in waves (parallel where no dependencies). Steering files enforced project conventions (Tailwind design tokens, Zod 4 patterns, Server Action pipeline).

The spec served as the single source of truth throughout. When implementation diverged (e.g., the AI SDK swap), the spec was updated to reflect reality.

## 5. What I'd build next (given more time)

- **Batch import from documents** — Upload PDFs/CSVs of climate action plans and extract multiple actions in one pass, with progress tracking
- **Collaboration features** — Comments on actions, change history/audit trail, notification when actions are updated
- **Data validation against external sources** — Cross-reference reduction estimates with published emission factors (e.g., EPA, IPCC) to flag unrealistic claims
- **Public API** — REST/GraphQL endpoint so other tools (city dashboards, reporting systems) can pull climate action data programmatically
- **Comparative analytics** — Compare progress across cities in the same organization, benchmark against similar-sized cities
- **Email notifications** — Alert admins when actions go off-track or when new members join the organization
- **Proper invitation system** — Instead of open "join by slug", implement invite links with expiry and role assignment
- **E2E tests** — Playwright tests covering the full user journey (sign up → onboard → import → approve → view dashboard)
- **Deploy to Vercel** — Production deployment with proper domain, edge caching for public dashboard, and rate limiting on the AI endpoint
