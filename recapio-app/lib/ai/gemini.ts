import { getSummarizationPrompt } from "./prompts";

export interface SummarizationResult {
  summary: string;
  keyPoints: string[];
  actionItems: {
    task: string;
    owner: string | null;
    deadline: string | null;
  }[];
}

/**
 * Transcribes audio using Gemini 1.5 Flash API (free tier).
 */
export async function transcribeAudioWithGemini(fileBuffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API Key (GEMINI_API_KEY) in environment variables.");
  }

  // Convert buffer to base64
  const base64Audio = fileBuffer.toString("base64");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Audio,
                },
              },
              {
                text: "Please transcribe the conversation in this audio file accurately. Output ONLY the transcription, nothing else.",
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Transcription API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const transcriptionText = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!transcriptionText) {
    throw new Error("Gemini returned an empty transcription.");
  }

  return transcriptionText.trim();
}

/**
 * Summarizes a transcript using Gemini 1.5 Flash API (free tier) with JSON response constraint.
 */
export async function summarizeTranscriptWithGemini(transcript: string): Promise<SummarizationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API Key (GEMINI_API_KEY) in environment variables.");
  }

  const promptText = getSummarizationPrompt(transcript);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Summarization API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error("Gemini returned an empty summarization response.");
  }

  try {
    const parsed = JSON.parse(responseText.trim()) as SummarizationResult;
    
    // Schema validation
    if (
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.keyPoints) ||
      !Array.isArray(parsed.actionItems)
    ) {
      throw new Error("Invalid schema fields returned in Gemini's JSON response.");
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse Gemini JSON response. Raw content was:", responseText);
    const msg = error instanceof Error ? error.message : "JSON parsing failure";
    throw new Error(`Failed to parse Gemini summarization output: ${msg}`);
  }
}
