"use client";

import { useChat } from "@ai-sdk/react";
import { MessageCircle, Send, MinusCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { DefaultChatTransport } from 'ai';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/assistant" }),
  });
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100 dark:border-slate-800 flex-shrink-0 animate-in slide-in-from-bottom-8">
          
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold flex items-center space-x-2">
                <span>DJM AI Assistant</span>
              </h3>
              <p className="text-blue-100 text-xs">Available 24/7</p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors cursor-pointer"
            >
              <MinusCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 my-8 text-sm">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>Hello! I&apos;m the DJM Audio virtual assistant.</p>
                <p>How can I help you with your event?</p>
              </div>
            )}
            
            {messages.map((m: any) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {m.parts?.map((part: any, i: number) => {
                    if (part.type === 'text') {
                      return <span key={i}>{part.text}</span>;
                    }
                    return null;
                  }) || m.content}
                </div>
              </div>
            ))}
            
            {status === "submitted" && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim()) {
                sendMessage({ text: inputValue });
                setInputValue("");
              }
            }} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl px-2 py-1 border border-gray-200 dark:border-slate-700">
              <input
                className="flex-1 bg-transparent p-2 outline-none text-sm text-gray-900 dark:text-gray-100"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                disabled={status === "submitted"}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || status === "submitted"}
                className="p-2 text-blue-600 disabled:text-gray-400 hover:text-blue-800 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
