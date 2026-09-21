"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the heavy Chatbot component only when rendered
const Chatbot = dynamic(
  () => import("./Chatbot").then((mod) => mod.Chatbot),
  { ssr: false, loading: () => null }
);

export function ClientChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const prefetchChatbot = () => {
    // Start prefetching the Chatbot chunk on hover/touch
    import("./Chatbot");
  };

  return (
    <>
      {/* Floating Action Button - Rendered statically on initial page load with zero heavy dependencies */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={prefetchChatbot}
          onTouchStart={prefetchChatbot}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all z-50 animate-bounce hover:animate-none group cursor-pointer animate-in fade-in duration-300"
          aria-label="Chat with AI Assistant"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 group-hover:scale-110 transition-transform"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
        </button>
      )}

      {/* Heavy Chat Window loaded dynamically only when opened */}
      {isOpen && (
        <Chatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}

