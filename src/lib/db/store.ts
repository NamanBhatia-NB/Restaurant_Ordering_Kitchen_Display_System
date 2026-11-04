import {
  Outlet,
  MenuCategory,
  MenuItem,
  OutletMenuItem,
  Order,
  OrderItem,
  OrderEvent,
  OrderStatus,
  Profile,
} from "./schema";
import {
  SEED_OUTLETS,
  SEED_CATEGORIES,
  SEED_MENU_ITEMS,
  SEED_OUTLET_MENU_ITEMS,
  SEED_ORDERS,
  SEED_PROFILES,
} from "./seed-data";
import { defaultPrepEstimator, PrepFeatures } from "../ai/prep-estimator";
import { isValidTransition } from "../validation/schemas";
import { appEventBus } from "../events/event-bus";

// In-Memory Database Store with Out-of-the-Box Persistence & Seed Data
class Store {
  private outlets: Map<string, Outlet> = new Map();
  private categories: Map<string, MenuCategory> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private outletMenuItems: Map<string, OutletMenuItem> = new Map(); // key: outletId:itemId
  private orders: Map<string, Order> = new Map(); // key: order_number or order.id
  private orderEvents: OrderEvent[] = [];
  private profiles: Map<string, Profile> = new Map();
  private nextOrderSeq: number = 778150;

  constructor() {
    this.seed();
  }

  private seed() {
    SEED_OUTLETS.forEach((o) => this.outlets.set(o.id, { ...o }));
    SEED_CATEGORIES.forEach((c) => this.categories.set(c.id, { ...c }));
    SEED_MENU_ITEMS.forEach((m) => this.menuItems.set(m.id, { ...m }));
    SEED_OUTLET_MENU_ITEMS.forEach((om) => {
      this.outletMenuItems.set(`${om.outlet_id}:${om.menu_item_id}`, { ...om });
    });
    SEED_PROFILES.forEach((p) => this.profiles.set(p.id, { ...p }));

    SEED_ORDERS.forEach((order) => {
      this.orders.set(order.id, { ...order });
      this.orders.set(order.order_number, { ...order });

      // Initial event for each seed order
      this.orderEvents.push({
        id: `event-${order.order_number}-init`,
        order_id: order.id,
        order_number: order.order_number,
        new_status: order.status,
        changed_by: "SYSTEM_SEED",
        note: `Order seeded in status ${order.status}`,
        created_at: order.created_at,
      });
    });
  }

  // Outlets
  public getOutlets(): Outlet[] {
    return Array.from(this.outlets.values()).filter((o) => o.is_active);
  }

  public getOutlet(id: string): Outlet | undefined {
    return this.outlets.get(id);
  }

  // Categories
  public getCategories(): MenuCategory[] {
    return Array.from(this.categories.values())
      .filter((c) => c.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  // Menu Items
  public getMenuItems(outletId?: string): (MenuItem & { outletPrice?: number; isOutletAvailable?: boolean })[] {
    return Array.from(this.menuItems.values()).map((item) => {
      let outletPrice = item.base_price;
      let isOutletAvailable = item.is_active;

      if (outletId) {
        const outletOverride = this.outletMenuItems.get(`${outletId}:${item.id}`);
        if (outletOverride) {
          outletPrice = outletOverride.price;
          isOutletAvailable = item.is_active && outletOverride.is_available;
        }
      }

      return {
        ...item,
        outletPrice,
        isOutletAvailable,
      };
    });
  }

  public getMenuItem(id: string): MenuItem | undefined {
    return this.menuItems.get(id);
  }

  public updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem {
    const existing = this.menuItems.get(id);
    if (!existing) throw new Error(`Menu item not found: ${id}`);
    const updated = { ...existing, ...updates };
    this.menuItems.set(id, updated);
    appEventBus.emit("menu", { type: "ITEM_UPDATED", item: updated });
    return updated;
  }

  public updateOutletMenuItem(outletId: string, menuItemId: string, updates: Partial<OutletMenuItem>): OutletMenuItem {
    const key = `${outletId}:${menuItemId}`;
    const existing = this.outletMenuItems.get(key) || {
      outlet_id: outletId,
      menu_item_id: menuItemId,
      price: this.menuItems.get(menuItemId)?.base_price || 0,
      is_available: true,
    };
    const updated = { ...existing, ...updates };
    this.outletMenuItems.set(key, updated);
    appEventBus.emit("menu", { type: "OUTLET_ITEM_UPDATED", item: updated });
    return updated;
  }

  // Queue Depth for Outlet (Orders currently in progress)
  public getKitchenQueueDepth(outletId: string): number {
    return Array.from(new Set(this.orders.values())).filter(
      (o) =>
        o.outlet_id === outletId &&
        ["RECEIVED", "ACCEPTED", "PREPARING"].includes(o.status)
    ).length;
  }

  // Orders
  public getOrders(outletId?: string, customerId?: string): Order[] {
    const uniqueOrders = Array.from(new Set(this.orders.values()));
    return uniqueOrders
      .filter((o) => {
        if (outletId && o.outlet_id !== outletId) return false;
        if (customerId && o.customer_id !== customerId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getOrder(idOrNumber: string): Order | undefined {
    return this.orders.get(idOrNumber);
  }

  // Server-side safe order creation
  public createOrder(input: {
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    outlet_id: string;
    payment_method: "UPI" | "CARD" | "CASH";
    items: {
      menu_item_id: string;
      quantity: number;
      portion?: string;
      add_ons?: { name: string; price: number }[];
    }[];
  }): Order {
    const outlet = this.getOutlet(input.outlet_id);
    if (!outlet) throw new Error("Selected outlet does not exist");

    // Server-side price calculation and item snapshot
    let subtotal = 0;
    let totalItems = 0;
    let totalComplexityPoints = 0;

    const orderItems: OrderItem[] = [];

    input.items.forEach((reqItem, index) => {
      const menuItem = this.menuItems.get(reqItem.menu_item_id);
      if (!menuItem) {
        throw new Error(`Item not found: ${reqItem.menu_item_id}`);
      }

      // Check outlet specific price
      const outletOverride = this.outletMenuItems.get(`${input.outlet_id}:${menuItem.id}`);
      const basePrice = outletOverride ? outletOverride.price : menuItem.base_price;

      // Portion multiplier calculation
      let unitPrice = basePrice;
      if (reqItem.portion && menuItem.portion_options) {
        const option = menuItem.portion_options.find((p) => p.name === reqItem.portion);
        if (option) {
          unitPrice = Math.round(basePrice * option.price_multiplier);
        }
      }

      // Add-ons total per unit
      const addOnsCost = (reqItem.add_ons || []).reduce((acc, a) => acc + a.price, 0);
      const lineUnitTotal = unitPrice + addOnsCost;
      const lineTotal = lineUnitTotal * reqItem.quantity;

      subtotal += lineTotal;
      totalItems += reqItem.quantity;
      totalComplexityPoints += menuItem.complexity_score * reqItem.quantity;

      orderItems.push({
        id: `item-${Date.now()}-${index}`,
        order_id: "", // filled below
        menu_item_id: menuItem.id,
        item_name_snapshot: menuItem.name,
        portion_snapshot: reqItem.portion,
        quantity: reqItem.quantity,
        unit_price_snapshot: unitPrice,
        add_ons: reqItem.add_ons || [],
        line_total: lineTotal,
        is_vegetarian: menuItem.is_vegetarian,
        complexity_score: menuItem.complexity_score,
      });
    });

    // 5% GST is already included in the displayed food prices
    // Food price including GST = Subtotal. GST portion = Subtotal - (Subtotal / 1.05)
    const gst_amount = Math.round((subtotal - subtotal / 1.05) * 100) / 100;
    const total = subtotal;

    // AI Preparation Time Estimation
    const queueDepth = this.getKitchenQueueDepth(input.outlet_id);
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday

    const isPeakPeriod =
      (currentHour >= 12 && currentHour <= 15) || (currentHour >= 19 && currentHour <= 22)
        ? 1
        : 0;
    const isWeekend = currentDay === 0 || currentDay === 5 || currentDay === 6 ? 1 : 0;

    const prepFeatures: PrepFeatures = {
      itemCount: totalItems,
      complexityPoints: totalComplexityPoints,
      queueDepth,
      peakPeriod: isPeakPeriod,
      isWeekend,
    };

    const aiPrediction = defaultPrepEstimator.predict(prepFeatures, outlet.minimum_prep_minutes);

    const orderNumber = `WEB-${this.nextOrderSeq++}`;
    const orderId = `order-${orderNumber.toLowerCase()}`;
    const createdAt = new Date().toISOString();
    const promisedAt = new Date(Date.now() + aiPrediction.promisedMinutes * 60000).toISOString();

    // Link order id into items
    orderItems.forEach((item) => (item.order_id = orderId));

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: input.customer_id,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_address: input.customer_address,
      outlet_id: outlet.id,
      outlet_name: outlet.name,
      status: "RECEIVED",
      subtotal,
      gst_amount,
      total,
      payment_method: input.payment_method,
      payment_status: "PAID", // Simulated payment instant success
      estimated_prep_minutes: aiPrediction.promisedMinutes,
      promised_at: promisedAt,
      ai_metadata: {
        predictedMinutes: aiPrediction.predictedMinutes,
        confidence: aiPrediction.confidence,
        modelType: aiPrediction.modelType,
        trainingSamples: aiPrediction.trainingSamples,
        mae: aiPrediction.mae,
        fallbackUsed: aiPrediction.fallbackUsed,
        features: prepFeatures,
      },
      items: orderItems,
      created_at: createdAt,
      updated_at: createdAt,
    };

    this.orders.set(orderId, newOrder);
    this.orders.set(orderNumber, newOrder);

    // Record Event
    this.recordEvent(orderId, orderNumber, undefined, "RECEIVED", input.customer_id, "Order placed by customer");

    // Realtime notification
    appEventBus.emit("orders", { type: "ORDER_CREATED", order: newOrder });
    appEventBus.emit(`outlet:${outlet.id}`, { type: "ORDER_CREATED", order: newOrder });

    return newOrder;
  }

  // Safe State Transition
  public transitionOrderStatus(
    orderIdOrNumber: string,
    newStatus: OrderStatus,
    changedBy: string,
    note?: string
  ): Order {
    const order = this.orders.get(orderIdOrNumber);
    if (!order) throw new Error(`Order ${orderIdOrNumber} not found`);

    if (!isValidTransition(order.status, newStatus)) {
      throw new Error(`Invalid state transition: Cannot move from ${order.status} to ${newStatus}`);
    }

    const previousStatus = order.status;
    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    if (newStatus === "READY") {
      order.actual_ready_at = new Date().toISOString();
    }

    this.recordEvent(order.id, order.order_number, previousStatus, newStatus, changedBy, note);

    appEventBus.emit("orders", { type: "STATUS_UPDATED", order, previousStatus, newStatus });
    appEventBus.emit(`order:${order.order_number}`, { type: "STATUS_UPDATED", order, previousStatus, newStatus });
    appEventBus.emit(`outlet:${order.outlet_id}`, { type: "STATUS_UPDATED", order, previousStatus, newStatus });

    return { ...order };
  }

  // Kitchen Prep Time Override
  public overridePrepMinutes(
    orderIdOrNumber: string,
    overrideMinutes: number,
    reason: string,
    changedBy: string
  ): Order {
    const order = this.orders.get(orderIdOrNumber);
    if (!order) throw new Error(`Order ${orderIdOrNumber} not found`);

    order.kitchen_override_minutes = overrideMinutes;
    order.kitchen_override_reason = reason;
    order.estimated_prep_minutes = overrideMinutes;

    // Recalculate promised time from creation date + override
    const createdTime = new Date(order.created_at).getTime();
    order.promised_at = new Date(createdTime + overrideMinutes * 60000).toISOString();
    order.updated_at = new Date().toISOString();

    this.recordEvent(
      order.id,
      order.order_number,
      order.status,
      order.status,
      changedBy,
      `Prep time overridden to ${overrideMinutes} mins. Reason: ${reason}`
    );

    appEventBus.emit("orders", { type: "PREP_OVERRIDDEN", order });
    appEventBus.emit(`order:${order.order_number}`, { type: "PREP_OVERRIDDEN", order });
    appEventBus.emit(`outlet:${order.outlet_id}`, { type: "PREP_OVERRIDDEN", order });

    return { ...order };
  }

  private recordEvent(
    orderId: string,
    orderNumber: string,
    previousStatus: OrderStatus | undefined,
    newStatus: OrderStatus,
    changedBy: string,
    note?: string
  ): OrderEvent {
    const event: OrderEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order_id: orderId,
      order_number: orderNumber,
      previous_status: previousStatus,
      new_status: newStatus,
      changed_by: changedBy,
      note,
      created_at: new Date().toISOString(),
    };
    this.orderEvents.unshift(event);
    return event;
  }

  public getOrderEvents(orderIdOrNumber: string): OrderEvent[] {
    const order = this.orders.get(orderIdOrNumber);
    if (!order) return [];
    return this.orderEvents.filter(
      (e) => e.order_id === order.id || e.order_number === order.order_number
    );
  }

  // Demo Profiles
  public getProfile(idOrEmail: string): Profile | undefined {
    for (const p of this.profiles.values()) {
      if (p.id === idOrEmail || p.email === idOrEmail) return p;
    }
    return undefined;
  }
}

// Global Singleton
const globalForStore = globalThis as unknown as { appStore: Store };
export const dbStore = globalForStore.appStore || new Store();
if (process.env.NODE_ENV !== "production") globalForStore.appStore = dbStore;
