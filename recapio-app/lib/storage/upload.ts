import fs from "fs";
import path from "path";

/**
 * Saves an uploaded audio File object. If Supabase environment variables are provided,
 * it uploads the file to Supabase Storage. Otherwise, it falls back to saving on the local filesystem.
 * 
 * @param file The audio file received from the form upload
 * @returns The web-accessible URL string (public cloud URL or local static path)
 */
export async function saveAudioFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const originalName = file.name || "audio.mp3";
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const cleanFileName = `${timestamp}-${baseName || "audio"}${ext}`;

  // Check if Supabase keys are configured
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucketName = process.env.SUPABASE_BUCKET || "audios";

  if (supabaseUrl && supabaseKey) {
    const cleanUrl = supabaseUrl.replace(/\/$/, "");
    const uploadUrl = `${cleanUrl}/storage/v1/object/${bucketName}/${cleanFileName}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": file.type || "audio/mpeg",
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase Storage upload failed:", errorText);
      throw new Error(`Cloud storage upload failed: ${response.statusText}. Please verify your Supabase bucket '${bucketName}' exists and allows service role uploads.`);
    }

    // Return the public URL
    return `${cleanUrl}/storage/v1/object/public/${bucketName}/${cleanFileName}`;
  }

  // Fallback to local filesystem storage
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
