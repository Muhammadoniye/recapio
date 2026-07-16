/**
 * Whisper client helper module.
 * Sends raw audio file buffer to OpenAI Audio Transcriptions endpoint.
 */

import { transcribeAudioWithGemini } from "./gemini";

/**
 * Transcribes an audio file buffer using OpenAI's Whisper-1 model or Google Gemini 1.5 Flash.
 * 
 * @param fileBuffer The audio file contents as a Node Buffer
 * @param fileName The original filename (used to determine extension and MIME type)
 * @returns The plain-text transcription result
 */
export async function transcribeAudio(fileBuffer: Buffer, fileName: string): Promise<string> {
  // Determine standard MIME type from extension
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  let mimeType = "audio/mpeg";
  if (ext === "wav") {
    mimeType = "audio/wav";
  } else if (ext === "m4a") {
    mimeType = "audio/x-m4a";
  }

  // Check if Gemini is configured as the preferred/free option
  if (process.env.GEMINI_API_KEY) {
    return await transcribeAudioWithGemini(fileBuffer, mimeType);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing API Credentials. Please configure GEMINI_API_KEY or OPENAI_API_KEY in environment variables.");
  }



  // Prepare standard web FormData payload
  const formData = new FormData();
  
  // Wrap Node Buffer as a web Blob (convert Buffer to Uint8Array for TS compatibility)
  const fileBlob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
  formData.append("file", fileBlob, fileName);
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json"); // Verbose JSON includes segments and metadata

  // Execute request via global fetch
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI Whisper API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  if (typeof result !== "object" || !result || !("text" in result)) {
    throw new Error("Whisper API returned an unexpected response format.");
  }

  const transcript = result.text as string;
  if (!transcript.trim()) {
    throw new Error("Whisper API returned an empty transcript.");
  }

  return transcript;
}
