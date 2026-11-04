import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const order = dbStore.getOrder(orderNumber);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order ${orderNumber} not found` },
        { status: 404 }
      );
    }

    const events = dbStore.getOrderEvents(order.order_number);

    return NextResponse.json({
      success: true,
      order,
      events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
