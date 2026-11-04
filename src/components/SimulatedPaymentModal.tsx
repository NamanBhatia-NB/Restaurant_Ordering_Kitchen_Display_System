"use client";

import React, { useState } from "react";
import { PaymentMethod } from "@/lib/db/schema";
import { QrCode, CreditCard, Banknote, ShieldCheck, CheckCircle2, Loader2, X } from "lucide-react";

interface SimulatedPaymentModalProps {
  total: number;
  outletName: string;
  onAuthorize: (method: PaymentMethod) => Promise<void>;
  onClose: () => void;
}

export function SimulatedPaymentModal({
  total,
  outletName,
  onAuthorize,
  onClose,
}: SimulatedPaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      // Simulate network verification handshake
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      await onAuthorize(selectedMethod);
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-cream-200">
        {/* Header */}
        <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-600">
              Mock Payment Gateway
            </span>
            <h3 className="font-serif text-xl font-bold text-charcoal">
              Authorize Payment
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-charcoal-400 hover:text-charcoal rounded-full transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-charcoal">
          {/* Amount Badge */}
          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-charcoal-500">Order for {outletName}</p>
              <p className="text-2xl font-extrabold text-charcoal mt-0.5">₹{total}</p>
            </div>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
              5% GST Included
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedMethod("UPI")}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs ${
                selectedMethod === "UPI"
                  ? "border-terracotta-500 bg-terracotta-50 text-terracotta-700 font-bold shadow-sm"
                  : "border-cream-200 hover:border-cream-300 text-charcoal-600"
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span>Instant UPI</span>
            </button>

            <button
              onClick={() => setSelectedMethod("CARD")}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs ${
                selectedMethod === "CARD"
                  ? "border-terracotta-500 bg-terracotta-50 text-terracotta-700 font-bold shadow-sm"
                  : "border-cream-200 hover:border-cream-300 text-charcoal-600"
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Credit / Debit</span>
            </button>

            <button
              onClick={() => setSelectedMethod("CASH")}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs ${
                selectedMethod === "CASH"
                  ? "border-terracotta-500 bg-terracotta-50 text-terracotta-700 font-bold shadow-sm"
                  : "border-cream-200 hover:border-cream-300 text-charcoal-600"
              }`}
            >
              <Banknote className="w-5 h-5" />
              <span>Pay at Counter</span>
            </button>
          </div>

          {/* Method Details simulation */}
          {selectedMethod === "UPI" && (
            <div className="p-4 rounded-xl border border-cream-200 bg-white space-y-3 text-center">
              <div className="w-28 h-28 mx-auto bg-cream-50 rounded-xl border border-dashed border-cream-300 flex flex-col items-center justify-center p-2">
                <QrCode className="w-16 h-16 text-charcoal-700" />
                <span className="text-[9px] text-charcoal-400 mt-1 uppercase font-semibold">
                  Scan to Pay
                </span>
              </div>
              <p className="text-xs font-mono text-charcoal-600">
                UPI ID: <strong>dumhouse.direct@icici</strong>
              </p>
              <p className="text-[11px] text-charcoal-400">
                Simulated dynamic UPI payment request for ₹{total}. Click authorize below.
              </p>
            </div>
          )}

          {selectedMethod === "CARD" && (
            <div className="p-4 rounded-xl border border-cream-200 bg-cream-50/50 space-y-2 text-xs">
              <div className="font-mono bg-white p-2.5 rounded-lg border border-cream-200 text-charcoal-700 flex justify-between">
                <span>Card: 4242 •••• •••• 4242</span>
                <span className="text-charcoal-400">12/28</span>
              </div>
              <p className="text-[11px] text-charcoal-400">
                Sandboxed test card simulator. No actual bank charge will occur.
              </p>
            </div>
          )}

          {selectedMethod === "CASH" && (
            <div className="p-4 rounded-xl border border-cream-200 bg-cream-50/50 text-xs text-charcoal-600 space-y-1">
              <p className="font-bold text-charcoal">Pay at counter or on delivery</p>
              <p className="text-[11px] text-charcoal-400">
                Kitchen immediately starts preparation; pay upon pickup or handoff.
              </p>
            </div>
          )}

          {/* Compliance Sandbox Note */}
          <div className="flex items-center gap-1.5 text-[11px] text-charcoal-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mock payment engine strictly for evaluation & testing</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-5 border-t border-cream-200 bg-cream-50 flex items-center justify-end">
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-terracotta-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-75"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>Payment Authorized! Placing Order...</span>
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Simulating Gateway Handshake...</span>
              </>
            ) : (
              <span>Authorize Mock Payment (₹{total})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
