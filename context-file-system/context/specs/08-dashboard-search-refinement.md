# Unit 08 — Dashboard Search & Refinement

## Goal

Provide interactive filtering and sorting tools on the dashboard to allow users to quickly parse their recap library. Update the `StatusBadge` styling to reference the centralized CSS custom properties (`--state-success`, `--state-error`, `--state-warning`) instead of static Tailwind color names.

## Deliverables

1. **Dashboard Filter and Sort Controls (`app/page.tsx`)**:
   - Implement dynamic state properties:
     - `statusFilter`: `"all" | "complete" | "processing" | "failed"` (defaults to `"all"`).
     - `sortOrder`: `"desc" | "asc"` (defaults to `"desc"`).
   - Add inline filter controls next to the search input on the dashboard:
     - A select dropdown to filter recaps by status:
       - "All Statuses"
       - "Completed" (status = `complete`)
       - "Processing" (status is `queued`, `transcribing`, `transcribed`, or `summarizing`)
       - "Failed" (status = `failed`)
     - A toggle button displaying current sort direction: "Newest First" (sorting by `createdAt` descending) vs. "Oldest First" (sorting by `createdAt` ascending).
   - Update filtering and sorting execution client-side:
     - Search filter: Match title against query.
     - Status filter: Filter list according to the active status grouping.
     - Sort: Sort remaining items by `createdAt` time values.

2. **Status Badge Token Alignments (`components/status-badge.tsx`)**:
   - Refactor styling configuration inside `StatusBadge`:
     - `complete`: Use `--state-success` for backgrounds (`bg-[var(--state-success)]/10`), text (`text-[var(--state-success)]`), and borders (`border-[var(--state-success)]/20`).
     - `failed`: Use `--state-error` for backgrounds (`bg-[var(--state-error)]/10`), text (`text-[var(--state-error)]`), and borders (`border-[var(--state-error)]/20`).
     - `queued` / `transcribing` / `transcribed` / `summarizing`: Use `--state-warning` for backgrounds (`bg-[var(--state-warning)]/10`), text (`text-[var(--state-warning)]`), and borders (`border-[var(--state-warning)]/20`).

## Verification Checklist

- [x] Search input continues to filter titles case-insensitively.
- [x] Changing the status select dropdown correctly filters the cards list.
- [x] Selecting "Processing" shows only `queued`, `transcribing`, `transcribed`, and `summarizing` cards.
- [x] Toggling the sort button updates the order (Newest first displays latest date at top; oldest first displays earliest date at top).
- [x] Status badges use tailwind variables mapping to CSS state custom properties.
- [x] `npm run build` succeeds with no TypeScript/compile errors.
