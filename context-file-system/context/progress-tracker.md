# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- None — project complete!

## Current Goal

- None

## Completed

- **Unit 01**: Project scaffolded using Next.js 14, TypeScript (strict mode), Tailwind CSS, and shadcn/ui. Created the Prisma v6 database schema with `Recap` and `ActionItem` models, generated the client, and established standard layout and global design tokens.
- **Unit 02**: Dashboard UI Shell built with the top bar, "New Recap" dialog, RecapCard component, and empty states utilizing mock placeholder data.
- **Unit 03**: Upload Flow (API + UI Wiring) implemented. Built local filesystem storage, POST/GET API routes for recaps, wired up frontend modal, and replaced mock state with database-driven items.
- **Unit 04**: Transcription Pipeline implemented. Integrated OpenAI Whisper API, built the transcription helper, and implemented `/api/recaps/[id]/process` to transcribe raw audio files.
- **Unit 05**: Summarization & Action Item Extraction implemented. Integrated Claude 3.5 API, built summarization helpers, and updated `/api/recaps/[id]/process` to run summarization and save action items.
- **Unit 06**: Status Polling implemented. Added background processing triggers and silent 3s dashboard polling loops for active uploads.
- **Unit 07**: Recap Detail Page implemented. Created GET details and PATCH action item routes, dynamic checkmarks, and collapsible transcript search views.
- **Unit 08**: Dashboard Search & Refinement. Implemented search-by-title, status-based filters (All, Completed, Processing, Failed), creation-date sorting (Newest/Oldest First), and aligned status badges to centralized CSS state tokens.
- **Unit 09**: Error Handling & Polish. Replaced browser mock click alerts with Next.js client-side programmatic navigation (`useRouter`) and keyboard accessibility. Added client-side size restrictions and inline dialog banners. Added server-side early Content-Length header verification returning `413 Payload Too Large`. Standardized offline database connectivity failure messaging across routes.

## In Progress

- None

## Next Up

- None — project complete!

## Open Questions

- Which PostgreSQL provider will be used (Neon vs. Supabase)?
  Decided: Neon. The database schema has been prepared using PostgreSQL, and database configuration templates have been established in `.env`.
- Which storage provider for audio files — Supabase Storage or
  Cloudinary?
  Decided: Local filesystem storage (`public/uploads`) for development/MVP, with modular design to support Supabase Storage later.
- Max audio file size/duration for the MVP — draft assumption is
  25MB / ~30 minutes.
  Confirmed: 25MB size limit enforced on both client and server.

## Architecture Decisions

- Processing is synchronous per request, no background job queue,
  to keep the build achievable in one week (see
  `architecture.md`, Processing Model).
- No authentication in this version — single-user internal tool
  (see `architecture.md`, Auth and Access Model).
- Local filesystem storage (`public/uploads`) acts as the file storage
  provider for the MVP to run locally without cloud credentials.

## Session Notes

- This file is updated regularly to track spec execution progress.

