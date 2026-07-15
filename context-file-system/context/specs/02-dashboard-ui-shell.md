# Unit 02 — Dashboard UI Shell (Placeholder Data)

## Goal

Implement the main dashboard layout shell, including the top bar, "New Recap" dialog, `RecapCard` component, and an empty state, using hardcoded placeholder data. No API routes or database calls are wired up in this unit.

## Deliverables

1. **Dashboard Page Layout (`app/page.tsx`)**:
   - Header/Top Bar: Left side shows App Name ("Recapio"), right side shows a "New Recap" button.
   - Main Section: Displays a clean grid or vertical list of recaps (using `RecapCard`) or an empty state when list is empty.
   - Simple toggle or query param to easily demonstrate both states (populated and empty list) for testing.

2. **RecapCard Component (`components/recap-card.tsx`)**:
   - Displays Recap title, created date (formatted, e.g. "Jul 15, 2026"), and a status badge.
   - Shows a short summary preview if the status is `complete` (or a status/processing explanation if processing/failed).
   - Entire card is hoverable/clickable (will link to a detail page in the future).

3. **StatusBadge Component (`components/status-badge.tsx`)**:
   - Color-coded indicator based on status:
     - `complete`: Success (`--state-success` green background/border)
     - `failed`: Error (`--state-error` red background/border)
     - `queued`, `transcribing`, `transcribed`, `summarizing`: Warning/Pending (`--state-warning` amber background/border)
   - Uses Lucide React stroke-based icons (`h-4 w-4` size) inline if helpful (e.g. Check for complete, Loader2 for transcribing, AlertCircle for failed).

4. **New Recap Dialog Component (`components/new-recap-dialog.tsx`)**:
   - Triggered by the header's "New Recap" button.
   - Dialog overlay with backdrop blur (standard shadcn Dialog).
   - Form fields: Title input and an interactive Audio File drop zone.
   - Interactive drop zone supports drag-and-drop visuals (changing styles on dragover) and basic file selection (only visual state changes, no file upload API yet).
   - "Create Recap" button inside the dialog that closes the modal and triggers a mock UI success state.

5. **Aesthetic Requirements (from `ui-context.md` / Guidelines)**:
   - Light mode only, off-white background (`--bg-base`).
   - Surfaces/Cards use white background (`--bg-surface`), border (`--border-default`), and `rounded-xl` radiuses.
   - High-quality hover states, micro-interactions, and transition speeds (using CSS transitions).
   - Accent button uses `--accent-primary` and hover state `--accent-hover`.
   - Typography uses Inter (`--font-sans`).

## Verification Checklist

- [x] Header renders with App Name and "New Recap" button.
- [x] Clicking "New Recap" opens the Dialog modal with backdrop blur.
- [x] Dialog contains Title input, drag-and-drop file zone, and action buttons.
- [x] Mock toggle/state allows viewing the empty state (clean dashboard design with an illustration or message and a call-to-action button to create a recap).
- [x] Mock list displays multiple card placeholders showing different statuses (`queued`, `transcribing`, `complete`, `failed`).
- [x] Status badges use correct colors from `ui-context.md` (`--state-success`, `--state-error`, `--state-warning`).
- [x] Cards display hover animations (subtle shadow increase, border change).
- [x] `npm run build` succeeds with no TypeScript/compile errors.


