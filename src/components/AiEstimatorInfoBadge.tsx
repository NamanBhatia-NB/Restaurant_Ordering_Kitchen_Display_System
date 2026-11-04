"use client";

import React, { useState } from "react";
import { Sparkles, Info, X, ShieldCheck, Cpu } from "lucide-react";

interface AiEstimatorInfoBadgeProps {
  predictedMinutes?: number;
  confidence?: "high" | "medium" | "low";
  modelType?: string;
  mae?: number;
  features?: {
    itemCount: number;
    complexityPoints: number;
    queueDepth: number;
    peakPeriod: number;
    isWeekend: number;
  };
}

export function AiEstimatorInfoBadge({
  predictedMinutes = 28,
  confidence = "high",
  modelType = "ridge_regression",
  mae = 3.2,
  features,
}: AiEstimatorInfoBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case "high":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "low":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-cream-200 text-charcoal-700 border-cream-300";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-terracotta-50 text-terracotta-800 border border-terracotta-200 hover:bg-terracotta-100 transition-colors shadow-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
        <span>AI Prep Estimate: <strong>{predictedMinutes}m</strong></span>
        <span
          className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold border ${getConfidenceColor(
            confidence
          )}`}
        >
          {confidence}
        </span>
        <Info className="w-3 h-3 text-terracotta-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-cream-200 overflow-hidden text-charcoal">
            <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-terracotta-500 text-white flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base">
                    AI Preparation Time Estimator
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    Interpretable Ridge Regression Architecture
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                  <span className="text-[10px] uppercase font-bold text-charcoal-400">
                    Model Algorithm
                  </span>
                  <p className="font-mono font-bold text-charcoal-800 mt-0.5">
                    {modelType}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                  <span className="text-[10px] uppercase font-bold text-charcoal-400">
                    Model Error (MAE)
                  </span>
                  <p className="font-mono font-bold text-emerald-700 mt-0.5">
                    ±{mae} minutes
                  </p>
                </div>
              </div>

              {features && (
                <div className="space-y-1.5 p-3 rounded-xl bg-cream-100/60 border border-cream-200">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-charcoal-600">
                    Live Input Features
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Item Count:</span>
                      <strong className="font-mono">{features.itemCount} items</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Complexity Points:</span>
                      <strong className="font-mono">{features.complexityPoints} pts</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Kitchen Queue:</span>
                      <strong className="font-mono">{features.queueDepth} orders ahead</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Peak Hour Load:</span>
                      <strong className="font-mono">{features.peakPeriod ? "Yes (1.0)" : "No (0.0)"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Weekend Rush:</span>
                      <strong className="font-mono">{features.isWeekend ? "Yes (1.0)" : "No (0.0)"}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-bold text-charcoal">Guardrails & Safeguards</h4>
                <ul className="space-y-1.5 text-charcoal-600 list-disc list-inside text-[11px]">
                  <li>
                    <strong>Honest Promise Floor:</strong> Promised time is the <em>higher</em> of the AI estimate (+ safety buffer) and the outlet&apos;s physical minimum prep time.
                  </li>
                  <li>
                    <strong>Kitchen Staff Override:</strong> Chefs can adjust the estimate with an audit reason at any stage.
                  </li>
                  <li>
                    <strong>Late Order Alerts:</strong> Orders exceeding promised time by &gt;10 mins are highlighted in high-contrast red for the kitchen.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-[10px] text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Transparency Disclosure:</strong> Model trained on 180 reproducible synthetic order samples simulating kitchen physics. Staff can override predictions at any time.
                </p>
              </div>
            </div>

            <div className="p-4 bg-cream-50 border-t border-cream-200 text-right">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-charcoal text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-charcoal-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
