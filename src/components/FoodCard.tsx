"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MenuItem } from "@/lib/db/schema";
import { useCart } from "@/lib/cart/cart-context";
import { ItemCustomizerModal } from "./ItemCustomizerModal";
import { Plus, Flame, Sparkles } from "lucide-react";

interface FoodCardProps {
  item: MenuItem & { outletPrice?: number; isOutletAvailable?: boolean };
}

export function FoodCard({ item }: FoodCardProps) {
  const { addItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayPrice = item.outletPrice !== undefined ? item.outletPrice : item.base_price;
  const isAvailable = item.isOutletAvailable !== false && item.is_active;

  const hasCustomizations =
    (item.portion_options && item.portion_options.length > 0) ||
    (item.available_add_ons && item.available_add_ons.length > 0);

  const handleAddClick = () => {
    if (hasCustomizations) {
      setIsModalOpen(true);
    } else {
      addItem(item, 1, undefined, [], displayPrice);
    }
  };

  const getSpiceBadge = (level: number) => {
    switch (level) {
      case 0:
        return <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Mild</span>;
      case 1:
        return <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Medium</span>;
      case 2:
        return (
          <span className="text-[10px] text-terracotta-700 bg-terracotta-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
            <Flame className="w-2.5 h-2.5" /> Spicy
          </span>
        );
      case 3:
        return (
          <span className="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
            <Flame className="w-2.5 h-2.5 fill-current" /> Extra Hot
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
          !isAvailable ? "opacity-60 grayscale-[40%]" : ""
        }`}
      >
        <div>
          {/* Food Image with Veg/Non-Veg Badge */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-100">
            {!imageError ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cream-200 text-charcoal-400 font-medium text-xs">
                {item.name}
              </div>
            )}

            {/* Veg / Non-Veg Indicator */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
              <span
                className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center ${
                  item.is_vegetarian ? "border-emerald-600" : "border-red-600"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.is_vegetarian ? "bg-emerald-600" : "bg-red-600"
                  }`}
                />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-600">
                {item.is_vegetarian ? "Veg" : "Non-Veg"}
              </span>
            </div>

            {/* Availability Badge */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-red-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-full shadow-lg">
                  Currently Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {getSpiceBadge(item.spice_level)}
              {item.complexity_score >= 4 && (
                <span className="text-[10px] text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Nizami Slow Dum
                </span>
              )}
            </div>

            <h3 className="font-serif font-bold text-lg text-charcoal group-hover:text-terracotta-600 transition-colors">
              {item.name}
            </h3>

            <p className="text-xs text-charcoal-500 line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1 flex-wrap text-[10px] text-charcoal-400">
                <span>Allergens:</span>
                {item.allergens.map((alg) => (
                  <span
                    key={alg}
                    className="bg-cream-100 px-1.5 py-0.2 rounded text-charcoal-600 font-medium"
                  >
                    {alg}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price & Action Footer */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-cream-100 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-sans font-extrabold text-xl text-charcoal">
                ₹{displayPrice}
              </span>
              <span className="text-[10px] text-charcoal-400 font-medium">
                (incl. 5% GST)
              </span>
            </div>
            {item.portion_options && item.portion_options.length > 0 && (
              <span className="text-[10px] text-terracotta-600 font-medium block">
                Customizable portion
              </span>
            )}
          </div>

          <button
            onClick={handleAddClick}
            disabled={!isAvailable}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 ${
              isAvailable
                ? "bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-terracotta-500/20"
                : "bg-charcoal-200 text-charcoal-400 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4" />
            {hasCustomizations ? "Customize" : "Add"}
          </button>
        </div>
      </div>

      {/* Customizer Modal */}
      {isModalOpen && (
        <ItemCustomizerModal
          item={item}
          displayPrice={displayPrice}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
