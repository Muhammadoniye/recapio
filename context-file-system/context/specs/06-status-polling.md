# Unit 06 — Status Polling

## Goal

Implement frontend polling and trigger logic so that when a user creates a new recap, the processing pipeline starts automatically, and the dashboard reflects status transitions (`queued` → `transcribing` → `transcribed` → `summarizing` → `complete` / `failed`) in real time without a manual page refresh.

## Deliverables

1. **Dashboard Polling Logic (`app/page.tsx`)**:
   - Implement a polling mechanism using `setInterval` that triggers while there is at least one recap in a processing state (i.e. status is `queued`, `transcribing`, `transcribed`, or `summarizing`).
   - The poll should request `GET /api/recaps` every 3 seconds to fetch the updated status from the database.
   - Once all recaps in the list have reached a terminal state (`complete` or `failed`), clear the polling interval to save resources.
   - Clean up the polling timer when the component unmounts.

2. **Asynchronous Processing Trigger**:
   - In `components/new-recap-dialog.tsx` (or `app/page.tsx` on recap creation):
     - When the `POST /api/recaps` endpoint successfully creates a recap, trigger the pipeline process request `POST /api/recaps/[id]/process` in the background (without blocking the UI/dialog close).
     - Ensure the parent page immediately triggers a refetch and starts polling.

3. **Status Polling for Recap Detail Page**:
   - Note: The detail page itself will be built in Unit 07. However, the polling utility/pattern established here should be designed so that the future detail page can reuse the same endpoint structure and logic.

## Verification Checklist

- [ ] Creating a recap triggers a background call to `/api/recaps/[id]/process`.
- [ ] Dashboard starts polling every 3 seconds immediately after creation.
- [ ] Status badges dynamically update:
  - Card showing `queued` shifts to `transcribing` when Whisper starts.
  - Card shifts to `summarizing` when Claude starts.
  - Card shifts to `complete` (displaying summary preview) or `failed` (displaying error block) when finished.
- [ ] Polling stops automatically when all recaps on the dashboard are in terminal states (`complete` or `failed`).
- [ ] Navigating away or unmounting components properly cleans up the polling interval.
- [ ] `npm run build` succeeds with no TypeScript/compile errors.
