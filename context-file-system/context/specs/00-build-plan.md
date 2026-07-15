# Unit 00: Build Plan

This file is the full build plan for Recapio, broken into ordered,
scoped units. Each unit should have its own spec file in
`context/specs/` (e.g. `01-project-scaffold.md`) written just
before that unit is implemented, using this plan plus
`project-overview.md` and `architecture.md` as input.

Do not start a unit out of order. Do not merge units unless
explicitly revised here first.

---

### Unit 01 — Project Scaffold & Database Schema

**Builds:** Next.js + TypeScript project initialized, Tailwind
and shadcn/ui configured, Prisma installed with the initial
schema (`Recap` and `ActionItem` models) and a working migration
against a real PostgreSQL database.

**Dependencies:** None — this is the foundation.

---

### Unit 02 — Dashboard UI Shell (Placeholder Data)

**Builds:** The dashboard page layout — top bar, "New Recap"
button, RecapCard component, empty state — rendered with
hardcoded placeholder data. No API calls yet.

**Dependencies:** Unit 01 (Tailwind/shadcn configured).

---

### Unit 03 — Upload Flow (API + UI Wiring)

**Builds:** The "New Recap" modal (title + file input), the audio
file storage integration, and the `POST /api/recaps` route that
creates a `Recap` record with status `queued` and stores the
uploaded file. Dashboard is wired to real data (recaps now come
from the database instead of placeholders).

**Dependencies:** Unit 01 (schema), Unit 02 (dashboard shell to
wire up).

---

### Unit 04 — Transcription Pipeline

**Builds:** The Whisper API integration in `lib/ai/`, and the
route handler that takes a `queued` recap, transcribes its audio,
stores the transcript, and updates status to `transcribed` (or
`failed` on error).

**Dependencies:** Unit 03 (recap creation and audio storage must
exist first).

---

### Unit 05 — Summarization & Action Item Extraction

**Builds:** The Claude API integration in `lib/ai/`, including the
structured-output prompt that returns a summary, key discussion
points, and action items. Route handler takes a `transcribed`
recap, runs summarization, stores the summary and creates
`ActionItem` records, and updates status to `complete` (or
`failed`).

**Dependencies:** Unit 04 (a transcript must exist to summarize).

---

### Unit 06 — Status Polling

**Builds:** A status endpoint (or reuse of the recap GET route)
and frontend polling logic so the dashboard and detail page
reflect live pipeline status (`queued` → `transcribing` →
`transcribed` → `summarizing` → `complete`/`failed`) without a
manual refresh.

**Dependencies:** Units 03–05 (all statuses must be produced by
the pipeline before they can be polled and displayed).

---

### Unit 07 — Recap Detail Page

**Builds:** The full detail page — summary card, action item
checklist (toggle complete via a `PATCH` route), and the
collapsible/searchable transcript viewer.

**Dependencies:** Unit 05 (summary and action items must exist),
Unit 06 (status must be visible while still processing).

---

### Unit 08 — Dashboard Search & Refinement

**Builds:** Search-by-title on the dashboard, sort by date, and
status badge styling per `ui-context.md`.

**Dependencies:** Unit 03 (real recap data), Unit 06 (status
values to badge).

---

### Unit 09 — Error Handling & Polish

**Builds:** `failed` status handling with a visible error message
and retry option, loading/empty states audit, responsive check
across dashboard and detail page, final pass against
`ui-context.md` for visual consistency.

**Dependencies:** All previous units — this is a hardening pass,
not new functionality.

---

## Notes on Ordering

- Backend pipeline (Units 03–05) is built before the frontend is
  fully wired to live status (Unit 06), following the "backend
  before frontend wiring" rule.
- The dashboard UI shell (Unit 02) is built with placeholder data
  before real data exists, following the "UI shells before real
  data" rule — this lets visual/layout issues get caught early.
- Search and polish (Units 08–09) are deliberately last since they
  depend on every other piece already working.
