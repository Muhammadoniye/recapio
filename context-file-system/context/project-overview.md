# Recapio

## Overview

Recapio is a web application that turns raw meeting and lecture
audio into a structured, readable record: a full transcript, a
concise summary, and a checklist of action items with owners and
deadlines. It is built for anyone who sits through meetings or
lectures and either forgets to take notes or has no time to write
them up afterward. Instead of manually typing minutes, a user
uploads an audio recording and Recapio produces the summary and
action items automatically using AI.

## Goals

1. Reduce the time it takes to go from "meeting just ended" to
   "clear written summary with action items" from ~20 minutes of
   manual note-writing to under 3 minutes of automated processing.
2. Ensure no action item discussed in a meeting or lecture gets
   forgotten by extracting it into a persistent, checkable list.
3. Give users a searchable archive of past meetings/lectures so
   they never have to ask "what did we agree on last time?" again.

## Core User Flow

1. User lands on the Dashboard and sees a list of past recaps
   (empty state on first visit).
2. User clicks "New Recap," gives it a title, and uploads an
   audio file (`.mp3`, `.wav`, or `.m4a`).
3. Recapio uploads the file to storage and creates a Recap record
   with status `queued`.
4. Recapio transcribes the audio (status moves to `transcribing`,
   then `transcribed`).
5. Recapio sends the transcript to Claude to generate a summary
   and structured action items (status moves to `summarizing`,
   then `complete`).
6. User is taken to the Recap Detail page automatically once
   processing completes, or can navigate to it manually from the
   dashboard while it's still processing to see live status.
7. On the Recap Detail page, the user reads the summary, checks
   off action items as they're completed, and can expand/search
   the full transcript.
8. User returns to the Dashboard at any time to search past
   recaps by title or sort by date.

## Features

### Upload & Processing

- Upload an audio file with a title
- Automatic pipeline: transcription → summarization → action item
  extraction
- Live status shown on both the dashboard and detail page
  (`queued`, `transcribing`, `transcribed`, `summarizing`,
  `complete`, `failed`)

### AI Summarization

- Concise natural-language summary of the discussion
- Structured action items: task, owner (if mentioned), deadline
  (if mentioned)
- Key discussion points as a short bulleted list

### Recap Library (Dashboard)

- List of all past recaps, most recent first
- Search by title
- Status badge per recap (processing vs. complete vs. failed)

### Recap Detail View

- Summary card
- Action item checklist — each item can be marked complete/incomplete
- Full transcript viewer — collapsible, with in-page text search

## Scope

### In Scope

- Single-user, no-login usage (internal/demo tool)
- Uploading pre-recorded audio files (not live recording)
- Automated transcription via Whisper API
- Automated summary and action item extraction via Claude API
- Marking action items complete/incomplete
- Searching and listing past recaps
- Basic error/failure handling if transcription or summarization
  fails

### Out of Scope

- Live/real-time recording and transcription
- Multi-user accounts, authentication, teams, or roles
- Speaker diarization (identifying who said what)
- Email, SMS, or Slack notifications for action items
- Editing or correcting the AI-generated transcript
- Video file support (audio only)
- Calendar integration or scheduling
- Multi-language interface (English transcripts/summaries only)
- Payment, billing, or usage limits

## Success Criteria

1. A user can upload an audio file and, without further input,
   receive a complete summary and action item list.
2. A user can mark an action item complete and have that state
   persist after a page reload.
3. A user can find a specific past recap by searching its title
   from the dashboard.
4. If transcription or summarization fails, the user sees a clear
   `failed` status instead of a silently broken or infinitely
   loading page.
5. The full pipeline (upload → transcript → summary → action
   items) completes for a 10–15 minute audio file without manual
   intervention.
