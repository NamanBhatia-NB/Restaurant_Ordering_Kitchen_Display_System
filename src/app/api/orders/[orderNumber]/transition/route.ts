import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { StatusTransitionSchema } from "@/lib/validation/schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const body = await request.json();

    const validation = StatusTransitionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status transition payload",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { new_status, changed_by, note } = validation.data;

    const updatedOrder = dbStore.transitionOrderStatus(
      orderNumber,
      new_status,
      changed_by,
      note
    );

    return NextResponse.json({
      success: true,
      message: `Order transitioned to ${new_status}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 400 }
    );
  }
}
