"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem("djm-cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("djm-cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("djm-cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 left-6 md:right-8 md:left-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-gray-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-500">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Cookie className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Cookie Notice</h3>
          </div>
          <button 
            onClick={handleDecline} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1"
            aria-label="Close Notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          We use functional cookies to remember items in your event proposal cart and maintain system preferences (such as light/dark mode). You can read our{" "}
          <a href="/privacy" className="text-blue-600 dark:text-blue-500 font-semibold hover:underline">
            Privacy Policy
          </a>{" "}
          to learn more.
        </p>

        {/* Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button 
            onClick={handleAccept} 
            className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-500/10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Accept All
          </button>
          <button 
            onClick={handleDecline} 
            className="bg-gray-100 dark:bg-slate-850 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-xl text-sm transition-all focus:ring-2 focus:ring-gray-300 focus:outline-none"
          >
            Essential Only
          </button>
        </div>

      </div>
    </div>
  );
}
