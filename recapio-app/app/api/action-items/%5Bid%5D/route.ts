import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * PATCH /api/action-items/[id]
 * Updates the completed status of a specific action item.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await request.json();
    const { completed } = body;

    // Validate that completed is a boolean
    if (typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "Field 'completed' must be a boolean." },
        { status: 400 }
      );
    }

    // Update the action item completion state
    const actionItem = await prisma.actionItem.update({
      where: { id },
      data: {
        completed,
      },
    });

    return NextResponse.json({ data: actionItem }, { status: 200 });
  } catch (error) {
    console.error("Failed to update action item:", error);
    return NextResponse.json(
      { error: "Failed to update action item. Database connection offline." },
      { status: 500 }
    );
  }
}
