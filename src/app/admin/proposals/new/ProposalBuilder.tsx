"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface InventoryItem {
  barcode: string;
  name: string;
  category: string;
  daily_rate: number;
  brand: string | null;
  model: string | null;
}

interface ProposalBuilderProps {
  inventory: InventoryItem[];
}

interface CartItem extends InventoryItem {
  quantity: number;
}

const PRESET_PACKAGES = [
  {
    name: "Medium PA Package",
    description: "2x Ingenia IG3T, 1x Sub (DAS/JBL), 2x Truss Towers with lights",
    price: 800,
    items: [
      { keyword: "IG3T", quantity: 2 },
      { keyword: "Subwoofer", quantity: 1 },
      { keyword: "Lightjoy", quantity: 2 },
      { keyword: "Element Hex", quantity: 2 },
      { keyword: "Smoke Machine", quantity: 1 }
    ]
  },
  {
    name: "Medium PA + 4 Towers",
    description: "Medium PA + 2 extra light towers",
    price: 1000,
    items: [
      { keyword: "IG3T", quantity: 2 },
      { keyword: "Subwoofer", quantity: 1 },
      { keyword: "Lightjoy", quantity: 4 },
      { keyword: "Element Hex", quantity: 4 },
      { keyword: "Smoke Machine", quantity: 1 }
    ]
  },
  {
    name: "All-Inclusive (Live Band + DJ)",
    description: "4x IG3T, 4x Subs, Monitors, 32-ch Mixer, Mics",
    price: 2000,
    items: [
      { keyword: "IG3T", quantity: 4 },
      { keyword: "Subwoofer", quantity: 4 },
      { keyword: "Monitor", quantity: 3 },
      { keyword: "SQ5", quantity: 1 },
      { keyword: "AB168", quantity: 1 },
      { keyword: "Microphone", quantity: 10 }
    ]
  }
];

export default function ProposalBuilder({ inventory }: ProposalBuilderProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [notes, setNotes] = useState("");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  const addToCart = (item: InventoryItem, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.barcode === item.barcode);
      if (existing) {
        return prev.map(i => i.barcode === item.barcode ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeFromCart = (barcode: string) => {
    setCart(prev => prev.filter(i => i.barcode !== barcode));
  };

  const applyPackage = (pkg: typeof PRESET_PACKAGES[0]) => {
    setCart([]);
    const newCart: CartItem[] = [];
    
    pkg.items.forEach(req => {
      // Find the first available item in inventory matching the keyword
      const match = inventory.find(i => 
        i.name.toLowerCase().includes(req.keyword.toLowerCase()) || 
        (i.model && i.model.toLowerCase().includes(req.keyword.toLowerCase()))
      );
      if (match) {
        newCart.push({ ...match, quantity: req.quantity });
      }
    });
    setCart(newCart);
  };

  const totalCost = cart.reduce((sum, item) => sum + (item.daily_rate * item.quantity), 0);

  const handleGenerate = async () => {
    if (!clientName || !clientPhone || !eventName || !eventDate || cart.length === 0) {
      alert("Please fill out all required fields and add items to the cart.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: rental, error: rentalError } = await supabase
        .from("rentals")
        .insert({
          client_name: clientName,
          client_phone: clientPhone,
          event_name: eventName,
          event_date: eventDate,
          venue_name: venue,
          notes: notes,
          status: "pending",
          final_cost: totalCost
        })
        .select()
        .single();

      if (rentalError) throw rentalError;

      const rentalItemsToInsert = cart.map(item => ({
        rental_id: rental.id,
        item_barcode: item.barcode,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from("rental_items")
        .insert(rentalItemsToInsert);

      if (itemsError) throw itemsError;

      const origin = typeof window !== "undefined" ? window.location.origin : "https://www.djmaudio.com";
      setGeneratedLink(`${origin}/proposal/${rental.id}`);
      
    } catch (err: any) {
      console.error(err);
      alert("Error generating proposal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Client & Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Client Name *</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-gray-800 rounded border border-gray-700 text-white px-4 py-2" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone Number *</label>
              <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-gray-800 rounded border border-gray-700 text-white px-4 py-2" placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Event Name *</label>
              <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} className="w-full bg-gray-800 rounded border border-gray-700 text-white px-4 py-2" placeholder="Corporate Gala 2026" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Event Date *</label>
              <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full bg-gray-800 rounded border border-gray-700 text-white px-4 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Venue Name / Location</label>
              <input type="text" value={venue} onChange={e => setVenue(e.target.value)} className="w-full bg-gray-800 rounded border border-gray-700 text-white px-4 py-2" placeholder="Beverly Hills Hotel" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Internal Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-gray-800 rounded border border-gray-700 text-white px-4 py-2" rows={2} placeholder="Optional notes..."></textarea>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Equipment Selection</h2>
          
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Start with a Popular Package (Optional)</label>
            <p className="text-xs text-gray-500 mb-3">Selecting a package will auto-fill the required inventory items.</p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_PACKAGES.map(pkg => (
                <button 
                  key={pkg.name}
                  onClick={() => applyPackage(pkg)}
                  className="bg-gray-800 hover:bg-blue-900/50 hover:border-blue-500 border border-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  {pkg.name}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-800 my-6" />

          <div>
            <label className="block text-sm text-gray-400 mb-2">Search Inventory to Add Individual Items</label>
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, brand, or category..." 
              className="w-full bg-gray-800 rounded border border-gray-700 text-white px-4 py-2 mb-4"
            />
            
            {searchQuery && (
              <div className="bg-gray-800 rounded border border-gray-700 divide-y divide-gray-700">
                {filteredInventory.map(item => (
                  <div key={item.barcode} className="p-3 flex justify-between items-center hover:bg-gray-700/50">
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.brand} | {item.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-green-400 font-medium">${item.daily_rate}</span>
                      <button 
                        onClick={() => addToCart(item)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
                {filteredInventory.length === 0 && (
                  <div className="p-4 text-gray-400 text-center text-sm">No items found matching "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 h-fit sticky top-24">
        <h2 className="text-xl font-semibold text-white mb-4">Current Proposal</h2>
        
        {cart.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No equipment added yet.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.barcode} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium pr-2">{item.name}</p>
                  <p className="text-gray-400 text-xs">Qty: {item.quantity} x ${item.daily_rate}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.barcode)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-800 pt-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Estimated Cost</span>
            <span className="text-white font-medium">${totalCost.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500">*Final price may vary based on package overrides</p>
        </div>

        {generatedLink ? (
          <div className="bg-green-900/30 border border-green-800 rounded p-4 text-center">
            <p className="text-green-400 font-medium mb-2">✅ Proposal Generated!</p>
            <input 
              type="text" 
              readOnly 
              value={generatedLink}
              className="w-full bg-black/50 text-white text-sm p-2 rounded mb-3 border border-green-800"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(generatedLink)}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-medium transition-colors"
            >
              Copy Link
            </button>
          </div>
        ) : (
          <button 
            onClick={handleGenerate}
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded font-semibold transition-colors"
          >
            {isSubmitting ? "Generating..." : "Generate 3D Proposal"}
          </button>
        )}
      </div>
    </div>
  );
}
