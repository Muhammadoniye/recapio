import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Set max execution time to 60s for transcription processing
export const maxDuration = 60;

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
 * Accepts a JSON body with { title, audioUrl } — the file has already been uploaded
 * directly from the browser to Supabase Storage, bypassing Vercel's body size limit.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, audioUrl } = body;

    // Validate title
    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "Recap title is required." },
        { status: 400 }
      );
    }

    // Validate audioUrl
    if (!audioUrl || typeof audioUrl !== "string" || !audioUrl.startsWith("http")) {
      return NextResponse.json(
        { error: "A valid audio URL is required." },
        { status: 400 }
      );
    }

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
    console.error("Failed to create recap record:", error);
    return NextResponse.json(
      { error: "Failed to create recap. Database connection offline." },
      { status: 500 }
    );
  }
}
