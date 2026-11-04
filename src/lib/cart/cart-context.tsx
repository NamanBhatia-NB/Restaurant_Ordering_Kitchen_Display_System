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

  // Load from localStorage
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

    // Create unique key based on item + portion + addons signature
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
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  // 5% GST is already included in prices: subtotal = net + (net * 0.05) => net = subtotal / 1.05
  const gstAmount = Math.round((subtotal - subtotal / 1.05) * 100) / 100;
  const total = subtotal;

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
