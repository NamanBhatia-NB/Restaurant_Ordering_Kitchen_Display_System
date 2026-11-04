import { NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export async function GET() {
  try {
    const outlets = dbStore.getOutlets();
    return NextResponse.json({
      success: true,
      outlets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch outlets" },
      { status: 500 }
    );
  }
}
