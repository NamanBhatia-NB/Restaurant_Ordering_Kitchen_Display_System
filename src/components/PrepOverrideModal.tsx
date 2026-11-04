"use client";

import React, { useState } from "react";
import { Order } from "@/lib/db/schema";
import { Clock, AlertTriangle, X, Check } from "lucide-react";

interface PrepOverrideModalProps {
  order: Order;
  onConfirm: (newMinutes: number, reason: string) => Promise<void>;
  onClose: () => void;
}

export function PrepOverrideModal({ order, onConfirm, onClose }: PrepOverrideModalProps) {
  const [minutes, setMinutes] = useState(order.estimated_prep_minutes || 30);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedReasons = [
    "High handi dum pot steam time",
    "Fresh bhatti batch in progress",
    "Special customer dietary instruction",
    "Tandoor reheating cycle",
    "Rush kitchen station peak",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for the adjustment.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(minutes, reason);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update prep time");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-cream-200 overflow-hidden text-charcoal">
        <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif font-bold text-lg">
              Override Prep Time — {order.order_number}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
              Adjust Promised Prep Time (Minutes)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full accent-terracotta-500"
              />
              <span className="font-mono text-xl font-extrabold w-16 text-right text-charcoal">
                {minutes}m
              </span>
            </div>
            <p className="text-[11px] text-charcoal-400 mt-1">
              Current estimate: {order.estimated_prep_minutes} minutes
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
              Reason for Override (Audit Logged)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Delay due to second charcoal handi dum seal..."
              rows={3}
              className="w-full p-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 text-xs"
              required
            />

            <div className="flex flex-wrap gap-1.5 mt-2">
              {predefinedReasons.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReason(r)}
                  className="text-[10px] bg-cream-100 hover:bg-cream-200 text-charcoal-600 px-2 py-1 rounded-md transition-colors"
                >
                  + {r}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
            Override immediately updates the customer&apos;s live tracking screen and recalibrates the promised countdown.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-cream-300 text-charcoal-600 font-semibold text-xs hover:bg-cream-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Apply Override"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
