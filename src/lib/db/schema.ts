export type UserRole = "CUSTOMER" | "KITCHEN_STAFF" | "ADMIN";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  outlet_id?: string;
  created_at: string;
}

export interface Outlet {
  id: string;
  name: string;
  location: string;
  city: string;
  service_pincodes: string[];
  fssai_license_number: string;
  minimum_prep_minutes: number;
  phone: string;
  address: string;
  is_active: boolean;
  latitude: number;
  longitude: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  base_price: number;
  is_vegetarian: boolean;
  spice_level: 0 | 1 | 2 | 3; // 0 = Mild, 1 = Medium, 2 = Spicy, 3 = Extra Hot
  allergens: string[];
  complexity_score: number; // 1 (Fast/Cold) to 5 (Dum/Slow Cook)
  portion_options?: { name: string; price_multiplier: number }[];
  available_add_ons?: { name: string; price: number }[];
  is_active: boolean;
}

export interface OutletMenuItem {
  outlet_id: string;
  menu_item_id: string;
  price: number;
  is_available: boolean;
}

export type OrderStatus =
  | "RECEIVED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "HANDED_OFF"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "UPI" | "CARD" | "CASH";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name_snapshot: string;
  portion_snapshot?: string;
  quantity: number;
  unit_price_snapshot: number;
  add_ons: { name: string; price: number }[];
  line_total: number;
  is_vegetarian: boolean;
  complexity_score: number;
}

export interface Order {
  id: string;
  order_number: string; // e.g. WEB-778120
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  outlet_id: string;
  outlet_name: string;
  status: OrderStatus;
  subtotal: number;
  gst_amount: number; // Included in total
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  estimated_prep_minutes: number;
  promised_at: string;
  actual_ready_at?: string;
  kitchen_override_minutes?: number;
  kitchen_override_reason?: string;
  ai_metadata?: {
    predictedMinutes: number;
    confidence: "high" | "medium" | "low";
    modelType: string;
    trainingSamples: number;
    mae: number;
    fallbackUsed: boolean;
    features: {
      itemCount: number;
      complexityPoints: number;
      queueDepth: number;
      peakPeriod: number;
      isWeekend: number;
    };
  };
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  order_number: string;
  previous_status?: OrderStatus;
  new_status: OrderStatus;
  changed_by: string; // user id or "SYSTEM" or "KITCHEN"
  note?: string;
  created_at: string;
}

export interface PrepTrainingSample {
  id: string;
  outlet_id: string;
  item_count: number;
  complexity_points: number;
  queue_depth: number;
  peak_period: number; // 1 or 0
  is_weekend: number; // 1 or 0
  actual_prep_minutes: number;
  created_at: string;
}
