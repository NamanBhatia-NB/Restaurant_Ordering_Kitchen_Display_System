"use client";

import React from "react";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  User,
  ChefHat,
  Utensils,
  LayoutDashboard,
  Users,
  BarChart3,
} from "lucide-react";

export function RoleSwitcher() {
  const { user, role, loginAsCustomer, loginAsKitchenStaff } = useAuth();
  const pathname = usePathname();

  return (
    <aside aria-label="Reviewer Demo Banner" className="bg-charcoal text-white text-xs px-3 py-2 border-b border-charcoal-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-terracotta-500 text-white px-2 py-0.5 rounded font-semibold tracking-wide uppercase text-[10px]">
            <ShieldAlert className="w-3 h-3" /> Reviewer Mode
          </span>
          <span className="text-charcoal-300 hidden sm:inline">
            Active Role: <strong className="text-white font-medium">{role === "KITCHEN_STAFF" ? "Kitchen Staff (Chef)" : "Customer"}</strong> ({user?.email})
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Quick role toggle */}
          <div className="flex items-center bg-charcoal-800 rounded-lg p-0.5 border border-charcoal-700">
            <button
              onClick={loginAsCustomer}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                role === "CUSTOMER"
                  ? "bg-terracotta-500 text-white font-medium"
                  : "text-charcoal-400 hover:text-white"
              }`}
            >
              <User className="w-3 h-3" /> Customer Demo
            </button>
            <button
              onClick={() => loginAsKitchenStaff("outlet-kondapur")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                role === "KITCHEN_STAFF"
                  ? "bg-amber-600 text-white font-medium"
                  : "text-charcoal-400 hover:text-white"
              }`}
            >
              <ChefHat className="w-3 h-3" /> Kitchen Staff Demo
            </button>
          </div>

          {/* Quick screen navigation */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-charcoal-700">
            <Link
              href="/"
              className={`px-2 py-1 rounded hover:bg-charcoal-800 transition-colors flex items-center gap-1 ${
                pathname === "/" ? "text-terracotta-400 font-medium" : "text-charcoal-300"
              }`}
            >
              <Utensils className="w-3 h-3" /> Menu
            </Link>
            <Link
              href="/party-orders"
              className={`px-2 py-1 rounded hover:bg-charcoal-800 transition-colors flex items-center gap-1 ${
                pathname.startsWith("/party-orders") ? "text-amber-400 font-medium" : "text-charcoal-300"
              }`}
            >
              <Users className="w-3 h-3" /> Party Orders
            </Link>
            <Link
              href="/staff/kitchen"
              className={`px-2 py-1 rounded hover:bg-charcoal-800 transition-colors flex items-center gap-1 ${
                pathname.startsWith("/staff/kitchen") ? "text-amber-400 font-medium" : "text-charcoal-300"
              }`}
            >
              <ChefHat className="w-3 h-3" /> Kitchen KDS
            </Link>
            <Link
              href="/staff/dashboard"
              className={`px-2 py-1 rounded hover:bg-charcoal-800 transition-colors flex items-center gap-1 ${
                pathname.startsWith("/staff/dashboard") ? "text-emerald-400 font-medium" : "text-charcoal-300"
              }`}
            >
              <BarChart3 className="w-3 h-3" /> Ops Dashboard
            </Link>
            <Link
              href="/staff/menu"
              className={`px-2 py-1 rounded hover:bg-charcoal-800 transition-colors flex items-center gap-1 ${
                pathname.startsWith("/staff/menu") ? "text-amber-400 font-medium" : "text-charcoal-300"
              }`}
            >
              <LayoutDashboard className="w-3 h-3" /> Menu CMS
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
