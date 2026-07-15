import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { saveAudioFile } from "@/lib/storage/upload";
import path from "path";

/**
 * GET /api/recaps
 * Retrieves a list of all recaps in the database ordered by creation date descending.
 */
export async function GET() {
  try {
    const recaps = await prisma.recap.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json({ data: recaps });
  } catch (error) {
    console.error("Failed to fetch recaps:", error);
    return NextResponse.json(
      { error: "Failed to fetch recaps. Database connection offline." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recaps
 * Handles audio upload, stores the file, and queues a new recap record in the database.
 */
export async function POST(request: NextRequest) {
  try {
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB limit

    // 1. Early check on Content-Length header to prevent unnecessary body downloading
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 25MB limit." },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const file = formData.get("file");

    // Validate title presence
    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "Recap title is required." },
        { status: 400 }
      );
    }

    // Validate file presence
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Audio file is required." },
        { status: 400 }
      );
    }

    // Validate file extension
    const ext = path.extname(file.name).toLowerCase();
    const validExtensions = [".mp3", ".wav", ".m4a"];
    if (!validExtensions.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file format. Please upload .mp3, .wav, or .m4a audio files." },
        { status: 400 }
      );
    }

    // Validate file size (double check fallback)
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 25MB limit." },
        { status: 413 }
      );
    }

    // Save the file to public/uploads/
    const audioUrl = await saveAudioFile(file);

    // Create the database record with default status 'queued'
    const recap = await prisma.recap.create({
      data: {
        title: title.trim(),
        audioUrl,
        status: "queued",
      },
    });

    return NextResponse.json({ data: recap }, { status: 201 });
  } catch (error) {
    console.error("Failed to process recap creation:", error);
    return NextResponse.json(
      { error: "Failed to process upload and queue recap. Database connection offline." },
      { status: 500 }
    );
  }
}
