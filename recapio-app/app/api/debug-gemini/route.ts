import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/debug-gemini
 * Helper diagnostic endpoint to verify model access and debug Gemini API configuration.
 */
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY environment variable is not set on Vercel." },
      { status: 400 }
    );
  }

  try {
    // Attempt to list models supported by this specific API Key
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();

    return NextResponse.json({
      httpStatus: response.status,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 4) + "...",
      data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to query Gemini API" },
      { status: 500 }
    );
  }
}
