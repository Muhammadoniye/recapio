# Code Standards

## General

- Keep modules small and single-purpose — a file that transcribes
  audio should not also format API responses for the UI.
- Fix root causes, do not layer workarounds. If a type mismatch
  or a bad response shape shows up, fix it at the source, not
  with a patch downstream.
- Do not mix unrelated concerns in one component or route handler
  (e.g. do not put transcription logic and database writes for
  action items in the same function without clear separation).

## TypeScript

- Strict mode is required throughout the project.
- Avoid `any`. Use explicit interfaces for all data shapes,
  especially the AI response shapes (transcript result, summary
  result, action item).
- Validate unknown external input (uploaded files, AI API
  responses) at system boundaries before trusting it. Never
  assume the Claude API returned valid JSON — parse defensively
  and handle malformed output.

## Next.js (App Router)

- Default to server components. Add `"use client"` only when a
  component needs browser interactivity (file input, checkbox
  toggling, polling with `useEffect`).
- Route handlers in `app/api/` are focused on a single
  responsibility each (e.g. `app/api/recaps/route.ts` handles
  listing/creating recaps; `app/api/recaps/[id]/process/route.ts`
  handles running the pipeline — do not merge these).
- Keep pages thin. Data fetching and orchestration logic belongs
  in `lib/`, not inlined in page components.

## Styling

- Use the CSS custom property tokens defined in `ui-context.md` —
  no hardcoded hex values in components.
- Follow the border radius scale defined in `ui-context.md`.
- Use Tailwind utility classes; avoid custom CSS files unless a
  pattern genuinely cannot be expressed with utilities.

## API Routes

- Validate and parse request input (e.g. uploaded file type/size,
  request body shape) before any processing logic runs.
- Return consistent, predictable JSON response shapes across all
  routes: `{ data }` on success, `{ error: string }` on failure.
- Every route that triggers a pipeline step must update the
  recap's `status` field before returning, even on failure.

## AI Integration

- All prompts live in `lib/ai/` as named, exported functions —
  never inline prompt strings inside route handlers.
- Claude API calls that need structured output must request JSON
  explicitly in the prompt and the response must be parsed with a
  try/catch — a malformed response should set the recap status to
  `failed`, not throw an unhandled error.
- Whisper API calls should request timestamped output where
  possible, even though timestamps are not required for the MVP
  UI, so the data is available for future features.

## Data and Storage

- Recap metadata, transcript text, summary text, and action items
  belong in the database.
- Raw audio files belong in file/blob storage — never store audio
  binaries or base64-encoded audio in the database.
- Action items are a related table (`ActionItem`), not a JSON blob
  column, so individual items can be updated (e.g. marking
  complete) without rewriting the whole recap record.

## File Organization

- `app/` — pages, layouts, and route handlers
- `lib/ai/` — Whisper client, Claude client, prompt templates
- `lib/db/` — Prisma client and query functions
- `lib/storage/` — audio upload/retrieval helpers
- `components/` — Recapio-specific reusable components
- `components/ui/` — shadcn primitives (do not hand-edit)
- `prisma/` — schema and migrations
