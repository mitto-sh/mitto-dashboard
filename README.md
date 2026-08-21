# mitto-dashboard

Web UI — the Mitto control panel. Projects are a canvas of draggable service cards, Railway-style.

## Features
- GitHub OAuth login (redirect flow against mitto-api)
- Project list + creation
- Per-project environments (production/dev + custom ones), switchable from the project header —
  env vars, env var editing, and deployment history are all scoped to the selected environment
- Per-project canvas: services as draggable cards (positions persisted in localStorage)
- Service creation, env var editor, deploy trigger/cancel, deployment status

Not yet built: live logs, custom domains, database provisioning, teams/orgs, billing.

## Stack
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- [@dnd-kit/core](https://dndkit.com/) for the draggable service canvas
- vitest + Testing Library for tests (85%+ coverage required — see conventions in mitto-docs)

## Getting Started
```bash
cp .env.example .env.local
npm install
npm run dev   # http://localhost:4001
```

Requires `mitto-api` running (default `http://localhost:4000`, see `NEXT_PUBLIC_API_URL`) with
`DASHBOARD_URL=http://localhost:4001` set in its `.env` so the OAuth callback redirects here.

## Testing
```bash
npm test              # once
npm run test:coverage # with coverage report — gated at 85%
```
