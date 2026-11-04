import { describe, it, expect, beforeEach } from "vitest";
import { dbStore } from "../src/lib/db/store";
import { isValidTransition, VALID_STATUS_TRANSITIONS } from "../src/lib/validation/schemas";
import { OrderStatus } from "../src/lib/db/schema";

describe("Restaurant Order Business Logic & State Transitions", () => {
  it("allows all valid forward status transitions", () => {
    expect(isValidTransition("RECEIVED", "ACCEPTED")).toBe(true);
    expect(isValidTransition("ACCEPTED", "PREPARING")).toBe(true);
    expect(isValidTransition("PREPARING", "READY")).toBe(true);
    expect(isValidTransition("READY", "HANDED_OFF")).toBe(true);
    expect(isValidTransition("HANDED_OFF", "COMPLETED")).toBe(true);
  });

  it("permits cancellation from early stages but not terminal states", () => {
    expect(isValidTransition("RECEIVED", "CANCELLED")).toBe(true);
    expect(isValidTransition("ACCEPTED", "CANCELLED")).toBe(true);
    expect(isValidTransition("PREPARING", "CANCELLED")).toBe(true);
    expect(isValidTransition("COMPLETED", "CANCELLED")).toBe(false);
    expect(isValidTransition("CANCELLED", "RECEIVED")).toBe(false);
  });

  it("strictly rejects backward and invalid jump transitions", () => {
    // Jumping directly from RECEIVED to READY or COMPLETED is illegal
    expect(isValidTransition("RECEIVED", "READY")).toBe(false);
    expect(isValidTransition("RECEIVED", "COMPLETED")).toBe(false);
    // Going backward from READY to PREPARING is illegal
    expect(isValidTransition("READY", "PREPARING")).toBe(false);
    expect(isValidTransition("COMPLETED", "ACCEPTED")).toBe(false);
  });

  it("calculates order prices securely server-side from menu snapshot", () => {
    const order = dbStore.createOrder({
      customer_id: "test-customer-1",
      customer_name: "Aman Varma",
      customer_phone: "+91 98491 11223",
      customer_address: "Flat 101, Kondapur",
      outlet_id: "outlet-kondapur",
      payment_method: "UPI",
      items: [
        {
          menu_item_id: "item-chicken-biryani-family", // Base price 850
          quantity: 1,
          portion: "Family Pack (Serves 3-4)",
        },
        {
          menu_item_id: "item-double-ka-meetha", // Base price 165
          quantity: 2,
        },
      ],
    });

    // 850 * 1 + 165 * 2 = 1180
    expect(order.subtotal).toBe(1180);
    expect(order.total).toBe(1180);
    // 5% GST included: 1180 - (1180 / 1.05) ~ 56.19
    expect(order.gst_amount).toBeCloseTo(56.19, 1);
    expect(order.status).toBe("RECEIVED");
    expect(order.payment_status).toBe("PAID");
  });

  it("accurately applies add-on side costs to line items", () => {
    const order = dbStore.createOrder({
      customer_id: "test-customer-2",
      customer_name: "Sneha Rao",
      customer_phone: "+91 98492 33445",
      customer_address: "Villa 5, Gachibowli",
      outlet_id: "outlet-gachibowli",
      payment_method: "CARD",
      items: [
        {
          menu_item_id: "item-veg-biryani", // Base price 250
          quantity: 2,
          add_ons: [
            { name: "Extra Crispy Fried Onions", price: 25 },
            { name: "Extra Veg Salan", price: 40 },
          ], // Unit: 250 + 65 = 315. Total for 2: 630
        },
      ],
    });

    expect(order.subtotal).toBe(630);
    expect(order.total).toBe(630);
    expect(order.items[0].line_total).toBe(630);
  });

  it("handles kitchen staff prep time override with audit trail", () => {
    const order = dbStore.createOrder({
      customer_id: "test-customer-3",
      customer_name: "Rahul Mehra",
      customer_phone: "+91 98493 55667",
      customer_address: "Kukatpally Phase 4",
      outlet_id: "outlet-kukatpally",
      payment_method: "UPI",
      items: [
        {
          menu_item_id: "item-mutton-haleem",
          quantity: 1,
        },
      ],
    });

    const updated = dbStore.overridePrepMinutes(
      order.order_number,
      45,
      "Second fresh batch bhatti heating",
      "CHEF_LEAD"
    );

    expect(updated.estimated_prep_minutes).toBe(45);
    expect(updated.kitchen_override_minutes).toBe(45);
    expect(updated.kitchen_override_reason).toBe("Second fresh batch bhatti heating");

    const events = dbStore.getOrderEvents(order.order_number);
    const overrideEvent = events.find((e) => e.note?.includes("Second fresh batch bhatti heating"));
    expect(overrideEvent).toBeDefined();
  });

  it("prevents customer from querying or modifying other customer private data", () => {
    const order1 = dbStore.createOrder({
      customer_id: "customer-alice",
      customer_name: "Alice",
      customer_phone: "+91 98494 77889",
      customer_address: "Address Alice",
      outlet_id: "outlet-kondapur",
      payment_method: "UPI",
      items: [{ menu_item_id: "item-irani-chai", quantity: 2 }],
    });

    const order2 = dbStore.createOrder({
      customer_id: "customer-bob",
      customer_name: "Bob",
      customer_phone: "+91 98495 88990",
      customer_address: "Address Bob",
      outlet_id: "outlet-kondapur",
      payment_method: "CARD",
      items: [{ menu_item_id: "item-double-ka-meetha", quantity: 1 }],
    });

    const aliceOrders = dbStore.getOrders(undefined, "customer-alice");
    expect(aliceOrders.some((o) => o.id === order1.id)).toBe(true);
    expect(aliceOrders.some((o) => o.id === order2.id)).toBe(false);
  });
});
