import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { PrepOverrideSchema } from "@/lib/validation/schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const body = await request.json();

    const validation = PrepOverrideSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid override payload",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { override_minutes, reason, changed_by } = validation.data;

    const updatedOrder = dbStore.overridePrepMinutes(
      orderNumber,
      override_minutes,
      reason,
      changed_by
    );

    return NextResponse.json({
      success: true,
      message: `Preparation time successfully overridden to ${override_minutes} minutes`,
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to override prep time" },
      { status: 400 }
    );
  }
}
