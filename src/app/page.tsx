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
    <div className="h-screen w-full bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
      
      {/* Compact Header */}
      <div className="flex-none p-3 sm:p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
            Build Your Own Setup
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure your audio, lighting, and stage setup. Watch it update live.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          3D Visualizer
        </div>
      </div>

      {/* Main Split Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* 3D Canvas Pane (Top on Mobile, Left on Desktop) */}
        <div className="lg:w-3/5 h-[45vh] lg:h-full relative z-0 lg:border-r border-gray-100 dark:border-slate-800 bg-slate-900 shrink-0">
          <BuilderCanvas setup={setup} />
        </div>

        {/* Controls Pane (Bottom on Mobile, Right on Desktop) - Scrollable */}
        <div className="lg:w-2/5 flex-1 lg:h-full overflow-y-auto bg-gray-50 dark:bg-slate-950/50 p-4 sm:p-6 lg:p-8 relative z-10">
          
          <div className="space-y-8 max-w-2xl mx-auto">
            <BuilderControls setup={setup} setSetup={setSetup} />
            
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3 pl-1">
                Setup Inspiration
              </h3>
              <DynamicCarousel setup={setup} />
            </div>

            {/* Finalize Quote Form */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Ready to Finalize?
              </h2>
              
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm">
                  Estimated Total: <span className="text-green-500 font-extrabold text-xl">${estimatedCost}</span>
                </p>
              </div>

              {/* Policy Badges */}
              <div className="mb-6 grid grid-cols-1 gap-2 text-xs text-left">
                <div className="p-2.5 bg-gray-50 dark:bg-slate-800/60 rounded-lg flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Free Skirting:</strong> Complimentary black pleat skirt included.</span>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">First & Last Name *</label>
                    <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <input required type="email" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                    <input required type="tel" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Event Date *</label>
                    <input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Venue or City *</label>
                    <input required type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Special Requests or Notes</label>
                    <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Stage ceiling height..." className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Quote & Reserve"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
