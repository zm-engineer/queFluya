# Quefluya

Language learning app built with Next.js, Supabase, and Prisma. Users pick a native and target language, work through topics by level, and submit voice recordings that get transcribed and corrected.

## Tech stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS v4
- **Auth**: Supabase Auth (via `@supabase/ssr`)
- **Database**: PostgreSQL on Supabase, accessed through Prisma 6
- **Language**: TypeScript

## Project structure

```
app/                  Next.js App Router pages and layouts
lib/
  prisma.ts           Prisma client singleton (server-only)
  supabase/
    client.ts         Supabase browser client (client components)
    server.ts         Supabase server client (server components, actions)
prisma/
  schema.prisma       Database schema (Profile, TopicProgress, Recording)
prisma.config.ts      Prisma CLI config (loads .env via dotenv)
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Two files are used:

- **`.env`** — read by the Prisma CLI. Contains `DATABASE_URL` and `DIRECT_URL` pointing at the Supabase connection pooler.
- **`.env.local`** — read by Next.js at runtime. Contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

For Supabase, use the connection pooler URLs (not the direct `db.<ref>.supabase.co` host, which is IPv6-only on the free tier):

- `DATABASE_URL` → Transaction pooler (port `6543`) with `?pgbouncer=true&connection_limit=1`
- `DIRECT_URL` → Session pooler (port `5432`)

Both are available in Supabase Dashboard → **Connect** → **ORMs** → **Prisma**.

### 3. Sync the database schema

```bash
npx prisma db push
```

This applies `prisma/schema.prisma` to Supabase and regenerates the Prisma client.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database schema

| Model           | Purpose                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `Profile`       | One per authenticated user. Native/target languages, level, avatar.     |
| `TopicProgress` | Per-section progress within a topic for a given profile.                |
| `Recording`     | Audio submissions with transcription, corrected text, and corrected audio. |

Enums: `Language` (`EN`, `ES`), `Level` (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`).

## Using the clients

**Server (server components, route handlers, server actions):**

```ts
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
const profile = await prisma.profile.findUnique({ where: { userId: user!.id } });
```

**Browser (client components):**

```ts
"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

> The Prisma client must never be imported from a client component.

## Scripts

| Command                | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start the Next.js dev server                              |
| `npm run build`        | Production build                                          |
| `npm run start`        | Run the production build                                  |
| `npm run lint`         | Run ESLint                                                |
| `npm run test`         | Run Vitest in watch mode                                  |
| `npm run test:run`     | Run Vitest once (CI mode)                                 |
| `npm run test:ui`      | Vitest with the interactive UI                            |
| `npm run test:e2e`     | Run Playwright end-to-end tests                           |
| `npm run test:e2e:ui`  | Playwright with the UI runner                             |

## Testing

- **Unit / component tests**: Vitest + React Testing Library, configured in `vitest.config.mts`. Tests live next to the source files as `*.test.ts(x)`.
- **E2E tests**: Playwright, configured in `playwright.config.ts`. Tests live in `e2e/`.
- **Supabase mock**: `test/mocks/supabase.ts` exposes `createSupabaseMock()` to build a controllable fake client per test.
- **First-time Playwright setup**: run `npx playwright install chromium` once to download the browser binary.
- **Caveat**: Vitest does not support async Server Components yet (see Next.js docs). The dashboard page is covered only by Playwright.

## Docker

The repo ships a multi-stage `Dockerfile` and a `docker-compose.yml` that produce a small production image using Next.js's `output: "standalone"` mode (~246 MB on `node:20-alpine`).

### Build

```bash
docker compose --env-file .env.local build
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are baked into the client bundle at build time, so they are passed as build args from `.env.local`.

### Run

```bash
docker compose --env-file .env.local up
```

The container listens on `http://localhost:3000`. To run alongside the dev server (which already binds 3000), use `docker run -p 3001:3000 --env-file .env.local quefluya:local` instead.

### Stop

```bash
docker compose down
```

### Notes

- Use `npm run dev` for active development — Docker is for production-like runs and CI (see Next.js docs on local development).
- The image runs as the unprivileged `nextjs` user inside the container.
- Prisma's generated client is produced during the build stage; the runtime image does **not** include `node_modules` or the `prisma` CLI.
- `DATABASE_URL` and `DIRECT_URL` are runtime-only (Supabase queries), passed via `environment` in the compose file.

## CI with Jenkins

A declarative pipeline lives in [`Jenkinsfile`](./Jenkinsfile) with four stages: **Install → Lint → Unit tests → Docker build**. Stages 1-3 run inside a `node:20-bookworm` container; stage 4 uses the host Docker socket to build the production image.

Trigger: poll SCM every ~5 minutes (`H/5 * * * *`), plus manual builds.

See [`jenkins/SETUP.md`](./jenkins/SETUP.md) for step-by-step instructions on:

- Running Jenkins locally in Docker (with the Docker socket mounted)
- Configuring `supabase-url` and `supabase-anon-key` as Secret text credentials
- Wiring the pipeline job to this repo
- Common gotchas (missing `docker` CLI in the controller, permission errors on the socket)
