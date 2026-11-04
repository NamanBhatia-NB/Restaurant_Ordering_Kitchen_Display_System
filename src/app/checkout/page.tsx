"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { useAuth } from "@/lib/auth/auth-context";
import { SimulatedPaymentModal } from "@/components/SimulatedPaymentModal";
import { PaymentMethod } from "@/lib/db/schema";
import {
  MapPin,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Phone,
  User,
  AlertCircle,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, gstAmount, total, selectedOutlet, clearCart } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.full_name || "Farhan Ahmed");
  const [customerPhone, setCustomerPhone] = useState("+91 98490 12345");
  const [customerAddress, setCustomerAddress] = useState(
    "Flat 402, Cyber Heights, Kondapur, Hyderabad 500084"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-cream-200 flex items-center justify-center text-charcoal-400 mb-4">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-charcoal">Your cart is empty</h2>
        <p className="text-xs text-charcoal-500 mt-1 mb-6">
          Add authentic Biryanis and Nizami specials from our menu before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  const handleValidateAndOpenPay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || customerName.length < 2) {
      setErrorMessage("Please enter a valid customer name");
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!customerAddress.trim() || customerAddress.length < 5) {
      setErrorMessage("Please enter a complete delivery address");
      return;
    }

    setIsModalOpen(true);
  };

  const handleAuthorizeOrder = async (method: PaymentMethod) => {
    try {
      const payload = {
        customer_id: user?.id || "guest-customer",
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        outlet_id: selectedOutlet.id,
        payment_method: method,
        items: items.map((i) => ({
          menu_item_id: i.menuItemId,
          quantity: i.quantity,
          portion: i.portion,
          add_ons: i.addOns,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order");
      }

      clearCart();
      router.push(`/order/${data.order.order_number}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit order. Please check inputs.");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-charcoal mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Menu</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-600">
              Direct Order Checkout
            </span>
            <h1 className="font-serif text-3xl font-black text-charcoal mt-1">
              Delivery Details
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Your contact details are encrypted and processed strictly for order fulfillment under the DPDP Act 2023.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleValidateAndOpenPay} className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-600">
                1. Contact & Recipient
              </h2>

              <div>
                <label className="block text-xs font-semibold text-charcoal-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-cream-50/60 border border-cream-200 rounded-xl text-xs sm:text-sm text-charcoal focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                    placeholder="e.g., Farhan Ahmed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-600 mb-1">
                  Mobile Number (for live SMS & kitchen updates)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-cream-50/60 border border-cream-200 rounded-xl text-xs sm:text-sm text-charcoal focus:ring-2 focus:ring-terracotta-500 focus:outline-none font-mono"
                    placeholder="+91 98490 12345"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-600">
                2. Delivery Destination
              </h2>

              <div>
                <label className="block text-xs font-semibold text-charcoal-600 mb-1">
                  Complete Delivery Address (Flat / House, Building, Area)
                </label>
                <textarea
                  rows={3}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full p-3 bg-cream-50/60 border border-cream-200 rounded-xl text-xs sm:text-sm text-charcoal focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                  placeholder="e.g. Flat 402, Cyber Heights, Kondapur, Hyderabad 500084"
                  required
                />
              </div>

              <div className="p-3 rounded-2xl bg-cream-100 flex items-center justify-between text-xs text-charcoal-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-terracotta-500" />
                  <span>
                    Fulfilling Kitchen: <strong>{selectedOutlet.name}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-terracotta-700 font-semibold">
                  Min {selectedOutlet.minimum_prep_minutes}m Prep
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-terracotta-500/25 transition-all flex items-center justify-center gap-2 text-base active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>Continue to Simulated Payment (₹{total})</span>
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-sm space-y-5 sticky top-28">
            <h2 className="font-serif text-xl font-bold text-charcoal border-b border-cream-100 pb-3">
              Order Breakdown
            </h2>

            {/* Items review */}
            <div className="divide-y divide-cream-100 max-h-64 overflow-y-auto space-y-3">
              {items.map((item) => (
                <div key={item.cartId} className="pt-3 first:pt-0 flex justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-charcoal">
                      {item.quantity}x {item.name}
                    </span>
                    {item.portion && (
                      <p className="text-[11px] text-terracotta-600">{item.portion}</p>
                    )}
                    {item.addOns && item.addOns.length > 0 && (
                      <p className="text-[10px] text-charcoal-400">
                        + {item.addOns.map((a) => a.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-charcoal font-mono">
                    ₹{item.lineTotal}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-cream-200 pt-4 space-y-2 text-xs text-charcoal-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-charcoal">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[11px] text-charcoal-500">
                <span>Statutory 5% GST (Included)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Direct Order Fee</span>
                <span>FREE (₹0)</span>
              </div>
              <div className="border-t border-cream-200 pt-3 flex justify-between text-base font-bold text-charcoal">
                <span>Total Amount</span>
                <span className="text-2xl font-extrabold text-terracotta-600">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Trust box */}
            <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5 text-[11px] text-charcoal-500">
              <div className="flex items-center gap-1.5 font-bold text-charcoal-700">
                <Clock className="w-3.5 h-3.5 text-terracotta-500" />
                <span>AI Preparation Estimate Active</span>
              </div>
              <p>
                Kitchen timer starts immediately after payment simulation with live progress tracking.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-charcoal-400 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulated Payment Gateway Sandbox</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {isModalOpen && (
        <SimulatedPaymentModal
          total={total}
          outletName={selectedOutlet.name}
          onAuthorize={handleAuthorizeOrder}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
