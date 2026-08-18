"use client";

import { useCartStore } from "@/store/cartStore";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type Item = {
  id: string;
  name: string;
  brand: string;
  category: string;
  rate_cents: number;
};

export function RentalGrid({ items }: { items: Item[] }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400">No inventory available.</h3>
      </div>
    );
  }

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  const allCategories = Object.keys(grouped);
  const allCollapsed = allCategories.every(cat => openCategories[cat] === false);

  const toggleAll = () => {
    if (allCollapsed) {
      // Expand all by resetting explicit collapses
      setOpenCategories({});
    } else {
      // Collapse all by setting all to false
      const collapsedState: Record<string, boolean> = {};
      allCategories.forEach(cat => {
        collapsedState[cat] = false;
      });
      setOpenCategories(collapsedState);
    }
  };

  return (
    <div className="space-y-8">
      {/* Grid Controls */}
      <div className="flex justify-end pr-2">
        <button
          onClick={toggleAll}
          className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>{allCollapsed ? "Expand All Categories" : "Collapse All Categories"}</span>
        </button>
      </div>

      <div className="space-y-12">
        {Object.entries(grouped).map(([category, categoryItems]) => {
          const isOpen = openCategories[category] !== false;
          return (
            <section key={category} className="border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <button 
                onClick={() => {
                  setOpenCategories(prev => ({ ...prev, [category]: !isOpen }));
                }}
                className="w-full flex items-center justify-between p-6 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category}</h2>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                {isOpen ? <ChevronDown className="w-6 h-6 text-gray-500" /> : <ChevronRight className="w-6 h-6 text-gray-500" />}
              </button>
              
              {isOpen && (
                <div className="p-6 border-t border-gray-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 block">
                              {item.brand}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                              {item.name}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-50 dark:border-slate-800">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            ${(item.rate_cents / 100).toFixed(2)} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ day</span>
                          </span>
                          
                          <button
                            onClick={() => addToCart({
                              id: item.id,
                              name: item.name,
                              brand: item.brand,
                              category: item.category,
                              rate_cents: item.rate_cents,
                            })}
                            className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white p-3 rounded-full transition-colors cursor-pointer"
                            aria-label={`Add ${item.name} to cart`}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
