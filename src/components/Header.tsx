"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { SEED_OUTLETS } from "@/lib/db/seed-data";
import {
  ShoppingBag,
  MapPin,
  Clock,
  Menu as MenuIcon,
  X,
  Flame,
  ChefHat,
  ChevronDown,
} from "lucide-react";

export function Header() {
  const { selectedOutlet, setSelectedOutlet, totalItems, total, setIsDrawerOpen } = useCart();
  const [isOutletDropdownOpen, setIsOutletDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-cream-50/95 backdrop-blur-md border-b border-cream-200 sticky top-[37px] z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 flex items-center justify-center text-white shadow-md shadow-terracotta-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-charcoal flex items-center gap-1">
                  DumHouse
                  <span className="text-[10px] uppercase font-sans tracking-widest font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                    Hyderabad
                  </span>
                </span>
                <p className="text-[11px] text-charcoal-500 font-medium -mt-1 hidden sm:block">
                  Authentic Handi Dum Biryani & Cuisine
                </p>
              </div>
            </Link>
          </div>

          {/* Outlet Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOutletDropdownOpen(!isOutletDropdownOpen)}
              className="flex items-center gap-2 text-left bg-white hover:bg-cream-100 px-3 py-2 rounded-xl border border-cream-200 shadow-sm transition-all text-xs sm:text-sm text-charcoal"
            >
              <MapPin className="w-4 h-4 text-terracotta-500 flex-shrink-0" />
              <div className="max-w-[130px] sm:max-w-[200px] truncate">
                <span className="block text-[10px] text-charcoal-500 uppercase font-semibold tracking-wider">
                  Select Outlet
                </span>
                <span className="font-bold text-charcoal truncate block">
                  {selectedOutlet.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 ml-1" />
            </button>

            {isOutletDropdownOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 bg-white rounded-2xl shadow-xl border border-cream-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-cream-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                    Hyderabad Outlets & Cloud Kitchens
                  </h4>
                  <p className="text-[11px] text-charcoal-400">
                    Pick your nearest outlet for fastest preparation
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-cream-100">
                  {SEED_OUTLETS.map((outlet) => (
                    <button
                      key={outlet.id}
                      onClick={() => {
                        setSelectedOutlet(outlet);
                        setIsOutletDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-cream-50 transition-colors flex items-start justify-between gap-3 ${
                        selectedOutlet.id === outlet.id ? "bg-terracotta-50/50" : ""
                      }`}
                    >
                      <div>
                        <div className="font-bold text-charcoal text-sm flex items-center gap-1.5">
                          {outlet.name}
                          {selectedOutlet.id === outlet.id && (
                            <span className="w-2 h-2 rounded-full bg-terracotta-500" />
                          )}
                        </div>
                        <p className="text-xs text-charcoal-500 mt-0.5 line-clamp-1">
                          {outlet.location}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-charcoal-400 mt-1">
                          <span className="flex items-center gap-1 text-terracotta-600 font-medium">
                            <Clock className="w-3 h-3" /> Min {outlet.minimum_prep_minutes}m prep
                          </span>
                          <span>Lic: {outlet.fssai_license_number.split(" ")[0]}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 bg-cream-50 text-[10px] text-charcoal-400 border-t border-cream-200">
                  All outlets adhere to strict FSSAI food hygiene protocols.
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold text-charcoal hover:text-terracotta-600 transition-colors"
            >
              Menu
            </Link>
            <Link
              href="/staff/kitchen"
              className="text-sm font-medium text-charcoal-600 hover:text-terracotta-600 transition-colors flex items-center gap-1.5"
            >
              <ChefHat className="w-4 h-4 text-amber-600" />
              Kitchen Display
            </Link>
            <Link
              href="/staff/menu"
              className="text-sm font-medium text-charcoal-600 hover:text-terracotta-600 transition-colors"
            >
              Menu Admin
            </Link>
          </nav>

          {/* Cart Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center gap-2.5 bg-gradient-to-r from-terracotta-600 to-terracotta-700 hover:from-terracotta-700 hover:to-terracotta-800 text-white px-4 py-2.5 rounded-xl shadow-md shadow-terracotta-600/25 hover:shadow-lg transition-all active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 text-amber-200" />
              <div className="text-left hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-terracotta-200 block -mb-0.5">
                  My Cart
                </span>
                <span className="text-xs font-extrabold tracking-wide">
                  {totalItems > 0 ? `₹${total}` : "Empty"}
                </span>
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-charcoal-900 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-charcoal hover:bg-cream-200 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-cream-200 space-y-2 animate-in fade-in">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium text-charcoal hover:bg-cream-100"
            >
              Full Menu
            </Link>
            <Link
              href="/staff/kitchen"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium text-charcoal hover:bg-cream-100 flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4 text-amber-600" />
              Kitchen Display (KDS)
            </Link>
            <Link
              href="/staff/menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium text-charcoal hover:bg-cream-100"
            >
              Central Menu Administration
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
