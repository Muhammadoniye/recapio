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
