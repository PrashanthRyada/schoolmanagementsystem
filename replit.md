# Willow Creek School Portal

A school operations portal for managing attendance, classes, student performance, fee collection, homepage media, and school events.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Web: React, Vite, TanStack Query, Wouter, Recharts

## Where things live

- `artifacts/school-portal/src/App.tsx` — portal routes and page UI
- `artifacts/school-portal/src/index.css` — visual theme and responsive styles
- `artifacts/api-server/src/routes/` — Express route handlers
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/db/src/schema/` — Drizzle tables

## Architecture decisions

- Keep API contracts in OpenAPI and regenerate both the client hooks and server Zod schemas after changes.
- Date-only values are stored as `YYYY-MM-DD` strings in PostgreSQL and normalized at the API boundary.
- Homepage media currently accepts http(s) links or site-relative paths; direct file uploads are not configured.

## Product

The portal includes student and staff attendance, student/class mapping, student performance history, fee balances and collection analytics, school events, and an admin-facing homepage image/video carousel manager. It starts with fictional sample records and images.

## User preferences

- The user requested a React + Node.js school website with attendance, class mapping, fee analytics, student performance graphs, admin-managed homepage photos/videos, cultural activities, upcoming events, and an animated image carousel.

## Gotchas

- `/api` is the shared API prefix. Artifact pages and API calls must remain compatible with the path-based preview.
- The app has no sign-in or role-based access yet. Do not enter real student/family records or publish it until protected access is added.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
