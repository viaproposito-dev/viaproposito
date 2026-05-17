# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Environment

Always run `nvm use 22` before any `npm` or `node` commands — the project requires Node 22.

## Commands

```bash
npm run dev        # Start dev server with Turbopack at localhost:3000
npm run build      # prisma generate + next build
npm run lint       # ESLint via next lint
npm run test-db    # Verify database connectivity
npm run init-db    # Initialize the database schema
```

## Architecture

**Vía Propósito** is a Next.js 15 (App Router) psychological self-assessment web app. Users answer 30 questions scored across 5 personality profiles (`desorientado`, `rebelde`, `explorador`, `constructor`, `guia`), and receive their top profile via email after submission.

### Data flow

1. `/` — Landing page (`app/page.tsx`)
2. `/test` — Main test page (`app/test/page.tsx`, client component). Orchestrates the full flow: instructions modal → demographics form → 30 questions → score calculation → DB save → automatic email send
3. `/admin` — Admin dashboard (`app/admin/page.tsx`), password-protected via JWT stored in sessionStorage

### Scoring logic

Questions 1–6 → `desorientado`, 7–12 → `rebelde`, 13–18 → `explorador`, 19–24 → `constructor`, 25–30 → `guia`. Each category sums its 6 answer values (Likert scale). On tie, lower-order category wins. The winning category becomes `final_result`.

### API routes (`app/api/`)

| Route | Purpose |
|---|---|
| `POST /api/test-results` | Save test result with answers and category scores (Prisma transaction) |
| `GET /api/test-results` | Fetch all results (admin use) |
| `POST /api/send-result-email` | Send branded HTML email via Nodemailer |
| `POST /api/user-lookup` | Look up prior results by email |
| `POST /api/admin/login` | Authenticate admin, returns 8h JWT |
| `GET /api/admin/stats` | Aggregated statistics |
| `GET /api/admin/basic-stats` | Quick stats |
| `GET /api/admin/all-tests` | All test results for admin table |
| `GET /api/admin/tests-by-day` | Time-series data |
| `GET /api/admin/user-summary` | Per-user summary |

### Database (PostgreSQL + Prisma)

Three tables: `test_results` (one row per submission), `answers` (one row per question), `category_scores` (one row per category). All `answers` and `category_scores` cascade-delete with their `test_result`.

Schema is at `prisma/schema.prisma`. Run `npx prisma generate` after schema changes; run `npm run build` which does this automatically.

### Auth

- Admin routes: JWT signed with `JWT_SECRET`, verified client-side in sessionStorage. Token expires in 8h.
- Middleware (`middleware.ts`) protects `/api/initialize-db` and `/api/admin/stats` via `x-api-key` header matching `ADMIN_API_KEY`.
- Admin UI auth is client-side only — the middleware comment acknowledges this limitation.

### Shared types (`types.ts`)

`Question`, `CategoryResult`, `TestResult`, `UserDemographics` — used across the test page and API routes.

### Styling

Tailwind CSS with a custom brand palette defined in `tailwind.config.ts`:
- `via-primary` (#295244) — dark green
- `via-cream` (#FEFBEF) — background
- `via-orange` (#CC6F48) — validation/alerts
- `via-sage`, `via-light`, `via-secondary`, `via-dark`, `via-yellow`

Fonts: Poppins (sans-serif body), STIX Two Text (serif accent).

### Required environment variables

```
DATABASE_URL
ADMIN_API_KEY
ADMIN_PASSWORD
JWT_SECRET
EMAIL_SERVER_HOST
EMAIL_SERVER_PORT
EMAIL_SERVER_USER
EMAIL_SERVER_PASSWORD
EMAIL_FROM
NEXT_PUBLIC_APP_URL
```
