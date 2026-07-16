# Recapio: Project Overview & Specification

## 1. Overview
Recapio is a dynamic web application that automates the process of transcribing, summarizing, and tracking action items from meeting and lecture recordings. Users upload audio files (such as `.mp3`, `.wav`, or `.m4a`), and the app automatically parses the audio to compile structured summaries, key discussion points, and interactive, checkable action checklists complete with assignees and deadlines.

---

## 2. Technical Stack & Architecture
Recapio is built on a modern, highly scalable, and cost-efficient serverless architecture:

* **Frontend Framework:** Next.js 14.2.35 (React, App Router) using a client-side polling model for dynamic UI status synchronizations.
* **Database & ORM:** PostgreSQL (hosted on Supabase) utilizing Prisma ORM. Engineered programmatically to run with a transaction-mode connection pooler (PgBouncer) via port 6543, forcing `pgbouncer=true` and a strict connection limit of 1 per container to prevent resource exhaustion.
* **Storage Layer:** Supabase Cloud Storage. Designed for direct client-to-bucket uploads from the browser (bypassing Vercel's 4.5MB API body limits) secured by bucket-level Row Level Security (RLS) policies.
* **AI Core Services:** 
  * Google Gemini 1.5 Flash API (Standalone/Free Tier option for both speech transcription and JSON structured summaries).
  * OpenAI Whisper API & Anthropic Claude 3.5 Sonnet (Premium Tier alternatives).
* **Styling & UI:** Tailwind CSS, Lucide icons, and Radix UI Primitives for a clean, custom design system.

---

## 3. Core Features & Functional Walkthrough

### 🚀 Direct Uploader & Validation
* Handles file uploads up to 25MB (approx. 30–40 minutes of audio).
* Direct-to-Supabase upload flow completely avoids Vercel serverless request payload limits.
* Client-side validation for file formats (`.mp3`, `.wav`, `.m4a`) and maximum size constraints.

### 🔄 Dynamic State Tracking & Auto-Processing
* The app automatically orchestrates and monitors the background pipeline.
* UI badges render status dynamically: `Processing ➜ Transcribing ➜ Transcribed ➜ Summarizing ➜ Complete`.
* Mount-check listeners automatically trigger processing on the backend if a queued recording is visited or loaded on the dashboard, preventing pipeline hanging.

### 📝 Detail Workspace
* Collapsible, plain-text transcription reader featuring real-time, highlighted query search.
* Structured bulleted list of key discussion points parsed from raw transcripts.
* Interactive checkbox lists for action items (tasks, assignees, deadlines) with persistent database updates on click.

### 🗑️ Custom Modal Cleanup Flow
* Standard browser-native alert dialogs are replaced with a custom-built, modern confirmation dialog.
* Triggers cascade deletion: purging the database record, deleting checklists, and deleting the physical audio file from Supabase Cloud Storage.

---

## 4. Scope Specification

### 🎯 IN SCOPE (What is Supported)
1. **Google Gemini Free Tier:** High-speed, 100% free transcription and summarization using Gemini 1.5 Flash.
2. **Direct Browser Uploads:** Large file support up to 25MB directly to cloud storage.
3. **Cascade Purges:** Deleting a recap automatically cleans up related database entries and storage files.
4. **Auto-Triggering:** Automatically resumes/starts processing for any recap stuck in the "queued" status.
5. **Interactive Checklists:** Checkbox state toggling persists instantly across reloads.
6. **Search & Filter:** Find past recaps by title or filter by pipeline status.

### 🚫 OUT OF SCOPE (Future Features)
1. **Live Stream Recording:** Transcribing audio in real-time from a microphrone (only pre-recorded file uploads are supported).
2. **Speaker Diarization:** Automatically distinguishing different speakers in the transcript (e.g. "Speaker 1", "Speaker 2").
3. **User Authentication:** No sign-in, login, or roles/permissions (designed as a single-workspace demo tool).
4. **External Integrations:** Auto-syncing action items to Slack, Google Calendar, or sending email notifications.
5. **Transcript Editing:** Manual editing or correction of generated text.
6. **Video Transcribing:** Support for video uploads (MP4, AVI, etc.) is currently blocked.
