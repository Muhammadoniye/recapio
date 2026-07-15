/**
 * Whisper client helper module.
 * Sends raw audio file buffer to OpenAI Audio Transcriptions endpoint.
 */

/**
 * Transcribes an audio file buffer using OpenAI's Whisper-1 model.
 * 
 * @param fileBuffer The audio file contents as a Node Buffer
 * @param fileName The original filename (used to determine extension and MIME type)
 * @returns The plain-text transcription result
 */
export async function transcribeAudio(fileBuffer: Buffer, fileName: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API Key (OPENAI_API_KEY) in environment variables.");
  }

  // Determine standard MIME type from extension
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  let mimeType = "application/octet-stream";
  if (ext === "mp3") {
    mimeType = "audio/mpeg";
  } else if (ext === "wav") {
    mimeType = "audio/wav";
  } else if (ext === "m4a") {
    mimeType = "audio/x-m4a";
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
