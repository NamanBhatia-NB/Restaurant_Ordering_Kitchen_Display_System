import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get("outlet_id") || undefined;

    const categories = dbStore.getCategories();
    const items = dbStore.getMenuItems(outletId);

    return NextResponse.json({
      success: true,
      categories,
      items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
