# Business Assistant Dashboard

A full-stack B2B business operations dashboard for small business owners. Login with business credentials to access a real-time control panel with calendar, notifications, orders, stock control, mail, contacts, and personal notes — all connected via a REST API with n8n webhook support.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/dashboard run dev` — run the frontend dashboard
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Default Login Credentials

- **Business Name:** `demo`
- **Password:** `demo123`
- To change credentials: set `BUSINESS_NAME` and `BUSINESS_PASSWORD` env vars on the API server

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (one file per entity)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/dashboard/src/pages/` — React pages (login, dashboard, settings)
- `artifacts/dashboard/src/components/layout.tsx` — Main sidebar layout
- `artifacts/dashboard/src/lib/auth.tsx` — Auth context (localStorage)

## Architecture decisions

- Auth is session-based via localStorage key `biz-auth`. The API doesn't use JWTs — just validates credentials on login and returns the business name. Extend with real sessions as needed.
- The n8n webhook endpoint (`POST /api/webhook/n8n`) accepts a typed payload (`type: "notification" | "calendar_event" | "order"`) and inserts records into the appropriate tables.
- `from` is a reserved SQL keyword — the mails table uses column name `sender` internally, mapped to `from` in the Drizzle schema.
- All API routes are prefix-aware under `/api`. The frontend uses the generated `@workspace/api-client-react` hooks exclusively.

## Product

- Login page with business name + password
- Dashboard with 7 widgets: Calendar, Notifications, Mail, Orders, Stock Control, Contacts, Personal Notes
- Settings page with n8n webhook URL, toggle, secret token, and API reference
- n8n webhook endpoint at `POST /api/webhook/n8n` — accepts calendar events, alerts, and orders from automation workflows

## User preferences

- Corporate navy + slate palette (professional B2B look)
- Fully responsive, mobile-friendly

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- The `mails` table uses `sender` as the DB column name (not `from`)
- Stock `isCritical` flag is set in seed data — in production, compute it dynamically based on `currentStock < minStock`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
