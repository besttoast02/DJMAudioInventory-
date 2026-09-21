"use client";

import { Minus, Plus, Music, Lightbulb, Speaker } from "lucide-react";

interface BuilderControlsProps {
  setup: {
    subs: number;
    tops: number;
    towers: number;
    dj: boolean;
  };
  setSetup: React.Dispatch<React.SetStateAction<{
    subs: number;
    tops: number;
    towers: number;
    dj: boolean;
  }>>;
}

const MAX_LIMITS = {
  subs: 4,
  tops: 4,
  towers: 4,
  stagePieces: 32,
  screenPanels: 32,
  sparkMachines: 16
};

export default function BuilderControls({ setup, setSetup }: BuilderControlsProps) {
  
  const updateQuantity = (key: keyof typeof setup, delta: number) => {
    setSetup(prev => {
      const current = prev[key] as number;
      const max = key !== 'dj' ? MAX_LIMITS[key as keyof typeof MAX_LIMITS] : 1;
      const next = Math.max(0, Math.min(current + delta, max));
      return { ...prev, [key]: next };
    });
  };

  const toggleDJ = () => {
    setSetup(prev => ({ ...prev, dj: !prev.dj }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-xl space-y-6">
      
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Build Your Setup</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add or remove items to visualize your stage. The 3D render and media examples will update automatically.
        </p>
      </div>

      <div className="space-y-4">
        
        {/* Main Audio / Tops */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Speaker className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Main PA Speakers</p>
              <p className="text-xs text-gray-500">High-end line arrays</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateQuantity('tops', -1)}
              disabled={setup.tops <= 0}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-4 text-center font-bold text-gray-900 dark:text-white">{setup.tops}</span>
            <button 
              onClick={() => updateQuantity('tops', 1)}
              disabled={setup.tops >= MAX_LIMITS.tops}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subwoofers */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Speaker className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Subwoofers</p>
              <p className="text-xs text-gray-500">Deep bass reinforcement</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateQuantity('subs', -1)}
              disabled={setup.subs <= 0}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-4 text-center font-bold text-gray-900 dark:text-white">{setup.subs}</span>
            <button 
              onClick={() => updateQuantity('subs', 1)}
              disabled={setup.subs >= MAX_LIMITS.subs}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lighting Towers */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Lighting Towers</p>
              <p className="text-xs text-gray-500">Truss with moving heads</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateQuantity('towers', -1)}
              disabled={setup.towers <= 0}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-4 text-center font-bold text-gray-900 dark:text-white">{setup.towers}</span>
            <button 
              onClick={() => updateQuantity('towers', 1)}
              disabled={setup.towers >= MAX_LIMITS.towers}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DJ Station */}
        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">DJ Setup</p>
              <p className="text-xs text-gray-500">DJ Booth and Mixer</p>
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={setup.dj}
            onChange={toggleDJ}
            className="w-5 h-5 text-blue-600 rounded bg-transparent border-gray-300 dark:border-slate-600 focus:ring-blue-500" 
          />
        </label>

        {/* Stage Pieces */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Stage Platforms (4&apos;x4&apos;)</p>
              <p className="text-xs text-gray-500">Min 4 pieces for a standard stage</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateQuantity('stagePieces', -1)}
              disabled={setup.stagePieces <= 0}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-4 text-center font-bold text-gray-900 dark:text-white">{setup.stagePieces}</span>
            <button 
              onClick={() => updateQuantity('stagePieces', 1)}
              disabled={setup.stagePieces >= MAX_LIMITS.stagePieces}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Screen Panels */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">LED Screen Panels</p>
              <p className="text-xs text-gray-500">20&quot;x40&quot; each. Min 4 recommended</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateQuantity('screenPanels', -1)}
              disabled={setup.screenPanels <= 0}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-4 text-center font-bold text-gray-900 dark:text-white">{setup.screenPanels}</span>
            <button 
              onClick={() => updateQuantity('screenPanels', 1)}
              disabled={setup.screenPanels >= MAX_LIMITS.screenPanels}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Spark Machines */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Cold Spark Machines</p>
              <p className="text-xs text-gray-500">Safe indoor spark effects</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateQuantity('sparkMachines', -1)}
              disabled={setup.sparkMachines <= 0}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-4 text-center font-bold text-gray-900 dark:text-white">{setup.sparkMachines}</span>
            <button 
              onClick={() => updateQuantity('sparkMachines', 1)}
              disabled={setup.sparkMachines >= MAX_LIMITS.sparkMachines}
              className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
