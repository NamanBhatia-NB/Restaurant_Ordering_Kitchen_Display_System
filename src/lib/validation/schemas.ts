import { z } from "zod";
import { OrderStatus } from "../db/schema";

// Permitted Order State Transitions
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["HANDED_OFF", "CANCELLED"],
  HANDED_OFF: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export const OrderItemInputSchema = z.object({
  menu_item_id: z.string().min(1, "Menu item ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50, "Max 50 items per line"),
  portion: z.string().optional(),
  add_ons: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().min(0),
      })
    )
    .optional()
    .default([]),
});

export const CreateOrderSchema = z.object({
  customer_id: z.string().min(1, "Customer ID is required"),
  customer_name: z.string().min(2, "Customer name must be at least 2 characters"),
  customer_phone: z
    .string()
    .regex(/^(\+91[\-\s]?)?[6-9]\d{9}$/, "Please enter a valid Indian mobile number"),
  customer_address: z.string().min(5, "Delivery address must be at least 5 characters"),
  outlet_id: z.string().min(1, "Outlet selection is required"),
  payment_method: z.enum(["UPI", "CARD", "CASH"]),
  items: z.array(OrderItemInputSchema).min(1, "At least one item is required in the cart"),
  coupon_code: z.string().optional(),
  coupon_discount: z.number().min(0).optional().default(0),
  loyalty_points_redeemed: z.number().min(0).optional().default(0),
  marketing_opt_in: z.boolean().optional().default(true),
});

export const StatusTransitionSchema = z.object({
  new_status: z.enum([
    "RECEIVED",
    "ACCEPTED",
    "PREPARING",
    "READY",
    "HANDED_OFF",
    "COMPLETED",
    "CANCELLED",
  ]),
  changed_by: z.string().min(1, "Actor identifier is required"),
  note: z.string().max(250).optional(),
});

export const PrepOverrideSchema = z.object({
  override_minutes: z.number().int().min(5, "Minimum 5 minutes").max(180, "Maximum 180 minutes"),
  reason: z.string().min(3, "Please provide a reason for the override").max(200),
  changed_by: z.string().min(1, "Actor identifier is required"),
});

export const UpdateMenuItemSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(5).max(500).optional(),
  image_url: z.string().url().optional(),
  base_price: z.number().min(0).optional(),
  is_vegetarian: z.boolean().optional(),
  spice_level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).optional(),
  allergens: z.array(z.string()).optional(),
  complexity_score: z.number().int().min(1).max(5).optional(),
  is_active: z.boolean().optional(),
});
