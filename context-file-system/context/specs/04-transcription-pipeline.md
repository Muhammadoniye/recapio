# Unit 04 — Transcription Pipeline

## Goal

Integrate OpenAI's Whisper API to convert raw audio files into text. Create the Whisper helper module in `lib/ai/` and a dedicated Next.js API route `/api/recaps/[id]/process` that transitions a recap's status to `transcribing`, runs the transcription, saves the resulting text, and updates the status to `transcribed` (or `failed` on error).

## Deliverables

1. **Whisper Client Helper (`lib/ai/whisper.ts`)**:
   - Path: `lib/ai/whisper.ts`
   - Exports a function `transcribeAudio(fileBuffer: Buffer, fileName: string): Promise<string>` that:
     - Prepares a `multipart/form-data` payload containing:
       - `file`: the audio file buffer (wrapped as a Blob or File).
       - `model`: `"whisper-1"`.
       - `response_format`: `"text"` (or JSON/srt/vtt if timestamped output is requested).
     - Sends a `POST` request to the OpenAI Audio Transcriptions endpoint `https://api.openai.com/v1/audio/transcriptions`.
     - Uses the header `Authorization: Bearer ${process.env.OPENAI_API_KEY}`.
     - Returns the transcribed text string.
     - Handles errors defensively (e.g. status code != 200, missing API key, network timeout).

2. **API Route `POST /api/recaps/[id]/process/route.ts`**:
   - Path: `app/api/recaps/[id]/process/route.ts`
   - Orchestrates the transcription step for a recap matching `[id]`:
     - Checks if the `OPENAI_API_KEY` is present. If missing, transitions the recap's status to `failed` with a clear error message, saves to the database, and returns a 500 status.
     - Retrieves the `Recap` from the database. If not found, returns a 404.
     - Verifies if the status is `queued` or `failed` (for retries). If in another state, returns a 400.
     - Updates the recap's status to `transcribing` in the database.
     - Maps the `recap.audioUrl` to the local filesystem path in `public/uploads/` (e.g. extract filename from URL, join with `public/uploads`).
     - Reads the audio file buffer using `fs.promises.readFile`.
     - Calls `transcribeAudio(buffer, filename)`.
     - If transcription succeeds:
       - Saves the text in the `transcript` field in the database.
       - Updates the status to `transcribed`.
       - Returns `{ data: recap }` with status 200.
     - If transcription fails:
       - Logs the error.
       - Updates status to `failed` and saves the error message in the `errorMessage` field.
       - Returns `{ error: string }` with status 500.

## Verification Checklist

- [ ] `OPENAI_API_KEY` presence validation works.
- [ ] Processing endpoint returns 404 for non-existent recap IDs.
- [ ] Processing endpoint transitions status to `transcribing` before calling Whisper.
- [ ] Audio file is successfully loaded from the local path.
- [ ] Transcribed text is saved to `recap.transcript` and status is set to `transcribed` on success.
- [ ] If Whisper API returns an error, status is correctly updated to `failed` with the error details saved in `errorMessage`.
- [ ] `npm run build` succeeds with no TypeScript/compile errors.
