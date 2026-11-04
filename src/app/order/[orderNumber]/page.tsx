"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Order, OrderEvent, OrderStatus } from "@/lib/db/schema";
import { AiEstimatorInfoBadge } from "@/components/AiEstimatorInfoBadge";
import {
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ChefHat,
  Package,
  Bike,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const STAGES: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  {
    status: "RECEIVED",
    label: "Order Placed",
    desc: "Order sent to outlet kitchen",
    icon: CheckCircle2,
  },
  {
    status: "ACCEPTED",
    label: "Accepted",
    desc: "Chef Rasheed verified ticket",
    icon: ChefHat,
  },
  {
    status: "PREPARING",
    label: "Dum Cooking",
    desc: "Slow charcoal bhatti steaming",
    icon: Sparkles,
  },
  {
    status: "READY",
    label: "Ready for Pickup",
    desc: "Packed with hot Salan & Raita",
    icon: Package,
  },
  {
    status: "HANDED_OFF",
    label: "Handed Over",
    desc: "En route with direct delivery partner",
    icon: Bike,
  },
  {
    status: "COMPLETED",
    label: "Completed",
    desc: "Delivered to your doorstep",
    icon: CheckCircle2,
  },
];

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.orderNumber;

  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Fetch order details
  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setEvents(data.events || []);
        setError(null);
      } else {
        setError(data.error || "Order not found");
      }
    } catch {
      setError("Failed to connect to order tracking service");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Timer tick every 5 seconds for live countdown
    const timer = setInterval(() => setNow(Date.now()), 5000);

    // Realtime SSE connection for instantaneous kitchen updates
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/events?channel=*");

      eventSource.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload.order &&
            (payload.order.order_number === orderNumber || payload.order.id === orderNumber)
          ) {
            setOrder(payload.order);
            // Refresh events
            fetch(`/api/orders/${orderNumber}`)
              .then((r) => r.json())
              .then((d) => d.events && setEvents(d.events));
          }
        } catch {}
      });
    } catch {}

    // Fallback polling every 8s
    const pollInterval = setInterval(fetchOrder, 8000);

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
      if (eventSource) eventSource.close();
    };
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-charcoal-500">
          Connecting to kitchen display feed for {orderNumber}...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-charcoal">Order Not Found</h2>
        <p className="text-xs text-charcoal-500">{error || "Please verify the order number."}</p>
        <Link
          href="/"
          className="inline-block bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  // Calculate current stage index
  const currentStageIndex = STAGES.findIndex((s) => s.status === order.status);
  const promisedTime = new Date(order.promised_at).getTime();
  const minutesRemaining = Math.max(0, Math.round((promisedTime - now) / 60000));
  const isDelayed = now > promisedTime && !["READY", "HANDED_OFF", "COMPLETED"].includes(order.status);
  const delayedMinutes = Math.round((now - promisedTime) / 60000);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-charcoal mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Menu
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-3xl font-black text-charcoal tracking-tight">
              {order.order_number}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
              {order.status}
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Fulfilling from <strong>{order.outlet_name}</strong>
          </p>
        </div>

        {/* Live sync badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-2 rounded-xl border border-cream-200 shadow-sm text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-charcoal-600 font-medium">Live Kitchen Feed Connected</span>
          <button
            onClick={fetchOrder}
            className="p-1 hover:bg-cream-100 rounded text-charcoal-400 hover:text-charcoal transition-colors ml-1"
            title="Refresh feed"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Hero ETA Card */}
      <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-amber-400 font-extrabold">
              AI Estimated Preparation Time
            </span>
            <div className="flex items-baseline gap-3">
              {isDelayed ? (
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">
                    Steaming on Bhatti (+{delayedMinutes}m)
                  </div>
                  <p className="text-xs text-charcoal-300 mt-1">
                    Dum pot perfection takes precision. Chef is sealing the aroma.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-white">
                    ~{minutesRemaining} mins
                  </div>
                  <p className="text-xs text-charcoal-300 mt-1">
                    Promised by {new Date(order.promised_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}
            </div>

            {/* AI Disclosure Badge */}
            <div className="pt-2">
              <AiEstimatorInfoBadge
                predictedMinutes={order.ai_metadata?.predictedMinutes || order.estimated_prep_minutes}
                confidence={order.ai_metadata?.confidence || "high"}
                modelType={order.ai_metadata?.modelType || "ridge_regression"}
                mae={order.ai_metadata?.mae || 3.2}
                features={order.ai_metadata?.features}
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-xs space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ChefHat className="w-4 h-4" />
              <span>Kitchen Station Update</span>
            </div>
            <p className="text-cream-100 text-[11px] leading-relaxed">
              Order synced in real-time with the <strong>{order.outlet_name}</strong> kitchen tablet display.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Timeline Tracker */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-lg text-charcoal">
          Order Progress Timeline
        </h3>

        {/* Step icons grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex >= idx;
            const isCurrent = currentStageIndex === idx;
            const Icon = stage.icon;

            return (
              <div
                key={stage.status}
                className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-between gap-2 ${
                  isCurrent
                    ? "border-terracotta-500 bg-terracotta-50/70 shadow-sm"
                    : isCompleted
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-cream-200 bg-cream-50/40 opacity-40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isCurrent
                      ? "bg-terracotta-500 text-white shadow-md shadow-terracotta-500/30"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-cream-200 text-charcoal-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal leading-tight">
                    {stage.label}
                  </h4>
                  <p className="text-[10px] text-charcoal-500 mt-0.5 leading-snug">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit Event History */}
        {events.length > 0 && (
          <div className="pt-4 border-t border-cream-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-3">
              Event Audit Trail
            </h4>
            <div className="space-y-2">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-cream-50 border border-cream-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-terracotta-500" />
                    <span className="font-bold text-charcoal">{evt.new_status}</span>
                    {evt.note && <span className="text-charcoal-500">— {evt.note}</span>}
                  </div>
                  <span className="text-[10px] text-charcoal-400 font-mono">
                    {new Date(evt.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Details & Outlet Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items Summary */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-cream-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-charcoal">
            Items in this Feast
          </h3>
          <div className="divide-y divide-cream-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 first:pt-0 flex justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-charcoal">
                    {item.quantity}x {item.item_name_snapshot}
                  </span>
                  {item.portion_snapshot && (
                    <p className="text-[11px] text-terracotta-600 font-medium">
                      {item.portion_snapshot}
                    </p>
                  )}
                  {item.add_ons && item.add_ons.length > 0 && (
                    <p className="text-[10px] text-charcoal-400 mt-0.5">
                      + {item.add_ons.map((a) => a.name).join(", ")}
                    </p>
                  )}
                </div>
                <span className="font-mono font-bold text-charcoal">
                  ₹{item.line_total}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-cream-200 pt-3 flex justify-between items-center text-sm">
            <span className="font-semibold text-charcoal">
              Total Paid ({order.payment_method})
            </span>
            <span className="text-xl font-extrabold text-terracotta-600 font-mono">
              ₹{order.total}
            </span>
          </div>
          <p className="text-[10px] text-charcoal-400">
            Includes statutory 5% GST (₹{order.gst_amount.toFixed(2)}).
          </p>
        </div>

        {/* Outlet & Delivery info */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-charcoal">
            Outlet & Destination
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                Fulfilling Outlet
              </span>
              <p className="font-bold text-charcoal text-sm mt-0.5">{order.outlet_name}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                Delivery Destination
              </span>
              <p className="text-charcoal-600 mt-0.5">{order.customer_address}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                Recipient Contact
              </span>
              <p className="text-charcoal-600 mt-0.5 font-mono">{order.customer_phone}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-cream-100 flex items-center gap-1.5 text-[10px] text-charcoal-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>DPDP Act 2023 Compliant Order</span>
          </div>
        </div>
      </div>
    </div>
  );
}
