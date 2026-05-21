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

| Command         | What it does                            |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start the Next.js dev server            |
| `npm run build` | Production build                        |
| `npm run start` | Run the production build                |
| `npm run lint`  | Run ESLint                              |
