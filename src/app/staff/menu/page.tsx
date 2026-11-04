"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MenuItem, MenuCategory } from "@/lib/db/schema";
import { SEED_OUTLETS } from "@/lib/db/seed-data";
import {
  LayoutDashboard,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Flame,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  MapPin,
  RefreshCw,
} from "lucide-react";

export default function CentralMenuAdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string>("outlet-kondapur");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category_id: "cat-biryani",
    description: "",
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
    base_price: 250,
    is_vegetarian: false,
    spice_level: 2 as 0 | 1 | 2 | 3,
    complexity_score: 3,
    allergens: ["Dairy"],
  });

  const fetchMenu = async () => {
    try {
      const res = await fetch(`/api/menu?outlet_id=${selectedOutletId}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setCategories(data.categories || []);
      }
    } catch {
      console.error("Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [selectedOutletId]);

  const showNotification = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Toggle outlet availability
  const handleToggleOutletAvailability = async (item: MenuItem & { isOutletAvailable?: boolean }) => {
    const newStatus = !(item.isOutletAvailable !== false);
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlet_id: selectedOutletId,
          is_available: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification(`${item.name} is now ${newStatus ? "AVAILABLE" : "PAUSED"} at this outlet.`);
        fetchMenu();
      }
    } catch {
      alert("Failed to toggle availability");
    }
  };

  // Open Edit Modal
  const handleStartEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      description: item.description,
      image_url: item.image_url,
      base_price: item.base_price,
      is_vegetarian: item.is_vegetarian,
      spice_level: item.spice_level,
      complexity_score: item.complexity_score,
      allergens: item.allergens || [],
    });
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`/api/menu/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        showNotification(`Updated ${formData.name} successfully.`);
        setEditingItem(null);
        fetchMenu();
      } else {
        alert(data.error || "Update failed");
      }
    } catch {
      alert("Failed to update menu item");
    }
  };

  const filteredItems = items.filter((i) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
  });

  const selectedOutlet = SEED_OUTLETS.find((o) => o.id === selectedOutletId) || SEED_OUTLETS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cream-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Headquarters Menu CMS
          </span>
          <h1 className="font-serif text-3xl font-black text-charcoal tracking-tight mt-1">
            Central Menu & Availability Administration
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage recipes, prices, spice levels, and pause out-of-stock handi batches per outlet in real-time.
          </p>
        </div>

        {/* Outlet Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-cream-200 shadow-sm">
            <MapPin className="w-4 h-4 text-terracotta-500" />
            <select
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="text-xs font-bold text-charcoal bg-transparent focus:outline-none"
            >
              {SEED_OUTLETS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchMenu}
            className="p-2.5 bg-white border border-cream-200 hover:bg-cream-100 rounded-xl text-charcoal-600 transition-colors shadow-sm"
            title="Refresh items"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Search & Info */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter dishes by name or ingredient..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-200 rounded-xl text-xs text-charcoal focus:ring-2 focus:ring-terracotta-500 focus:outline-none shadow-sm"
          />
        </div>

        <div className="text-xs text-charcoal-500 flex items-center gap-2">
          <span>Active Outlet: <strong>{selectedOutlet.name}</strong></span>
          <span className="text-charcoal-300">•</span>
          <span>{filteredItems.length} dishes listed</span>
        </div>
      </div>

      {/* Dishes Table / Cards */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-cream-100">
            <thead className="bg-cream-50 text-charcoal-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Dish</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Base Price</th>
                <th className="py-3.5 px-4">Diet / Spice</th>
                <th className="py-3.5 px-4">Complexity</th>
                <th className="py-3.5 px-4 text-center">{selectedOutlet.name} Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-charcoal">
              {filteredItems.map((item: any) => {
                const isOutletAvailable = item.isOutletAvailable !== false && item.is_active;

                return (
                  <tr key={item.id} className="hover:bg-cream-50/50 transition-colors">
                    {/* Dish name & thumb */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-charcoal text-sm block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-charcoal-400 line-clamp-1 max-w-xs">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-medium text-charcoal-600">
                      {categories.find((c) => c.id === item.category_id)?.name || item.category_id}
                    </td>

                    {/* Base Price */}
                    <td className="py-3 px-4 font-mono font-bold text-sm">
                      ₹{item.base_price}
                      <span className="text-[10px] text-charcoal-400 font-sans block">
                        incl. 5% GST
                      </span>
                    </td>

                    {/* Diet & Spice */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            item.is_vegetarian
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.is_vegetarian ? "VEG" : "NON-VEG"}
                        </span>
                        <div className="flex items-center gap-0.5 text-terracotta-600 text-[10px] font-semibold">
                          <Flame className="w-2.5 h-2.5" /> Level {item.spice_level}/3
                        </div>
                      </div>
                    </td>

                    {/* Complexity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="font-bold text-amber-700">{item.complexity_score}</span>
                        <span className="text-charcoal-400">/ 5 pts</span>
                      </div>
                    </td>

                    {/* Outlet Availability Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleOutletAvailability(item)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                          isOutletAvailable
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {isOutletAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-red-600" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 text-charcoal-500 hover:text-terracotta-600 hover:bg-cream-100 rounded-lg transition-colors"
                        title="Edit Recipe & Pricing"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-cream-200 overflow-hidden text-charcoal max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50">
              <h3 className="font-serif font-bold text-lg text-charcoal">
                Edit Dish: {editingItem.name}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Dish Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-600 mb-1">Base Price (₹ incl. GST)</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-terracotta-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-600 mb-1">Spice Level (0-3)</label>
                  <select
                    value={formData.spice_level}
                    onChange={(e) => setFormData({ ...formData, spice_level: Number(e.target.value) as any })}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                  >
                    <option value={0}>0 - Mild</option>
                    <option value={1}>1 - Medium</option>
                    <option value={2}>2 - Spicy</option>
                    <option value={3}>3 - Extra Hot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-600 mb-1">Dietary Type</label>
                  <select
                    value={formData.is_vegetarian ? "veg" : "non-veg"}
                    onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.value === "veg" })}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-600 mb-1">Complexity (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.complexity_score}
                    onChange={(e) => setFormData({ ...formData, complexity_score: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-terracotta-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-600 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-terracotta-500 focus:outline-none font-mono text-[11px]"
                  required
                />
              </div>

              <div className="pt-3 border-t border-cream-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-cream-300 rounded-xl font-semibold text-charcoal-600 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl font-bold shadow-md"
                >
                  Save Recipe Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
