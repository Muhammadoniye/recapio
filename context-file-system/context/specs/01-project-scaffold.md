# Unit 01 — Project Scaffold & Database Schema

## Goal

Initialize the Recapio project foundation: a Next.js 14 (App
Router) + TypeScript codebase with Tailwind CSS, shadcn/ui, Prisma
ORM, and a working PostgreSQL database connection with the initial
schema migrated.

## Deliverables

1. A Next.js 14 project (App Router) with TypeScript strict mode.
2. Tailwind CSS installed and configured.
3. shadcn/ui initialized; Button, Card, Badge, Checkbox, Dialog,
   Input, and Skeleton components added.
4. Design tokens from `ui-context.md` wired into global CSS as
   custom properties, plus Tailwind config extended to reference
   them.
5. Inter and JetBrains Mono fonts loaded via `next/font`.
6. Prisma installed and configured with a PostgreSQL datasource.
7. Initial schema with two models:
   - `Recap` — id, title, status (enum: `queued`, `transcribing`,
     `transcribed`, `summarizing`, `complete`, `failed`), audioUrl,
     transcript (optional text), summary (optional text),
     keyPoints (optional text, stored as JSON string),
     errorMessage (optional text), createdAt, updatedAt.
   - `ActionItem` — id, recapId (FK → Recap), task, owner
     (optional), deadline (optional), completed (boolean, default
     false), createdAt, updatedAt.
8. An initial migration generated and applied against a real
   PostgreSQL database.
9. Prisma client generated and a singleton instance exported from
   `lib/db/prisma.ts`.
10. A minimal root layout with global styles applied (background
    color, font family) and a placeholder home page confirming the
    app runs.
11. Directory structure matching the architecture boundaries:
    - `app/` — pages, layouts, route handlers
    - `app/api/` — (empty, ready for future routes)
    - `lib/ai/` — (empty, ready for Whisper/Claude clients)
    - `lib/db/` — Prisma client singleton
    - `lib/storage/` — (empty, ready for upload helpers)
    - `components/` — (empty, ready for Recapio components)
    - `components/ui/` — shadcn primitives
    - `prisma/` — schema and migrations

## Out of Scope

- Any UI beyond confirming the app loads (dashboard shell is
  Unit 02).
- Any API routes (Unit 03+).
- Any AI integration or pipeline logic (Units 04–05).
- Audio storage configuration (Unit 03).

## PostgreSQL Provider

Use Neon (serverless Postgres) for the MVP database. The
connection string goes in `.env` as `DATABASE_URL`.

## Verification Checklist

- [ ] `npm run dev` starts the app with no errors
- [ ] The home page renders in the browser with the correct
      background color (`#F7F8FA`) and Inter font
- [ ] `npx prisma db push` (or migrate) succeeds against the
      Neon database
- [ ] `npx prisma studio` opens and shows Recap and ActionItem
      tables
- [x] `npm run build` completes with no TypeScript errors
- [x] Directory structure matches the architecture boundaries
      defined above
- [x] All CSS design tokens from `ui-context.md` are present as
      custom properties in the global stylesheet
