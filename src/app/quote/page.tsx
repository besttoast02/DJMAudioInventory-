"use client";

import { useCartStore } from "@/store/cartStore";
import { useState, useEffect } from "react";
import { Trash2, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function QuotePage() {
  const { items, removeFromCart, updateQuantity, getTotalItems, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    eventDate: "",
    eventType: "",
    venue: "",
    guestCount: "Under 50",
    setting: "Indoor",
    services: [] as string[],
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    notes: "",
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cartItems: Object.values(items),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit request.");
      }

      setIsSuccess(true);
      clearCart();
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Request Sent!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thank you for reaching out. We have received your event details and will send you a custom proposal within 24 hours.
          </p>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const cartItems = Object.values(items);
  const hasCartItems = cartItems.length > 0;

  return (
    <div className="py-24 bg-gray-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Get My Event Quote</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Fill out the details below and we&apos;ll send you a custom proposal within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side */}
          <div className={`bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 ${hasCartItems ? 'lg:col-span-8' : 'lg:col-span-12 max-w-4xl mx-auto w-full'}`}>
            
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Event Details */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-slate-800 pb-2">1. Event Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Event Date *</label>
                    <input 
                      id="eventDate"
                      type="date" 
                      required 
                      value={formData.eventDate}
                      onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label htmlFor="eventType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Event Type *</label>
                    <select 
                      id="eventType"
                      required 
                      value={formData.eventType}
                      onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dark:[&>option]:bg-slate-900"
                    >
                      <option value="">Select Event Type</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate">Corporate Event</option>
                      <option value="Private Party">Private Party / Birthday</option>
                      <option value="Live Performance">Live Performance / Band</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="venue" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Venue or City *</label>
                    <input 
                      id="venue"
                      type="text" 
                      placeholder="e.g. Langham Pasadena" 
                      required 
                      value={formData.venue}
                      onChange={(e) => setFormData({...formData, venue: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label htmlFor="guestCount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estimated Guest Count</label>
                    <select 
                      id="guestCount"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({...formData, guestCount: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dark:[&>option]:bg-slate-900"
                    >
                      <option value="Under 50">Under 50</option>
                      <option value="50-100">50 - 100</option>
                      <option value="100-250">100 - 250</option>
                      <option value="250-500">250 - 500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="setting" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Setting</label>
                    <select 
                      id="setting"
                      value={formData.setting}
                      onChange={(e) => setFormData({...formData, setting: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dark:[&>option]:bg-slate-900"
                    >
                      <option value="Indoor">Indoor</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Both">Both / Mixed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Services Needed */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-slate-800 pb-2">2. Services Needed</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Event Sound / PA System", "DJ & MC Services", "Uplighting & Dance Floor Lights", "Equipment Rental Only"].map((service) => (
                    <label key={service} className="flex items-center space-x-3 p-4 border dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 bg-transparent border-gray-300 dark:border-slate-600" 
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-200">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-slate-800 pb-2">3. Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="clientName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">First & Last Name *</label>
                    <input 
                      id="clientName"
                      type="text" 
                      required 
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label htmlFor="clientPhone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                    <input 
                      id="clientPhone"
                      type="tel" 
                      required 
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="clientEmail" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                    <input 
                      id="clientEmail"
                      type="email" 
                      required 
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Optional Details / Questions</label>
                    <textarea 
                      id="notes"
                      rows={4} 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-5 rounded-xl font-bold text-xl transition-all shadow-xl shadow-blue-500/20"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Request for Quote"}
              </button>
            </form>
          </div>

          {/* Cart Side */}
          {hasCartItems && (
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 sticky top-28">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b dark:border-slate-800 pb-2 flex justify-between items-center">
                  <span>Your Gear List</span>
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm py-1 px-3 rounded-full">{getTotalItems()}</span>
                </h2>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{item.brand}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 p-1 text-center border dark:border-slate-700 bg-transparent dark:text-white rounded-md text-sm"
                        />
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">This gear will be attached to your quote request automatically.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
