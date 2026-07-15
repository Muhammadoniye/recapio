/**
 * Prompt generation helpers for AI.
 */

/**
 * Returns the prompt instructing Claude to summarize the transcript
 * and extract key discussion points and action items in a strict JSON format.
 * 
 * @param transcript The plain-text transcription of the audio
 * @returns The structured prompt string
 */
export function getSummarizationPrompt(transcript: string): string {
  return `You are an expert AI meeting assistant. Your task is to analyze the meeting/lecture transcript provided below and generate a concise summary, extract key discussion points, and compile a list of action items.

You MUST respond with a valid JSON object matching the following TypeScript interface structure:

interface SummarizationResult {
  summary: string;
  keyPoints: string[];
  actionItems: {
    task: string;
    owner: string | null;
    deadline: string | null;
  }[];
}

Instructions for parsing fields:
- summary: A single cohesive paragraph (3-5 sentences) summarizing the main topics covered, decisions, and overall alignment.
- keyPoints: A list of 3-6 bullet points capturing critical decisions, debates, or information shared.
- actionItems: A list of actionable tasks. For each item:
  - task: Clear, specific, and actionable task description.
  - owner: The name of the assignee (e.g. "John"). If no assignee is explicitly or implicitly mentioned, set this to null.
  - deadline: The due date, timeline, or relative date mentioned (e.g. "by Friday", "end of next week"). If no timeframe is mentioned, set this to null.

Constraint:
Your response must contain ONLY the raw JSON object. Do not wrap it in markdown block quotes (do not use \`\`\`json or \`\`\`), do not output any introductory greetings, explanations, or note texts.

Transcript:
"""
${transcript}
"""`;
}
