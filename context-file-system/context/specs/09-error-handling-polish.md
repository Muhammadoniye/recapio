# Unit 09 — Error Handling & Polish

## Goal

Perform final polish on all existing modules. Replace mock alerts with functional router links, double-verify file size constraints on both client and server layers, and ensure comprehensive offline database handling and clean compilation.

## Deliverables

1. **Dashboard Card Clicks (`components/recap-card.tsx`)**:
   - Replace the mock click alert:
     ```typescript
     onClick={() => alert(`Navigating to Recap Details...`)}
     ```
     with programmatic client-side routing using `useRouter` from `next/navigation`:
     ```typescript
     router.push(`/recaps/${id}`)
     ```
   - Ensure the card is keyboard accessible and follows good anchor/interaction behavior.

2. **File Size Limit Double Checks**:
   - Client check: Verify that file sizes above 25MB trigger immediate rejection banners in the modal before any network payload is sent.
   - Server check: Confirm that `POST /api/recaps` routes read file chunk size lengths and reject requests with `413 Payload Too Large` if they exceed 25MB.

3. **Offline database and API validation**:
   - Verify that all routes gracefully transition to database-isolated mock status updates or display retry indicators when Postgres connections are offline.

## Verification Checklist

- [x] Clicking a recap card on the dashboard navigates successfully to `/recaps/[id]`.
- [x] Uploading a file larger than 25MB is blocked client-side with an error in the dialog.
- [x] Uploading a file larger than 25MB via REST clients returns a 413 error status on the server.
- [x] Bad API configuration shows clear error details with actionable solutions inside the failure banner.
- [x] Database errors on the list view show clean "Error Loading Recaps" illustration blocks with working retry triggers.
- [x] `npm run build` compiles successfully with no lint or type warnings.
