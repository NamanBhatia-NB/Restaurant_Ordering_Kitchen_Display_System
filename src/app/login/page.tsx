"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  User,
  ChefHat,
  Lock,
  Mail,
  ShieldCheck,
  Flame,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginAsCustomer, loginAsKitchenStaff, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email.toLowerCase() === "customer.demo@example.com") {
      loginAsCustomer();
      router.push("/");
      return;
    }

    if (email.toLowerCase() === "kitchen.demo@example.com") {
      loginAsKitchenStaff("outlet-kondapur");
      router.push("/staff/kitchen");
      return;
    }

    // Generic login
    login(email, "CUSTOMER");
    router.push("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-cream-200 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center mx-auto shadow-md shadow-terracotta-500/20">
            <Flame className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="font-serif text-2xl font-black text-charcoal">
            DumHouse Portal Sign In
          </h1>
          <p className="text-xs text-charcoal-500">
            One-click reviewer accounts or custom login
          </p>
        </div>

        {/* One-Click Reviewer Quick Access */}
        <div className="space-y-3 p-4 rounded-2xl bg-cream-50 border border-cream-200">
          <h2 className="text-[10px] uppercase font-bold tracking-wider text-charcoal-500 text-center">
            Reviewer Demo Quick Access
          </h2>

          <div className="space-y-2">
            <button
              onClick={() => {
                loginAsCustomer();
                router.push("/");
              }}
              className="w-full bg-white hover:bg-cream-100 border border-cream-300 p-3 rounded-xl flex items-center justify-between text-left transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-charcoal">
                    Customer Demo Account
                  </h3>
                  <span className="text-[11px] text-charcoal-400 font-mono">
                    customer.demo@example.com
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-400" />
            </button>

            <button
              onClick={() => {
                loginAsKitchenStaff("outlet-kondapur");
                router.push("/staff/kitchen");
              }}
              className="w-full bg-white hover:bg-cream-100 border border-cream-300 p-3 rounded-xl flex items-center justify-between text-left transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-charcoal">
                    Kitchen Staff Demo Account
                  </h3>
                  <span className="text-[11px] text-charcoal-400 font-mono">
                    kitchen.demo@example.com
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-400" />
            </button>
          </div>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-charcoal-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer.demo@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50/60 border border-cream-200 rounded-xl focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50/60 border border-cream-200 rounded-xl focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-charcoal hover:bg-charcoal-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-xs"
          >
            Sign In with Credentials
          </button>
        </form>

        <div className="pt-2 border-t border-cream-100 flex items-center gap-1.5 text-[10px] text-charcoal-400 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fictional demo credentials for review assessment</span>
        </div>
      </div>
    </div>
  );
}
