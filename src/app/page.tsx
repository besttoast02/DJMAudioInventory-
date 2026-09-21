"use client";

import { useState, useEffect } from "react";
import BuilderCanvas from "@/components/builder/BuilderCanvas";
import BuilderControls, { SetupState } from "@/components/builder/BuilderControls";
import DynamicCarousel from "@/components/builder/DynamicCarousel";
import { CheckCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function BuildYourOwnPage() {
  const [mounted, setMounted] = useState(false);
  const [setup, setSetup] = useState<SetupState>({
    subs: 0,
    tops: 2,
    towers: 0,
    serviceType: "dj",
    mixer: 0,
    stagePieces: 0,
    archTruss: false,
    stageSteps: 0,
    screenPanels: 0,
    sparkMachines: 0,
  });

  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    eventDate: "",
    eventType: "",
    venue: "",
    guestCount: "Under 50",
    setting: "Indoor",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Calculate estimated total based on transparent pricing rules
  const calculateEstimate = () => {
    let total = 0;
    total += setup.tops * 100;
    total += setup.subs * 125;
    total += setup.towers * 75;
    if (setup.serviceType === "dj") total += 300;
    if (setup.serviceType === "rental") total += setup.mixer * 150; // $150 for mixer rental
    total += setup.stagePieces * 65;
    total += setup.stageSteps * 50; // $50 for stage steps
    if (setup.archTruss) total += 150; // $150 for overhead arch truss
    // Black skirt is $0 (Complimentary)
    total += setup.screenPanels * 150;
    total += setup.sparkMachines * 150;
    return total;
  };

  const estimatedCost = calculateEstimate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Create descriptors based on the setup state
    const cartItems = [];
    if (setup.tops > 0) cartItems.push({ name: "Main Audio PA Speakers", qty: setup.tops, rate_cents: 10000 });
    if (setup.subs > 0) cartItems.push({ name: "Subwoofers (Bass Reinforcement)", qty: setup.subs, rate_cents: 12500 });
    if (setup.towers > 0) cartItems.push({ name: "Lighting Towers (Moving Heads/Wash)", qty: setup.towers, rate_cents: 7500 });
    if (setup.stagePieces > 0) {
      cartItems.push({ name: "4x4 Modular Stage Platforms", qty: setup.stagePieces, rate_cents: 6500 });
      cartItems.push({ name: "Black Stage Skirting (Complimentary)", qty: 1, rate_cents: 0 });
    }
    if (setup.stageSteps > 0) cartItems.push({ name: "Stage Access Steps (2-tier)", qty: setup.stageSteps, rate_cents: 5000 });
    if (setup.archTruss) cartItems.push({ name: "Overhead Stage Arch Truss (Spans Stage, Max 32')", qty: 1, rate_cents: 15000 });
    if (setup.screenPanels > 0) cartItems.push({ name: "LED Video Screen Panels", qty: setup.screenPanels, rate_cents: 15000 });
    if (setup.sparkMachines > 0) cartItems.push({ name: "Cold Spark Machines", qty: setup.sparkMachines, rate_cents: 15000 });
    if (setup.serviceType === "dj") cartItems.push({ name: "DJ / Audio Engineer Services", qty: 1, rate_cents: 30000 });
    if (setup.serviceType === "rental" && setup.mixer > 0) cartItems.push({ name: "Pioneer XDJ-XZ Mixer", qty: setup.mixer, rate_cents: 15000 });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          services: ["Custom 3D Builder Setup"],
          cartItems
        }),
      });

      if (!res.ok) throw new Error("Failed to submit custom quote.");

      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <div className="py-24 sm:py-32 bg-gray-50 dark:bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 dark:border-slate-800 text-center max-w-lg w-full mx-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Setup Saved!</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            Thank you! We have received your custom 3D stage build and will be in touch with a finalized formal proposal within 24 hours.
          </p>
          <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-4 mb-6 text-xs text-left text-gray-500 dark:text-gray-400 space-y-1">
            <p><strong>Estimate:</strong> ~${estimatedCost}</p>
            <p><strong>Client:</strong> {formData.clientName} ({formData.clientEmail})</p>
            {setup.stagePieces > 0 && <p><strong>Stage:</strong> {setup.stagePieces} Decks (Black Skirt Included)</p>}
            {setup.stageSteps > 0 && <p><strong>Steps:</strong> {setup.stageSteps} Access Set ($50 ea)</p>}
            {setup.archTruss && <p><strong>Rigging:</strong> Overhead Stage Arch Truss (Max 32&apos;)</p>}
          </div>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all text-sm sm:text-base">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24 pb-12 bg-gray-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 max-w-screen-2xl">
        
        {/* Header Title */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            3D Event Visualizer
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 mb-2 sm:mb-3">
            Build Your Own Setup
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
            Configure your audio, lighting, and stage setup. Watch the 3D stage update in real-time.
          </p>
        </div>

        {/* Main Grid: Responsive Reordering for Mobile (3D Canvas top on mobile, controls below) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* 3D Canvas (Order 1 on mobile, Order 2 on desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-8 h-[360px] sm:h-[480px] lg:h-[720px] w-full rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
            <BuilderCanvas setup={setup} />
          </div>

          {/* Controls & Media (Order 2 on mobile, Order 1 on desktop) */}
          <div className="order-2 lg:order-1 lg:col-span-4 space-y-6 flex flex-col">
            <BuilderControls setup={setup} setSetup={setSetup} />
            
            <div className="mt-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2 pl-1">
                Setup Inspiration & Live Photos
              </h3>
              <DynamicCarousel setup={setup} />
            </div>
          </div>

        </div>

        {/* Finalize Quote Form */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border border-gray-100 dark:border-slate-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Ready to Finalize Your Build?
          </h2>
          
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm sm:text-base">
              Estimated Total: <span className="text-green-500 font-extrabold text-xl sm:text-2xl">${estimatedCost}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-lg mx-auto">
              (Final pricing includes delivery, sound engineer staffing, and setup based on date & venue distance)
            </p>
          </div>

          {/* Policy Badges & Inclusions */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left">
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/50 dark:border-slate-700/50 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Free Skirting:</strong> Complimentary black pleat skirt included on all stages.</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/50 dark:border-slate-700/50 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span><strong>Stage Steps:</strong> $50/unit for modular 2-tier stage access stairs.</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/50 dark:border-slate-700/50 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Code Safety:</strong> Handrails & ADA ramps extra based on venue inspection code.</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">First & Last Name *</label>
                <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                <input required type="email" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number *</label>
                <input required type="tel" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Event Date *</label>
                <input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Venue or City *</label>
                <input required type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Special Requests or Venue Notes (Optional)</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Stage ceiling height, outdoor turf, loading dock details..." className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-6 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all shadow-xl shadow-blue-500/20"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Request Official Quote & Reserve Build"}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
