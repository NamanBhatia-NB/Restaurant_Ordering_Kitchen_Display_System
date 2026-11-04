import React from "react";
import Link from "next/link";
import { Flame, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { SEED_OUTLETS } from "@/lib/db/seed-data";

export function Footer() {
  return (
    <footer className="bg-charcoal-900 text-charcoal-300 border-t border-charcoal-800 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-terracotta-500 flex items-center justify-center text-white">
                <Flame className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                DumHouse
              </span>
            </div>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              Hyderabad&apos;s direct ordering platform. Eliminating 25-30% aggregator commissions to deliver authentic dum handi biryani directly from our kitchens to your table.
            </p>
          </div>

          {/* Outlets */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Our Outlets & Kitchens
            </h4>
            <ul className="space-y-1.5 text-xs text-charcoal-400">
              {SEED_OUTLETS.map((o) => (
                <li key={o.id}>
                  <strong className="text-charcoal-200">{o.name}:</strong> {o.location}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              System Portals
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Customer Direct Menu
                </Link>
              </li>
              <li>
                <Link href="/staff/kitchen" className="hover:text-amber-400 transition-colors">
                  Kitchen Display System (KDS)
                </Link>
              </li>
              <li>
                <Link href="/staff/menu" className="hover:text-amber-400 transition-colors">
                  Central Menu Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Regulatory Badges */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Regulatory & Compliance
            </h4>
            <div className="p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700/80 space-y-2 text-[11px]">
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>DPDP Act 2023:</strong> Customer personal data encrypted & used strictly for order fulfillment.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>5% GST Included:</strong> All prices shown include 5% statutory restaurant GST.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimers Bar */}
        <div className="pt-6 border-t border-charcoal-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-charcoal-400">
          <p>
            © {new Date().getFullYear()} DumHouse India Pvt Ltd. FSSAI Lic Nos: 13624011000001, 13624011000002, 13624011000003 (Sample/Demo IDs for evaluation).
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> AI Prep Estimator: Active (Ridge Regression)
            </span>
            <span>Zero Aggregator Commission</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
