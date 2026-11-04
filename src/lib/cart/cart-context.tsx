"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Outlet, MenuItem } from "../db/schema";
import { SEED_OUTLETS } from "../db/seed-data";

export interface CartLineItem {
  cartId: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  portion?: string;
  addOns: { name: string; price: number }[];
  lineTotal: number;
  isVegetarian: boolean;
  complexityScore: number;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
}

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: "DUMDIRECT",
    description: "Flat ₹100 OFF on direct orders over ₹500",
    discountType: "FLAT",
    discountValue: 100,
    minOrderValue: 500,
  },
  {
    code: "NIZAM15",
    description: "15% OFF up to ₹150 for Hyderabad food lovers",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderValue: 400,
    maxDiscount: 150,
  },
];

interface CartContextType {
  items: CartLineItem[];
  selectedOutlet: Outlet;
  setSelectedOutlet: (outlet: Outlet) => void;
  addItem: (
    item: MenuItem,
    quantity: number,
    portion?: string,
    addOns?: { name: string; price: number }[],
    customPrice?: number
  ) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  availableLoyaltyPoints: number;
  isRedeemingLoyalty: boolean;
  loyaltyDiscount: number;
  toggleRedeemLoyalty: (redeem: boolean) => void;
  gstAmount: number;
  total: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [selectedOutlet, setSelectedOutletState] = useState<Outlet>(SEED_OUTLETS[0]);
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isRedeemingLoyalty, setIsRedeemingLoyalty] = useState<boolean>(false);
  const availableLoyaltyPoints = 180; // 180 points = ₹90 discount (2 pts = ₹1)

  useEffect(() => {
    const savedOutlet = localStorage.getItem("dumhouse_outlet");
    if (savedOutlet) {
      try {
        const parsed = JSON.parse(savedOutlet);
        const match = SEED_OUTLETS.find((o) => o.id === parsed.id) || parsed;
        setSelectedOutletState(match);
      } catch {}
    }

    const savedCart = localStorage.getItem("dumhouse_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {}
    }
  }, []);

  const saveCart = (newItems: CartLineItem[]) => {
    setItems(newItems);
    localStorage.setItem("dumhouse_cart", JSON.stringify(newItems));
  };

  const setSelectedOutlet = (outlet: Outlet) => {
    setSelectedOutletState(outlet);
    localStorage.setItem("dumhouse_outlet", JSON.stringify(outlet));
  };

  const addItem = (
    item: MenuItem,
    quantity: number,
    portion?: string,
    addOns: { name: string; price: number }[] = [],
    customPrice?: number
  ) => {
    let unitPrice = customPrice !== undefined ? customPrice : item.base_price;
    if (portion && item.portion_options) {
      const p = item.portion_options.find((opt) => opt.name === portion);
      if (p) {
        unitPrice = Math.round(unitPrice * p.price_multiplier);
      }
    }

    const addOnsTotal = addOns.reduce((sum, a) => sum + a.price, 0);
    const lineUnitCost = unitPrice + addOnsTotal;

    const addOnKey = addOns.map((a) => a.name).sort().join(",");
    const signature = `${item.id}_${portion || "def"}_${addOnKey}`;

    const existingIndex = items.findIndex((i) => i.cartId === signature);

    let updated: CartLineItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].lineTotal = updated[existingIndex].quantity * lineUnitCost;
    } else {
      const newLineItem: CartLineItem = {
        cartId: signature,
        menuItemId: item.id,
        name: item.name,
        imageUrl: item.image_url,
        unitPrice,
        quantity,
        portion,
        addOns,
        lineTotal: lineUnitCost * quantity,
        isVegetarian: item.is_vegetarian,
        complexityScore: item.complexity_score,
      };
      updated = [...items, newLineItem];
    }

    saveCart(updated);
    setIsDrawerOpen(true);
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartId);
      return;
    }

    const updated = items.map((i) => {
      if (i.cartId === cartId) {
        const addOnsCost = i.addOns.reduce((sum, a) => sum + a.price, 0);
        const unitCost = i.unitPrice + addOnsCost;
        return {
          ...i,
          quantity,
          lineTotal: unitCost * quantity,
        };
      }
      return i;
    });

    saveCart(updated);
  };

  const removeItem = (cartId: string) => {
    const updated = items.filter((i) => i.cartId !== cartId);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
    setIsRedeemingLoyalty(false);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

  // Apply Coupon
  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === clean);
    if (!found) {
      return { success: false, message: "Invalid promo code. Try DUMDIRECT or NIZAM15" };
    }
    if (subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Minimum order value of ₹${found.minOrderValue} required for ${found.code}`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Coupon Discount Calculation
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === "FLAT") {
      couponDiscount = appliedCoupon.discountValue;
    } else {
      const pct = (subtotal * appliedCoupon.discountValue) / 100;
      couponDiscount = appliedCoupon.maxDiscount ? Math.min(pct, appliedCoupon.maxDiscount) : pct;
    }
    couponDiscount = Math.round(couponDiscount);
  }

  // Loyalty Discount (2 points = ₹1)
  const loyaltyDiscount = isRedeemingLoyalty ? Math.min(subtotal - couponDiscount, Math.round(availableLoyaltyPoints / 2)) : 0;

  const totalDiscounts = couponDiscount + loyaltyDiscount;
  const total = Math.max(0, subtotal - totalDiscounts);

  // 5% GST is already included in displayed prices
  const gstAmount = Math.round((total - total / 1.05) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        selectedOutlet,
        setSelectedOutlet,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        availableLoyaltyPoints,
        isRedeemingLoyalty,
        loyaltyDiscount,
        toggleRedeemLoyalty: setIsRedeemingLoyalty,
        gstAmount,
        total,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
