"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  UtensilsCrossed,
  ArrowRight,
  Phone,
  Mail,
  User,
  AlertTriangle,
} from "lucide-react";

export default function PartyOrdersPage() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [guestCount, setGuestCount] = useState<number>(50);
  const [eventDate, setEventDate] = useState<string>(tomorrow);
  const [eventTime, setEventTime] = useState<string>("19:30");
  const [eventType, setEventType] = useState<string>("Corporate Celebration");
  const [selectedPackage, setSelectedPackage] = useState<string>("nizami-grand");
  const [customerName, setCustomerName] = useState<string>("Farhan Ahmed");
  const [customerPhone, setCustomerPhone] = useState<string>("+91 98490 12345");
  const [customerEmail, setCustomerEmail] = useState<string>("farhan.ahmed@example.com");
  const [eventVenue, setEventVenue] = useState<string>("Cyber Gateway Auditorium, Hitec City, Hyderabad");
  const [specialNotes, setSpecialNotes] = useState<string>("Prefer medium spice level for biryani handis.");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string>("");

  const PACKAGES: Record<
    string,
    { name: string; perHead: number; desc: string; dishes: string[] }
  > = {
    "nizami-grand": {
      name: "The Royal Nizami Grand Feast",
      perHead: 360,
      desc: "Our most popular banquet: Handi Chicken Dum Biryani, Mutton Haleem, Double Ka Meetha, Mirchi Ka Salan, Mint Raita, and Irani Chai.",
      dishes: ["Chicken Dum Biryani Handi", "Slow-Cooked Mutton Haleem", "Double Ka Meetha", "Mirchi Ka Salan", "Mint Raita"],
    },
    "shahi-mutton": {
      name: "Shahi Mutton Dawat",
      perHead: 480,
      desc: "Opulent feast featuring Hyderabadi Mutton Dum Biryani, fiery Chicken 65, Garlic Butter Naan, Qubani Ka Meetha, and Salan.",
      dishes: ["Hyderabadi Mutton Dum Biryani", "Crisp Chicken 65", "Garlic Butter Naan", "Qubani Ka Meetha with Malai"],
    },
    "veg-banquet": {
      name: "Begumpet Pure Veg Royal Feast",
      perHead: 300,
      desc: "Fragrant saffron Veg Dum Biryani with fresh Malai Paneer Butter Masala, Tandoor Naans, Double Ka Meetha, and Salan.",
      dishes: ["Royal Veg Paneer Dum Biryani", "Paneer Butter Masala", "Garlic Butter Naan", "Double Ka Meetha"],
    },
  };

  const currentPkg = PACKAGES[selectedPackage];
  const estimatedSubtotal = guestCount * currentPkg.perHead;
  const handiPotsNeeded = Math.ceil(guestCount / 12); // ~12 guests per handi pot

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `PARTY-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(ref);
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-terracotta-600 bg-terracotta-50 px-3 py-1 rounded-full border border-terracotta-200">
          Bulk Catering & Party Handis
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-charcoal tracking-tight">
          Celebrate with Authentic Sealed Handis
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
          From corporate gatherings in Hitec City to grand family weddings, enjoy fresh bhatti handi biryani delivered hot. Minimum 24-hour advance notice required.
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-3xl border border-cream-200 shadow-xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase text-charcoal-400">
              Booking Request: {bookingRef}
            </span>
            <h2 className="font-serif text-2xl font-bold text-charcoal mt-1">
              Party Order Received!
            </h2>
            <p className="text-xs text-charcoal-500 mt-2 leading-relaxed">
              Thank you, <strong>{customerName}</strong>. Our Catering Manager at Company A Headquarters has received your inquiry for <strong>{guestCount} guests</strong> on <strong>{eventDate}</strong> at {eventTime}.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Package:</span>
              <strong className="text-charcoal">{currentPkg.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Estimated Handi Pots:</span>
              <strong className="text-charcoal font-mono">{handiPotsNeeded} large pots</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Indicative Quote:</span>
              <strong className="text-terracotta-600 font-bold font-mono">₹{estimatedSubtotal}</strong>
            </div>
          </div>

          <p className="text-[11px] text-charcoal-400">
            A confirmation call will be placed to <strong className="font-mono">{customerPhone}</strong> within 2 business hours.
          </p>

          <Link
            href="/"
            className="inline-block w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3 rounded-xl text-xs transition-colors"
          >
            Return to Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal border-b border-cream-100 pb-3">
              Event & Guest Specifications
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Notice Banner */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-[11px] text-amber-900">
                <Clock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>24-Hour Notice Rule:</strong> Handi dum biryani and slow-cooked mutton haleem require 10 hours of charcoal simmer. Bookings must be placed at least 24 hours prior to event time.
                </span>
              </div>

              {/* Guest Count Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-charcoal uppercase tracking-wider text-[11px]">
                    Expected Guest Count
                  </label>
                  <span className="font-mono text-base font-extrabold text-terracotta-600">
                    {guestCount} Guests
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="350"
                  step="5"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full accent-terracotta-500"
                />
                <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
                  <span>Small Party (20)</span>
                  <span>Grand Banquet (350+)</span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal-600 mb-1">
                    Event Date (Min Tomorrow)
                  </label>
                  <input
                    type="date"
                    min={tomorrow}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-600 mb-1">
                    Preferred Serving Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block font-semibold text-charcoal-600 mb-1">
                  Event Occasion
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
                >
                  <option value="Corporate Celebration">Corporate Team Lunch / Dinner</option>
                  <option value="Birthday Party">Birthday & Milestone Party</option>
                  <option value="Wedding / Reception">Wedding Reception / Sangeet</option>
                  <option value="Family Dawat">Traditional Nizami Family Dawat</option>
                </select>
              </div>

              {/* Package Selection */}
              <div>
                <label className="block font-bold text-charcoal uppercase tracking-wider text-[11px] mb-2">
                  Select Catering Package
                </label>
                <div className="space-y-2">
                  {Object.entries(PACKAGES).map(([key, pkg]) => {
                    const isSelected = selectedPackage === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setSelectedPackage(key)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                          isSelected
                            ? "border-terracotta-500 bg-terracotta-50/60 shadow-sm"
                            : "border-cream-200 hover:border-cream-300"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-charcoal text-sm">{pkg.name}</span>
                          <span className="font-mono font-extrabold text-terracotta-600">
                            ₹{pkg.perHead} / guest
                          </span>
                        </div>
                        <p className="text-[11px] text-charcoal-500 mt-1">{pkg.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-cream-100">
                <div>
                  <label className="block font-semibold text-charcoal-600 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal-600 mb-1">
                  Venue Address in Hyderabad
                </label>
                <textarea
                  rows={2}
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-cream-300 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-terracotta-500/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Submit Party Order Request (₹{estimatedSubtotal})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-sm space-y-5 sticky top-28 text-xs">
              <h3 className="font-serif text-lg font-bold text-charcoal border-b border-cream-100 pb-3">
                Catering Estimate Breakdown
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 block">
                    Kitchen Preparation Specs
                  </span>
                  <div className="flex justify-between font-mono">
                    <span className="text-charcoal-600">Handi Pots:</span>
                    <strong className="text-charcoal">{handiPotsNeeded}x 10kg Pots</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Dum Seal Time:</span>
                    <strong className="text-charcoal font-mono">3.5 Hours Bhatti</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Service Area:</span>
                    <strong className="text-charcoal">Within 15km of Kitchen</strong>
                  </div>
                </div>

                <div className="space-y-2 text-charcoal-600">
                  <div className="flex justify-between">
                    <span>{guestCount} Guests × ₹{currentPkg.perHead}</span>
                    <span className="font-mono font-bold text-charcoal">₹{estimatedSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Direct Catering Margin Saving</span>
                    <span className="font-bold">Save ₹{Math.round(estimatedSubtotal * 0.15)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-charcoal-400">
                    <span>Statutory 5% GST Included</span>
                    <span>₹{Math.round(estimatedSubtotal - estimatedSubtotal / 1.05)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline">
                  <span className="font-bold text-charcoal text-sm">Estimated Total</span>
                  <span className="text-2xl font-black text-terracotta-600 font-mono">
                    ₹{estimatedSubtotal}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Catering Manager Guarantee</span>
                </div>
                <p>
                  Every bulk order is supervised directly by Company A&apos;s master ustaad to ensure royal banquet consistency.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

