"use client";

import React, { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/lib/db/schema";
import { PrepOverrideModal } from "./PrepOverrideModal";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  ArrowRight,
  Flame,
  User,
  Sliders,
  XCircle,
} from "lucide-react";

interface KitchenOrderCardProps {
  order: Order;
  onTransition: (orderNumber: string, nextStatus: OrderStatus) => Promise<void>;
  onOverride: (orderNumber: string, minutes: number, reason: string) => Promise<void>;
}

export function KitchenOrderCard({ order, onTransition, onOverride }: KitchenOrderCardProps) {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Update timer every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const createdTime = new Date(order.created_at).getTime();
  const promisedTime = new Date(order.promised_at).getTime();
  const elapsedMinutes = Math.floor((now - createdTime) / 60000);
  const delayMinutes = Math.floor((now - promisedTime) / 60000);
  const isLate = delayMinutes > 0 && !["READY", "HANDED_OFF", "COMPLETED", "CANCELLED"].includes(order.status);
  const isCriticalLate = delayMinutes >= 10 && !["READY", "HANDED_OFF", "COMPLETED", "CANCELLED"].includes(order.status);

  // Status Styling
  const getCardTheme = () => {
    if (isCriticalLate) return "border-red-500 bg-red-50/40 shadow-red-500/20";
    if (isLate) return "border-amber-500 bg-amber-50/30 shadow-amber-500/10";
    switch (order.status) {
      case "RECEIVED":
        return "border-sky-400 bg-white";
      case "ACCEPTED":
        return "border-amber-400 bg-white";
      case "PREPARING":
        return "border-orange-500 bg-orange-50/20";
      case "READY":
        return "border-emerald-500 bg-emerald-50/20";
      case "HANDED_OFF":
        return "border-charcoal-300 bg-cream-50 opacity-80";
      default:
        return "border-charcoal-200 bg-white";
    }
  };

  const getNextStatusAction = (): { next: OrderStatus; label: string; icon: any; color: string } | null => {
    switch (order.status) {
      case "RECEIVED":
        return {
          next: "ACCEPTED",
          label: "Accept Order",
          icon: CheckCircle2,
          color: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case "ACCEPTED":
        return {
          next: "PREPARING",
          label: "Start Cooking",
          icon: ChefHat,
          color: "bg-orange-600 hover:bg-orange-700 text-white",
        };
      case "PREPARING":
        return {
          next: "READY",
          label: "Mark Ready for Pickup",
          icon: CheckCircle2,
          color: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      case "READY":
        return {
          next: "HANDED_OFF",
          label: "Handover to Delivery",
          icon: ArrowRight,
          color: "bg-charcoal-800 hover:bg-charcoal-900 text-white",
        };
      case "HANDED_OFF":
        return {
          next: "COMPLETED",
          label: "Archive Completed",
          icon: CheckCircle2,
          color: "bg-charcoal-600 hover:bg-charcoal-700 text-white",
        };
      default:
        return null;
    }
  };

  const action = getNextStatusAction();

  const handleNextAction = async () => {
    if (!action || isUpdating) return;
    setIsUpdating(true);
    try {
      await onTransition(order.order_number, action.next);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (confirm(`Cancel order ${order.order_number}?`)) {
      setIsUpdating(true);
      try {
        await onTransition(order.order_number, "CANCELLED");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <>
      <div
        className={`rounded-2xl border-2 p-5 flex flex-col justify-between shadow-md transition-all ${getCardTheme()}`}
      >
        {/* Top Header: Order Number, Age, Late warning */}
        <div>
          <div className="flex items-start justify-between gap-2 border-b border-cream-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-black text-charcoal tracking-tight">
                  {order.order_number}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-cream-200 text-charcoal-700">
                  {order.outlet_name}
                </span>
              </div>
              <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5" />
                <span>{order.customer_name}</span>
                <span className="text-charcoal-300">•</span>
                <span className="font-medium text-emerald-700">{order.payment_method} Paid</span>
              </p>
            </div>

            {/* Time Indicators */}
            <div className="text-right">
              <div className="font-mono text-sm font-bold text-charcoal flex items-center justify-end gap-1">
                <Clock className="w-4 h-4 text-charcoal-400" />
                <span>{elapsedMinutes}m ago</span>
              </div>
              <span className="text-[11px] text-charcoal-400 block">
                Promised: {new Date(order.promised_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* Late Order Banner */}
          {isLate && (
            <div
              className={`mt-3 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold ${
                isCriticalLate
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-amber-500 text-charcoal-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {isCriticalLate ? "CRITICAL: Late by >10 minutes!" : `Late by ${delayMinutes} mins`}
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-wider underline">
                Prioritize Handi
              </span>
            </div>
          )}

          {/* Prep Override Notice if adjusted */}
          {order.kitchen_override_minutes && (
            <div className="mt-2 text-[11px] bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <Sliders className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Staff adjusted to {order.kitchen_override_minutes}m: &ldquo;{order.kitchen_override_reason}&rdquo;
              </span>
            </div>
          )}

          {/* Item Checklist (High-contrast 2m readability) */}
          <div className="py-4 space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-white/80 border border-cream-200/60"
              >
                <span className="font-mono text-xl font-black text-terracotta-600 w-8 text-center flex-shrink-0">
                  {item.quantity}x
                </span>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 border rounded-sm flex items-center justify-center flex-shrink-0 ${
                        item.is_vegetarian ? "border-emerald-600" : "border-red-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.is_vegetarian ? "bg-emerald-600" : "bg-red-600"
                        }`}
                      />
                    </span>
                    <h4 className="font-bold text-base text-charcoal leading-snug">
                      {item.item_name_snapshot}
                    </h4>
                  </div>

                  {item.portion_snapshot && (
                    <p className="text-xs font-semibold text-terracotta-700 mt-0.5 ml-5">
                      Portion: {item.portion_snapshot}
                    </p>
                  )}

                  {item.add_ons && item.add_ons.length > 0 && (
                    <div className="ml-5 mt-1 text-xs text-charcoal-600 space-y-0.5">
                      {item.add_ons.map((a, aidx) => (
                        <div key={aidx} className="flex items-center gap-1">
                          <span className="text-terracotta-500 font-bold">+</span>
                          <span className="font-medium">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {item.complexity_score >= 4 && (
                  <span className="p-1 rounded bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-amber-600" /> Dum
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions: Next status, Override, Cancel */}
        <div className="pt-3 border-t border-cream-200 flex flex-col gap-2">
          {action ? (
            <button
              onClick={handleNextAction}
              disabled={isUpdating}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 ${action.color}`}
            >
              <action.icon className="w-5 h-5" />
              <span>{isUpdating ? "Updating..." : action.label}</span>
            </button>
          ) : (
            <div className="text-center py-2 text-xs font-bold text-charcoal-400 uppercase tracking-wider">
              Order {order.status}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-xs">
            <button
              onClick={() => setShowOverrideModal(true)}
              disabled={isUpdating || ["COMPLETED", "CANCELLED"].includes(order.status)}
              className="flex items-center gap-1 text-charcoal-600 hover:text-charcoal bg-cream-100 hover:bg-cream-200 px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-30"
            >
              <Sliders className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Adjust Time ({order.estimated_prep_minutes}m)</span>
            </button>

            {["RECEIVED", "ACCEPTED", "PREPARING"].includes(order.status) && (
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="text-charcoal-400 hover:text-red-600 flex items-center gap-1 p-1 rounded transition-colors text-[11px]"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showOverrideModal && (
        <PrepOverrideModal
          order={order}
          onConfirm={async (minutes, reason) => {
            await onOverride(order.order_number, minutes, reason);
          }}
          onClose={() => setShowOverrideModal(false)}
        />
      )}
    </>
  );
}
