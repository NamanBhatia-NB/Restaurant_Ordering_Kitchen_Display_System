"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MenuItem } from "@/lib/db/schema";
import { useCart } from "@/lib/cart/cart-context";
import { X, Plus, Minus, Check } from "lucide-react";

interface ItemCustomizerModalProps {
  item: MenuItem;
  displayPrice: number;
  onClose: () => void;
}

export function ItemCustomizerModal({
  item,
  displayPrice,
  onClose,
}: ItemCustomizerModalProps) {
  const { addItem } = useCart();
  const [selectedPortion, setSelectedPortion] = useState<string>(
    item.portion_options?.[0]?.name || ""
  );
  const [selectedAddOns, setSelectedAddOns] = useState<{ name: string; price: number }[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Compute calculated unit price based on portion
  let currentUnitPrice = displayPrice;
  if (selectedPortion && item.portion_options) {
    const opt = item.portion_options.find((p) => p.name === selectedPortion);
    if (opt) {
      currentUnitPrice = Math.round(displayPrice * opt.price_multiplier);
    }
  }

  // Add-ons total
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const finalUnitPrice = currentUnitPrice + addOnsTotal;
  const grandTotal = finalUnitPrice * quantity;

  const toggleAddOn = (addOn: { name: string; price: number }) => {
    if (selectedAddOns.some((a) => a.name === addOn.name)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.name !== addOn.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleConfirm = () => {
    addItem(
      item,
      quantity,
      selectedPortion || undefined,
      selectedAddOns,
      displayPrice
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-cream-200 flex flex-col max-h-[90vh]">
        {/* Header / Hero */}
        <div className="relative aspect-[16/9] w-full bg-cream-100 flex-shrink-0">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-charcoal p-1.5 rounded-full shadow-md transition-transform hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-serif text-2xl font-bold">{item.name}</h3>
            <p className="text-xs text-cream-200 line-clamp-1 mt-0.5">
              {item.description}
            </p>
          </div>
        </div>

        {/* Scrollable Customization Content */}
        <div className="p-6 overflow-y-auto space-y-6 divide-y divide-cream-100 text-charcoal">
          {/* Portion Selection */}
          {item.portion_options && item.portion_options.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3">
                1. Select Portion Size
              </h4>
              <div className="space-y-2">
                {item.portion_options.map((option) => {
                  const optionPrice = Math.round(displayPrice * option.price_multiplier);
                  const isSelected = selectedPortion === option.name;
                  return (
                    <button
                      key={option.name}
                      onClick={() => setSelectedPortion(option.name)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-sm ${
                        isSelected
                          ? "border-terracotta-500 bg-terracotta-50/60 font-semibold"
                          : "border-cream-200 hover:border-cream-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-terracotta-500 bg-terracotta-500"
                              : "border-charcoal-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span>{option.name}</span>
                      </div>
                      <span className="font-bold text-charcoal">₹{optionPrice}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons Selection */}
          {item.available_add_ons && item.available_add_ons.length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3">
                2. Extra Add-ons & Sides (Optional)
              </h4>
              <div className="space-y-2">
                {item.available_add_ons.map((addOn) => {
                  const isChecked = selectedAddOns.some((a) => a.name === addOn.name);
                  return (
                    <button
                      key={addOn.name}
                      onClick={() => toggleAddOn(addOn)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-sm ${
                        isChecked
                          ? "border-terracotta-500 bg-terracotta-50/60 font-semibold"
                          : "border-cream-200 hover:border-cream-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked
                              ? "border-terracotta-500 bg-terracotta-500 text-white"
                              : "border-charcoal-300"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{addOn.name}</span>
                      </div>
                      <span className="font-bold text-charcoal">+₹{addOn.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pricing notes */}
          <div className="pt-4 text-[11px] text-charcoal-400">
            Note: All listed prices include 5% GST. No extra hidden charges at checkout.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-cream-200 bg-cream-50/60 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Quantity Controls */}
          <div className="flex items-center bg-white border border-cream-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 text-charcoal-600 hover:text-charcoal disabled:opacity-30 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-charcoal">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-charcoal-600 hover:text-charcoal transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-white py-3 px-6 rounded-xl font-bold text-sm shadow-md shadow-terracotta-500/25 transition-all flex items-center justify-between active:scale-98"
          >
            <span>Add to Order</span>
            <span className="bg-black/15 px-2 py-0.5 rounded text-xs font-extrabold tracking-wide">
              ₹{grandTotal}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
