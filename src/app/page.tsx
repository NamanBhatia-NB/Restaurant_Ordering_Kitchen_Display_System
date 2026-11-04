"use client";

import React, { useState, useEffect } from "react";
import { MenuItem, MenuCategory } from "@/lib/db/schema";
import { FoodCard } from "@/components/FoodCard";
import { useCart } from "@/lib/cart/cart-context";
import {
  Flame,
  Search,
  Clock,
  ShieldCheck,
  Percent,
  Sparkles,
  MapPin,
  UtensilsCrossed,
  RefreshCw,
} from "lucide-react";

export default function HomePage() {
  const { selectedOutlet, totalItems, total, setIsDrawerOpen } = useCart();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<(MenuItem & { outletPrice?: number; isOutletAvailable?: boolean })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState<number>(2);

  const fetchMenu = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/menu?outlet_id=${selectedOutlet.id}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setItems(data.items || []);
      } else {
        setError(data.error || "Failed to load menu items");
      }
    } catch {
      setError("Unable to connect to DumHouse menu services. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [selectedOutlet.id]);

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== "all" && item.category_id !== selectedCategory) {
      return false;
    }
    if (dietaryFilter === "veg" && !item.is_vegetarian) {
      return false;
    }
    if (dietaryFilter === "non-veg" && item.is_vegetarian) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-cream-100 to-cream-50 border-b border-cream-200 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold tracking-wide">
                <Percent className="w-3.5 h-3.5 text-terracotta-600" />
                <span>Zero Aggregator Markups • Direct From Outlet Handi</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-black text-charcoal tracking-tight leading-[1.15]">
                Taste Hyderabad&apos;s Legendary Dum Biryani.
              </h1>

              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
                Direct handi-to-home ordering from 14 royal outlets & 3 cloud kitchens across Hyderabad. Real-time kitchen tracking and guaranteed honesty in delivery times.
              </p>
            </div>

            {/* Outlet Status Card */}
            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm space-y-3 max-w-sm flex-shrink-0">
              <div className="flex items-center justify-between border-b border-cream-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-terracotta-50 flex items-center justify-center text-terracotta-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      Selected Outlet
                    </h2>
                    <p className="font-serif font-bold text-base text-charcoal">
                      {selectedOutlet.name}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Kitchen Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-100">
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">
                    Min Prep Time
                  </span>
                  <span className="font-bold text-charcoal flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-terracotta-500" /> {selectedOutlet.minimum_prep_minutes} mins
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-100">
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">
                    Kitchen Queue
                  </span>
                  <span className="font-bold text-charcoal flex items-center gap-1 mt-0.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> Normal Pace
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-charcoal-400 truncate">
                {selectedOutlet.address}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search biryani, haleem, double ka meetha..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-200 rounded-xl text-xs sm:text-sm text-charcoal placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal-400 hover:text-charcoal"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dietary Filter Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setDietaryFilter("all")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                dietaryFilter === "all"
                  ? "bg-charcoal text-white shadow-sm"
                  : "bg-white text-charcoal-600 hover:bg-cream-100 border border-cream-200"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setDietaryFilter("veg")}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                dietaryFilter === "veg"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white text-charcoal-600 hover:bg-cream-100 border border-cream-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Veg Only
            </button>
            <button
              onClick={() => setDietaryFilter("non-veg")}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                dietaryFilter === "non-veg"
                  ? "bg-red-700 text-white shadow-sm"
                  : "bg-white text-charcoal-600 hover:bg-cream-100 border border-cream-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Non-Veg Only
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-cream-200 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-terracotta-500 text-white shadow-sm shadow-terracotta-500/20"
                : "bg-white text-charcoal-600 hover:bg-cream-100 border border-cream-200"
            }`}
          >
            All Categories ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-terracotta-500 text-white shadow-sm shadow-terracotta-500/20"
                    : "bg-white text-charcoal-600 hover:bg-cream-100 border border-cream-200"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* GST Notice Badge */}
        <div className="mb-6 p-3 rounded-2xl bg-cream-100/80 border border-cream-200 flex flex-wrap items-center justify-between gap-3 text-xs text-charcoal-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Transparent Dining:</strong> All displayed menu prices include statutory 5% GST. No unexpected checkout additions.
            </span>
          </div>
          <span className="text-[11px] text-charcoal-400 font-mono">
            Direct Kitchen Outlet Pricing
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-[16/10] bg-cream-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-cream-200 rounded w-3/4" />
                  <div className="h-3 bg-cream-100 rounded w-full" />
                  <div className="h-3 bg-cream-100 rounded w-2/3" />
                  <div className="pt-4 flex justify-between items-center">
                    <div className="h-5 bg-cream-200 rounded w-16" />
                    <div className="h-8 bg-cream-200 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-8 text-center bg-white rounded-3xl border border-cream-200 shadow-sm max-w-md mx-auto space-y-3">
            <UtensilsCrossed className="w-12 h-12 text-terracotta-400 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-charcoal">
              Unable to load menu
            </h3>
            <p className="text-xs text-charcoal-500">{error}</p>
            <button
              onClick={fetchMenu}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-terracotta-500 text-white rounded-xl text-xs font-bold hover:bg-terracotta-600"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredItems.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-cream-200 shadow-sm max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-charcoal-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal">
              No matching delicacies found
            </h3>
            <p className="text-xs text-charcoal-500">
              Try relaxing your dietary filters or clearing the search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setDietaryFilter("all");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 bg-charcoal text-white rounded-xl text-xs font-bold hover:bg-charcoal-800"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Food Items Grid */}
        {!isLoading && !error && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Mobile Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden animate-in slide-in-from-bottom-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full bg-gradient-to-r from-terracotta-600 to-terracotta-700 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold">
                {totalItems}
              </span>
              <div className="text-left">
                <p className="text-xs font-bold">View Cart ({selectedOutlet.name})</p>
                <p className="text-[10px] text-terracotta-200">5% GST included</p>
              </div>
            </div>
            <span className="font-extrabold text-base">₹{total} →</span>
          </button>
        </div>
      )}
    </div>
  );
}
