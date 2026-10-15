# Q-Bar Frontend

Production frontend for the Q-Bar backend (busbar CRM, quotations, purchase-order intake,
and reporting). React + TypeScript + Vite, Arabic-first / RTL.

## Stack

- **React 18 + TypeScript (strict)** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **React Router** (route-level code splitting)
- **TanStack Query** — server state
- **Zustand** — auth/session + UI state (access token is **in memory only**)
- **React Hook Form + Zod** — forms & validation
- **Axios** — single configured client with centralized error handling + single-flight 401 refresh
- **Recharts** (via shadcn charts) · **Lucide** icons

## Getting started

```bash
cp .env.example .env      # then adjust VITE_API_BASE_URL if needed
npm install
npm run dev               # http://localhost:5173
```

### Environment

| Variable            | Description                              | Default                         |
| ------------------- | ---------------------------------------- | ------------------------------- |
| `VITE_API_BASE_URL` | Backend base URL including `/api/v1`     | `http://localhost:3000/api/v1`  |

### ⚠️ Backend CORS prerequisite (local dev)

The backend uses `credentials: true`, so it must allow the frontend origin explicitly — a
wildcard (`CORS_ORIGINS=*`) will **not** work with credentialed requests. In the backend
`.env` set:

```
CORS_ORIGINS=http://localhost:5173
```

then restart the backend. Secure cookies work over `http://localhost` because browsers treat
localhost as a secure context. Do not modify backend code for this — it is a config value.

## Scripts

| Command             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start the Vite dev server                  |
| `npm run build`     | Typecheck (`tsc -b`) + production build     |
| `npm run preview`   | Preview the production build                |
| `npm run typecheck` | Type-check the project                      |
| `npm run lint`      | ESLint                                      |
| `npm run format`    | Prettier                                   |

## Architecture

```
src/
  api/            HTTP client (client/) + per-domain modules (auth, users, roles, dashboard, currencies)
  app/            providers, router, layouts
  components/     ui (shadcn), common, feedback, navigation
  features/       auth, dashboard, users, roles, currencies, settings
  stores/         auth (session bridge + Zustand), ui
  hooks/ lib/ constants/   permissions, query keys, strings (i18n-ready), money, formatting
```

Data flow: **component → feature hook → TanStack Query → api module → api client → backend**.
Components never call Axios directly.

### Authentication

- Access token lives **only in memory** (session bridge) — never `localStorage`/`sessionStorage`.
- The HttpOnly refresh cookie is never read by JS.
- **Bootstrap:** on app boot → `POST /auth/refresh` → `GET /auth/me` → live permissions → render.
- **401 handling:** a single-flight refresh is shared across concurrent 401s; each request
  retries once; terminal failure clears the session and routes to `/login`.

### Permissions

UI is gated by permission **keys** (never role names) via `usePermission`, `PermissionGate`,
and route guards. Frontend checks are UX only — the backend is the authority.

### Money

Amounts are integer minor units. `MoneyText` formats using the currency's `minorUnits` from
`GET /currencies` — decimals and currency are never hardcoded.

## Scope (Phase 1)

Implemented: login, session bootstrap, protected shell, dashboard, users management,
read-only roles, settings. Other modules (CRM, quotations, products, purchase orders,
reports, audit) appear as navigation placeholders and will be built in later phases.
