# OEF City Climate Action Tracker

A multi-tenant web application that helps cities track, visualize, and manage their climate action initiatives.

## Quick Start (pre-configured database)

A Supabase instance is already provisioned with all migrations applied and seed data loaded. To run the project:

```bash
git clone https://github.com/usasag/OEF-City-Admin---Case-Study.git
cd OEF-City-Admin---Case-Study
npm install
```

Drop the provided `.env.local` file into the project root (sent separately), then:

```bash
npm run dev
```

Open:
- **Public dashboard**: [http://localhost:3000/cities/greenville](http://localhost:3000/cities/greenville)
- **Admin workspace**: [http://localhost:3000/admin](http://localhost:3000/admin) (sign up with any email/password)

> The AI import feature requires a valid `GITHUB_TOKEN` with access to GitHub Models. If you don't have one, all other features still work.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript |
| Auth | Supabase Auth (email/password) |
| Database | Supabase Postgres + Row-Level Security |
| Validation | Zod 4 |
| Charts | Plotly.js via react-plotly.js |
| AI | OpenAI SDK (via GitHub Models endpoint) |
| Testing | Vitest + fast-check (property-based testing) |

## Full Setup (from scratch)

If you want to set up your own Supabase instance:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) |
| `AI_PROVIDER` | `github-models` |
| `AI_MODEL` | `gpt-4o` |
| `GITHUB_TOKEN` | GitHub personal access token (for GitHub Models) |

### 3. Set Up the Database

Run the migration files in `supabase/migrations/` in order (001 through 008) against your Supabase project via the SQL Editor.

Then run `supabase/seed.sql` to create demo data. This seeds **Greenville** with a 500,000 t CO2e baseline, 2035 target year, and 6 sample climate actions matching the exercise specification.

### 4. Run the Development Server

```bash
npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |

## Architecture

- **Auth**: Supabase Auth with email/password. Middleware protects admin routes.
- **AI Import**: Uses the `openai` npm package pointed at the GitHub Models endpoint (`https://models.github.ai/inference`). Extracts structured climate actions from free text with human-in-the-loop review.
- **Multi-tenancy**: Application-layer tenant checks + Postgres RLS policies.
- **Server Actions**: All mutations go through Next.js Server Actions with validation via Zod 4.

## License

Private — Case study project.
