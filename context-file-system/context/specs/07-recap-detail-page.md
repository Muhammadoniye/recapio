# Unit 07 — Recap Detail Page

## Goal

Build the Recap Detail page. This includes creating dynamic backend API routes to retrieve single recap details and toggle action item completion states, implementing a responsive two-column desktop layout on the frontend, integrating live status polling for in-progress recaps, and building a collapsible/searchable transcript viewer styled with monospace fonts.

## Deliverables

1. **API Route `GET /api/recaps/[id]`**:
   - Path: `app/api/recaps/[id]/route.ts`
   - Retrieves the full recap object matching `[id]`, including its related `actionItems` ordered by creation date ascending.
   - Returns `{ data: recap }` on success, `404` if not found, or `500` on system error.

2. **API Route `PATCH /api/action-items/[id]`**:
   - Path: `app/api/action-items/[id]/route.ts`
   - Accepts JSON body `{ completed: boolean }`.
   - Updates the matching `ActionItem` in the database and returns `{ data: actionItem }` on success.

3. **Recap Detail Page Components**:
   - Path: `app/recaps/[id]/page.tsx` (Client component)
   - Layout:
     - Header: Recapio branding, a "Back to Dashboard" button.
     - Content (Desktop two-column):
       - Left column (40%): Summary card (`recap.summary`), Key Points (bulleted list parsed from `recap.keyPoints`), Action Items checklist.
       - Right column (60%): Searchable, collapsible Transcript Viewer.
     - Content (Mobile): Stacks into one single column (Summary, Key Points, Action Items, Transcript).

4. **Detailed Feature Logic**:
   - **Active Polling**: If the fetched recap status is not `complete` or `failed`, render a processing visual banner and poll `GET /api/recaps/[id]` every 3 seconds to update the UI dynamically.
   - **Action Item Toggles**: Checking/unchecking an action item triggers a `PATCH /api/action-items/[id]` request in the background to persist its completion status. Toggles update the local state instantly to feel responsive.
   - **Transcript Search**: Search text input highlights query matches inline inside the transcript block.
   - **Monospace Styling**: The transcript text is rendered using JetBrains Mono (`--font-mono`).

## Verification Checklist

- [ ] `GET /api/recaps/[id]` returns the recap with sorted action items.
- [ ] `PATCH /api/action-items/[id]` persists the checked/unchecked state in the database.
- [ ] Detail page renders in two columns on desktop and a single column on mobile.
- [ ] Polling runs while the recap is actively processing, and resolves to the complete state automatically.
- [ ] Key points are parsed from the database's JSON string and rendered as bullets.
- [ ] Checking an action item sends the PATCH request, and the state persists after page reload.
- [ ] Transcript viewer can be collapsed and expanded.
- [ ] Typing in the transcript search bar highlights occurrences of the search query inside the text.
- [ ] Transcript uses JetBrains Mono (`--font-mono`) font.
- [ ] `npm run build` succeeds with no TypeScript/compile errors.
