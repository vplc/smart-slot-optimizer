# OverbookIQ

OverbookIQ is a Next.js + Supabase starter for optimizing appointment overbooking and SMS reminder timing. The project ships with a Postgres schema, core math utilities, minimal pages, and API route stubs so you can iterate on the full workflow end-to-end.

## Getting started

1. **Clone the repository** and install dependencies:
   ```bash
   git clone <repo-url>
   cd smart-slot-optimizer
   npm install
   ```

2. **Copy the environment template**:
   ```bash
   cp .env.local.example .env.local
   # fill in Supabase, Google, and Twilio credentials
   ```

3. **Run database migrations** (requires the Supabase CLI to be logged in and pointed at your project):
   ```bash
   npm run db:apply
   ```

4. **Start the Next.js dev server**:
   ```bash
   npm run dev
   ```
   The app is available at [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint using the flat config. |
| `npm run type-check` | Type-check the project without emitting files. |
| `npm run test` | Execute Vitest unit tests located in `tests/`. |
| `npm run db:apply` | Apply the SQL migrations via the Supabase CLI (falls back to a warning if the CLI is not installed). |

## Project structure

```
app/
  (public)/connect          – Integration onboarding screen
  (app)/dashboard           – Weekly optimization summary
  (app)/policy              – Editable policy levers
  (app)/results             – Performance snapshots
  api/                      – Supabase, Google OAuth, and optimization stubs
components/                 – Shared UI (Nav, Card)
db/migrations/              – Postgres schema compatible with Supabase
lib/                        – Math utilities, Supabase helper, bandit logic
tests/                      – Vitest suite for math helpers
```

## Deployment

The project is ready for deployment on Vercel. Ensure all environment variables from `.env.local` are configured in your Vercel project and that the Supabase database has been migrated. Once the build succeeds locally, push to your main branch and import the repository into Vercel for a one-click deploy.

## Notes

- The Google OAuth and Twilio integrations are currently stubs—they log payloads so you can verify the flow without hitting external APIs.
- Supabase authentication uses the JavaScript client; wire up real email login flows in `/app/(public)` when ready.
- The optimizer API uses coarse heuristics for initial viability. Replace with production-grade data retrieval and calibration as historical data becomes available.
