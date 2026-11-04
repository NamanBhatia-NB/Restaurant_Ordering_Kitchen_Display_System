import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { UpdateMenuItemSchema } from "@/lib/validation/schemas";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = UpdateMenuItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid menu item update",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const updated = dbStore.updateMenuItem(id, validation.data);

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully",
      item: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update menu item" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { outlet_id, price, is_available } = body;

    if (!outlet_id) {
      return NextResponse.json(
        { success: false, error: "outlet_id is required" },
        { status: 400 }
      );
    }

    const updated = dbStore.updateOutletMenuItem(outlet_id, id, {
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(is_available !== undefined ? { is_available: Boolean(is_available) } : {}),
    });

    return NextResponse.json({
      success: true,
      message: "Outlet menu availability updated",
      outletItem: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update outlet item" },
      { status: 400 }
    );
  }
}
