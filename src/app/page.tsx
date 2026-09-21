"use client";

import { useState, useEffect } from "react";
import BuilderCanvas from "@/components/builder/BuilderCanvas";
import BuilderControls from "@/components/builder/BuilderControls";
import DynamicCarousel from "@/components/builder/DynamicCarousel";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BuildYourOwnPage() {
  const [mounted, setMounted] = useState(false);
  const [setup, setSetup] = useState({
    subs: 0,
    tops: 2,
    towers: 0,
    dj: true,
    stagePieces: 0,
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

  // Calculate estimated total based on loose rules (Pricing hidden per-item)
  const calculateEstimate = () => {
    let total = 0;
    total += setup.tops * 100;
    total += setup.subs * 125;
    total += setup.towers * 75;
    if (setup.dj) total += 300;
    total += setup.stagePieces * 65;
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
    if (setup.stagePieces > 0) cartItems.push({ name: "4x4 Stage Platforms", qty: setup.stagePieces, rate_cents: 6500 });
    if (setup.screenPanels > 0) cartItems.push({ name: "LED Video Screen Panels", qty: setup.screenPanels, rate_cents: 15000 });
    if (setup.sparkMachines > 0) cartItems.push({ name: "Cold Spark Machines", qty: setup.sparkMachines, rate_cents: 15000 });
    if (setup.dj) cartItems.push({ name: "DJ Performance Station", qty: 1, rate_cents: 30000 });

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
      <div className="py-32 bg-gray-50 dark:bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-xl border border-gray-100 dark:border-slate-800 text-center max-w-lg w-full mx-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Setup Saved!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thank you! We have received your custom 3D build and will be in touch with a finalized formal proposal within 24 hours.
          </p>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 bg-gray-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 max-w-screen-2xl">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Build Your Own Setup
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Interactively piece together your ideal audio and lighting configuration. 
            Watch the stage update in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls & Media (Left Column) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <BuilderControls setup={setup} setSetup={setSetup} />
            
            <div className="flex-1 mt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 pl-1">Examples of this setup</h3>
              <DynamicCarousel setup={setup} />
            </div>
          </div>

          {/* 3D Canvas (Center/Right) */}
          <div className="lg:col-span-8 h-[600px] lg:h-auto min-h-[600px] relative">
            <BuilderCanvas setup={setup} />
          </div>

        </div>

        {/* Finalize Quote Form */}
        <div className="mt-16 max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-slate-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Ready to Finalize?</h2>
          <p className="text-gray-500 text-center mb-8">
            Estimated Total: <span className="text-green-500 font-bold">${estimatedCost}</span> <br/>
            <span className="text-xs text-gray-400">(Final price may vary based on location and date availability)</span>
          </p>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">First & Last Name *</label>
                <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <input required type="email" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                <input required type="tel" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Event Date *</label>
                <input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Venue or City *</label>
                <input required type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-5 rounded-xl font-bold text-xl transition-all shadow-xl shadow-blue-500/20"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Request Official Quote"}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
