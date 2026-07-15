import fs from "fs";
import path from "path";

/**
 * Saves an uploaded audio File object to the local filesystem under public/uploads/
 * and returns the public web-accessible URL path.
 * 
 * @param file The audio file received from the form upload
 * @returns The public URL string, e.g. "/uploads/1715830112-meeting.mp3"
 */
export async function saveAudioFile(file: File): Promise<string> {
  // Convert standard Web API File to a Node.js Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Clean filename: lowercase, replace special characters/spaces with dashes
  const timestamp = Date.now();
  const originalName = file.name || "audio.mp3";
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, ""); // strip leading/trailing dashes

  const cleanFileName = `${timestamp}-${baseName || "audio"}${ext}`;

  // Ensure public/uploads directory exists
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Write file
  const filePath = path.join(uploadDir, cleanFileName);
  await fs.promises.writeFile(filePath, buffer);

  // Return static route path
  return `/uploads/${cleanFileName}`;
}
