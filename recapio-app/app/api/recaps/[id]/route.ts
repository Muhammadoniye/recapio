import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/recaps/[id]
 * Retrieves the details of a single recap, including its related action items.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const recap = await prisma.recap.findUnique({
      where: { id },
      include: {
        actionItems: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!recap) {
      return NextResponse.json(
        { error: "Recap not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: recap }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch recap details:", error);
    return NextResponse.json(
      { error: "Failed to fetch recap details. Database connection offline." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recaps/[id]
 * Deletes a recap and all its associated action items from the database.
 * Also deletes the corresponding audio file from Supabase Storage.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // 1. Fetch the recap to get the audio URL before deleting
    const recap = await prisma.recap.findUnique({
      where: { id },
    });

    if (!recap) {
      return NextResponse.json(
        { error: "Recap not found." },
        { status: 404 }
      );
    }

    // 2. Delete the record from the database (actionItems will Cascade delete automatically due to Prisma schema onDelete: Cascade)
    await prisma.recap.delete({
      where: { id },
    });

    // 3. Attempt to delete from Supabase Storage if it's a cloud URL
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_BUCKET || "Audio";

    if (supabaseUrl && supabaseKey && recap.audioUrl.includes(supabaseUrl)) {
      try {
        const fileName = recap.audioUrl.split("/").pop();
        if (fileName) {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.storage.from(bucketName).remove([fileName]);
        }
      } catch (storageErr) {
        console.error("Failed to delete audio file from storage:", storageErr);
      }
    }

    return NextResponse.json({ message: "Recap deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete recap:", error);
    return NextResponse.json(
      { error: "Failed to delete recap. Database connection offline." },
      { status: 500 }
    );
  }
}
