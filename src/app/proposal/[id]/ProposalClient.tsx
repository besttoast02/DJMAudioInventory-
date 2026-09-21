"use client";

import React, { useState, useMemo } from 'react';
import { ProposalScene, SceneItem } from '@/components/3d/ProposalScene';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProposalItem {
  barcode: string;
  name: string;
  category: string;
  daily_rate: number;
  quantity: number;
}

interface ProposalClientProps {
  proposalId: string;
  eventName: string;
  clientName: string;
  eventDate: string;
  items: ProposalItem[];
}

export function ProposalClient({ proposalId, eventName, clientName, eventDate, items }: ProposalClientProps) {
  // Track which items the user has selected/kept in the proposal
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(items.map(item => item.barcode))
  );

  const toggleItem = (barcode: string) => {
    const next = new Set(selectedItems);
    if (next.has(barcode)) {
      next.delete(barcode);
    } else {
      next.add(barcode);
    }
    setSelectedItems(next);
  };

  // Calculate live total
  const estimatedTotal = useMemo(() => {
    return items
      .filter(item => selectedItems.has(item.barcode))
      .reduce((total, item) => total + (item.daily_rate * item.quantity), 0);
  }, [items, selectedItems]);

  // Map selected items to 3D Scene primitives
  const sceneItems = useMemo<SceneItem[]>(() => {
    const active = items.filter(i => selectedItems.has(i.barcode));
    
    // Naive auto-layout for primitives based on category
    let speakerX = -2;
    let lightX = -1.5;

    return active.map((item, index) => {
      const isSpeaker = item.category?.toLowerCase().includes('audio') || item.category?.toLowerCase().includes('speaker');
      const isLight = item.category?.toLowerCase().includes('light');
      
      let position: [number, number, number] = [0, 0, 0];
      let color = '#222222';
      let size: [number, number, number] = [0.5, 0.5, 0.5];

      if (isSpeaker) {
        position = [speakerX, 0.5, -1];
        speakerX += 1.5;
        color = '#1a1a1a';
        size = [0.6, 1.2, 0.5];
      } else if (isLight) {
        position = [lightX, 0.25, -2];
        lightX += 1.0;
        color = '#44aaff';
        size = [0.4, 0.5, 0.4];
      } else {
        position = [(index % 4) - 1.5, 0.25, (Math.floor(index/4)) * 1.5];
      }

      return {
        id: item.barcode,
        name: item.name,
        category: item.category || 'Misc',
        position,
        size,
        color
      };
    });
  }, [items, selectedItems]);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Proposal: {eventName}</h1>
        <p className="text-gray-400 text-lg">Prepared for {clientName} • Event Date: {new Date(eventDate).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: 3D Scene & Media */}
        <div className="lg:col-span-2 space-y-8">
          {/* 3D Viewer */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Interactive 3D Stage Preview</h2>
            <p className="text-gray-400 mb-4 text-sm">Drag to rotate. As you toggle items off in your checklist, the stage will update live to reflect your selection.</p>
            <div className="h-[500px] w-full relative rounded-xl overflow-hidden border border-gray-800">
              <ProposalScene items={sceneItems} />
            </div>
          </div>

          {/* Media Carousel (Placeholder for now) */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Setup Examples</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {items.filter(i => selectedItems.has(i.barcode)).map(item => (
                <div key={item.barcode} className="min-w-[250px] h-[150px] bg-gray-800 rounded-lg flex flex-col items-center justify-center snap-center border border-gray-700">
                  <span className="text-gray-500 mb-2">📸 {item.name}</span>
                  <span className="text-xs text-gray-600">(Media Tagging Pending)</span>
                </div>
              ))}
              {selectedItems.size === 0 && (
                <div className="text-gray-500 p-4">No items selected to preview.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Item Checklist & Quote */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-xl sticky top-24">
            <h2 className="text-2xl font-bold text-white mb-6">Equipment & Services</h2>
            
            <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => {
                const isSelected = selectedItems.has(item.barcode);
                return (
                  <div 
                    key={item.barcode}
                    onClick={() => toggleItem(item.barcode)}
                    className={`flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? 'border-blue-500/50 bg-blue-500/10' : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                          {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                        </p>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${isSelected ? 'text-green-400' : 'text-gray-600'}`}>
                      ${(item.daily_rate * item.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-800 pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 text-lg">Estimated Total</span>
                <span className="text-3xl font-bold text-white">${estimatedTotal.toFixed(2)}</span>
              </div>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg shadow-blue-600/20 text-lg">
                Accept Proposal
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Prices do not include tax or labor unless explicitly stated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
