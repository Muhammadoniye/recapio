import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { transcribeAudio } from "@/lib/ai/whisper";
import { summarizeTranscript } from "@/lib/ai/claude";
import fs from "fs";
import path from "path";

export const maxDuration = 60; // Max allowed on Vercel Pro; 10s on Hobby
export const dynamic = "force-dynamic";

/**
 * POST /api/recaps/[id]/process
 * Orchestrates the full processing pipeline: audio transcription via Whisper
 * followed by summarization and action item extraction via Claude.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // 1. Validate AI Provider API Credentials
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!geminiKey && (!openAiKey || !anthropicKey)) {
      const errorMsg = "System configuration error: Please configure either GEMINI_API_KEY (for free processing) or both OPENAI_API_KEY and ANTHROPIC_API_KEY in your environment settings.";

      await prisma.recap.update({
        where: { id },
        data: {
          status: "failed",
          errorMessage: errorMsg,
        },
      });
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    // 2. Fetch target recap from the database
    const recap = await prisma.recap.findUnique({
      where: { id },
    });

    if (!recap) {
      return NextResponse.json(
        { error: "Recap not found." },
        { status: 404 }
      );
    }

    // 3. Verify status (allow queued, failed, or transcribed to support retries/resume)
    if (recap.status !== "queued" && recap.status !== "failed" && recap.status !== "transcribed") {
      return NextResponse.json(
        { error: `Recap cannot be processed in its current status: '${recap.status}'.` },
        { status: 400 }
      );
    }

    let transcriptText = recap.transcript || "";

    // Phase A: Transcription (Run if status is queued/failed, or if transcript is missing)
    if (recap.status === "queued" || recap.status === "failed" || !transcriptText) {
      // 4. Update status to 'transcribing'
      await prisma.recap.update({
        where: { id },
        data: {
          status: "transcribing",
          errorMessage: null, // Reset previous errors on retry
        },
      });

      // 5. Read audio file from either local storage or fetch from cloud storage
      const audioFileName = path.basename(recap.audioUrl);
      let fileBuffer: Buffer;

      if (recap.audioUrl.startsWith("/uploads/")) {
        const localFilePath = path.join(process.cwd(), "public", "uploads", audioFileName);

        if (!fs.existsSync(localFilePath)) {
          const errorMsg = "Source audio file not found on server storage.";
          await prisma.recap.update({
            where: { id },
            data: {
              status: "failed",
              errorMessage: errorMsg,
            },
          });
          return NextResponse.json({ error: errorMsg }, { status: 500 });
        }

        fileBuffer = await fs.promises.readFile(localFilePath);
      } else {
        try {
          const fileResponse = await fetch(recap.audioUrl);
          if (!fileResponse.ok) {
            throw new Error(`HTTP error ${fileResponse.status}: ${fileResponse.statusText}`);
          }
          const arrayBuffer = await fileResponse.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
        } catch (fetchErr) {
          const errorMsg = `Failed to download audio file from cloud storage: ${fetchErr instanceof Error ? fetchErr.message : "Network error"}`;
          await prisma.recap.update({
            where: { id },
            data: {
              status: "failed",
              errorMessage: errorMsg,
            },
          });
          return NextResponse.json({ error: errorMsg }, { status: 500 });
        }
      }

      // 6. Call OpenAI Whisper Transcriptions API
      try {
        transcriptText = await transcribeAudio(fileBuffer, audioFileName);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "OpenAI Whisper transcription failed.";
        await prisma.recap.update({
          where: { id },
          data: {
            status: "failed",
            errorMessage: errorMsg,
          },
        });
        return NextResponse.json({ error: errorMsg }, { status: 500 });
      }

      // Save intermediate transcript and transition status to 'transcribed'
      await prisma.recap.update({
        where: { id },
        data: {
          status: "transcribed",
          transcript: transcriptText,
        },
      });
    }

    // Phase B: Summarization and Action Item Extraction
    // 7. Update status to 'summarizing'
    await prisma.recap.update({
      where: { id },
      data: {
        status: "summarizing",
      },
    });

    // 8. Call Anthropic Claude Messages API
    let summaryResult;
    try {
      summaryResult = await summarizeTranscript(transcriptText);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Anthropic Claude summarization failed.";
      await prisma.recap.update({
        where: { id },
        data: {
          status: "failed",
          errorMessage: errorMsg,
        },
      });
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    // 9. Save all extracted structured data inside a database transaction
    const finalRecap = await prisma.$transaction(async (tx) => {
      // Delete existing action items to support clean retries without duplication
      await tx.actionItem.deleteMany({
        where: { recapId: id },
      });

      // Insert new action items
      if (summaryResult.actionItems.length > 0) {
        await tx.actionItem.createMany({
          data: summaryResult.actionItems.map((item) => ({
            recapId: id,
            task: item.task,
            owner: item.owner,
            deadline: item.deadline,
            completed: false,
          })),
        });
      }

      // Finalize recap status as 'complete' and save structured summaries
      return await tx.recap.update({
        where: { id },
        data: {
          summary: summaryResult.summary,
          keyPoints: JSON.stringify(summaryResult.keyPoints),
          status: "complete",
          errorMessage: null,
        },
        include: {
          actionItems: true,
        },
      });
    });

    return NextResponse.json({ data: finalRecap }, { status: 200 });
  } catch (error) {
    console.error("Pipeline process error:", error);

    // Safety check: attempt to write the failed state to database to prevent UI hanging
    try {
      const errorMsg = error instanceof Error ? error.message : "An unexpected system error occurred during processing.";
      await prisma.recap.update({
        where: { id },
        data: {
          status: "failed",
          errorMessage: errorMsg,
        },
      });
    } catch (dbErr) {
      console.error("Failed to write fail state to database:", dbErr);
    }

    return NextResponse.json(
      { error: "Internal server error occurred during processing pipeline. Database connection offline." },
      { status: 500 }
    );
  }
}
