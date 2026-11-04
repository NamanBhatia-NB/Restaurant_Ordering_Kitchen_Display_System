"use client";

import React, { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/lib/db/schema";
import { SEED_OUTLETS } from "@/lib/db/seed-data";
import { KitchenOrderCard } from "@/components/KitchenOrderCard";
import {
  ChefHat,
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "PREPARING" | "READY" | "ALL">("ACTIVE");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Audio chime
  const playNewOrderChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5 note
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  const fetchOrders = async () => {
    try {
      const url =
        selectedOutletId === "all"
          ? "/api/orders"
          : `/api/orders?outlet_id=${selectedOutletId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
        setLastUpdated(new Date());
      }
    } catch {
      console.error("Failed to fetch kitchen orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to SSE for real-time kitchen incoming orders
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/events?channel=*");

      eventSource.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "ORDER_CREATED") {
            playNewOrderChime();
            setBannerNotice(`New Order ${payload.order.order_number} arrived!`);
            setTimeout(() => setBannerNotice(null), 5000);
            fetchOrders();
          } else if (payload.type === "STATUS_UPDATED" || payload.type === "PREP_OVERRIDDEN") {
            fetchOrders();
          }
        } catch {}
      });
    } catch {}

    // 8s background poll fallback
    const interval = setInterval(fetchOrders, 8000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [selectedOutletId, soundEnabled]);

  const handleStatusTransition = async (orderNumber: string, nextStatus: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderNumber}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        new_status: nextStatus,
        changed_by: "KITCHEN_STAFF_LEAD",
        note: `Updated on KDS station to ${nextStatus}`,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      alert(data.error || "Failed to update order status");
      return;
    }

    // Immediate optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.order_number === orderNumber ? data.order : o))
    );
  };

  const handleOverridePrep = async (orderNumber: string, minutes: number, reason: string) => {
    const res = await fetch(`/api/orders/${orderNumber}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        override_minutes: minutes,
        reason,
        changed_by: "KITCHEN_STAFF_LEAD",
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to override prep time");
    }

    setOrders((prev) =>
      prev.map((o) => (o.order_number === orderNumber ? data.order : o))
    );
  };

  // Metrics
  const activeOrders = orders.filter((o) =>
    ["RECEIVED", "ACCEPTED", "PREPARING", "READY"].includes(o.status)
  );

  const now = Date.now();
  const lateOrders = activeOrders.filter(
    (o) => now > new Date(o.promised_at).getTime() && !["READY", "HANDED_OFF", "COMPLETED"].includes(o.status)
  );
  const criticalLateOrders = activeOrders.filter(
    (o) => (now - new Date(o.promised_at).getTime()) >= 600000 && !["READY", "HANDED_OFF", "COMPLETED"].includes(o.status)
  );

  // Filter display list
  const displayOrders = orders.filter((o) => {
    if (statusFilter === "ACTIVE") {
      return ["RECEIVED", "ACCEPTED", "PREPARING", "READY"].includes(o.status);
    }
    if (statusFilter === "PREPARING") {
      return o.status === "PREPARING";
    }
    if (statusFilter === "READY") {
      return o.status === "READY";
    }
    return true; // ALL
  });

  return (
    <div className="min-h-screen bg-charcoal-900 text-white p-4 sm:p-6 lg:p-8">
      {/* KDS Header & Controls */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-charcoal-950 shadow-lg shadow-amber-500/20">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Kitchen Display System
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  2m Tablet Mode
                </span>
              </div>
              <p className="text-xs text-charcoal-400">
                High-visibility real-time station display for Hyderabad outlets & cloud kitchens
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Outlet selector */}
            <select
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="bg-charcoal-800 text-white text-xs font-bold border border-charcoal-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All 14 Outlets & Kitchens</option>
              {SEED_OUTLETS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                soundEnabled
                  ? "bg-charcoal-800 border-charcoal-700 text-amber-400"
                  : "bg-charcoal-800 border-charcoal-700 text-charcoal-500"
              }`}
              title={soundEnabled ? "Audio chime active" : "Audio muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? "Chime On" : "Muted"}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={fetchOrders}
              className="p-2.5 bg-charcoal-800 border border-charcoal-700 rounded-xl text-charcoal-300 hover:text-white transition-colors"
              title="Refresh tickets"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Arrival Banner */}
        {bannerNotice && (
          <div className="bg-gradient-to-r from-amber-500 to-terracotta-500 text-charcoal-950 font-black px-4 py-3 rounded-2xl flex items-center justify-between shadow-xl animate-in slide-in-from-top-2 text-sm">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 animate-bounce" />
              <span>{bannerNotice}</span>
            </div>
            <span className="text-xs uppercase bg-black/20 px-2 py-0.5 rounded">
              Just Placed
            </span>
          </div>
        )}

        {/* High-Level Operational Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-charcoal-800/80 border border-charcoal-700/80 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider block">
              Active Queue
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-white">
                {activeOrders.length}
              </span>
              <span className="text-xs text-charcoal-400">tickets</span>
            </div>
          </div>

          <div className="bg-charcoal-800/80 border border-charcoal-700/80 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider block">
              On Bhatti (Preparing)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-amber-400">
                {orders.filter((o) => o.status === "PREPARING").length}
              </span>
              <span className="text-xs text-amber-300">handi pots</span>
            </div>
          </div>

          <div
            className={`border rounded-2xl p-4 ${
              lateOrders.length > 0
                ? "bg-red-950/60 border-red-700 text-red-100"
                : "bg-charcoal-800/80 border-charcoal-700/80"
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider block">
              Late Tickets Alert
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-3xl font-black font-mono ${
                  lateOrders.length > 0 ? "text-red-400 animate-pulse" : "text-white"
                }`}
              >
                {lateOrders.length}
              </span>
              {criticalLateOrders.length > 0 && (
                <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                  {criticalLateOrders.length} &gt;10m
                </span>
              )}
            </div>
          </div>

          <div className="bg-charcoal-800/80 border border-charcoal-700/80 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider block">
              Ready for Handover
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-emerald-400">
                {orders.filter((o) => o.status === "READY").length}
              </span>
              <span className="text-xs text-emerald-300">packed</span>
            </div>
          </div>
        </div>

        {/* Swimlane / Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "ACTIVE"
                ? "bg-amber-500 text-charcoal-950 shadow-md shadow-amber-500/20"
                : "bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700"
            }`}
          >
            Active In-Progress ({activeOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter("PREPARING")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "PREPARING"
                ? "bg-amber-500 text-charcoal-950 shadow-md shadow-amber-500/20"
                : "bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700"
            }`}
          >
            Preparing / Dum ({orders.filter((o) => o.status === "PREPARING").length})
          </button>
          <button
            onClick={() => setStatusFilter("READY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "READY"
                ? "bg-amber-500 text-charcoal-950 shadow-md shadow-amber-500/20"
                : "bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700"
            }`}
          >
            Ready for Pickup ({orders.filter((o) => o.status === "READY").length})
          </button>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "ALL"
                ? "bg-amber-500 text-charcoal-950 shadow-md shadow-amber-500/20"
                : "bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700"
            }`}
          >
            All Tickets / History ({orders.length})
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-charcoal-400">Loading live kitchen queue...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && displayOrders.length === 0 && (
          <div className="bg-charcoal-800/40 rounded-3xl border border-charcoal-700/60 p-16 text-center space-y-3 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-charcoal-700 flex items-center justify-center text-charcoal-400 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="font-serif font-bold text-xl text-white">
              No orders in this station
            </h3>
            <p className="text-xs text-charcoal-400">
              Kitchen is all caught up. When a customer places an order, it will appear here instantly.
            </p>
          </div>
        )}

        {/* Tickets Grid (High readability cards) */}
        {!isLoading && displayOrders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayOrders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                onTransition={handleStatusTransition}
                onOverride={handleOverridePrep}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
