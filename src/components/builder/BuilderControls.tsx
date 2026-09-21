"use client";

import { Minus, Plus, Music, Lightbulb, Speaker, Layers, ShieldAlert, Sparkles, Tv, Check } from "lucide-react";

export interface SetupState {
  subs: number;
  tops: number;
  towers: number;
  serviceType: "dj" | "rental";
  mixer: number;
  stagePieces: number;
  archTruss: boolean;
  stageSteps: number;
  screenPanels: number;
  sparkMachines: number;
}

interface BuilderControlsProps {
  setup: SetupState;
  setSetup: React.Dispatch<React.SetStateAction<SetupState>>;
}

const MAX_LIMITS = {
  subs: 4,
  tops: 4,
  towers: 4,
  screenPanels: 32,
  sparkMachines: 16,
  mixer: 1,
  stageSteps: 2
};

// Discrete rectangular and square stage sizes (Pieces = cols * rows strictly)
// DJM Audio has 36' total truss available, so stage width closes at 32' max (8x4' platforms).
export const STAGE_SIZES = [0, 4, 6, 8, 12, 16, 20, 24, 32] as const;
export const STAGE_CONFIGS: Record<number, { cols: number; rows: number; label: string; shape: string }> = {
  0: { cols: 0, rows: 0, label: "None", shape: "None" },
  4: { cols: 2, rows: 2, label: "8' x 8' (4 pcs)", shape: "Square" },
  6: { cols: 3, rows: 2, label: "12' x 8' (6 pcs)", shape: "Rectangle" },
  8: { cols: 4, rows: 2, label: "16' x 8' (8 pcs)", shape: "Rectangle" },
  12: { cols: 4, rows: 3, label: "16' x 12' (12 pcs)", shape: "Rectangle" },
  16: { cols: 4, rows: 4, label: "16' x 16' (16 pcs)", shape: "Square" },
  20: { cols: 5, rows: 4, label: "20' x 16' (20 pcs)", shape: "Rectangle" },
  24: { cols: 6, rows: 4, label: "24' x 16' (24 pcs)", shape: "Rectangle" },
  32: { cols: 8, rows: 4, label: "32' x 16' (32 pcs — Max 32' length)", shape: "Rectangle" },
};

export default function BuilderControls({ setup, setSetup }: BuilderControlsProps) {
  
  const updateQuantity = (key: keyof SetupState, delta: number) => {
    if (key === 'serviceType' || key === 'stagePieces' || key === 'archTruss') return;
    
    setSetup(prev => {
      const current = prev[key] as number;
      const max = (MAX_LIMITS as Record<string, number>)[key] || 1;
      
      let next = current + delta;
      
      // Special logic for Screens (Jump 0 <-> 4)
      if (key === 'screenPanels') {
        if (current === 0 && delta > 0) next = 4;
        else if (current === 4 && delta < 0) next = 0;
      }
      
      next = Math.max(0, Math.min(next, max));
      return { ...prev, [key]: next };
    });
  };

  const stepStage = (delta: number) => {
    setSetup(prev => {
      const currentIndex = STAGE_SIZES.indexOf(prev.stagePieces as typeof STAGE_SIZES[number]);
      const validIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = Math.max(0, Math.min(STAGE_SIZES.length - 1, validIndex + delta));
      const nextPieces = STAGE_SIZES[nextIndex];
      return {
        ...prev,
        stagePieces: nextPieces,
        // If stage is removed, auto-reset steps
        stageSteps: nextPieces === 0 ? 0 : prev.stageSteps,
      };
    });
  };

  const toggleArchTruss = () => {
    setSetup(prev => ({ ...prev, archTruss: !prev.archTruss }));
  };

  const setServiceType = (type: "dj" | "rental") => {
    setSetup(prev => ({ ...prev, serviceType: type }));
  };

  const currentStageInfo = STAGE_CONFIGS[setup.stagePieces] || { label: "Custom", shape: "Rectangular" };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-slate-800 shadow-xl space-y-6">
      
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Build Your Setup</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Add or remove items to customize your stage. 3D render updates live.
        </p>
      </div>

      {/* Service Type Toggle */}
      <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
        <button
          onClick={() => setServiceType("dj")}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${setup.serviceType === "dj" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
        >
          🎧 Hire DJ / Audio Engineer
        </button>
        <button
          onClick={() => setServiceType("rental")}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${setup.serviceType === "rental" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
        >
          📦 Equipment Rental Only
        </button>
      </div>

      <div className="space-y-3.5">
        
        {/* Main Audio / Tops */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Speaker className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Main PA Speakers</p>
              <p className="text-xs text-gray-500">High-end line arrays on stands</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => updateQuantity('tops', -1)}
              disabled={setup.tops <= 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              aria-label="Decrease tops"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-5 text-center font-bold text-gray-900 dark:text-white text-sm sm:text-base">{setup.tops}</span>
            <button 
              onClick={() => updateQuantity('tops', 1)}
              disabled={setup.tops >= MAX_LIMITS.tops}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              aria-label="Increase tops"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subwoofers */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Speaker className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Subwoofers</p>
              <p className="text-xs text-gray-500">Deep bass reinforcement</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => updateQuantity('subs', -1)}
              disabled={setup.subs <= 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              aria-label="Decrease subs"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-5 text-center font-bold text-gray-900 dark:text-white text-sm sm:text-base">{setup.subs}</span>
            <button 
              onClick={() => updateQuantity('subs', 1)}
              disabled={setup.subs >= MAX_LIMITS.subs}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              aria-label="Increase subs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lighting Towers */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Lighting Towers</p>
              <p className="text-xs text-gray-500">Vertical truss with moving heads</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => updateQuantity('towers', -1)}
              disabled={setup.towers <= 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              aria-label="Decrease towers"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-5 text-center font-bold text-gray-900 dark:text-white text-sm sm:text-base">{setup.towers}</span>
            <button 
              onClick={() => updateQuantity('towers', 1)}
              disabled={setup.towers >= MAX_LIMITS.towers}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              aria-label="Increase towers"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DJ Station or Rental Mixer */}
        {setup.serviceType === "dj" ? (
          <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-green-100 dark:border-green-900/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">DJ / Audio Engineer Setup</p>
                <p className="text-xs text-gray-500">Included with DJ service</p>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">Included</div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Pioneer XDJ-XZ Mixer</p>
                <p className="text-xs text-gray-500">Standalone rental DJ mixer</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => updateQuantity('mixer', -1)}
                disabled={setup.mixer <= 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-5 text-center font-bold text-gray-900 dark:text-white text-sm sm:text-base">{setup.mixer}</span>
              <button 
                onClick={() => updateQuantity('mixer', 1)}
                disabled={setup.mixer >= MAX_LIMITS.mixer}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══ STAGE CONFIGURATION (Strict Rectangle/Square - No L Shapes) ══ */}
        <div className="p-3.5 sm:p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl space-y-3 border border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Modular Stage (4&apos;x4&apos; decks)</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {setup.stagePieces === 0 ? "No stage selected" : `${currentStageInfo.label} • Perfect ${currentStageInfo.shape}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => stepStage(-1)}
                disabled={setup.stagePieces <= 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                aria-label="Decrease stage size"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="min-w-8 text-center font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                {setup.stagePieces}
              </span>
              <button 
                onClick={() => stepStage(1)}
                disabled={setup.stagePieces >= 32}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                aria-label="Increase stage size"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Complimentary Black Skirt Callout */}
          <div className="flex items-center justify-between py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 text-xs">
            <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <strong>Black Skirt:</strong> Included Free (covers silver legs)
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">$0</span>
          </div>

          {/* Stage Steps ($50 / unit) */}
          {setup.stagePieces > 0 && (
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Stage Access Steps ($50 ea)
                </p>
                <p className="text-[11px] text-gray-500">2-tier non-slip modular stairs</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateQuantity('stageSteps', -1)}
                  disabled={setup.stageSteps <= 0}
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  {setup.stageSteps}
                </span>
                <button 
                  onClick={() => updateQuantity('stageSteps', 1)}
                  disabled={setup.stageSteps >= MAX_LIMITS.stageSteps}
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Code Requirements Note for Railing and Ramps */}
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <span>
              <strong>Building & Safety Code:</strong> Guardrails and ADA accessibility ramps are extra based on local municipality and venue requirements. Ask for a code-compliant custom quote.
            </span>
          </div>
        </div>

        {/* ══ OVERHEAD STAGE TRUSS ARCH (Max 32' Span) ══ */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Overhead Arch Truss</p>
              <p className="text-xs text-gray-500">Spans stage length (Max 32&apos; span) with lighting</p>
            </div>
          </div>
          <button
            onClick={toggleArchTruss}
            className={`py-1.5 px-3.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              setup.archTruss 
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20" 
                : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
            }`}
          >
            {setup.archTruss ? "Added (+$150)" : "+ Add Arch"}
          </button>
        </div>

        {/* LED Screen Panels */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">LED Screen Panels</p>
              <p className="text-xs text-gray-500">High-res video wall (Min 4 pieces)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => updateQuantity('screenPanels', -1)}
              disabled={setup.screenPanels <= 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              aria-label="Decrease screen panels"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-5 text-center font-bold text-gray-900 dark:text-white text-sm sm:text-base">{setup.screenPanels}</span>
            <button 
              onClick={() => updateQuantity('screenPanels', 1)}
              disabled={setup.screenPanels >= MAX_LIMITS.screenPanels}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              aria-label="Increase screen panels"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spark Machines */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Cold Spark Machines</p>
              <p className="text-xs text-gray-500">Indoor/outdoor safe cold pyrotechnics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => updateQuantity('sparkMachines', -1)}
              disabled={setup.sparkMachines <= 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              aria-label="Decrease spark machines"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-5 text-center font-bold text-gray-900 dark:text-white text-sm sm:text-base">{setup.sparkMachines}</span>
            <button 
              onClick={() => updateQuantity('sparkMachines', 1)}
              disabled={setup.sparkMachines >= MAX_LIMITS.sparkMachines}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              aria-label="Increase spark machines"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
