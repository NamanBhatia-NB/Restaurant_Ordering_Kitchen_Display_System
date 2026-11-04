"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, AVAILABLE_COUPONS } from "@/lib/cart/cart-context";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Tag,
  Gift,
  Check,
} from "lucide-react";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    availableLoyaltyPoints,
    isRedeemingLoyalty,
    loyaltyDiscount,
    toggleRedeemLoyalty,
    gstAmount,
    total,
    selectedOutlet,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-cream-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50">
            <div>
              <h2 className="font-serif text-xl font-bold text-charcoal">Your Order</h2>
              <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
                <span>
                  Preparing at <strong>{selectedOutlet.name}</strong>
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-charcoal-500 hover:text-charcoal hover:bg-cream-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-cream-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center text-charcoal-400">
                  <X className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-lg text-charcoal">Your cart is empty</h3>
                <p className="text-xs text-charcoal-500 max-w-xs">
                  Discover authentic Hyderabad Dum Biryanis, rich Haleem, and Nizami desserts from our menu.
                </p>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.cartId} className="py-4 flex gap-3 group">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-bold text-charcoal truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.cartId)}
                          className="text-charcoal-400 hover:text-red-600 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.portion && (
                        <p className="text-[11px] font-medium text-terracotta-600">
                          {item.portion}
                        </p>
                      )}

                      {item.addOns && item.addOns.length > 0 && (
                        <p className="text-[10px] text-charcoal-400 mt-0.5 line-clamp-1">
                          + {item.addOns.map((a) => a.name).join(", ")}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-extrabold text-sm text-charcoal">
                          ₹{item.lineTotal}
                        </span>

                        {/* Stepper */}
                        <div className="flex items-center bg-cream-100 border border-cream-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                            className="p-1 text-charcoal-600 hover:text-charcoal"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                            className="p-1 text-charcoal-600 hover:text-charcoal"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loyalty Rewards Redemption Box */}
                <div className="pt-4 pb-2">
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <Gift className="w-4 h-4 text-amber-600" />
                        <span>DumRewards Loyalty Points</span>
                      </div>
                      <span className="font-mono font-bold text-amber-800">
                        {availableLoyaltyPoints} pts (₹90)
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/80 leading-relaxed">
                      Earn 10 points for every ₹100 ordered direct.
                    </p>
                    <label className="flex items-center gap-2 text-xs font-semibold text-charcoal cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={isRedeemingLoyalty}
                        onChange={(e) => toggleRedeemLoyalty(e.target.checked)}
                        className="w-4 h-4 text-terracotta-500 rounded accent-terracotta-500"
                      />
                      <span>Redeem 180 points for ₹90 instant discount</span>
                    </label>
                  </div>
                </div>

                {/* Coupons Box */}
                <div className="pt-3 pb-2 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-500 block">
                    Promo Code / Coupon
                  </span>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{appliedCoupon.code} applied (-₹{couponDiscount})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-600 font-bold hover:underline text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Try DUMDIRECT or NIZAM15"
                        className="flex-1 p-2 bg-cream-50 border border-cream-200 rounded-xl text-xs font-mono uppercase text-charcoal focus:ring-1 focus:ring-terracotta-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-charcoal hover:bg-charcoal-800 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-red-600">{couponError}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-cream-200 bg-cream-50/80 space-y-4">
              <div className="space-y-1.5 text-xs text-charcoal-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-charcoal">₹{subtotal}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Loyalty Points Redemption</span>
                    <span>-₹{loyaltyDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-charcoal-500">
                  <span>Included 5% GST</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Direct Delivery Savings</span>
                  <span>₹0 Delivery Fee</span>
                </div>

                <div className="pt-2 border-t border-cream-200 flex justify-between text-base font-bold text-charcoal">
                  <span>Total Payable</span>
                  <span className="text-xl font-extrabold text-terracotta-600">
                    ₹{total}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Zero food app commission means fresher ingredients and direct customer rewards.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 border border-cream-300 hover:bg-cream-100 rounded-xl text-xs font-semibold text-charcoal-500 transition-colors"
                >
                  Clear
                </button>
                <Link
                  href="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 px-5 rounded-xl shadow-md shadow-terracotta-500/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
