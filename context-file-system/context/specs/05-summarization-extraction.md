# Unit 05 — Summarization & Action Item Extraction

## Goal

Integrate Anthropic's Claude API to extract a structured summary, key discussion points, and action items from a transcript. Update the processing API route `/api/recaps/[id]/process` to run this summarization step right after a successful transcription, creating the associated `ActionItem` records in the database, and transitioning the status to `complete` (or `failed`).

## Deliverables

1. **Prompt Template Module (`lib/ai/prompts.ts`)**:
   - Path: `lib/ai/prompts.ts`
   - Exports a function `getSummarizationPrompt(transcript: string): string` that instructs Claude to return a structured JSON response containing:
     - `summary`: string (concise summary paragraph).
     - `keyPoints`: array of strings (key discussion points).
     - `actionItems`: array of objects, each containing:
       - `task`: string (task description).
       - `owner`: string | null (assigned person, if mentioned).
       - `deadline`: string | null (due date or timeframe, if mentioned).
     - Forces Claude to return *only* the raw JSON object.

2. **Claude API Client Helper (`lib/ai/claude.ts`)**:
   - Path: `lib/ai/claude.ts`
   - Exports a function `summarizeTranscript(transcript: string): Promise<{ summary: string; keyPoints: string[]; actionItems: Array<{ task: string; owner: string | null; deadline: string | null }> }>` that:
     - Fetches `process.env.ANTHROPIC_API_KEY`. If missing, throws a configuration error.
     - Calls Anthropic's Messages API (`https://api.anthropic.com/v1/messages`) using `fetch`.
     - Uses model `"claude-3-5-sonnet-20241022"` (or standard current Claude 3.5 model).
     - Sends standard headers:
       - `x-api-key`: the API key.
       - `anthropic-version`: `"2023-06-01"`.
       - `content-type`: `"application/json"`.
     - Validates and parses the JSON response defensively, stripping markdown code fences (`\`\`\`json` / `\`\`\``) if Claude includes them.
     - Throws clear errors if the response is malformed or the API fails.

3. **Processing Route Updates (`app/api/recaps/[id]/process/route.ts`)**:
   - Path: `app/api/recaps/[id]/process/route.ts`
   - Extend the `POST` route handler to execute the summarization step in sequence:
     - After transcription completes successfully and the status is set to `transcribed` (or immediately following saving of the transcript), update status to `summarizing`.
     - Call `summarizeTranscript(transcript)`.
     - If summarization succeeds:
       - Save `summary` text in `recap.summary`.
       - Save `keyPoints` array as a JSON string in `recap.keyPoints`.
       - For each extracted action item:
         - Create a related record in the `ActionItem` table (mapped to `recapId = id`, setting `task`, `owner`, `deadline`, and `completed = false`).
       - Update the recap's status to `complete`.
       - Return the finalized recap object.
     - If summarization fails:
       - Catch the error, log it, update the recap's status to `failed`, write the error details into `recap.errorMessage`, and return a 500 status.

## Verification Checklist

- [ ] `ANTHROPIC_API_KEY` presence validation works.
- [ ] Prompt template instructions enforce pure JSON format.
- [ ] Response parser is robust against markdown fences (`\`\`\`json`) and handles parse failures gracefully.
- [ ] When process endpoint runs, status transitions to `summarizing` before calling Claude.
- [ ] Extracted summary and key points (JSON string) are successfully persisted in `recap.summary` and `recap.keyPoints`.
- [ ] Action items are inserted as separate rows in the `ActionItem` table related to the recap.
- [ ] Status updates to `complete` upon successful pipeline completion.
- [ ] If Claude API fails, status transitions to `failed` and error message is saved.
- [ ] `npm run build` succeeds with no TypeScript/compile errors.
