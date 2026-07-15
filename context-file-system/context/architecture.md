# Architecture Context

## Stack

| Layer            | Technology                          | Role                                                             |
| ----------------- | ------------------------------------ | ----------------------------------------------------------------- |
| Framework         | Next.js 14 (App Router) + TypeScript | Fullstack app — UI pages and API layer in one codebase           |
| UI                | Tailwind CSS + shadcn/ui             | Styling and component primitives                                 |
| Transcription     | OpenAI Whisper API                   | Converts uploaded audio into text                                 |
| Summarization     | Anthropic Claude API                 | Converts transcript into summary + structured action items       |
| Database          | PostgreSQL + Prisma ORM              | Stores recap metadata, transcripts, summaries, action items       |
| File Storage      | Supabase Storage (or equivalent)     | Stores raw uploaded audio files                                   |
| Hosting           | Vercel                               | Deployment for the Next.js app                                    |

## System Boundaries

- `app/` — pages and layouts only. No direct calls to Whisper,
  Claude, or the database from here — pages call route handlers
  or server actions, never external APIs directly.
- `app/api/` — route handlers. This is the only layer allowed to
  call Whisper or Claude, and the only layer allowed to perform
  database writes tied to the processing pipeline.
- `lib/ai/` — Whisper client, Claude client, and all prompt
  templates. All prompt engineering lives here, not inline in
  route handlers.
- `lib/db/` — Prisma client instance and all query functions.
  Route handlers call functions from here rather than using
  Prisma directly inline.
- `lib/storage/` — upload and retrieval helpers for the audio
  file storage bucket.
- `components/` — reusable UI components specific to Recapio
  (RecapCard, ActionItemList, TranscriptViewer, StatusBadge, etc).
- `components/ui/` — shadcn-generated primitives. Treated as
  library code, not application code.
- `prisma/` — schema definition and migrations.
- `context/` — the six-file context system and unit specs.

## Storage Model

- **Database (Postgres via Prisma)**: All structured data —
  recap title, status, timestamps, audio file URL (not the file
  itself), full transcript text, summary text, key discussion
  points, and action items (task, owner, deadline, completed
  flag) as a related table.
- **File Storage (Supabase Storage bucket)**: Raw audio files
  only. The database stores a reference URL, never the binary
  audio content.

## Processing Model

- Processing is **synchronous per request** for this MVP: when a
  file is uploaded, the API route runs transcription and
  summarization in sequence within the request/response
  lifecycle, updating the recap's `status` field at each stage.
- There is no background job queue in this version. This is a
  deliberate scope decision to keep the build achievable in one
  week. A queue-based pipeline (e.g. with a worker process) is a
  reasonable post-MVP improvement and should not be built now.
- The frontend polls a status endpoint (or re-fetches the recap)
  every few seconds while a recap is not yet `complete` or
  `failed`, so the UI reflects pipeline progress without needing
  websockets.

## Auth and Access Model

- No authentication in this version. Recapio is a single-user
  internal tool for this build. Every recap is visible to anyone
  who has the app open — there is no ownership or access control
  layer.
- This is an explicit scope decision, not an omission. If
  multi-user support is added later, it should be layered in as
  its own unit with its own spec — do not partially implement
  auth as a side effect of another unit.

## Invariants

1. Route handlers under `app/api/` are the only place Whisper or
   Claude API calls happen. Client components never call these
   external services directly.
2. Raw audio files are never stored in the database — only their
   storage URL is persisted.
3. AI-generated action items are always stored and returned as
   structured data (`task`, `owner`, `deadline`, `completed`) —
   never rendered as unstructured free text in the UI.
4. A recap has exactly one `status` value at any time, and that
   value must be one of: `queued`, `transcribing`, `transcribed`,
   `summarizing`, `complete`, `failed`. The UI must always reflect
   the true current status, not an assumed one.
5. A Recap Detail page never renders summary or action item data
   without a transcript existing first — the transcript is the
   source of truth; summary and action items are derived from it
   and must not exist independently.
6. If any pipeline step (transcription or summarization) fails,
   the recap's status is set to `failed` with an error message
   stored — the pipeline must never leave a recap silently stuck
   in a processing state.
