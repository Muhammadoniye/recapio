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
 * Sends a transcript to Anthropic's Claude API for summarization and action item extraction.
 * 
 * @param transcript Plain-text meeting or lecture transcript
 * @returns Parsed JSON summary and action item object
 */
export async function summarizeTranscript(transcript: string): Promise<SummarizationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Anthropic API Key (ANTHROPIC_API_KEY) in environment variables.");
  }

  const prompt = getSummarizationPrompt(transcript);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic Claude API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  if (
    !result ||
    !result.content ||
    !Array.isArray(result.content) ||
    result.content.length === 0 ||
    result.content[0].type !== "text"
  ) {
    throw new Error("Claude API returned an invalid response structure.");
  }

  let responseText = (result.content[0].text as string).trim();

  // Defensive parsing: strip markdown code blocks if Claude wraps the JSON
  if (responseText.startsWith("```")) {
    responseText = responseText
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "");
  }

  try {
    const parsed = JSON.parse(responseText) as SummarizationResult;
    
    // Schema validation
    if (
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.keyPoints) ||
      !Array.isArray(parsed.actionItems)
    ) {
      throw new Error("Invalid schema fields returned in Claude's JSON response.");
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse Claude JSON response. Raw content was:", responseText);
    const msg = error instanceof Error ? error.message : "JSON parsing failure";
    throw new Error(`Failed to parse Claude summarization output: ${msg}`);
  }
}
