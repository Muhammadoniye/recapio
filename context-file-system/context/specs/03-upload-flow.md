# Unit 03 — Upload Flow (API + UI Wiring)

## Goal

Implement the end-to-end file upload flow. This involves creating a local filesystem-based audio storage helper, building the `/api/recaps` API route for listing and creating recaps (status `queued`), wiring the "New Recap" dialog to submit data to the API, and replacing the hardcoded dashboard state with real database-driven recap records.

## Decisions & Open Questions Resolved

1. **Storage Provider**: Local filesystem storage (`public/uploads`) will be used as the development-friendly "equivalent" storage provider for the MVP. This keeps the setup simple and free of credentials while maintaining a clean boundary in `lib/storage/` so it can be swapped for Supabase Storage/Cloudinary post-MVP.
2. **File Size/Duration Constraint**: The MVP will enforce a strict limit of 25MB (approx. 30 minutes of standard audio compressed format) both in the frontend upload dialog and the backend API route.
3. **Supported Formats**: Only `.mp3`, `.wav`, and `.m4a` file formats are supported.

## Deliverables

1. **Audio Storage Helper (`lib/storage/upload.ts`)**:
   - Helper function `saveAudioFile(file: File): Promise<string>` that:
     - Sanitizes the file name to avoid path traversal and invalid characters.
     - Prefixes the name with a unique identifier (e.g. timestamp or UUID) to prevent name collisions.
     - Saves the file buffer to `public/uploads/` directory inside `recapio-app`.
     - Ensures the `public/uploads/` directory is created if it doesn't exist.
     - Returns the public URL path (e.g. `/uploads/1715830112-meeting.mp3`) which will be saved in the database.

2. **API Route `POST /api/recaps`**:
   - File location: `app/api/recaps/route.ts`
   - Handles `multipart/form-data` requests.
   - Validates input:
     - `title` must be a non-empty string.
     - `file` must be present, have a size <= 25MB, and have a supported extension (`.mp3`, `.wav`, `.m4a`).
   - If validation fails, return `{ error: string }` with status `400`.
   - Saves the file using `saveAudioFile`.
   - Creates a database record in the `Recap` table with:
     - `title`: the user-specified title.
     - `audioUrl`: the returned local public path of the stored file.
     - `status`: `queued` (default from schema, but explicitly assigned or verified).
   - Returns `{ data: recap }` with status `201`.

3. **API Route `GET /api/recaps`**:
   - File location: `app/api/recaps/route.ts`
   - Fetches all `Recap` records from the database using Prisma.
   - Orders the records by `createdAt` descending.
   - Returns `{ data: recaps }` with status `200`.

4. **New Recap Dialog Wiring (`components/new-recap-dialog.tsx`)**:
   - Replace the mock timer in `handleSubmit` with a real `fetch` request to `POST /api/recaps` using `FormData`.
   - Show uploading/submitting states during the network request.
   - On success:
     - Show the success state UI checkmark.
     - Trigger a refresh callback (e.g. `onRecapCreated` or reload) so the dashboard reflects the new recap immediately.
     - Close the dialog after a brief delay and reset form fields.
   - On error:
     - Show an error notification or message inside the dialog and restore the submit button state so the user can try again.

5. **Dashboard Wiring (`app/page.tsx`)**:
   - Convert the dashboard page to fetch and display real data:
     - Use React state to hold the list of `Recap` objects.
     - Fetch the list of recaps from `/api/recaps` inside a `useEffect` hook.
     - Refresh the recap list when `onRecapCreated` is called.
     - If the API returns an empty list, render the empty state page.
   - Modify the visual toggle for testing at the bottom right so it is either disabled, commented out, or adapted to mock empty/populated database views safely without breaking live data connection.

## Verification Checklist

- [ ] A `public/uploads` directory is automatically created or exists.
- [ ] Uploading a file size > 25MB is blocked in the UI with a clear warning, and rejected by the API with a `400` status.
- [ ] Uploading an unsupported file format (e.g. `.png` or `.txt`) is blocked in the UI and rejected by the API.
- [ ] Submitting the "New Recap" form successfully uploads the file to `public/uploads/` and creates a `Recap` record with status `queued` in the database.
- [ ] Database recaps are listed on the dashboard page, ordered by most recent first.
- [ ] If no recaps exist in the database, the dashboard correctly displays the empty state page.
- [ ] Clicking "Create Recap" in the empty state page works correctly and uploads the file.
- [ ] `npm run build` succeeds with no compile or TypeScript errors.
